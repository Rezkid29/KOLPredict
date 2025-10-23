import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc, sql } from "drizzle-orm";
import ws from "ws";

// Custom error types for proper HTTP status code handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;
import {
  users,
  kols,
  markets,
  bets,
  positions,
  comments,
  transactions,
  kolMetricsHistory,
  scrapedKols,
  followerCache,
  marketMetadata,
  solanaDeposits,
  solanaWithdrawals,
  platformFees,
  type User,
  type InsertUser,
  type Kol,
  type InsertKol,
  type Market,
  type InsertMarket,
  type MarketWithKol,
  type Bet,
  type InsertBet,
  type BetWithMarket,
  type Position,
  type InsertPosition,
  type PositionWithMarket,
  type Comment,
  type InsertComment,
  type CommentWithUser,
  type Transaction,
  type InsertTransaction,
  type KolMetricsHistory,
  type InsertKolMetricsHistory,
  type ScrapedKol,
  type InsertScrapedKol,
  type FollowerCacheEntry,
  type InsertFollowerCache,
  type MarketMetadata,
  type InsertMarketMetadata,
  type SolanaDeposit,
  type InsertSolanaDeposit,
  type SolanaWithdrawal,
  type InsertSolanaWithdrawal,
  type PlatformFee,
  type InsertPlatformFee,
  type LeaderboardEntry,
  type PriceHistoryPoint,
} from "@shared/schema";
import type { IStorage } from "./storage";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.walletAddress, walletAddress)).limit(1);
    return result[0];
  }

  async getUserByTwitterId(twitterId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.twitterId, twitterId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserBalance(id: string, balance: string): Promise<void> {
    await db.update(users).set({ balance }).where(eq(users.id, id));
  }

  async updateUserStats(id: string, totalBets: number, totalWins: number, totalProfit: string): Promise<void> {
    await db.update(users).set({ totalBets, totalWins, totalProfit }).where(eq(users.id, id));
  }

  // KOL methods
  async getKol(id: string): Promise<Kol | undefined> {
    const result = await db.select().from(kols).where(eq(kols.id, id)).limit(1);
    return result[0];
  }

  async getKolByHandle(handle: string): Promise<Kol | undefined> {
    const result = await db.select().from(kols).where(eq(kols.handle, handle)).limit(1);
    return result[0];
  }

  async getAllKols(): Promise<Kol[]> {
    return await db.select().from(kols);
  }

  async createKol(insertKol: InsertKol): Promise<Kol> {
    const result = await db.insert(kols).values(insertKol).returning();
    return result[0];
  }

  async updateKol(id: string, updates: Partial<Omit<Kol, 'id'>>): Promise<Kol> {
    const result = await db.update(kols).set(updates).where(eq(kols.id, id)).returning();
    if (!result[0]) {
      throw new NotFoundError(`KOL with id ${id} not found`);
    }
    return result[0];
  }

  // Market methods
  async getMarket(id: string): Promise<Market | undefined> {
    const result = await db.select().from(markets).where(eq(markets.id, id)).limit(1);
    return result[0];
  }

  async getAllMarkets(): Promise<Market[]> {
    return await db.select().from(markets);
  }

  async getMarketWithKol(id: string): Promise<MarketWithKol | undefined> {
    const result = await db
      .select()
      .from(markets)
      .leftJoin(kols, eq(markets.kolId, kols.id))
      .where(eq(markets.id, id))
      .limit(1);

    if (!result[0] || !result[0].kols) return undefined;

    return {
      ...result[0].markets,
      kol: result[0].kols,
    };
  }

  async getAllMarketsWithKols(): Promise<MarketWithKol[]> {
    const result = await db
      .select()
      .from(markets)
      .leftJoin(kols, eq(markets.kolId, kols.id));

    return result
      .filter((row) => row.kols !== null)
      .map((row) => ({
        ...row.markets,
        kol: row.kols!,
      }));
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const result = await db.insert(markets).values(insertMarket).returning();
    return result[0];
  }

  async updateMarket(id: string, updates: Partial<Omit<Market, 'id' | 'createdAt'>>): Promise<void> {
    await db.update(markets).set(updates).where(eq(markets.id, id));
  }

  async updateMarketPools(id: string, yesPool: string, noPool: string, yesPrice: string, noPrice: string): Promise<void> {
    await db.update(markets).set({ yesPool, noPool, yesPrice, noPrice }).where(eq(markets.id, id));
  }

  async updateMarketVolume(id: string, volume: string): Promise<void> {
    await db.update(markets).set({ totalVolume: volume }).where(eq(markets.id, id));
  }

  async resolveMarket(id: string, resolvedValue: string): Promise<void> {
    await db.update(markets).set({ resolved: true, resolvedValue, isLive: false }).where(eq(markets.id, id));
  }

  // Bet methods
  async getBet(id: string): Promise<Bet | undefined> {
    const result = await db.select().from(bets).where(eq(bets.id, id)).limit(1);
    return result[0];
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt));
  }

  async getUserBetsWithMarkets(userId: string): Promise<BetWithMarket[]> {
    const result = await db
      .select()
      .from(bets)
      .leftJoin(markets, eq(bets.marketId, markets.id))
      .leftJoin(kols, eq(markets.kolId, kols.id))
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.createdAt));

    return result
      .filter((row) => row.markets !== null && row.kols !== null)
      .map((row) => ({
        ...row.bets,
        market: {
          ...row.markets!,
          kol: row.kols!,
        },
      }));
  }

  async getRecentBets(limit: number = 20): Promise<BetWithMarket[]> {
    const result = await db
      .select()
      .from(bets)
      .leftJoin(markets, eq(bets.marketId, markets.id))
      .leftJoin(kols, eq(markets.kolId, kols.id))
      .orderBy(desc(bets.createdAt))
      .limit(limit);

    return result
      .filter((row) => row.markets !== null && row.kols !== null)
      .map((row) => ({
        ...row.bets,
        market: {
          ...row.markets!,
          kol: row.kols!,
        },
      }));
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const result = await db.insert(bets).values(insertBet).returning();
    return result[0];
  }

  async getMarketBets(marketId: string): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.marketId, marketId));
  }

  async updateBetStatus(id: string, status: string, profit?: string): Promise<void> {
    if (profit !== undefined) {
      await db.update(bets).set({ status, profit }).where(eq(bets.id, id));
    } else {
      await db.update(bets).set({ status }).where(eq(bets.id, id));
    }
  }

  // Legacy transactional bet placement - DEPRECATED - use placeBetWithLocking instead
  async placeBetTransaction(params: {
    bet: InsertBet;
    userId: string;
    marketId: string;
    position: string;
    shares: number;
    action: string;
    newBalance: string;
    totalBets: number;
    totalWins: number;
    totalProfit: string;
    yesPool: string;
    noPool: string;
    yesPrice: string;
    noPrice: string;
    newVolume: string;
  }): Promise<Bet> {
    return await db.transaction(async (tx) => {
      // 1. Create the bet
      const [createdBet] = await tx.insert(bets).values(params.bet).returning();

      // 2. Update user position
      const existingPosition = await tx
        .select()
        .from(positions)
        .where(
          sql`${positions.userId} = ${params.userId} AND ${positions.marketId} = ${params.marketId} AND ${positions.position} = ${params.position}`
        )
        .limit(1);

      if (existingPosition.length > 0) {
        const pos = existingPosition[0];
        const currentShares = parseFloat(pos.shares);
        const currentAvgPrice = parseFloat(pos.averagePrice);
        
        if (params.action === "buy") {
          const newShares = currentShares + params.shares;
          const newAvgPrice = ((currentShares * currentAvgPrice) + (params.shares * parseFloat(params.bet.price))) / newShares;
          
          await tx
            .update(positions)
            .set({
              shares: newShares.toFixed(2),
              averagePrice: newAvgPrice.toFixed(4),
              updatedAt: new Date(),
            })
            .where(eq(positions.id, pos.id));
        } else {
          await tx
            .update(positions)
            .set({
              shares: Math.max(0, currentShares - params.shares).toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(positions.id, pos.id));
        }
      } else if (params.action === "buy") {
        // Create new position
        await tx.insert(positions).values({
          userId: params.userId,
          marketId: params.marketId,
          position: params.position,
          shares: params.shares.toFixed(2),
          averagePrice: params.bet.price,
        });
      }

      // 3. Update user balance
      await tx
        .update(users)
        .set({ balance: params.newBalance })
        .where(eq(users.id, params.userId));

      // 4. Update user stats
      await tx
        .update(users)
        .set({
          totalBets: params.totalBets,
          totalWins: params.totalWins,
          totalProfit: params.totalProfit,
        })
        .where(eq(users.id, params.userId));

      // 5. Update market pools and prices
      await tx
        .update(markets)
        .set({
          yesPool: params.yesPool,
          noPool: params.noPool,
          yesPrice: params.yesPrice,
          noPrice: params.noPrice,
          totalVolume: params.newVolume,
        })
        .where(eq(markets.id, params.marketId));

      return createdBet;
    });
  }

  // NEW: Robust transactional bet placement with row-level locking and internal calculations
  // This eliminates race conditions by performing all reads, calculations, and writes atomically
  async placeBetWithLocking(params: {
    userId: string;
    marketId: string;
    position: "YES" | "NO";
    amount: number;
    action: "buy" | "sell";
    slippageTolerance?: number; // Optional: max acceptable price impact (0-1), defaults to 0.05 (5%)
  }): Promise<{
    bet: Bet;
    priceImpact: number;
    error?: string;
  }> {
    return await db.transaction(async (tx) => {
      // STEP 1: Lock and read market data (prevents concurrent modifications)
      const [market] = await tx
        .select()
        .from(markets)
        .where(eq(markets.id, params.marketId))
        .for('update')
        .limit(1);

      if (!market) {
        throw new NotFoundError("Market not found");
      }

      // Re-validate market state inside transaction
      if (!market.isLive) {
        throw new ValidationError("Market is not live");
      }

      if (market.outcome !== "pending") {
        throw new ValidationError("Market is already resolved");
      }

      // STEP 2: Lock and read user data (prevents concurrent balance modifications)
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, params.userId))
        .for('update')
        .limit(1);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Parse pool values inside transaction (fresh data)
      const yesPool = parseFloat(market.yesPool);
      const noPool = parseFloat(market.noPool);
      const userBalance = parseFloat(user.balance);

      // Validate pool values
      if (isNaN(yesPool) || isNaN(noPool) || !isFinite(yesPool) || !isFinite(noPool)) {
        throw new ValidationError("Market has invalid pool values");
      }

      if (yesPool <= 0 || noPool <= 0) {
        throw new ValidationError("Market pools are depleted");
      }

      // AMM Safety Constants
      const MIN_PRICE = 0.01;  // Minimum price to prevent prices from going to 0
      const MAX_PRICE = 0.99;  // Maximum price to prevent prices from going to 1
      const MAX_TRADE_PERCENTAGE = 0.40; // Maximum 40% of pool size per trade
      const DEFAULT_SLIPPAGE_TOLERANCE = 0.05; // Default 5% slippage tolerance
      
      // Use provided slippage tolerance or default
      const slippageTolerance = params.slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE;
      
      // Validate slippage tolerance
      if (slippageTolerance < 0 || slippageTolerance > 1) {
        throw new ValidationError("Slippage tolerance must be between 0 and 1");
      }

      // STEP 3: Perform AMM calculations inside transaction
      const calculateAMMPrices = (yesP: number, noP: number) => {
        const totalPool = yesP + noP;
        return {
          yesPrice: yesP / totalPool,
          noPrice: noP / totalPool,
        };
      };

      const calculateSharesForBuy = (
        amt: number,
        pos: "YES" | "NO",
        yesP: number,
        noP: number
      ): number => {
        const k = yesP * noP;
        if (pos === "YES") {
          const newNoPool = k / (yesP + amt);
          return noP - newNoPool;
        } else {
          const newYesPool = k / (noP + amt);
          return yesP - newYesPool;
        }
      };

      const calculatePayoutForSell = (
        shares: number,
        pos: "YES" | "NO",
        yesP: number,
        noP: number
      ): number => {
        const k = yesP * noP;
        if (pos === "YES") {
          const newNoPool = k / (yesP - shares);
          return newNoPool - noP;
        } else {
          const newYesPool = k / (noP - shares);
          return newYesPool - yesP;
        }
      };

      let betAmount: number;
      let sharesAmount: number;
      let newYesPool: number;
      let newNoPool: number;

      if (params.action === "buy") {
        // Re-validate balance inside transaction
        if (params.amount > userBalance) {
          throw new ValidationError(
            `Insufficient balance. You have ${userBalance.toFixed(2)} but trying to spend ${params.amount.toFixed(2)}`
          );
        }

        // Validate trade size relative to pool (max 40% of available liquidity)
        const totalLiquidity = yesPool + noPool;
        const maxTradeSize = totalLiquidity * MAX_TRADE_PERCENTAGE;
        if (params.amount > maxTradeSize) {
          throw new ValidationError(
            `Trade size too large. Maximum allowed is ${maxTradeSize.toFixed(2)} (40% of pool). Your trade: ${params.amount.toFixed(2)}`
          );
        }

        betAmount = params.amount;
        sharesAmount = calculateSharesForBuy(params.amount, params.position, yesPool, noPool);

        // Validate calculation
        if (isNaN(sharesAmount) || !isFinite(sharesAmount) || sharesAmount < 0) {
          throw new ValidationError("Invalid share calculation - trade too large for pool liquidity");
        }

        // Calculate new pools
        if (params.position === "YES") {
          newYesPool = yesPool + params.amount;
          newNoPool = noPool - sharesAmount;
        } else {
          newNoPool = noPool + params.amount;
          newYesPool = yesPool - sharesAmount;
        }

        // Validate new pools
        if (newYesPool <= 0 || newNoPool <= 0) {
          throw new ValidationError("Trade amount too large - would deplete market pools");
        }
      } else {
        // Selling - lock and read user position
        const [userPosition] = await tx
          .select()
          .from(positions)
          .where(
            sql`${positions.userId} = ${params.userId} AND ${positions.marketId} = ${params.marketId} AND ${positions.position} = ${params.position}`
          )
          .for('update')
          .limit(1);

        const currentShares = userPosition ? parseFloat(userPosition.shares) : 0;

        // Re-validate shares inside transaction
        if (params.amount > currentShares) {
          throw new ValidationError(
            `Insufficient ${params.position} shares. You own ${currentShares.toFixed(2)} but trying to sell ${params.amount.toFixed(2)}`
          );
        }

        if (params.amount > (params.position === "YES" ? yesPool : noPool)) {
          throw new ValidationError("Cannot sell more shares than available in pool");
        }

        sharesAmount = params.amount;
        betAmount = calculatePayoutForSell(params.amount, params.position, yesPool, noPool);

        // Validate calculation
        if (isNaN(betAmount) || !isFinite(betAmount) || betAmount < 0) {
          throw new ValidationError("Invalid payout calculation");
        }

        // Calculate new pools
        if (params.position === "YES") {
          newYesPool = yesPool - params.amount;
          newNoPool = noPool + betAmount;
        } else {
          newNoPool = noPool - params.amount;
          newYesPool = yesPool + betAmount;
        }

        // Sanity check
        if (newYesPool < 0 || newNoPool < 0) {
          throw new ValidationError("Invalid trade - would result in negative pool values");
        }
      }

      // Calculate new prices
      const prices = calculateAMMPrices(newYesPool, newNoPool);
      const yesPrice = prices.yesPrice;
      const noPrice = prices.noPrice;

      // Validate prices
      if (isNaN(yesPrice) || isNaN(noPrice) || !isFinite(yesPrice) || !isFinite(noPrice)) {
        throw new ValidationError("Invalid price calculation result");
      }

      if (yesPrice < 0 || yesPrice > 1 || noPrice < 0 || noPrice > 1) {
        throw new ValidationError("Calculated prices out of valid range [0, 1]");
      }

      // Enforce price bounds to prevent extreme prices (prevents math instability)
      if (yesPrice < MIN_PRICE || yesPrice > MAX_PRICE) {
        throw new ValidationError(
          `Trade would push price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting price: ${yesPrice.toFixed(4)}. Reduce trade size.`
        );
      }

      if (noPrice < MIN_PRICE || noPrice > MAX_PRICE) {
        throw new ValidationError(
          `Trade would push price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting price: ${noPrice.toFixed(4)}. Reduce trade size.`
        );
      }

      // Calculate price impact and validate slippage for both buys and sells
      const currentPrice = params.position === "YES" ? parseFloat(market.yesPrice) : parseFloat(market.noPrice);
      const newPrice = params.position === "YES" ? yesPrice : noPrice;
      const priceImpact = Math.abs(newPrice - currentPrice) / currentPrice;
      
      // Check slippage protection for both buy and sell trades
      if (priceImpact > slippageTolerance) {
        throw new ValidationError(
          `Price impact (${(priceImpact * 100).toFixed(2)}%) exceeds slippage tolerance (${(slippageTolerance * 100).toFixed(2)}%). Current price: ${currentPrice.toFixed(4)}, New price: ${newPrice.toFixed(4)}. Reduce trade size or increase slippage tolerance.`
        );
      }

      // STEP 4: Create bet record
      const [createdBet] = await tx
        .insert(bets)
        .values({
          userId: params.userId,
          marketId: params.marketId,
          position: params.position,
          amount: betAmount.toFixed(2),
          price: currentPrice.toFixed(4),
          shares: sharesAmount.toFixed(2),
        })
        .returning();

      // STEP 5: Update user position
      const existingPosition = await tx
        .select()
        .from(positions)
        .where(
          sql`${positions.userId} = ${params.userId} AND ${positions.marketId} = ${params.marketId} AND ${positions.position} = ${params.position}`
        )
        .limit(1);

      if (existingPosition.length > 0) {
        const pos = existingPosition[0];
        const currentShares = parseFloat(pos.shares);
        const currentAvgPrice = parseFloat(pos.averagePrice);

        if (params.action === "buy") {
          const newShares = currentShares + sharesAmount;
          const newAvgPrice = ((currentShares * currentAvgPrice) + (sharesAmount * currentPrice)) / newShares;

          await tx
            .update(positions)
            .set({
              shares: newShares.toFixed(2),
              averagePrice: newAvgPrice.toFixed(4),
              updatedAt: new Date(),
            })
            .where(eq(positions.id, pos.id));
        } else {
          await tx
            .update(positions)
            .set({
              shares: Math.max(0, currentShares - sharesAmount).toFixed(2),
              updatedAt: new Date(),
            })
            .where(eq(positions.id, pos.id));
        }
      } else if (params.action === "buy") {
        await tx.insert(positions).values({
          userId: params.userId,
          marketId: params.marketId,
          position: params.position,
          shares: sharesAmount.toFixed(2),
          averagePrice: currentPrice.toFixed(4),
        });
      }

      // STEP 6: Update user balance
      const newBalance = params.action === "buy"
        ? (userBalance - betAmount).toFixed(2)
        : (userBalance + betAmount).toFixed(2);

      // Final safety check
      if (parseFloat(newBalance) < 0) {
        throw new ValidationError("Balance calculation resulted in negative value");
      }

      await tx
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, params.userId));

      // STEP 7: Update user stats
      await tx
        .update(users)
        .set({
          totalBets: user.totalBets + 1,
          totalWins: user.totalWins,
          totalProfit: user.totalProfit,
        })
        .where(eq(users.id, params.userId));

      // STEP 8: Update market pools and prices
      await tx
        .update(markets)
        .set({
          yesPool: newYesPool.toFixed(2),
          noPool: newNoPool.toFixed(2),
          yesPrice: yesPrice.toFixed(4),
          noPrice: noPrice.toFixed(4),
          totalVolume: (parseFloat(market.totalVolume) + betAmount).toFixed(2),
        })
        .where(eq(markets.id, params.marketId));

      return { bet: createdBet, priceImpact };
    });
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const result = await db
      .select({
        userId: users.id,
        username: users.username,
        totalProfit: users.totalProfit,
        totalBets: users.totalBets,
        totalWins: users.totalWins,
      })
      .from(users)
      .where(sql`${users.totalBets} > 0`)
      .orderBy(desc(users.totalProfit));

    return result.map((user, index) => ({
      ...user,
      winRate: user.totalBets > 0 ? (user.totalWins / user.totalBets) * 100 : 0,
      rank: index + 1,
    }));
  }

  // Position methods
  async getUserPosition(userId: string, marketId: string, position: string): Promise<Position | undefined> {
    const result = await db
      .select()
      .from(positions)
      .where(sql`${positions.userId} = ${userId} AND ${positions.marketId} = ${marketId} AND ${positions.position} = ${position}`)
      .limit(1);
    return result[0];
  }

  async getUserPositions(userId: string): Promise<Position[]> {
    return await db
      .select()
      .from(positions)
      .where(sql`${positions.userId} = ${userId} AND CAST(${positions.shares} AS DECIMAL) > 0`);
  }

  async getUserPositionsWithMarkets(userId: string): Promise<PositionWithMarket[]> {
    const result = await db
      .select()
      .from(positions)
      .leftJoin(markets, eq(positions.marketId, markets.id))
      .leftJoin(kols, eq(markets.kolId, kols.id))
      .where(sql`${positions.userId} = ${userId} AND CAST(${positions.shares} AS DECIMAL) > 0`);

    return result
      .filter((row) => row.markets !== null && row.kols !== null)
      .map((row) => ({
        ...row.positions,
        market: {
          ...row.markets!,
          kol: row.kols!,
        },
      }));
  }

  async getMarketPositions(marketId: string): Promise<Position[]> {
    return await db
      .select()
      .from(positions)
      .where(sql`${positions.marketId} = ${marketId} AND CAST(${positions.shares} AS DECIMAL) > 0`);
  }

  async updateUserPosition(userId: string, marketId: string, position: string, shares: number, action: string): Promise<void> {
    const existing = await this.getUserPosition(userId, marketId, position);
    
    if (existing) {
      const currentShares = parseFloat(existing.shares);
      const currentAvgPrice = parseFloat(existing.averagePrice);
      
      let newShares: number;
      let newAvgPrice: number;
      
      if (action === "buy") {
        newShares = currentShares + shares;
        const market = await this.getMarket(marketId);
        const currentPrice = parseFloat(position === "YES" ? market!.yesPrice : market!.noPrice);
        newAvgPrice = ((currentShares * currentAvgPrice) + (shares * currentPrice)) / newShares;
      } else {
        newShares = Math.max(0, currentShares - shares);
        newAvgPrice = currentAvgPrice;
      }
      
      await db.update(positions)
        .set({ 
          shares: newShares.toFixed(2), 
          averagePrice: newAvgPrice.toFixed(4),
          updatedAt: new Date()
        })
        .where(eq(positions.id, existing.id));
    } else if (action === "buy") {
      const market = await this.getMarket(marketId);
      const price = position === "YES" ? market?.yesPrice : market?.noPrice;
      await db.insert(positions).values({
        userId,
        marketId,
        position,
        shares: shares.toFixed(2),
        averagePrice: price ?? "0.5000",
      });
    }
  }

  // Price history
  async getMarketPriceHistory(marketId: string, days: number = 7): Promise<PriceHistoryPoint[]> {
    const market = await this.getMarket(marketId);
    if (!market) return [];

    const currentYesPrice = parseFloat(market.yesPrice);
    const currentNoPrice = parseFloat(market.noPrice);
    const history: PriceHistoryPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const progress = (days - i) / days;
      const baseYesPrice = 0.5 + (currentYesPrice - 0.5) * progress;
      const randomVariation = (Math.random() - 0.5) * 0.05;
      const yesPrice = Math.max(0.01, Math.min(0.99, baseYesPrice + randomVariation));
      const noPrice = 1.0 - yesPrice;

      history.push({
        time: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        yesPrice: parseFloat(yesPrice.toFixed(4)),
        noPrice: parseFloat(noPrice.toFixed(4)),
      });
    }

    return history;
  }

  // Comments
  async getMarketComments(marketId: string): Promise<CommentWithUser[]> {
    const result = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        marketId: comments.marketId,
        content: comments.content,
        createdAt: comments.createdAt,
        username: users.username,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.marketId, marketId))
      .orderBy(desc(comments.createdAt));

    return result.map((row) => ({
      id: row.id,
      userId: row.userId,
      marketId: row.marketId,
      content: row.content,
      createdAt: row.createdAt,
      user: {
        username: row.username || "Unknown",
      },
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(insertComment).returning();
    return result[0];
  }

  // Transaction methods
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // KOL metrics history methods
  async createKolMetricsHistory(insertHistory: InsertKolMetricsHistory): Promise<KolMetricsHistory> {
    const result = await db.insert(kolMetricsHistory).values(insertHistory).returning();
    return result[0];
  }

  async getKolMetricsHistory(kolId: string, days: number = 30): Promise<KolMetricsHistory[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    return await db
      .select()
      .from(kolMetricsHistory)
      .where(eq(kolMetricsHistory.kolId, kolId))
      .orderBy(desc(kolMetricsHistory.createdAt));
  }

  // Scraped KOLs methods
  async createScrapedKols(kols: InsertScrapedKol[]): Promise<ScrapedKol[]> {
    if (kols.length === 0) return [];
    const result = await db.insert(scrapedKols).values(kols).returning();
    return result;
  }

  async getLatestScrapedKols(limit: number = 20): Promise<ScrapedKol[]> {
    console.error('🔍 DEBUG: Getting latest scraped KOLs...');
    
    // Use a more robust query with subquery to avoid timestamp precision issues
    const results = await db
      .select()
      .from(scrapedKols)
      .where(
        sql`${scrapedKols.scrapedAt} = (SELECT MAX(${scrapedKols.scrapedAt}) FROM ${scrapedKols})`
      )
      .orderBy(scrapedKols.rank)
      .limit(limit);

    console.error(`🔍 DEBUG: Found ${results.length} KOLs from latest scrape`);
    return results;
  }

  async getScrapedKolsByDate(date: Date): Promise<ScrapedKol[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(scrapedKols)
      .where(sql`${scrapedKols.scrapedAt} >= ${startOfDay} AND ${scrapedKols.scrapedAt} <= ${endOfDay}`)
      .orderBy(scrapedKols.rank);
  }

  // Follower cache methods
  async getFollowerCache(xHandle: string): Promise<FollowerCacheEntry | undefined> {
    const result = await db
      .select()
      .from(followerCache)
      .where(eq(followerCache.xHandle, xHandle))
      .limit(1);
    return result[0];
  }

  async upsertFollowerCache(cache: InsertFollowerCache): Promise<FollowerCacheEntry> {
    const existing = await this.getFollowerCache(cache.xHandle);

    if (existing) {
      await db
        .update(followerCache)
        .set({
          followers: cache.followers,
          cachedAt: new Date(),
        })
        .where(eq(followerCache.xHandle, cache.xHandle));

      return {
        ...existing,
        followers: cache.followers,
        cachedAt: new Date(),
      };
    } else {
      const result = await db.insert(followerCache).values(cache).returning();
      return result[0];
    }
  }

  async getAllFollowerCache(): Promise<FollowerCacheEntry[]> {
    return await db.select().from(followerCache);
  }

  // Market metadata methods
  async createMarketMetadata(metadata: InsertMarketMetadata): Promise<MarketMetadata> {
    const result = await db.insert(marketMetadata).values(metadata).returning();
    return result[0];
  }

  async getMarketMetadata(marketId: string): Promise<MarketMetadata | undefined> {
    const result = await db
      .select()
      .from(marketMetadata)
      .where(eq(marketMetadata.marketId, marketId))
      .limit(1);
    return result[0];
  }

  async getAllMarketMetadata(): Promise<MarketMetadata[]> {
    return await db.select().from(marketMetadata);
  }

  // User Solana methods
  async updateUserSolanaBalance(id: string, solanaBalance: string): Promise<void> {
    await db.update(users).set({ solanaBalance }).where(eq(users.id, id));
  }

  async updateUserDepositAddress(id: string, address: string): Promise<void> {
    await db.update(users).set({ solanaDepositAddress: address }).where(eq(users.id, id));
  }

  // Solana deposit methods
  async createDeposit(insertDeposit: InsertSolanaDeposit): Promise<SolanaDeposit> {
    const result = await db.insert(solanaDeposits).values(insertDeposit).returning();
    return result[0];
  }

  async getPendingDeposits(): Promise<SolanaDeposit[]> {
    return await db
      .select()
      .from(solanaDeposits)
      .where(eq(solanaDeposits.status, "pending"))
      .orderBy(desc(solanaDeposits.createdAt));
  }

  async getUserDeposits(userId: string, limit: number = 50): Promise<SolanaDeposit[]> {
    return await db
      .select()
      .from(solanaDeposits)
      .where(eq(solanaDeposits.userId, userId))
      .orderBy(desc(solanaDeposits.createdAt))
      .limit(limit);
  }

  async updateDepositStatus(id: string, status: string, confirmations: number): Promise<void> {
    const updates: { status: string; confirmations: number; confirmedAt?: Date } = {
      status,
      confirmations,
    };
    
    if (status === "confirmed") {
      updates.confirmedAt = new Date();
    }
    
    await db.update(solanaDeposits).set(updates).where(eq(solanaDeposits.id, id));
  }

  // Solana withdrawal methods
  async createWithdrawal(insertWithdrawal: InsertSolanaWithdrawal): Promise<SolanaWithdrawal> {
    const result = await db.insert(solanaWithdrawals).values(insertWithdrawal).returning();
    return result[0];
  }

  async getPendingWithdrawals(): Promise<SolanaWithdrawal[]> {
    return await db
      .select()
      .from(solanaWithdrawals)
      .where(eq(solanaWithdrawals.status, "pending"))
      .orderBy(desc(solanaWithdrawals.createdAt));
  }

  async getUserWithdrawals(userId: string, limit: number = 50): Promise<SolanaWithdrawal[]> {
    return await db
      .select()
      .from(solanaWithdrawals)
      .where(eq(solanaWithdrawals.userId, userId))
      .orderBy(desc(solanaWithdrawals.createdAt))
      .limit(limit);
  }

  async updateWithdrawalStatus(id: string, status: string, signature?: string, error?: string): Promise<void> {
    const updates: { status: string; processedAt?: Date; signature?: string; error?: string } = {
      status,
    };
    
    if (status === "completed" || status === "failed") {
      updates.processedAt = new Date();
    }
    
    if (signature !== undefined) {
      updates.signature = signature;
    }
    
    if (error !== undefined) {
      updates.error = error;
    }
    
    await db.update(solanaWithdrawals).set(updates).where(eq(solanaWithdrawals.id, id));
  }

  // Platform fee methods
  async createPlatformFee(insertFee: InsertPlatformFee): Promise<PlatformFee> {
    const result = await db.insert(platformFees).values(insertFee).returning();
    return result[0];
  }

  async getTotalPlatformFees(): Promise<string> {
    const result = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${platformFees.amount} AS DECIMAL)), 0)`,
      })
      .from(platformFees);
    
    return result[0]?.total?.toString() || "0";
  }

  async getUserPlatformFees(userId: string): Promise<PlatformFee[]> {
    return await db
      .select()
      .from(platformFees)
      .where(eq(platformFees.userId, userId))
      .orderBy(desc(platformFees.createdAt));
  }
}

export const dbStorage = new DbStorage();
