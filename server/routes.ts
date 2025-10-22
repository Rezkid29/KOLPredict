import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { InsertBet } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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

  // Bonding curve price calculation
  const calculatePrice = (supply: number): number => {
    // Simple bonding curve: price = 0.01 + (supply / 10000)
    return 0.01 + (supply / 10000);
  };

  // Get current user (for MVP, return first user)
  app.get("/api/user", async (req, res) => {
    try {
      const users = Array.from((storage as any).users.values());
      const user = users[0];
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

  // Create a new bet
  app.post("/api/bets", async (req, res) => {
    try {
      const { marketId, type, amount, shares } = req.body;

      if (!marketId || !type || !amount || !shares) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get current user
      const users = Array.from((storage as any).users.values());
      const user = users[0];
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      const betAmount = parseFloat(amount);
      const userBalance = parseFloat(user.balance);

      // Check if user has enough balance
      if (betAmount > userBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Calculate new market price using bonding curve
      const newSupply = type === "buy" ? market.supply + shares : market.supply - shares;
      const newPrice = calculatePrice(newSupply).toFixed(4);

      // Create bet
      const insertBet: InsertBet = {
        userId: user.id,
        marketId,
        type,
        amount: amount.toString(),
        price: market.price,
        shares,
        status: "pending",
      };

      const bet = await storage.createBet(insertBet);

      // Update user balance
      const newBalance = (userBalance - betAmount).toFixed(2);
      await storage.updateUserBalance(user.id, newBalance);

      // Update user stats
      const newTotalBets = user.totalBets + 1;
      await storage.updateUserStats(user.id, newTotalBets, user.totalWins, user.totalProfit);

      // Update market
      await storage.updateMarketPrice(marketId, newPrice, newSupply);
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

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Simulate market price updates (for demo purposes)
  setInterval(() => {
    storage.getAllMarkets().then((markets) => {
      markets.forEach((market) => {
        // Randomly update price slightly
        const currentPrice = parseFloat(market.price);
        const change = (Math.random() - 0.5) * 0.001; // Small random change
        const newPrice = Math.max(0.01, currentPrice + change).toFixed(4);
        
        storage.updateMarketPrice(market.id, newPrice, market.supply);
        
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

  return httpServer;
}
