import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { dbStorage as storage } from "./db-storage";
import { seed } from "./seed";
import { metricsUpdater } from "./metrics-updater";
import { marketResolver } from "./market-resolver";
import { socialMediaClient } from "./social-api-client";
import type { InsertBet, User } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Seed database if empty
  try {
    const kols = await storage.getAllKols();
    if (kols.length === 0) {
      console.log("Database is empty, running seed...");
      await seed();
    }
  } catch (error) {
    console.error("Error checking/seeding database:", error);
  }

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Broadcast function to send updates to all connected clients
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Constant Product AMM (Automated Market Maker) calculations
  // In this system: yesPrice + noPrice = 1.00
  // When traders buy YES, yesPool increases, making YES price go up
  // When traders buy NO, noPool increases, making NO price go up
  
  const calculateAMMPrices = (yesPool: number, noPool: number) => {
    const totalPool = yesPool + noPool;
    return {
      yesPrice: yesPool / totalPool,
      noPrice: noPool / totalPool,
    };
  };

  const calculateSharesForBuy = (
    amount: number,
    position: "YES" | "NO",
    yesPool: number,
    noPool: number
  ): number => {
    // Constant product formula: k = yesPool * noPool
    const k = yesPool * noPool;
    
    if (position === "YES") {
      // Adding to YES pool, removing from NO pool
      // newNoPool = k / (yesPool + amount)
      const newNoPool = k / (yesPool + amount);
      return noPool - newNoPool;
    } else {
      // Adding to NO pool, removing from YES pool
      // newYesPool = k / (noPool + amount)
      const newYesPool = k / (noPool + amount);
      return yesPool - newYesPool;
    }
  };

  const calculatePayoutForSell = (
    shares: number,
    position: "YES" | "NO",
    yesPool: number,
    noPool: number
  ): number => {
    // Constant product formula: k = yesPool * noPool
    const k = yesPool * noPool;
    
    if (position === "YES") {
      // Removing from YES pool, adding to NO pool
      // newNoPool = k / (yesPool - shares)
      const newNoPool = k / (yesPool - shares);
      return newNoPool - noPool;
    } else {
      // Removing from NO pool, adding to YES pool
      // newYesPool = k / (noPool - shares)
      const newYesPool = k / (noPool - shares);
      return newYesPool - yesPool;
    }
  };

  // Authentication endpoints
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser({ username });
      res.json({ userId: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ userId: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Get current user (by userId from request body/header)
  app.get("/api/user", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        // Return default user as fallback for compatibility
        const user = await storage.getUserByUsername("trader1");
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        return res.json(user);
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all markets with KOL data
  app.get("/api/markets", async (req, res) => {
    try {
      const markets = await storage.getAllMarketsWithKols();
      res.json(markets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch markets" });
    }
  });

  // Get single market with KOL data
  app.get("/api/markets/:id", async (req, res) => {
    try {
      const market = await storage.getMarketWithKol(req.params.id);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }
      res.json(market);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market" });
    }
  });

  // Get all KOLs
  app.get("/api/kols", async (req, res) => {
    try {
      const kols = await storage.getAllKols();
      res.json(kols);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch KOLs" });
    }
  });

  // Get recent bets for live feed
  app.get("/api/bets/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const bets = await storage.getRecentBets(limit);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent bets" });
    }
  });

  // Get user's bets with market details
  app.get("/api/bets/user", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        // Fallback to default user for compatibility
        const user = await storage.getUserByUsername("trader1");
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const bets = await storage.getUserBetsWithMarkets(user.id);
        return res.json(bets);
      }

      const bets = await storage.getUserBetsWithMarkets(userId);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user bets" });
    }
  });

  // Create a new bet (buy or sell YES/NO positions)
  app.post("/api/bets", async (req, res) => {
    try {
      const { marketId, position, amount, action = "buy", userId } = req.body;

      if (!marketId || !position) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate position is exactly "YES" or "NO"
      if (position !== "YES" && position !== "NO") {
        return res.status(400).json({ message: "Invalid position. Must be 'YES' or 'NO'" });
      }

      // Validate action
      if (action !== "buy" && action !== "sell") {
        return res.status(400).json({ message: "Invalid action. Must be 'buy' or 'sell'" });
      }

      // Get current user
      let user: User | undefined;
      if (userId) {
        user = await storage.getUser(userId);
      } else {
        user = await storage.getUserByUsername("trader1");
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      if (market.resolved) {
        return res.status(400).json({ message: "Market is already resolved" });
      }

      const yesPool = parseFloat(market.yesPool);
      const noPool = parseFloat(market.noPool);
      const userBalance = parseFloat(user.balance);

      let betAmount: number;
      let sharesAmount: number;
      let newYesPool: number;
      let newNoPool: number;

      if (action === "buy") {
        // Buying shares
        if (!amount || amount <= 0) {
          return res.status(400).json({ message: "Amount must be positive for buy orders" });
        }

        if (amount > userBalance) {
          return res.status(400).json({ message: "Insufficient balance" });
        }

        betAmount = amount;
        sharesAmount = calculateSharesForBuy(amount, position, yesPool, noPool);

        // Update pools
        if (position === "YES") {
          newYesPool = yesPool + amount;
          newNoPool = noPool - sharesAmount;
        } else {
          newNoPool = noPool + amount;
          newYesPool = yesPool - sharesAmount;
        }
      } else {
        // Selling shares
        const userPosition = await storage.getUserPosition(user.id, marketId, position);
        const currentShares = userPosition ? parseFloat(userPosition.shares) : 0;

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: "Amount (shares) must be positive for sell orders" });
        }

        if (amount > currentShares) {
          return res.status(400).json({ 
            message: `Insufficient ${position} shares. You own ${currentShares} but trying to sell ${amount}.` 
          });
        }

        sharesAmount = amount;
        betAmount = calculatePayoutForSell(amount, position, yesPool, noPool);

        // Update pools
        if (position === "YES") {
          newYesPool = yesPool - amount;
          newNoPool = noPool + betAmount;
        } else {
          newNoPool = noPool - amount;
          newYesPool = yesPool + betAmount;
        }
      }

      // Calculate new prices
      const { yesPrice, noPrice } = calculateAMMPrices(newYesPool, newNoPool);
      const currentPrice = position === "YES" ? parseFloat(market.yesPrice) : parseFloat(market.noPrice);

      // Create bet record
      const insertBet: InsertBet = {
        userId: user.id,
        marketId,
        position,
        amount: betAmount.toFixed(2),
        price: currentPrice.toFixed(4),
        shares: sharesAmount.toFixed(2),
      };

      const bet = await storage.createBet(insertBet);

      // Update or create user position
      await storage.updateUserPosition(user.id, marketId, position, sharesAmount, action);

      // Update user balance
      const newBalance = action === "buy" 
        ? (userBalance - betAmount).toFixed(2)
        : (userBalance + betAmount).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      // Update user stats
      await storage.updateUserStats(user.id, user.totalBets + 1, user.totalWins, user.totalProfit);

      // Update market pools and prices
      await storage.updateMarketPools(marketId, newYesPool.toFixed(2), newNoPool.toFixed(2), yesPrice.toFixed(4), noPrice.toFixed(4));
      const newVolume = (parseFloat(market.totalVolume) + betAmount).toFixed(2);
      await storage.updateMarketVolume(marketId, newVolume);

      // Broadcast update via WebSocket
      broadcast({
        type: 'BET_PLACED',
        bet,
        market: await storage.getMarketWithKol(marketId),
      });

      res.json(bet);
    } catch (error) {
      console.error("Error creating bet:", error);
      res.status(500).json({ message: "Failed to create bet" });
    }
  });

  // Get user positions
  app.get("/api/positions/user", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        const user = await storage.getUserByUsername("trader1");
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const positions = await storage.getUserPositionsWithMarkets(user.id);
        return res.json(positions);
      }

      const positions = await storage.getUserPositionsWithMarkets(userId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user positions" });
    }
  });

  // Resolve a market
  app.post("/api/markets/:id/resolve", async (req, res) => {
    try {
      const { resolvedValue } = req.body;
      const marketId = req.params.id;

      if (resolvedValue !== "YES" && resolvedValue !== "NO") {
        return res.status(400).json({ message: "resolvedValue must be 'YES' or 'NO'" });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      if (market.resolved) {
        return res.status(400).json({ message: "Market is already resolved" });
      }

      // Resolve the market
      await storage.resolveMarket(marketId, resolvedValue);

      // Get all positions for this market
      const positions = await storage.getMarketPositions(marketId);

      // Pay out winners
      for (const position of positions) {
        const shares = parseFloat(position.shares);
        if (shares > 0 && position.position === resolvedValue) {
          const payout = shares * 1.00;
          const user = await storage.getUser(position.userId);
          if (user) {
            const newBalance = (parseFloat(user.balance) + payout).toFixed(2);
            await storage.updateUserBalance(position.userId, newBalance);
            
            const profit = payout - (shares * parseFloat(position.averagePrice));
            await storage.updateUserStats(
              position.userId,
              user.totalBets,
              user.totalWins + 1,
              (parseFloat(user.totalProfit) + profit).toFixed(2)
            );
          }
        }
      }

      // Broadcast market resolution
      broadcast({
        type: 'MARKET_RESOLVED',
        market: await storage.getMarketWithKol(marketId),
        resolvedValue,
      });

      res.json({ success: true, resolvedValue });
    } catch (error) {
      console.error("Error resolving market:", error);
      res.status(500).json({ message: "Failed to resolve market" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get market price history
  app.get("/api/markets/:id/history", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const history = await storage.getMarketPriceHistory(req.params.id, days);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch price history" });
    }
  });

  // Get market comments
  app.get("/api/markets/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getMarketComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Post a comment
  app.post("/api/comments", async (req, res) => {
    try {
      const { marketId, content, userId } = req.body;

      if (!marketId || !content || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const comment = await storage.createComment({
        userId,
        marketId,
        content,
      });

      const user = await storage.getUser(userId);
      res.json({
        ...comment,
        user: {
          username: user?.username || "Unknown",
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Wallet deposit
  app.post("/api/wallet/deposit", async (req, res) => {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const depositAmount = parseFloat(amount);
      if (depositAmount <= 0 || depositAmount > 10000) {
        return res.status(400).json({ message: "Invalid deposit amount (must be between $0.01 and $10,000)" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.balance);
      const newBalance = (currentBalance + depositAmount).toFixed(2);

      await storage.updateUserBalance(userId, newBalance);

      const transaction = await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount.toString(),
        balanceAfter: newBalance,
        description: `Deposited ${depositAmount.toFixed(2)} PTS`,
      });

      res.json({
        transaction,
        newBalance,
      });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Wallet withdrawal
  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      const { userId, amount } = req.body;

      if (!userId || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.balance);
      if (withdrawAmount > currentBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const newBalance = (currentBalance - withdrawAmount).toFixed(2);

      await storage.updateUserBalance(userId, newBalance);

      const transaction = await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount: amount.toString(),
        balanceAfter: newBalance,
        description: `Withdrew ${withdrawAmount.toFixed(2)} PTS`,
      });

      res.json({
        transaction,
        newBalance,
      });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Get user transaction history
  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!userId) {
        const user = await storage.getUserByUsername("trader1");
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const transactions = await storage.getUserTransactions(user.id, limit);
        return res.json(transactions);
      }

      const transactions = await storage.getUserTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Manual trigger for KOL metrics update
  app.post("/api/admin/update-metrics", async (req, res) => {
    try {
      await metricsUpdater.updateAllKolMetrics();
      res.json({ message: "Metrics update completed" });
    } catch (error) {
      console.error("Error updating metrics:", error);
      res.status(500).json({ message: "Failed to update metrics" });
    }
  });

  // Manual trigger for market resolution
  app.post("/api/admin/resolve-markets", async (req, res) => {
    try {
      const resolutions = await marketResolver.resolveExpiredMarkets();
      
      for (const resolution of resolutions) {
        const market = await storage.getMarketWithKol(resolution.marketId);
        if (market) {
          broadcast({
            type: 'MARKET_RESOLVED',
            market,
            resolution,
          });
        }
      }

      res.json({ 
        message: "Market resolution completed", 
        resolved: resolutions.length,
        resolutions,
      });
    } catch (error) {
      console.error("Error resolving markets:", error);
      res.status(500).json({ message: "Failed to resolve markets" });
    }
  });

  // Get API integration status
  app.get("/api/admin/api-status", async (req, res) => {
    try {
      const isConfigured = socialMediaClient.isConfigured();
      res.json({
        configured: isConfigured,
        message: isConfigured 
          ? "Social media APIs are configured and will fetch real data"
          : "No social media APIs configured - using enhanced mock data",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check API status" });
    }
  });

  // Simulate market price updates (for demo purposes)
  setInterval(() => {
    storage.getAllMarkets().then((markets) => {
      markets.forEach((market) => {
        // Randomly update YES/NO prices slightly (maintaining sum = 1.00)
        const currentYesPrice = parseFloat(market.yesPrice);
        const change = (Math.random() - 0.5) * 0.01; // Small random change
        const newYesPrice = Math.max(0.01, Math.min(0.99, currentYesPrice + change));
        const newNoPrice = 1.00 - newYesPrice;
        
        storage.updateMarketPools(
          market.id,
          market.yesPool,
          market.noPool,
          newYesPrice.toFixed(4),
          newNoPrice.toFixed(4)
        );
        
        // Broadcast price update
        storage.getMarketWithKol(market.id).then((updatedMarket) => {
          if (updatedMarket) {
            broadcast({
              type: 'PRICE_UPDATE',
              market: updatedMarket,
            });
          }
        });
      });
    });
  }, 5000); // Update every 5 seconds

  // Start automatic KOL metrics updates every 30 minutes
  console.log("Starting automatic KOL metrics updates...");
  metricsUpdater.startAutoUpdate(30);

  // Start automatic market resolution every 5 minutes
  console.log("Starting automatic market resolution...");
  marketResolver.startAutoResolution(5);

  // Set up callback for market resolutions to broadcast via WebSocket
  const originalResolveExpiredMarkets = marketResolver.resolveExpiredMarkets.bind(marketResolver);
  marketResolver.resolveExpiredMarkets = async function() {
    const resolutions = await originalResolveExpiredMarkets();
    
    for (const resolution of resolutions) {
      const market = await storage.getMarketWithKol(resolution.marketId);
      if (market) {
        broadcast({
          type: 'MARKET_RESOLVED',
          market,
          resolution,
        });
      }
    }
    
    return resolutions;
  };

  return httpServer;
}
