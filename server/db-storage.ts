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

  async cancelMarket(id: string, reason: string): Promise<void> {
    await db.update(markets).set({ resolved: true, outcome: 'cancelled', resolvedValue: 'cancelled', isLive: false }).where(eq(markets.id, id));
    console.log(`❌ Market ${id} cancelled: ${reason}`);
  }

  async refundMarket(marketId: string): Promise<number> {
    return await db.transaction(async (tx) => {
      const allBets = await tx
        .select()
        .from(bets)
        .where(eq(bets.marketId, marketId))
        .for('update');

      const pendingBets = allBets.filter(bet => bet.status === "pending" || bet.status === "open");

      if (pendingBets.length === 0) {
        console.log(`No bets to refund for market ${marketId}`);
        return 0;
      }

      let refundedCount = 0;
      let failedCount = 0;

      for (const bet of pendingBets) {
        try {
          const [user] = await tx
            .select()
            .from(users)
            .where(eq(users.id, bet.userId))
            .for('update')
            .limit(1);

          if (!user) {
            console.error(`User ${bet.userId} not found for refund - skipping bet ${bet.id}`);
            failedCount++;
            continue;
          }

          const betAmount = parseFloat(bet.amount);
          if (isNaN(betAmount) || betAmount < 0) {
            console.error(`Invalid bet amount ${bet.amount} for bet ${bet.id} - skipping`);
            failedCount++;
            continue;
          }

          const currentBalance = parseFloat(user.balance);
          const newBalance = (currentBalance + betAmount).toFixed(2);

          if (parseFloat(newBalance) < 0) {
            console.error(`Refund would result in negative balance for user ${bet.userId} - skipping`);
            failedCount++;
            continue;
          }

          await tx
            .update(users)
            .set({ balance: newBalance })
            .where(eq(users.id, bet.userId));

          await tx
            .update(bets)
            .set({ status: "refunded", profit: "0.00" })
            .where(eq(bets.id, bet.id));

          await tx.insert(transactions).values({
            userId: bet.userId,
            type: "refund",
            amount: bet.amount,
            balanceAfter: newBalance,
            description: `Refund for cancelled market`
          });

          refundedCount++;
        } catch (error) {
          console.error(`Error refunding bet ${bet.id}:`, error);
          failedCount++;
        }
      }

      console.log(`✅ Refunded ${refundedCount} bets for market ${marketId}${failedCount > 0 ? ` (${failedCount} failed)` : ''}`);
      return refundedCount;
    });
  }

  async settleBetsTransactional(marketId: string, outcome: "yes" | "no"): Promise<number> {
    return await db.transaction(async (tx) => {
      const allBets = await tx
        .select()
        .from(bets)
        .where(eq(bets.marketId, marketId))
        .for('update');

      const pendingBets = allBets.filter(bet => bet.status === "pending" || bet.status === "open");

      if (pendingBets.length === 0) {
        return 0;
      }

      for (const bet of pendingBets) {
        const shares = parseFloat(bet.shares);
        const won = shares > 0 && bet.position.toLowerCase() === outcome;
        const betAmount = parseFloat(bet.amount);

        let profit: number;
        let payout: number;
        let newStatus: string;

        if (won) {
          // Payout is the value of the shares (shares * $1 per share in winning pool)
          payout = shares;
          // Profit is payout minus original investment
          profit = payout - betAmount;
          newStatus = "won";
        } else {
          // Loss: no payout, profit is negative bet amount
          payout = 0;
          profit = -betAmount;
          newStatus = "lost";
        }

        await tx
          .update(bets)
          .set({ status: newStatus, profit: profit.toFixed(2) })
          .where(eq(bets.id, bet.id));

        const [user] = await tx
          .select()
          .from(users)
          .where(eq(users.id, bet.userId))
          .for('update')
          .limit(1);

        if (!user) {
          console.error(`User ${bet.userId} not found during settlement`);
          continue;
        }

        const currentBalance = parseFloat(user.balance);
        const newBalance = (currentBalance + payout).toFixed(2);
        const newTotalProfit = (parseFloat(user.totalProfit) + profit).toFixed(2);
        const newTotalWins = won ? user.totalWins + 1 : user.totalWins;

        await tx
          .update(users)
          .set({ 
            balance: newBalance,
            totalProfit: newTotalProfit,
            totalWins: newTotalWins
          })
          .where(eq(users.id, bet.userId));

        if (payout > 0) {
          await tx.insert(transactions).values({
            userId: bet.userId,
            type: "payout",
            amount: payout.toFixed(2),
            balanceAfter: newBalance,
            description: `Payout for winning bet on market`
          });
        }
      }

      console.log(`✅ Settled ${pendingBets.length} bets for market ${marketId} with outcome: ${outcome}`);
      return pendingBets.length;
    });
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

  // Robust transactional bet placement with row-level locking and internal calculations
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
      const market = await tx.query.markets.findFirst({
        where: eq(markets.id, params.marketId),
        // Lock the row for update
        lock: sql`FOR UPDATE`,
      });

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
      const yesSharePool = parseFloat(market.yesSharePool);
      const yesCollateralPool = parseFloat(market.yesCollateralPool);
      const noSharePool = parseFloat(market.noSharePool);
      const noCollateralPool = parseFloat(market.noCollateralPool);
      const userBalance = parseFloat(user.balance);

      // Validate pool values
      if (isNaN(yesSharePool) || isNaN(yesCollateralPool) || isNaN(noSharePool) || isNaN(noCollateralPool) ||
          !isFinite(yesSharePool) || !isFinite(yesCollateralPool) || !isFinite(noSharePool) || !isFinite(noCollateralPool)) {
        throw new ValidationError("Market has invalid pool values");
      }

      if (yesSharePool <= 0 || yesCollateralPool <= 0 || noSharePool <= 0 || noCollateralPool <= 0) {
        throw new ValidationError("Market pools are depleted");
      }

      // AMM Safety Constants
      const MIN_PRICE = 0.01;  // Minimum price to prevent prices from going to 0
      const MAX_PRICE = 0.99;  // Maximum price to prevent prices from going to 1
      const MAX_TRADE_PERCENTAGE = 0.40; // Maximum 40% of pool size per trade
      const MAX_PRICE_IMPACT = 0.25; // Hard cap: 25% maximum price movement per trade

      // Slippage tolerance protects users from unexpected price movements
      const DEFAULT_SLIPPAGE_TOLERANCE = 0.10; // Default 10% slippage tolerance

      // Use provided slippage tolerance or default
      const slippageTolerance = params.slippageTolerance ?? DEFAULT_SLIPPAGE_TOLERANCE;

      // Validate slippage tolerance
      if (slippageTolerance < 0 || slippageTolerance > 1) {
        throw new ValidationError("Slippage tolerance must be between 0 and 1");
      }

      // STEP 3: Perform AMM calculations inside transaction
      // Pools represent share inventory (not dollars)
      // Price formula ensures Price(YES) + Price(NO) = 1.0
      const calculateAMMPrices = (yesSP: number, yesCP: number, noSP: number, noCP: number) => {
        // Price of YES = collateral in YES pool / shares in YES pool
        const yesPrice = yesCP / yesSP;
        // Price of NO = collateral in NO pool / shares in NO pool
        const noPrice = noCP / noSP;
        return { yesPrice, noPrice };
      };

      // Platform fee configuration (2% by default, can be set via environment)
      const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "0.02");

      let betAmount: number;
      let sharesAmount: number;
      let newYesSharePool: number;
      let newYesCollateralPool: number;
      let newNoSharePool: number;
      let newNoCollateralPool: number;
      let platformFee: number = 0;
      let netBetAmount: number;

      let profit: number = 0;
      let averageCost: number = 0;

      if (params.action === "buy") {
        // Re-validate balance inside transaction
        if (params.amount > userBalance) {
          throw new ValidationError(
            `Insufficient balance. You have ${userBalance.toFixed(2)} but trying to spend ${params.amount.toFixed(2)}`
          );
        }

        // Calculate platform fee for buy orders (deducted from bet amount)
        platformFee = params.amount * PLATFORM_FEE_PERCENTAGE;
        netBetAmount = params.amount - platformFee;

        // Validate trade size relative to pool (max 40% of available liquidity)
        const totalLiquidity = yesCollateralPool + noCollateralPool; // Total collateral in the market
        const maxTradeSize = totalLiquidity * MAX_TRADE_PERCENTAGE;
        if (netBetAmount > maxTradeSize) {
          throw new ValidationError(
            `Trade size too large. Maximum allowed is ${maxTradeSize.toFixed(2)} (40% of pool). Your trade: ${netBetAmount.toFixed(2)}`
          );
        }

        betAmount = params.amount; // Total amount user pays (including fee)

        // Calculate shares based on net amount (excluding fee)
        const buyResult = this.calculateAmmTrade(
          params.position === "YES" ? 'yes' : 'no',
          netBetAmount,
          yesSharePool,
          yesCollateralPool,
          noSharePool,
          noCollateralPool
        );
        sharesAmount = buyResult.shares;
        newYesSharePool = buyResult.newYesSharePool;
        newYesCollateralPool = buyResult.newYesCollateralPool;
        newNoSharePool = buyResult.newNoSharePool;
        newNoCollateralPool = buyResult.newNoCollateralPool;
        averageCost = buyResult.avgPrice; // Avg cost per share

        // Validate calculation
        if (isNaN(sharesAmount) || !isFinite(sharesAmount) || sharesAmount < 0) {
          throw new ValidationError("Invalid share calculation - trade too large for pool liquidity");
        }

        // Validate new pools
        if (newYesSharePool <= 0 || newYesCollateralPool <= 0 || newNoSharePool <= 0 || newNoCollateralPool <= 0) {
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
        averageCost = userPosition ? parseFloat(userPosition.averagePrice) : 0;

        // Re-validate shares inside transaction
        if (params.amount > currentShares) {
          throw new ValidationError(
            `Insufficient ${params.position} shares. You own ${currentShares.toFixed(2)} but trying to sell ${params.amount.toFixed(2)}`
          );
        }

        // Calculate payout first to validate pool capacity
        sharesAmount = params.amount; // Shares user is selling

        const sellResult = this.calculatePayoutForSell(
          sharesAmount,
          params.position === "YES" ? 'yes' : 'no',
          yesSharePool,
          yesCollateralPool,
          noSharePool,
          noCollateralPool
        );
        betAmount = sellResult.payout; // Payout received by user
        newYesSharePool = sellResult.newYesSharePool;
        newYesCollateralPool = sellResult.newYesCollateralPool;
        newNoSharePool = sellResult.newNoSharePool;
        newNoCollateralPool = sellResult.newNoCollateralPool;

        // Validate that opposite pool has enough liquidity for payout
        const oppositeCollateralPool = params.position === "YES" ? newNoCollateralPool : newYesCollateralPool;
        if (betAmount > oppositeCollateralPool) {
          throw new ValidationError(
            `Insufficient pool liquidity. Sell would require ${betAmount.toFixed(2)} from ${params.position === "YES" ? "NO" : "YES"} collateral pool, but only ${oppositeCollateralPool.toFixed(2)} available`
          );
        }

        // Calculate profit: payout - total original investment
        // Total investment = shares sold × average cost per share
        const totalInvestment = params.amount * averageCost;
        profit = betAmount - totalInvestment;

        console.log(`\n💰 SELL P&L CALCULATION:`);
        console.log(`   Shares sold: ${params.amount}`);
        console.log(`   Average cost per share: ${averageCost.toFixed(4)}`);
        console.log(`   Total investment: ${totalInvestment.toFixed(2)}`);
        console.log(`   Payout received: ${betAmount.toFixed(2)}`);
        console.log(`   Profit/Loss: ${profit.toFixed(2)} (${profit >= 0 ? 'PROFIT' : 'LOSS'})\n`);

        // Validate calculation
        if (isNaN(betAmount) || !isFinite(betAmount) || betAmount < 0) {
          throw new ValidationError("Invalid payout calculation");
        }

        // Sanity check
        if (newYesSharePool < 0 || newYesCollateralPool < 0 || newNoSharePool < 0 || newNoCollateralPool < 0) {
          throw new ValidationError("Invalid trade - would result in negative pool values");
        }
      }

      // Calculate new prices
      const { yesPrice, noPrice } = calculateAMMPrices(
        newYesSharePool,
        newYesCollateralPool,
        newNoSharePool,
        newNoCollateralPool
      );

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
          `Trade would push price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting YES price: ${yesPrice.toFixed(4)}. Reduce trade size.`
        );
      }

      if (noPrice < MIN_PRICE || noPrice > MAX_PRICE) {
        throw new ValidationError(
          `Trade would push price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting NO price: ${noPrice.toFixed(4)}. Reduce trade size.`
        );
      }

      // Calculate price impact for return value (informational only in points mode)
      const currentYesPrice = parseFloat(market.currentYesPrice);
      const currentNoPrice = parseFloat(market.currentNoPrice);
      const newPrice = params.position === "YES" ? yesPrice : noPrice;
      const currentPrice = params.position === "YES" ? currentYesPrice : currentNoPrice;
      const priceImpact = currentPrice > 0 ? Math.abs(newPrice - currentPrice) / currentPrice : 0;

      // STEP 4: Create bet record
      const [createdBet] = await tx
        .insert(bets)
        .values({
          userId: params.userId,
          marketId: params.marketId,
          position: params.position,
          amount: betAmount.toFixed(2),
          price: currentPrice.toFixed(4), // Record the price at which the bet was placed
          shares: sharesAmount.toFixed(2),
          status: params.action === "sell" ? "settled" : "open",
          profit: params.action === "sell" ? profit.toFixed(2) : undefined,
          averageCost: params.action === "buy" ? averageCost.toFixed(4) : undefined,
        })
        .returning();

      // STEP 4.5: Record platform fee if this was a buy order
      if (params.action === "buy" && platformFee > 0) {
        await tx.insert(platformFees).values({
          betId: createdBet.id,
          userId: params.userId,
          amount: platformFee.toFixed(9),
          feePercentage: (PLATFORM_FEE_PERCENTAGE * 100).toFixed(2),
        });
      }

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
          // Use actual cost per share (total paid / shares received)
          const costPerShare = netBetAmount / sharesAmount; // Use net amount for cost calculation
          const newAvgPrice = ((currentShares * currentAvgPrice) + (sharesAmount * costPerShare)) / newShares;

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
        // For new positions, use actual cost per share
        const costPerShare = netBetAmount / sharesAmount; // Use net amount for cost calculation
        await tx.insert(positions).values({
          userId: params.userId,
          marketId: params.marketId,
          position: params.position,
          shares: sharesAmount.toFixed(2),
          averagePrice: costPerShare.toFixed(4),
        });
      }

      // STEP 6: Update user balance
      const newBalance = params.action === "buy"
        ? (userBalance - betAmount).toFixed(2) // Deduct total amount paid (including fee)
        : (userBalance + betAmount).toFixed(2); // Add payout

      // Final safety check
      if (parseFloat(newBalance) < 0) {
        throw new ValidationError("Balance calculation resulted in negative value");
      }

      await tx
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, params.userId));

      // STEP 7: Update user stats
      const newTotalProfit = params.action === "sell" 
        ? (parseFloat(user.totalProfit) + profit).toFixed(2)
        : user.totalProfit;

      await tx
        .update(users)
        .set({
          totalBets: user.totalBets + 1,
          totalWins: user.totalWins, // Wins updated on settlement, not here
          totalProfit: newTotalProfit,
        })
        .where(eq(users.id, params.userId));

      // STEP 8: Update market pools and prices
      await tx
        .update(markets)
        .set({
          yesSharePool: newYesSharePool.toFixed(2),
          yesCollateralPool: newYesCollateralPool.toFixed(2),
          noSharePool: newNoSharePool.toFixed(2),
          noCollateralPool: newNoCollateralPool.toFixed(2),
          totalVolume: (parseFloat(market.totalVolume) + betAmount).toFixed(2),
          currentYesPrice: newYesCollateralPool / newYesSharePool,
          currentNoPrice: newNoCollateralPool / newNoSharePool,
        })
        .where(eq(markets.id, params.marketId));

      return { 
        bet: createdBet, 
        priceImpact,
        platformFee: platformFee > 0 ? platformFee : undefined 
      };
    });
  }

  // Leaderboard with proper tie handling
  // Users with same totalProfit get same rank; wins/bets only used for ordering within profit tier
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
      .orderBy(desc(users.totalProfit), desc(users.totalWins), desc(users.totalBets));

    if (result.length === 0) {
      return [];
    }

    let currentRank = 1;
    let previousProfit: string = result[0].totalProfit;

    return result.map((user, index) => {
      if (index > 0 && user.totalProfit !== previousProfit) {
        currentRank = index + 1;
      }

      previousProfit = user.totalProfit;

      return {
        ...user,
        winRate: user.totalBets > 0 ? (user.totalWins / user.totalBets) * 100 : 0,
        rank: currentRank,
      };
    });
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
        const currentPrice = parseFloat(position === "YES" ? market!.currentYesPrice : market!.currentNoPrice);
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
      const price = position === "YES" ? market?.currentYesPrice : market?.currentNoPrice;
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

    const currentYesPrice = parseFloat(market.currentYesPrice);
    const currentNoPrice = parseFloat(market.currentNoPrice);
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

  // AMM calculation methods
  private calculateAmmTrade(
    side: 'yes' | 'no',
    amount: number, // Amount of collateral being added/removed
    yesSharePool: number,
    yesCollateralPool: number,
    noSharePool: number,
    noCollateralPool: number
  ): { 
    shares: number; // Shares received by the user
    newYesSharePool: number; 
    newYesCollateralPool: number;
    newNoSharePool: number;
    newNoCollateralPool: number;
    avgPrice: number // Average price per share for this trade
  } {
    let shares = 0;
    let newYesSharePool = yesSharePool;
    let newYesCollateralPool = yesCollateralPool;
    let newNoSharePool = noSharePool;
    let newNoCollateralPool = noCollateralPool;
    let avgPrice = 0;

    if (side === 'yes') {
      // Buying YES: User adds collateral (amount) to the YES pool, receives YES shares
      // The constant product 'k' for the YES pool is yesSharePool * yesCollateralPool
      const k = yesSharePool * yesCollateralPool;

      // User adds collateral to the pool
      newYesCollateralPool = yesCollateralPool + amount;

      // Solve for new share pool to maintain k
      newYesSharePool = k / newYesCollateralPool;

      // Shares given to user = difference in share pool
      shares = yesSharePool - newYesSharePool;
      avgPrice = amount / shares; // Avg price = collateral added / shares received

      // NO pool remains unchanged
    } else {
      // Buying NO: User adds collateral (amount) to the NO pool, receives NO shares
      // The constant product 'k' for the NO pool is noSharePool * noCollateralPool
      const k = noSharePool * noCollateralPool;

      // User adds collateral to the pool
      newNoCollateralPool = noCollateralPool + amount;

      // Solve for new share pool to maintain k
      newNoSharePool = k / newNoCollateralPool;

      // Shares given to user = difference in share pool
      shares = noSharePool - newNoSharePool;
      avgPrice = amount / shares; // Avg price = collateral added / shares received

      // YES pool remains unchanged
    }

    return { 
      shares, 
      newYesSharePool, 
      newYesCollateralPool,
      newNoSharePool,
      newNoCollateralPool,
      avgPrice 
    };
  }

  // Selling shares returns collateral from the opposite pool
  private calculatePayoutForSell(
    sharesToSell: number,
    side: 'yes' | 'no',
    yesSharePool: number,
    yesCollateralPool: number,
    noSharePool: number,
    noCollateralPool: number
  ): { payout: number; newYesSharePool: number; newYesCollateralPool: number; newNoSharePool: number; newNoCollateralPool: number } {
    let payout = 0;
    let newYesSharePool = yesSharePool;
    let newYesCollateralPool = yesCollateralPool;
    let newNoSharePool = noSharePool;
    let newNoCollateralPool = noCollateralPool;

    if (side === 'yes') {
      // Selling YES: User returns YES shares, receives collateral from NO pool
      newYesSharePool = yesSharePool + sharesToSell; // Add shares back to YES pool
      const k = yesSharePool * yesCollateralPool; // Constant product for YES pool
      newYesCollateralPool = k / newYesSharePool; // Calculate new collateral pool

      // Payout = difference in collateral pool (collateral removed from NO pool)
      payout = yesCollateralPool - newYesCollateralPool; 

      // Update NO pool collateral
      newNoCollateralPool = noCollateralPool - payout;

      // NO share pool remains unchanged
    } else {
      // Selling NO: User returns NO shares, receives collateral from YES pool
      newNoSharePool = noSharePool + sharesToSell; // Add shares back to NO pool
      const k = noSharePool * noCollateralPool; // Constant product for NO pool
      newNoSharePool = k / newNoSharePool; // Calculate new collateral pool

      // Payout = difference in collateral pool (collateral removed from YES pool)
      payout = yesCollateralPool - newYesCollateralPool;

      // Update YES pool collateral
      newYesCollateralPool = yesCollateralPool - payout;

      // YES share pool remains unchanged
    }

    return { payout, newYesSharePool, newYesCollateralPool, newNoSharePool, newNoCollateralPool };
  }
}

export const dbStorage = new DbStorage();