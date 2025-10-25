import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { dbStorage as storage, ValidationError, NotFoundError } from "./db-storage";
import { seed } from "./seed";
import { metricsUpdater } from "./metrics-updater";
import { marketResolver } from "./market-resolver";
import { socialMediaClient } from "./social-api-client";
import { verifySolanaSignature, validateAuthMessage } from "./solana-auth";
import { solanaWallet } from "./solana-wallet";
import { createDepositMonitor } from "./solana-deposit-monitor";
import { createWithdrawalProcessor } from "./solana-withdrawal-processor";
import { addDays } from "date-fns";
import rateLimit from "express-rate-limit";

// We'll initialize these after the broadcast function is created
let depositMonitor: ReturnType<typeof createDepositMonitor>;
let withdrawalProcessor: ReturnType<typeof createWithdrawalProcessor>;

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

  // Initialize deposit monitor and withdrawal processor with broadcast callback
  depositMonitor = createDepositMonitor(storage, broadcast);
  withdrawalProcessor = createWithdrawalProcessor(storage, broadcast);

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

  // Guest sign-in
  app.post("/api/auth/guest", async (req, res) => {
    try {
      const guestUsername = `Guest_${Date.now()}`;
      const user = await storage.createUser({
        username: guestUsername,
        authProvider: "guest",
        isGuest: true,
      });

      res.json({ 
        userId: user.id, 
        username: user.username,
        isGuest: true 
      });
    } catch (error) {
      console.error("Guest sign-in error:", error);
      res.status(500).json({ message: "Failed to create guest account" });
    }
  });

  // Solana wallet authentication - nonce storage (in-memory with 5-minute expiration)
  const solananonces = new Map<string, { timestamp: number }>();
  const NONCE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes
  const MAX_NONCE_AGE_FOR_MESSAGE = 10 * 60 * 1000; // 10 minutes - prevents very old signatures

  // Clean up expired nonces periodically
  const nonceCleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [nonce, data] of Array.from(solananonces.entries())) {
      if (now - data.timestamp > NONCE_EXPIRATION_MS) {
        solananonces.delete(nonce);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired nonces. Current nonce count: ${solananonces.size}`);
    }
  }, 60000); // Clean up every minute

  // Clear all nonces on server shutdown (for testing purposes)
  process.on('SIGTERM', () => {
    clearInterval(nonceCleanupInterval);
    solananonces.clear();
    console.log('Cleared all authentication nonces on shutdown');
  });

  // Rate limiter for authentication endpoints
  const authRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute per IP
    message: { message: "Too many authentication attempts. Please try again in a minute." },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
      res.status(429).json({ 
        message: "Too many authentication attempts. Please try again in a minute.",
        retryAfter: 60 
      });
    }
  });

  app.post("/api/auth/solana/nonce", authRateLimiter, async (req, res) => {
    try {
      const nonce = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      solananonces.set(nonce, { timestamp: Date.now() });
      console.log(`Generated nonce: ${nonce}, total active nonces: ${solananonces.size}`);
      res.json({ nonce });
    } catch (error) {
      console.error("Nonce generation error:", error);
      res.status(500).json({ message: "Failed to generate authentication nonce" });
    }
  });

  app.post("/api/auth/solana/verify", authRateLimiter, async (req, res) => {
    try {
      const { publicKey, signature, message, nonce } = req.body;

      if (!publicKey || !signature || !message || !nonce) {
        console.warn("Solana auth attempt with missing fields");
        return res.status(400).json({ 
          message: "Missing required fields: publicKey, signature, message, nonce",
          errorCode: "MISSING_FIELDS"
        });
      }

      // Validate message format includes public key and nonce
      const messageValidation = validateAuthMessage(message, publicKey, nonce);
      if (!messageValidation.valid) {
        console.warn(`Message validation failed: ${messageValidation.error}`);
        return res.status(400).json({ 
          message: messageValidation.error,
          errorCode: messageValidation.errorCode
        });
      }

      // Check if nonce exists and is valid
      const nonceData = solananonces.get(nonce);
      if (!nonceData) {
        console.warn(`Invalid or expired nonce attempted: ${nonce}`);
        return res.status(401).json({ 
          message: "Invalid or expired nonce. Please request a new authentication nonce.",
          errorCode: "INVALID_NONCE"
        });
      }

      // Check nonce expiration
      const nonceAge = Date.now() - nonceData.timestamp;
      if (nonceAge > NONCE_EXPIRATION_MS) {
        solananonces.delete(nonce);
        console.warn(`Expired nonce attempted (age: ${nonceAge}ms): ${nonce}`);
        return res.status(401).json({ 
          message: "Nonce has expired. Please request a new authentication nonce.",
          errorCode: "NONCE_EXPIRED"
        });
      }

      // Delete nonce immediately (single-use)
      solananonces.delete(nonce);
      console.log(`Nonce consumed: ${nonce}, remaining nonces: ${solananonces.size}`);

      // Verify Solana signature with comprehensive validation
      const verificationResult = verifySolanaSignature(publicKey, signature, message);

      if (!verificationResult.valid) {
        console.warn(`Signature verification failed: ${verificationResult.error}, code: ${verificationResult.errorCode}`);
        return res.status(401).json({ 
          message: verificationResult.error || "Invalid signature",
          errorCode: verificationResult.errorCode || "INVALID_SIGNATURE"
        });
      }

      // Get or create user
      let user = await storage.getUserByWalletAddress(publicKey);

      if (!user) {
        console.log(`Creating new user for wallet: ${publicKey.substring(0, 8)}...`);
        user = await storage.createUser({
          walletAddress: publicKey,
          authProvider: "solana",
          isGuest: false,
          username: `Wallet_${publicKey.substring(0, 8)}`,
        });
        console.log(`New user created: ${user.id}, username: ${user.username}`);
      } else {
        console.log(`Existing user authenticated: ${user.id}, username: ${user.username}`);
      }

      res.json({ 
        userId: user.id, 
        username: user.username,
        walletAddress: user.walletAddress 
      });
    } catch (error) {
      console.error("Solana auth error:", error);
      if (error instanceof Error) {
        console.error("Error stack:", error.stack);
      }
      res.status(500).json({ 
        message: "Failed to authenticate with Solana wallet. Please try again.",
        errorCode: "SERVER_ERROR"
      });
    }
  });

  // X (Twitter) OAuth endpoints - Prepared for free tier API
  // Note: These endpoints are prepared but require X API credentials to be functional
  // For free tier, you'll need to set up OAuth 2.0 in the X Developer Portal
  app.post("/api/auth/twitter/oauth-url", async (req, res) => {
    try {
      const { callbackUrl } = req.body;

      const twitterClientId = process.env.TWITTER_CLIENT_ID;
      if (!twitterClientId) {
        return res.status(503).json({ 
          message: "X (Twitter) authentication is not configured. Please add TWITTER_CLIENT_ID to environment variables.",
          configured: false
        });
      }

      const state = Buffer.from(JSON.stringify({ timestamp: Date.now() })).toString('base64');
      const codeChallenge = Buffer.from(Math.random().toString()).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

      const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('client_id', twitterClientId);
      authUrl.searchParams.append('redirect_uri', callbackUrl || `${req.protocol}://${req.get('host')}/auth/twitter/callback`);
      authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('code_challenge', codeChallenge);
      authUrl.searchParams.append('code_challenge_method', 'plain');

      res.json({ 
        authUrl: authUrl.toString(),
        state,
        codeChallenge,
        configured: true
      });
    } catch (error) {
      console.error("Twitter OAuth URL error:", error);
      res.status(500).json({ message: "Failed to generate OAuth URL" });
    }
  });

  app.post("/api/auth/twitter/callback", async (req, res) => {
    try {
      const { code, state } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Authorization code is required" });
      }

      const twitterClientId = process.env.TWITTER_CLIENT_ID;
      const twitterClientSecret = process.env.TWITTER_CLIENT_SECRET;

      if (!twitterClientId || !twitterClientSecret) {
        return res.status(503).json({ 
          message: "X (Twitter) authentication is not fully configured. Please add TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET to environment variables."
        });
      }

      res.status(501).json({ 
        message: "X (Twitter) OAuth callback is prepared but not yet implemented. This endpoint will exchange the authorization code for access tokens and create/login the user.",
        note: "To complete implementation, add OAuth token exchange logic here."
      });
    } catch (error) {
      console.error("Twitter OAuth callback error:", error);
      res.status(500).json({ message: "Failed to complete OAuth flow" });
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

  // Get user profile by username
  app.get("/api/profile/:username", async (req, res) => {
    try {
      const { username } = req.params;

      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const result = await storage.getProfileByUsername(username);
      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      const { user, profile } = result;

      res.json({
        user,
        profile,
        isFollowing: false
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
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

  // Get historical metrics for a specific KOL
  app.get("/api/kols/:id/history", async (req, res) => {
    try {
      const kolId = req.params.id;
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      // Validate days parameter
      if (Number.isNaN(days)) {
        return res.status(400).json({ message: "Invalid days parameter - must be a number" });
      }

      if (days < 1 || days > 365) {
        return res.status(400).json({ message: "Days must be between 1 and 365" });
      }

      const kol = await storage.getKol(kolId);
      if (!kol) {
        return res.status(404).json({ message: "KOL not found" });
      }

      const history = await storage.getKolMetricsHistory(kolId, days);

      res.json({
        kol: {
          id: kol.id,
          name: kol.name,
          handle: kol.handle,
          avatar: kol.avatar,
        },
        history,
        days,
      });
    } catch (error) {
      console.error("Error fetching KOL history:", error);
      res.status(500).json({ message: "Failed to fetch KOL metrics history" });
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

  // Preview price impact before placing a bet
  app.post("/api/bets/preview", async (req, res) => {
    try {
      const { marketId, position, amount, action = "buy", slippageTolerance } = req.body;

      // Input validation
      if (!marketId || typeof marketId !== 'string') {
        return res.status(400).json({ message: "Valid marketId is required" });
      }

      if (!position || (position !== "YES" && position !== "NO")) {
        return res.status(400).json({ message: "Position must be 'YES' or 'NO'" });
      }

      if (!action || (action !== "buy" && action !== "sell")) {
        return res.status(400).json({ message: "Action must be 'buy' or 'sell'" });
      }

      const amountValidation = validateNumericAmount(amount, "Amount", 0.01, 1000000);
      if (!amountValidation.valid) {
        return res.status(400).json({ message: amountValidation.error });
      }

      // Get market data
      const market = await storage.getMarket(marketId);
      if (!market) {
        return res.status(404).json({ message: "Market not found" });
      }

      const yesPool = parseFloat(market.yesPool);
      const noPool = parseFloat(market.noPool);
      const currentPrice = position === "YES" ? parseFloat(market.yesPrice) : parseFloat(market.noPrice);
      const tradeAmount = parseFloat(amount);

      // Calculate AMM values
      const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "0.02");
      const k = yesPool * noPool;

      let sharesAmount: number;
      let newYesPool: number;
      let newNoPool: number;
      let netAmount = tradeAmount;

      if (action === "buy") {
        // Deduct platform fee for buy orders
        netAmount = tradeAmount * (1 - PLATFORM_FEE_PERCENTAGE);

        // Calculate shares from constant product formula
        if (position === "YES") {
          newNoPool = k / (yesPool + netAmount);
          sharesAmount = noPool - newNoPool;
          newYesPool = yesPool + netAmount;
        } else {
          newYesPool = k / (noPool + netAmount);
          sharesAmount = yesPool - newYesPool;
          newNoPool = noPool + netAmount;
        }
      } else {
        // Selling shares
        sharesAmount = tradeAmount;
        if (position === "YES") {
          newNoPool = k / (yesPool - sharesAmount);
          netAmount = newNoPool - noPool;
          newYesPool = yesPool - sharesAmount;
        } else {
          newYesPool = k / (noPool - sharesAmount);
          netAmount = newYesPool - yesPool;
          newNoPool = noPool - sharesAmount;
        }
      }

      // Apply same validation rules as DbStorage.placeBetWithLocking
      const warnings = [];
      const MAX_PRICE_IMPACT = 0.25; // Hard cap from db-storage.ts
      const MAX_TRADE_PERCENTAGE = 0.40; // 40% max trade size
      const DEFAULT_SLIPPAGE_TOLERANCE = 0.10; // 10% default from db-storage.ts
      const HIGH_IMPACT_THRESHOLD = 0.10;
      const MEDIUM_IMPACT_THRESHOLD = 0.05;
      const MIN_PRICE = 0.01;
      const MAX_PRICE = 0.99;

      // Use same slippage tolerance logic as DbStorage.placeBetWithLocking
      // Nullish coalescing (??) only defaults for null/undefined, NOT empty string
      // Empty string coerces to 0 in numeric context (matches backend behavior)
      const effectiveSlippageTolerance = slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE;

      // Validate trade size (40% of pool maximum)
      if (action === "buy") {
        const totalLiquidity = yesPool + noPool;
        const maxTradeSize = totalLiquidity * MAX_TRADE_PERCENTAGE;
        if (netAmount > maxTradeSize) {
          warnings.push({
            severity: "error",
            message: `Trade size too large. Maximum allowed is ${maxTradeSize.toFixed(2)} (40% of pool). Your trade: ${netAmount.toFixed(2)}. Trade will be rejected.`
          });
          return res.json({
            currentPrice: currentPrice.toFixed(4),
            newPrice: "N/A",
            priceImpact: 0,
            priceImpactPercent: "N/A",
            estimatedShares: "0.00",
            platformFee: (tradeAmount * PLATFORM_FEE_PERCENTAGE).toFixed(2),
            netAmount: netAmount.toFixed(2),
            warnings,
            poolState: {
              currentYesPool: yesPool.toFixed(2),
              currentNoPool: noPool.toFixed(2),
              newYesPool: "N/A",
              newNoPool: "N/A",
              totalLiquidity: (yesPool + noPool).toFixed(2),
            }
          });
        }
      }

      // Calculate new price
      const totalPool = newYesPool + newNoPool;
      const newPrice = position === "YES" ? newYesPool / totalPool : newNoPool / totalPool;
      const priceImpact = Math.abs(newPrice - currentPrice) / currentPrice;

      // Check price bounds
      if (newPrice < MIN_PRICE || newPrice > MAX_PRICE) {
        warnings.push({
          severity: "error",
          message: `Trade would push price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting price: ${newPrice.toFixed(4)}. Trade will be rejected.`
        });
      }

      // ⚠️ PRICE IMPACT VALIDATION TEMPORARILY DISABLED FOR POINTS-ONLY MODE
      // See PRICE_IMPACT_BACKUP.md for restoration code

      // Show informational warnings only (no rejections)
      if (priceImpact > HIGH_IMPACT_THRESHOLD) {
        warnings.push({
          severity: "warning",
          message: `High price impact: ${(priceImpact * 100).toFixed(2)}%. Consider splitting into smaller trades.`
        });
      } else if (priceImpact > MEDIUM_IMPACT_THRESHOLD) {
        warnings.push({
          severity: "info",
          message: `Moderate price impact: ${(priceImpact * 100).toFixed(2)}%.`
        });
      }

      // Check liquidity
      const totalLiquidity = yesPool + noPool;
      const LOW_LIQUIDITY_THRESHOLD = 5000; // $5,000
      if (totalLiquidity < LOW_LIQUIDITY_THRESHOLD) {
        warnings.push({
          severity: "warning",
          message: `Low liquidity market (${totalLiquidity.toFixed(2)} total pool). Trades may have higher price impact.`
        });
      }

      res.json({
        currentPrice: currentPrice.toFixed(4),
        newPrice: newPrice.toFixed(4),
        priceImpact: priceImpact,
        priceImpactPercent: (priceImpact * 100).toFixed(2) + '%',
        estimatedShares: sharesAmount.toFixed(2),
        platformFee: action === "buy" ? (tradeAmount * PLATFORM_FEE_PERCENTAGE).toFixed(2) : "0.00",
        netAmount: netAmount.toFixed(2),
        warnings,
        poolState: {
          currentYesPool: yesPool.toFixed(2),
          currentNoPool: noPool.toFixed(2),
          newYesPool: newYesPool.toFixed(2),
          newNoPool: newNoPool.toFixed(2),
          totalLiquidity: totalLiquidity.toFixed(2),
        }
      });
    } catch (error) {
      console.error("Error previewing trade:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to preview trade" 
      });
    }
  });

  // Create a new bet (buy or sell YES/NO positions)
  // NOW USES ROBUST TRANSACTION WITH ROW-LEVEL LOCKING AND SLIPPAGE PROTECTION
  app.post("/api/bets", async (req, res) => {
    try {
      const { marketId, position, amount, action = "buy", userId, slippageTolerance } = req.body;

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

      // Validate slippage tolerance if provided (optional parameter)
      let validatedSlippage: number | undefined;
      if (slippageTolerance !== undefined) {
        const slippageValidation = validateNumericAmount(slippageTolerance, "Slippage tolerance", 0, 1);
        if (!slippageValidation.valid) {
          return res.status(400).json({ message: slippageValidation.error });
        }
        validatedSlippage = parseFloat(slippageTolerance);
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

      // Execute the bet transaction with row-level locking and slippage protection
      // All validation, calculations, and updates happen atomically inside the transaction
      const result = await storage.placeBetWithLocking({
        userId: actualUserId,
        marketId,
        position: position as "YES" | "NO",
        amount: parseFloat(amount),
        action: action as "buy" | "sell",
        slippageTolerance: validatedSlippage,
      });

      // Broadcast update via WebSocket
      try {
        const marketWithKol = await storage.getMarketWithKol(marketId);
        broadcast({
          type: 'BET_PLACED',
          bet: result.bet,
          market: marketWithKol,
          priceImpact: result.priceImpact,
        });
      } catch (error) {
        console.error("Error broadcasting bet update:", error);
      }

      res.json({
        bet: result.bet,
        priceImpact: result.priceImpact,
        priceImpactPercent: (result.priceImpact * 100).toFixed(2) + '%'
      });
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

  // Generate Win/Loss Ratio Markets
  app.post("/api/admin/generate-wl-markets", async (req, res) => {
    try {
      console.error('\n' + '='.repeat(70));
      console.error('🎯 Generating Win/Loss Ratio Head-to-Head Markets');
      console.error('='.repeat(70));

      const scrapedKolsData = await storage.getLatestScrapedKols(20);
      console.error(`📊 Found ${scrapedKolsData.length} scraped KOLs`);
      console.error('First KOL:', scrapedKolsData[0]);

      const validKOLs = scrapedKolsData.filter(k => {
        const wins = k.wins;
        const losses = k.losses;
        return wins !== null && losses !== null && !isNaN(wins) && !isNaN(losses) && losses > 0;
      });

      console.log(`✅ ${validKOLs.length} KOLs have valid win/loss data`);

      if (validKOLs.length < 8) {
        return res.status(400).json({ 
          message: 'Need at least 8 KOLs with valid win/loss data to create 4 unique markets',
          available: validKOLs.length 
        });
      }

      const usedKOLs = new Set<string>();
      const createdMarkets: any[] = [];

      for (let i = 0; i < 4 && validKOLs.length >= 2; i++) {
        const availableKOLs = validKOLs.filter(k => !usedKOLs.has(k.username));

        if (availableKOLs.length < 2) {
          console.error(`⚠️ Not enough available KOLs for market ${i + 1}`);
          break;
        }

        const [kolA, kolB] = availableKOLs.slice(0, 2);

        const winsA = kolA.wins!;
        const lossesA = kolA.losses!;
        const winsB = kolB.wins!;
        const lossesB = kolB.losses!;

        const ratioA = (winsA / lossesA).toFixed(2);
        const ratioB = (winsB / lossesB).toFixed(2);
        const winsLossesA = `${winsA}/${lossesA}`;
        const winsLossesB = `${winsB}/${lossesB}`;

        const kolARecord = await storage.getKolByHandle(kolA.username);
        if (!kolARecord) {
          console.error(`❌ Could not find KOL ${kolA.username} in database`);
          continue;
        }

        const market = {
          kolId: kolARecord.id,
          title: `Will ${kolA.username} have a higher win/loss ratio than ${kolB.username} on tomorrow's leaderboard?`,
          description: `Win/Loss ratio comparison: ${kolA.username} has ${ratioA} (${winsLossesA}) vs ${kolB.username} with ${ratioB} (${winsLossesB})`,
          outcome: 'pending' as const,
          yesPool: "10000.00",
          noPool: "10000.00",
          resolvesAt: addDays(new Date(), 1),
          marketType: 'winloss_ratio_flippening',
          marketCategory: 'performance',
          requiresXApi: false,
        };

        const createdMarket = await storage.createMarket(market);

        await storage.createMarketMetadata({
          marketId: createdMarket.id,
          marketType: 'winloss_ratio_flippening',
          kolA: kolA.username,
          kolB: kolB.username,
          xHandle: null,
          currentFollowers: null,
          currentRankA: kolA.rank.toString() || null,
          currentRankB: kolB.rank.toString() || null,
          currentUsd: null,
          currentSolA: null,
          currentSolB: null,
          currentUsdA: null,
          currentUsdB: null,
          currentWinsLossesA: winsLossesA,
          currentWinsLossesB: winsLossesB,
          threshold: null,
          timeframeDays: null,
        });

        usedKOLs.add(kolA.username);
        usedKOLs.add(kolB.username);

        console.log(`\n✅ MARKET ${i + 1} CREATED`);
        console.log(`   Title: ${createdMarket.title}`);
        console.log(`   ${kolA.username}: ${ratioA} ratio (${winsLossesA})`);
        console.log(`   ${kolB.username}: ${ratioB} ratio (${winsLossesB})`);
        console.log(`   Market ID: ${createdMarket.id}`);

        createdMarkets.push({
          id: createdMarket.id,
          title: createdMarket.title,
          kolA: kolA.username,
          kolB: kolB.username,
          ratioA,
          ratioB,
        });
      }

      console.log(`\n${'='.repeat(70)}`);
      console.log(`✅ Successfully created ${createdMarkets.length} win/loss ratio markets`);
      console.log(`${'='.repeat(70)}`);

      res.json({
        success: true,
        created: createdMarkets.length,
        markets: createdMarkets,
      });
    } catch (error) {
      console.error("Error generating win/loss markets:", error);
      res.status(500).json({ message: "Failed to generate markets" });
    }
  });

  // Resolve ALL markets and generate new ones
  app.post("/api/admin/reset-markets", async (req, res) => {
    try {
      console.log('\n' + '='.repeat(70));
      console.log('MARKET RESET: Resolving all markets and generating new ones');
      console.log('='.repeat(70));

      const resolutions = await marketResolver.resolveAllMarkets();

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

      console.log(`✅ Resolved ${resolutions.length} markets`);
      console.log('🔄 Generating new markets...');

      const generationResult = await scheduler.performMarketGeneration();

      console.log('='.repeat(70));
      console.log(`MARKET RESET COMPLETED: ${resolutions.length} resolved, ${generationResult.created} new markets created`);
      console.log('='.repeat(70) + '\n');

      res.json({ 
        message: "Market reset completed", 
        resolved: resolutions.length,
        generated: generationResult.created,
        resolutions,
      });
    } catch (error) {
      console.error("Error resetting markets:", error);
      res.status(500).json({ 
        message: "Failed to reset markets",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

  // Import scheduler and demo data
  const { scheduler } = await import("./scheduler");
  const { seedRealisticKolscanData } = await import("./demo-kolscan-data");

  // Manual trigger for scraping
  app.post("/api/admin/scrape-kols", async (req, res) => {
    try {
      const result = await scheduler.performScraping();
      res.json(result);
    } catch (error) {
      console.error("Error scraping KOLs:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to scrape KOLs",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Seed realistic kolscan demo data
  app.post("/api/admin/seed-demo-kols", async (req, res) => {
    try {
      const result = await seedRealisticKolscanData();
      res.json(result);
    } catch (error) {
      console.error("Error seeding demo KOLs:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to seed demo KOLs",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Manual trigger for market generation
  app.post("/api/admin/generate-markets", async (req, res) => {
    try {
      const count = req.body.count || 5;
      const result = await scheduler.performMarketGeneration();
      res.json(result);
    } catch (error) {
      console.error("Error generating markets:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to generate markets",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Solana: Get user's deposit address
  app.get("/api/solana/deposit-address", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.solanaDepositAddress) {
        return res.json({ 
          address: user.solanaDepositAddress,
          balance: user.solanaBalance
        });
      }

      const depositAddress = solanaWallet.generateDepositAddress(userId, 0);
      await storage.updateUserDepositAddress(userId, depositAddress.toBase58());

      res.json({ 
        address: depositAddress.toBase58(),
        balance: user.solanaBalance
      });
    } catch (error) {
      console.error("Error generating deposit address:", error);
      res.status(500).json({ message: "Failed to generate deposit address" });
    }
  });

  // Solana: Record manual deposit (for testing/admin)
  app.post("/api/solana/record-deposit", async (req, res) => {
    try {
      const { userId, signature, depositAddress } = req.body;

      if (!userId || !signature || !depositAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const deposit = await depositMonitor.recordManualDeposit(userId, signature, depositAddress);
      res.json(deposit);
    } catch (error: any) {
      console.error("Error recording deposit:", error);
      res.status(500).json({ message: error.message || "Failed to record deposit" });
    }
  });

  // Solana: Get user's deposit history
  app.get("/api/solana/deposits", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const deposits = await storage.getUserDeposits(userId, limit);
      res.json(deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
      res.status(500).json({ message: "Failed to fetch deposits" });
    }
  });

  // Solana: Request withdrawal
  app.post("/api/solana/withdraw", async (req, res) => {
    try {
      const { userId, destinationAddress, amount } = req.body;

      if (!userId || !destinationAddress || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const amountNumber = parseFloat(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const withdrawal = await withdrawalProcessor.requestWithdrawal(
        userId,
        destinationAddress,
        amountNumber
      );

      res.json(withdrawal);
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      res.status(400).json({ message: error.message || "Failed to process withdrawal" });
    }
  });

  // Solana: Get user's withdrawal history
  app.get("/api/solana/withdrawals", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const withdrawals = await storage.getUserWithdrawals(userId, limit);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Solana: Get withdrawal limits
  app.get("/api/solana/withdrawal-limits", async (req, res) => {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const limits = await withdrawalProcessor.getWithdrawalLimits(userId);
      res.json(limits);
    } catch (error) {
      console.error("Error fetching withdrawal limits:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal limits" });
    }
  });

  // Solana: Get total platform fees collected
  app.get("/api/solana/platform-fees", async (req, res) => {
    try {
      const totalFees = await storage.getTotalPlatformFees();
      res.json({ totalFees });
    } catch (error) {
      console.error("Error fetching platform fees:", error);
      res.status(500).json({ message: "Failed to fetch platform fees" });
    }
  });

  // Get scheduler status
  app.get("/api/admin/scheduler-status", async (req, res) => {
    try {
      const status = scheduler.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get scheduler status" });
    }
  });

  // Update scheduler configuration
  app.post("/api/admin/scheduler-config", async (req, res) => {
    try {
      const updates = req.body;
      scheduler.updateConfig(updates);
      res.json({ 
        message: "Scheduler configuration updated",
        config: scheduler.getConfig()
      });
    } catch (error) {
      console.error("Error updating scheduler config:", error);
      res.status(500).json({ message: "Failed to update scheduler configuration" });
    }
  });

  // Start/stop scheduler tasks
  app.post("/api/admin/scheduler-control", async (req, res) => {
    try {
      const { action, task } = req.body;

      if (action === 'start') {
        if (task === 'scraping') {
          scheduler.startScrapingSchedule();
        } else if (task === 'market-generation') {
          scheduler.startMarketGenerationSchedule();
        } else if (task === 'all') {
          scheduler.startAllSchedules();
        }
      } else if (action === 'stop') {
        if (task === 'scraping') {
          scheduler.stopScrapingSchedule();
        } else if (task === 'market-generation') {
          scheduler.stopMarketGenerationSchedule();
        } else if (task === 'all') {
          scheduler.stopAllSchedules();
        }
      }

      res.json({ 
        message: `Scheduler ${action} ${task} completed`,
        status: scheduler.getStatus()
      });
    } catch (error) {
      console.error("Error controlling scheduler:", error);
      res.status(500).json({ message: "Failed to control scheduler" });
    }
  });

  // Market prices now update organically through real bet placements via placeBetWithLocking
  // No artificial simulation needed

  // Start automatic KOL metrics updates every 30 minutes
  console.log("Starting automatic KOL metrics updates...");
  metricsUpdater.startAutoUpdate(30);

  // Start automatic market resolution every 5 minutes
  console.log("Starting automatic market resolution...");
  marketResolver.startAutoResolution(5);

  // Start daily scheduler for scraping and market generation
  console.log("Starting daily scheduler...");
  scheduler.startAllSchedules();

  // Start Solana deposit monitor
  console.log("Starting Solana deposit monitor...");
  depositMonitor.start();

  // Start Solana withdrawal processor
  console.log("Starting Solana withdrawal processor...");
  withdrawalProcessor.start();

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