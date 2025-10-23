import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { dbStorage as storage, ValidationError, NotFoundError } from "./db-storage";
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

  // Broadcast function to send updates to all connected clients with error handling
  const broadcast = (data: any) => {
    try {
      const message = JSON.stringify(data);
      wss.clients.forEach((client) => {
        try {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        } catch (clientError) {
          console.error("Error sending message to client:", clientError);
        }
      });
    } catch (error) {
      console.error("Error broadcasting message:", error);
    }
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

  // Validation helpers
  const validateNumericAmount = (value: any, fieldName: string, min = 0, max = Infinity): { valid: boolean; error?: string } => {
    if (value === undefined || value === null) {
      return { valid: false, error: `${fieldName} is required` };
    }
    
    const num = typeof value === 'number' ? value : parseFloat(value);
    
    if (isNaN(num)) {
      return { valid: false, error: `${fieldName} must be a valid number` };
    }
    
    if (!isFinite(num)) {
      return { valid: false, error: `${fieldName} must be a finite number` };
    }
    
    if (num < min) {
      return { valid: false, error: `${fieldName} must be at least ${min}` };
    }
    
    if (num > max) {
      return { valid: false, error: `${fieldName} must not exceed ${max}` };
    }
    
    return { valid: true };
  };

  const validateAMMCalculation = (value: number, operation: string): { valid: boolean; error?: string } => {
    if (isNaN(value) || !isFinite(value)) {
      return { valid: false, error: `Invalid AMM calculation result for ${operation}` };
    }
    
    if (value < 0) {
      return { valid: false, error: `${operation} resulted in negative value - trade too large for pool liquidity` };
    }
    
    return { valid: true };
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
  // NOW USES ROBUST TRANSACTION WITH ROW-LEVEL LOCKING
  app.post("/api/bets", async (req, res) => {
    try {
      const { marketId, position, amount, action = "buy", userId } = req.body;

      // Input validation
      if (!marketId || typeof marketId !== 'string') {
        return res.status(400).json({ message: "Valid marketId is required" });
      }

      if (!position || typeof position !== 'string') {
        return res.status(400).json({ message: "Valid position is required" });
      }

      if (position !== "YES" && position !== "NO") {
        return res.status(400).json({ message: "Position must be exactly 'YES' or 'NO'" });
      }

      if (!action || typeof action !== 'string') {
        return res.status(400).json({ message: "Valid action is required" });
      }

      if (action !== "buy" && action !== "sell") {
        return res.status(400).json({ message: "Action must be 'buy' or 'sell'" });
      }

      // Validate amount
      const amountValidation = validateNumericAmount(amount, "Amount", 0.01, 1000000);
      if (!amountValidation.valid) {
        return res.status(400).json({ message: amountValidation.error });
      }

      // Get user ID
      let actualUserId: string;
      if (userId) {
        actualUserId = userId;
      } else {
        const defaultUser = await storage.getUserByUsername("trader1");
        if (!defaultUser) {
          return res.status(404).json({ message: "Default user not found" });
        }
        actualUserId = defaultUser.id;
      }

      // Execute the bet transaction with row-level locking
      // All validation, calculations, and updates happen atomically inside the transaction
      const result = await storage.placeBetWithLocking({
        userId: actualUserId,
        marketId,
        position: position as "YES" | "NO",
        amount: parseFloat(amount),
        action: action as "buy" | "sell",
      });

      // Broadcast update via WebSocket
      try {
        const marketWithKol = await storage.getMarketWithKol(marketId);
        broadcast({
          type: 'BET_PLACED',
          bet: result.bet,
          market: marketWithKol,
        });
      } catch (error) {
        console.error("Error broadcasting bet update:", error);
      }

      res.json(result.bet);
    } catch (error) {
      console.error("Error creating bet:", error);
      
      // Return appropriate HTTP status codes based on error type
      if (error instanceof ValidationError) {
        return res.status(400).json({ 
          message: error.message,
        });
      }
      
      if (error instanceof NotFoundError) {
        return res.status(404).json({ 
          message: error.message,
        });
      }
      
      // Server errors return 500
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create bet",
      });
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
