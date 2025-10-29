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
  userProfiles,
  userFollows,
  activities,
  conversations,
  messages,
  forumThreads,
  forumComments,
  forumThreadVotes,
  forumCommentVotes,
  notifications,
  achievements,
  userAchievements,
  faqs,
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
  type UserProfile,
  type InsertUserProfile,
  type UserFollow,
  type InsertUserFollow,
  type Activity,
  type InsertActivity,
  type Conversation,
  type InsertConversation,
  type ConversationWithParticipants,
  type Message,
  type InsertMessage,
  type ForumThread,
  type InsertForumThread,
  type ForumComment,
  type InsertForumComment,
  type Notification,
  type InsertNotification,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type Faq,
  type InsertFaq,
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

  async getAllUsers(limit: number = 100): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);
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

        // Log activity for won/lost bet
        try {
          await tx.insert(activities).values({
            userId: bet.userId,
            type: won ? "bet_won" : "bet_lost",
            data: JSON.stringify({
              betId: bet.id,
              marketId,
              position: bet.position,
              amount: betAmount,
              profit: profit.toFixed(2),
              payout: won ? payout.toFixed(2) : "0.00",
            }),
          });
        } catch (error) {
          console.error(`Error logging activity for bet ${bet.id}:`, error);
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

      // Allow pools to be zero initially, price will be 0.5
      // if (yesSharePool <= 0 || yesCollateralPool <= 0 || noSharePool <= 0 || noCollateralPool <= 0) {
      //   throw new ValidationError("Market pools are depleted");
      // }

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
      // Single-pool CPMM pricing for prediction markets
      // Uses cross-pool pricing: Price(YES) = noPool / (yesPool + noPool)
      // This ensures Price(YES) + Price(NO) = 1.0 always
      const calculateAMMPrices = (yesPool: number, noPool: number) => {
        // For prediction markets, use cross-pool pricing for intuitive cost ≈ shares × price
        const totalPool = yesPool + noPool;
        // Handle edge case where totalPool is 0
        if (totalPool === 0) {
          return { yesPrice: 0.5, noPrice: 0.5 };
        }
        // Cross-pool pricing: YES price depends on NO pool, and vice versa
        const yesPrice = noPool / totalPool;
        const noPrice = yesPool / totalPool;
        return { yesPrice, noPrice };
      };

      // Platform fee configuration (2% by default, can be set via environment)
      const PLATFORM_FEE_PERCENTAGE = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || "0.02");
      // Referral commission configuration (1% by default), credited as extra balance to referrer
      const REFERRAL_PERCENTAGE = parseFloat(process.env.REFERRAL_PERCENTAGE || "0.01");

      let betAmount: number;
      let sharesAmount: number;
      let newYesSharePool: number;
      let newYesCollateralPool: number;
      let newNoSharePool: number;
      let newNoCollateralPool: number;
      let platformFee: number = 0;
      let netBetAmount: number = 0; // Initialize to avoid TypeScript errors

      let profit: number | null = null; // Initialize profit as null
      let averageCost: number = 0;

      const isSell = params.action === "sell";

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
        const totalLiquidity = yesSharePool + noSharePool; // Total share inventory in the market
        const maxTradeSize = totalLiquidity * MAX_TRADE_PERCENTAGE;
        if (netBetAmount > maxTradeSize && totalLiquidity > 0) { // Only enforce if there is liquidity
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
          noSharePool
        );
        sharesAmount = buyResult.shares;
        newYesSharePool = buyResult.newYesPool;
        newNoSharePool = buyResult.newNoPool;
        // In single-pool model, collateral pools are shadows of share pools
        newYesCollateralPool = newYesSharePool;
        newNoCollateralPool = newNoSharePool;
        averageCost = buyResult.avgPrice; // Avg cost per share

        // Validate calculation
        if (isNaN(sharesAmount) || !isFinite(sharesAmount) || sharesAmount < 0) {
          throw new ValidationError("Invalid share calculation - trade too large for pool liquidity");
        }

        // Validate new pools. Allow pools to become 0, but not negative.
        if (newYesSharePool < 0 || newNoSharePool < 0) {
          throw new ValidationError("Trade amount too large - would result in negative pool values");
        }

      } else {
        // Selling - lock and read user position
        const userPositions = await tx
          .select()
          .from(positions)
          .where(
            sql`${positions.userId} = ${params.userId} AND ${positions.marketId} = ${params.marketId} AND UPPER(${positions.position}) = ${params.position.toUpperCase()}`
          )
          .for('update');

        const userPosition = userPositions.length > 0 ? userPositions[0] : null;
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
          noSharePool
        );
        betAmount = sellResult.payout; // Payout received by user
        newYesSharePool = sellResult.newYesPool;
        newNoSharePool = sellResult.newNoPool;
        // In single-pool model, collateral pools are shadows of share pools
        newYesCollateralPool = newYesSharePool;
        newNoCollateralPool = newNoSharePool;

        // Validate that opposite pool has enough liquidity for payout
        const oppositePool = params.position === "YES" ? newNoSharePool : newYesSharePool;
        if (betAmount > oppositePool && oppositePool > 0) { // Only enforce if opposite pool has liquidity
          throw new ValidationError(
            `Insufficient pool liquidity. Sell would require ${betAmount.toFixed(2)} from ${params.position === "YES" ? "NO" : "YES"} pool, but only ${oppositePool.toFixed(2)} available`
          );
        }

        // Calculate profit: payout - total original investment (including platform fee)
        // When you bought these shares, you paid: (shares × avgCost) + platform fee
        // The avgCost already includes the fee impact, but we need to account for the total cost
        // Total cost per share when buying = avgCost / (1 - PLATFORM_FEE_PERCENTAGE)
        // This reverses the fee calculation to get the original amount paid
        const totalInvestment = params.amount * averageCost;
        const originalAmountPaid = totalInvestment / (1 - PLATFORM_FEE_PERCENTAGE);
        profit = betAmount - originalAmountPaid;

        console.log(`\n💰 SELL P&L CALCULATION:`);
        console.log(`   Shares sold: ${params.amount}`);
        console.log(`   Average cost per share: ${averageCost.toFixed(4)}`);
        console.log(`   Net investment (after fee): ${totalInvestment.toFixed(2)}`);
        console.log(`   Original amount paid (with fee): ${originalAmountPaid.toFixed(2)}`);
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

      // Calculate new prices using cross-pool pricing
      const { yesPrice, noPrice } = calculateAMMPrices(
        newYesSharePool,
        newNoSharePool
      );

      // Validate prices
      if (isNaN(yesPrice) || isNaN(noPrice) || !isFinite(yesPrice) || !isFinite(noPrice)) {
        throw new ValidationError("Invalid price calculation result");
      }

      if (yesPrice < 0 || yesPrice > 1 || noPrice < 0 || noPrice > 1) {
        throw new ValidationError("Calculated prices out of valid range [0, 1]");
      }

      // Enforce price bounds to prevent extreme prices (prevents math instability)
      if ((yesPrice < MIN_PRICE && params.position === "YES") || (yesPrice > MAX_PRICE && params.position === "YES")) {
        throw new ValidationError(
          `Trade would push YES price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting YES price: ${yesPrice.toFixed(4)}. Reduce trade size.`
        );
      }

      if ((noPrice < MIN_PRICE && params.position === "NO") || (noPrice > MAX_PRICE && params.position === "NO")) {
        throw new ValidationError(
          `Trade would push NO price outside safe bounds (${MIN_PRICE}-${MAX_PRICE}). Resulting NO price: ${noPrice.toFixed(4)}. Reduce trade size.`
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
          status: isSell ? "settled" : "open", // Use "open" for buys, "settled" for sells
          profit: isSell && profit !== null ? profit.toFixed(2) : null, // Include profit only for sells and if it's not null
          averageCost: isSell ? undefined : averageCost.toFixed(4), // Average cost is relevant for buys
        })
        .returning();

      if (isSell) {
        console.log(`   ✅ Bet created with profit: ${createdBet.profit}`);
      }

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
      const existingPositions = await tx
        .select()
        .from(positions)
        .where(
          sql`${positions.userId} = ${params.userId} AND ${positions.marketId} = ${params.marketId} AND UPPER(${positions.position}) = ${params.position.toUpperCase()}`
        );
      
      const existingPosition = existingPositions.length > 0 ? [existingPositions[0]] : [];

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

      // STEP 6.5: Pay referral commission (applies only to buy orders)
      if (params.action === "buy" && REFERRAL_PERCENTAGE > 0) {
        // user was selected earlier in the tx and contains referrerId if present
        const referredBy = (user as any).referrerId as string | undefined;
        if (referredBy && referredBy !== user.id) {
          const commission = betAmount * REFERRAL_PERCENTAGE;
          if (commission > 0) {
            // Lock referrer row and credit balance
            const [referrer] = await tx
              .select()
              .from(users)
              .where(eq(users.id, referredBy))
              .for('update')
              .limit(1);

            if (referrer) {
              const refBal = parseFloat(referrer.balance);
              const refNewBal = (refBal + commission).toFixed(2);
              await tx.update(users).set({ balance: refNewBal }).where(eq(users.id, referredBy));

              // Record ledger entry for referrer
              await tx.insert(transactions).values({
                userId: referredBy,
                type: "referral_commission",
                amount: commission.toFixed(2),
                balanceAfter: refNewBal,
                description: `Referral commission (${(REFERRAL_PERCENTAGE * 100).toFixed(2)}%) from bet ${createdBet.id}`,
              });
            }
          }
        }
      }

      // STEP 7: Update user stats
      // Only update totalProfit if it's a sell and profit is calculated
      const newTotalProfit = isSell && profit !== null
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
          currentYesPrice: yesPrice.toFixed(4), // Use the calculated price
          currentNoPrice: noPrice.toFixed(4),   // Use the calculated price
          yesPrice: yesPrice.toFixed(4),        // Update legacy field for backwards compatibility
          noPrice: noPrice.toFixed(4),          // Update legacy field for backwards compatibility
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

  // Price history - Generate historical data with dynamic intervals based on time until resolution
  async getMarketPriceHistory(marketId: string, days: number = 7): Promise<PriceHistoryPoint[]> {
    const market = await this.getMarket(marketId);
    if (!market) return [];

    const currentYesPrice = parseFloat(market.currentYesPrice);
    const currentNoPrice = parseFloat(market.currentNoPrice);
    const history: PriceHistoryPoint[] = [];
    const now = new Date();
    const resolvesAt = new Date(market.resolvesAt);
    const msUntilResolution = resolvesAt.getTime() - now.getTime();
    const hoursUntilResolution = msUntilResolution / (1000 * 60 * 60);

    let intervals: number;
    let intervalType: 'minutes' | 'hours' | 'days';
    let intervalMs: number;

    if (hoursUntilResolution <= 1) {
      // Show last 60 minutes in 1-minute intervals
      intervals = 60;
      intervalType = 'minutes';
      intervalMs = 60 * 1000;
    } else if (hoursUntilResolution <= 24) {
      // Show last 24 hours in 1-hour intervals
      intervals = 24;
      intervalType = 'hours';
      intervalMs = 60 * 60 * 1000;
    } else {
      // Show last 7 days in 1-day intervals
      intervals = 7;
      intervalType = 'days';
      intervalMs = 24 * 60 * 60 * 1000;
    }

    for (let i = intervals - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * intervalMs));

      const progress = (intervals - i) / intervals;
      const baseYesPrice = 0.5 + (currentYesPrice - 0.5) * progress;
      const randomVariation = (Math.random() - 0.5) * 0.05;
      const yesPrice = Math.max(0.01, Math.min(0.99, baseYesPrice + randomVariation));
      const noPrice = 1.0 - yesPrice;

      let timeLabel: string;
      if (intervalType === 'minutes') {
        timeLabel = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
      } else if (intervalType === 'hours') {
        timeLabel = date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
      } else {
        timeLabel = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      history.push({
        time: timeLabel,
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

  // User profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    return result[0];
  }

  async getProfileByUsername(username: string): Promise<{ user: User; profile: UserProfile } | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return undefined;
    }

    const profile = await this.ensureUserProfile(user.id);
    return { user, profile };
  }

  async ensureUserProfile(userId: string): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    const user = await this.getUser(userId);
    if (!user) {
      throw new NotFoundError(`User with id ${userId} not found`);
    }

    const totalLosses = user.totalBets - user.totalWins;
    const profitLoss = parseFloat(user.totalProfit);
    const winRate = user.totalBets > 0 ? (user.totalWins / user.totalBets) * 100 : 0;
    
    const totalVolume = user.totalBets * parseFloat(user.balance);
    const roi = totalVolume > 0 ? (profitLoss / totalVolume) * 100 : 0;

    const newProfile: InsertUserProfile = {
      userId: user.id,
      bio: null,
      avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${user.username || user.id}`,
    };

    const result = await db.insert(userProfiles).values(newProfile).returning();
    const createdProfile = result[0];

    const updateData = {
      totalBets: user.totalBets,
      totalWins: user.totalWins,
      totalLosses,
      profitLoss: profitLoss.toFixed(2),
      winRate: winRate.toFixed(2),
      roi: roi.toFixed(2),
      totalVolume: totalVolume.toFixed(2),
      updatedAt: new Date(),
    };

    await db.update(userProfiles).set(updateData).where(eq(userProfiles.id, createdProfile.id));

    return { ...createdProfile, ...updateData };
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'bio' | 'avatarUrl'>>): Promise<UserProfile> {
    await db.update(userProfiles).set({ ...updates, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw new NotFoundError(`User profile for user ${userId} not found`);
    }
    return profile;
  }

  // Phase 1: Shared Transaction Helpers
  private async withUserProfileCounts<T>(
    tx: any,
    followerId: string,
    followingId: string,
    increment: boolean,
    operation: (tx: any) => Promise<T>
  ): Promise<T> {
    const delta = increment ? 1 : -1;

    await tx
      .update(userProfiles)
      .set({ 
        followingCount: sql`${userProfiles.followingCount} + ${delta}`,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, followerId));

    await tx
      .update(userProfiles)
      .set({ 
        followersCount: sql`${userProfiles.followersCount} + ${delta}`,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, followingId));

    return await operation(tx);
  }

  private async logActivity(tx: any, activity: InsertActivity): Promise<void> {
    await tx.insert(activities).values(activity);
  }

  private async withNotificationDispatch(tx: any, notification: InsertNotification): Promise<void> {
    await tx.insert(notifications).values(notification);
  }

  // Phase 2: Core Methods (Follow, Activity, Notifications)
  async followUser(followerId: string, followingId: string): Promise<UserFollow> {
    return await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(userFollows)
        .where(sql`${userFollows.followerId} = ${followerId} AND ${userFollows.followingId} = ${followingId}`)
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      await this.ensureUserProfile(followerId);
      await this.ensureUserProfile(followingId);

      return await this.withUserProfileCounts(tx, followerId, followingId, true, async (tx) => {
        const [follow] = await tx.insert(userFollows).values({ followerId, followingId }).returning();

        await this.logActivity(tx, {
          userId: followerId,
          type: 'followed_user',
          data: JSON.stringify({ followingId })
        });

        const follower = await this.getUser(followerId);
        await this.withNotificationDispatch(tx, {
          userId: followingId,
          type: 'new_follower',
          title: 'New Follower',
          message: `${follower?.username || 'Someone'} started following you`,
          data: JSON.stringify({ followerId })
        });

        return follow;
      });
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(userFollows)
        .where(sql`${userFollows.followerId} = ${followerId} AND ${userFollows.followingId} = ${followingId}`)
        .limit(1);

      if (existing.length === 0) {
        return;
      }

      await this.withUserProfileCounts(tx, followerId, followingId, false, async (tx) => {
        await tx
          .delete(userFollows)
          .where(sql`${userFollows.followerId} = ${followerId} AND ${userFollows.followingId} = ${followingId}`);
        return;
      });
    });
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userFollows)
      .where(sql`${userFollows.followerId} = ${followerId} AND ${userFollows.followingId} = ${followingId}`)
      .limit(1);
    return result.length > 0;
  }

  async getFollowers(userId: string, limit: number = 50): Promise<Array<{ user: User; followedAt: Date }>> {
    const result = await db
      .select({
        user: users,
        followedAt: userFollows.createdAt
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followerId, users.id))
      .where(eq(userFollows.followingId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit);

    return result.map(row => ({
      user: row.user,
      followedAt: row.followedAt
    }));
  }

  async getFollowing(userId: string, limit: number = 50): Promise<Array<{ user: User; followedAt: Date }>> {
    const result = await db
      .select({
        user: users,
        followedAt: userFollows.createdAt
      })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followingId, users.id))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(userFollows.createdAt))
      .limit(limit);

    return result.map(row => ({
      user: row.user,
      followedAt: row.followedAt
    }));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }

  async getUserActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getFollowingActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    const result = await db
      .select({
        activity: activities
      })
      .from(activities)
      .innerJoin(userFollows, eq(activities.userId, userFollows.followingId))
      .where(eq(userFollows.followerId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);

    return result.map(row => row.activity);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(notifications)
      .where(sql`${notifications.userId} = ${userId} AND ${notifications.read} = false`);
    return result[0]?.count || 0;
  }

  // Phase 3: Messaging
  async createConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    const existing = await db
      .select()
      .from(conversations)
      .where(
        sql`(${conversations.user1Id} = ${user1Id} AND ${conversations.user2Id} = ${user2Id}) OR (${conversations.user1Id} = ${user2Id} AND ${conversations.user2Id} = ${user1Id})`
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(conversations).values({ user1Id, user2Id }).returning();
    return result[0];
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined> {
    const result = await db
      .select()
      .from(conversations)
      .where(
        sql`(${conversations.user1Id} = ${user1Id} AND ${conversations.user2Id} = ${user2Id}) OR (${conversations.user1Id} = ${user2Id} AND ${conversations.user2Id} = ${user1Id})`
      )
      .limit(1);
    return result[0];
  }

  async getUserConversations(userId: string, limit: number = 50): Promise<ConversationWithParticipants[]> {
    const result = await db
      .select({
        conversation: conversations,
        user1: users,
        user2Profile: userProfiles
      })
      .from(conversations)
      .innerJoin(users, sql`${users.id} = CASE WHEN ${conversations.user1Id} = ${userId} THEN ${conversations.user2Id} ELSE ${conversations.user1Id} END`)
      .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(sql`${conversations.user1Id} = ${userId} OR ${conversations.user2Id} = ${userId}`)
      .orderBy(desc(conversations.lastMessageAt))
      .limit(limit);

    const conversationsWithUnread = await Promise.all(
      result.map(async (row) => {
        const otherUserId = row.conversation.user1Id === userId ? row.conversation.user2Id : row.conversation.user1Id;
        const unreadCount = await this.getConversationUnreadCount(row.conversation.id, userId);

        return {
          ...row.conversation,
          user1: {
            username: row.conversation.user1Id === userId ? null : row.user1.username,
            avatarUrl: row.conversation.user1Id === userId ? null : row.user2Profile?.avatarUrl || null
          },
          user2: {
            username: row.conversation.user2Id === userId ? null : row.user1.username,
            avatarUrl: row.conversation.user2Id === userId ? null : row.user2Profile?.avatarUrl || null
          },
          unreadCount
        };
      })
    );

    return conversationsWithUnread;
  }

  private async getConversationUnreadCount(conversationId: string, userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(messages)
      .where(
        sql`${messages.conversationId} = ${conversationId} AND ${messages.senderId} != ${userId} AND ${messages.read} = false`
      );
    return result[0]?.count || 0;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    return await db.transaction(async (tx) => {
      const [newMessage] = await tx.insert(messages).values(message).returning();

      await tx
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, message.conversationId));

      return newMessage;
    });
  }

  async getConversationMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        sql`${messages.conversationId} = ${conversationId} AND ${messages.senderId} != ${userId} AND ${messages.read} = false`
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        sql`(${conversations.user1Id} = ${userId} OR ${conversations.user2Id} = ${userId}) AND ${messages.senderId} != ${userId} AND ${messages.read} = false`
      );
    return result[0]?.count || 0;
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Verify user is a participant
      const conversation = await tx
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (!conversation[0]) {
        throw new NotFoundError("Conversation not found");
      }

      if (conversation[0].user1Id !== userId && conversation[0].user2Id !== userId) {
        throw new ValidationError("You are not a participant in this conversation");
      }

      // Delete all messages in the conversation
      await tx.delete(messages).where(eq(messages.conversationId, conversationId));

      // Delete the conversation
      await tx.delete(conversations).where(eq(conversations.id, conversationId));
    });
  }

  // Phase 4: Forum
  async createForumThread(thread: InsertForumThread): Promise<ForumThread> {
    const result = await db.insert(forumThreads).values(thread).returning();
    return result[0];
  }

  async getForumThreads(category?: string, limit: number = 50): Promise<ForumThread[]> {
    let query = db.select().from(forumThreads);

    if (category) {
      query = query.where(eq(forumThreads.category, category)) as any;
    }

    return await query.orderBy(desc(forumThreads.isPinned), desc(forumThreads.createdAt)).limit(limit);
  }

  async getForumThread(threadId: string): Promise<ForumThread | undefined> {
    const result = await db.select().from(forumThreads).where(eq(forumThreads.id, threadId)).limit(1);
    return result[0];
  }

  async updateForumThread(
    threadId: string,
    updates: Partial<Pick<ForumThread, 'title' | 'content' | 'isPinned' | 'isLocked'>>
  ): Promise<ForumThread> {
    const result = await db
      .update(forumThreads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumThreads.id, threadId))
      .returning();
    
    if (!result[0]) {
      throw new NotFoundError(`Forum thread ${threadId} not found`);
    }
    return result[0];
  }

  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    return await db.transaction(async (tx) => {
      const [newComment] = await tx.insert(forumComments).values(comment).returning();

      await tx
        .update(forumThreads)
        .set({ 
          commentsCount: sql`${forumThreads.commentsCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(forumThreads.id, comment.threadId));

      return newComment;
    });
  }

  async getForumComments(threadId: string, limit: number = 50): Promise<ForumComment[]> {
    return await db
      .select()
      .from(forumComments)
      .where(eq(forumComments.threadId, threadId))
      .orderBy(desc(forumComments.createdAt))
      .limit(limit);
  }

  async voteForumThread(threadId: string, userId: string, vote: 'up' | 'down'): Promise<void> {
    await db.transaction(async (tx) => {
      const thread = await tx
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, threadId))
        .for('update')
        .limit(1);

      if (!thread[0]) {
        throw new NotFoundError(`Forum thread ${threadId} not found`);
      }

      // Check if user has already voted
      const existingVote = await tx
        .select()
        .from(forumThreadVotes)
        .where(
          sql`${forumThreadVotes.threadId} = ${threadId} AND ${forumThreadVotes.userId} = ${userId}`
        )
        .limit(1);

      if (existingVote.length > 0) {
        const oldVote = existingVote[0].voteType;
        
        // If voting the same way, do nothing
        if (oldVote === vote) {
          return;
        }

        // User is changing their vote - remove old vote count and add new one
        if (oldVote === 'up' && vote === 'down') {
          await tx
            .update(forumThreads)
            .set({ 
              upvotes: sql`${forumThreads.upvotes} - 1`,
              downvotes: sql`${forumThreads.downvotes} + 1`
            })
            .where(eq(forumThreads.id, threadId));
        } else if (oldVote === 'down' && vote === 'up') {
          await tx
            .update(forumThreads)
            .set({ 
              downvotes: sql`${forumThreads.downvotes} - 1`,
              upvotes: sql`${forumThreads.upvotes} + 1`
            })
            .where(eq(forumThreads.id, threadId));
        }

        // Update the vote record
        await tx
          .update(forumThreadVotes)
          .set({ voteType: vote })
          .where(eq(forumThreadVotes.id, existingVote[0].id));
      } else {
        // First time voting - insert new vote record
        await tx.insert(forumThreadVotes).values({
          threadId,
          userId,
          voteType: vote,
        });

        // Update vote count
        if (vote === 'up') {
          await tx
            .update(forumThreads)
            .set({ upvotes: sql`${forumThreads.upvotes} + 1` })
            .where(eq(forumThreads.id, threadId));
        } else {
          await tx
            .update(forumThreads)
            .set({ downvotes: sql`${forumThreads.downvotes} + 1` })
            .where(eq(forumThreads.id, threadId));
        }
      }
    });
  }

  async voteForumComment(commentId: string, userId: string, vote: 'up' | 'down'): Promise<void> {
    await db.transaction(async (tx) => {
      const comment = await tx
        .select()
        .from(forumComments)
        .where(eq(forumComments.id, commentId))
        .for('update')
        .limit(1);

      if (!comment[0]) {
        throw new NotFoundError(`Forum comment ${commentId} not found`);
      }

      // Check if user has already voted
      const existingVote = await tx
        .select()
        .from(forumCommentVotes)
        .where(
          sql`${forumCommentVotes.commentId} = ${commentId} AND ${forumCommentVotes.userId} = ${userId}`
        )
        .limit(1);

      if (existingVote.length > 0) {
        const oldVote = existingVote[0].voteType;
        
        // If voting the same way, do nothing
        if (oldVote === vote) {
          return;
        }

        // User is changing their vote - remove old vote count and add new one
        if (oldVote === 'up' && vote === 'down') {
          await tx
            .update(forumComments)
            .set({ 
              upvotes: sql`${forumComments.upvotes} - 1`,
              downvotes: sql`${forumComments.downvotes} + 1`
            })
            .where(eq(forumComments.id, commentId));
        } else if (oldVote === 'down' && vote === 'up') {
          await tx
            .update(forumComments)
            .set({ 
              downvotes: sql`${forumComments.downvotes} - 1`,
              upvotes: sql`${forumComments.upvotes} + 1`
            })
            .where(eq(forumComments.id, commentId));
        }

        // Update the vote record
        await tx
          .update(forumCommentVotes)
          .set({ voteType: vote })
          .where(eq(forumCommentVotes.id, existingVote[0].id));
      } else {
        // First time voting - insert new vote record
        await tx.insert(forumCommentVotes).values({
          commentId,
          userId,
          voteType: vote,
        });

        // Update vote count
        if (vote === 'up') {
          await tx
            .update(forumComments)
            .set({ upvotes: sql`${forumComments.upvotes} + 1` })
            .where(eq(forumComments.id, commentId));
        } else {
          await tx
            .update(forumComments)
            .set({ downvotes: sql`${forumComments.downvotes} + 1` })
            .where(eq(forumComments.id, commentId));
        }
      }
    });
  }

  // Phase 5: Achievements
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const result = await db.insert(achievements).values(achievement).returning();
    return result[0];
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const existing = await db
      .select()
      .from(userAchievements)
      .where(
        sql`${userAchievements.userId} = ${userId} AND ${userAchievements.achievementId} = ${achievementId}`
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const result = await db.insert(userAchievements).values({ userId, achievementId }).returning();
    return result[0];
  }

  async getUserAchievements(userId: string): Promise<Array<UserAchievement & { achievement: Achievement }>> {
    const result = await db
      .select({
        userAchievement: userAchievements,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));

    return result.map(row => ({
      ...row.userAchievement,
      achievement: row.achievement
    }));
  }

  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userAchievements)
      .where(
        sql`${userAchievements.userId} = ${userId} AND ${userAchievements.achievementId} = ${achievementId}`
      )
      .limit(1);
    return result.length > 0;
  }

  // Phase 6: FAQs
  async createFaq(faq: InsertFaq): Promise<Faq> {
    const result = await db.insert(faqs).values(faq).returning();
    return result[0];
  }

  async getFaqs(category?: string): Promise<Faq[]> {
    let query = db.select().from(faqs);

    if (category) {
      query = query.where(eq(faqs.category, category)) as any;
    }

    return await query.orderBy(faqs.order, desc(faqs.createdAt));
  }

  async updateFaq(
    faqId: string,
    updates: Partial<Pick<Faq, 'question' | 'answer' | 'category' | 'order'>>
  ): Promise<Faq> {
    const result = await db
      .update(faqs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(faqs.id, faqId))
      .returning();
    
    if (!result[0]) {
      throw new NotFoundError(`FAQ ${faqId} not found`);
    }
    return result[0];
  }

  async deleteFaq(faqId: string): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, faqId));
  }

  // AMM calculation methods
  private calculateAmmTrade(
    side: 'yes' | 'no',
    amount: number, // Amount user is spending (cash/points)
    yesPool: number, // Share inventory for YES
    noPool: number   // Share inventory for NO
  ): {
    shares: number; // Shares received by the user
    newYesPool: number;
    newNoPool: number;
    avgPrice: number // Average price per share for this trade
  } {
    // Single-pool CPMM for prediction markets
    // k = yesPool * noPool (constant product)
    // When buying YES: user deposits cash into NO pool, receives YES shares
    // When buying NO: user deposits cash into YES pool, receives NO shares
    // This ensures Price(YES) = noPool/(yesPool+noPool) and cost ≈ shares × price

    const k = yesPool * noPool;

    if (side === 'yes') {
      // Buying YES shares
      // User deposits 'amount' (cash) into NO pool
      const newNoPool = noPool + amount;

      // Maintain constant product: yesPool * noPool = k
      // newYesPool * newNoPool = k
      // Avoid division by zero
      const newYesPool = newNoPool > 0 ? k / newNoPool : 0;

      // Shares given to user = reduction in YES share inventory
      const shares = yesPool - newYesPool;

      // Calculate average price (total cost / shares received)
      // Avoid division by zero if shares is 0
      const avgPrice = shares > 0 ? amount / shares : 0;

      return {
        shares,
        newYesPool,
        newNoPool,
        avgPrice
      };
    } else {
      // Buying NO shares
      // User deposits 'amount' (cash) into YES pool
      const newYesPool = yesPool + amount;

      // Maintain constant product
      const newNoPool = newYesPool > 0 ? k / newYesPool : 0;

      // Shares given to user = reduction in NO share inventory
      const shares = noPool - newNoPool;

      // Calculate average price
      const avgPrice = shares > 0 ? amount / shares : 0;

      return {
        shares,
        newYesPool,
        newNoPool,
        avgPrice
      };
    }
  }

  // Selling shares returns cash based on CPMM formula
  private calculatePayoutForSell(
    sharesToSell: number,
    side: 'yes' | 'no',
    yesPool: number, // Share inventory for YES
    noPool: number   // Share inventory for NO
  ): { payout: number; newYesPool: number; newNoPool: number } {
    // Single-pool CPMM for selling
    // User returns shares to pool, receives cash from opposite pool
    // Maintains constant product: k = yesPool * noPool
    
    const k = yesPool * noPool;

    if (side === 'yes') {
      // Selling YES shares
      // User returns shares to YES inventory
      const newYesPool = yesPool + sharesToSell;

      // Maintain constant product: yesPool * noPool = k
      // newYesPool * newNoPool = k
      // Avoid division by zero
      const newNoPool = newYesPool > 0 ? k / newYesPool : 0;

      // Payout = reduction in NO pool (cash withdrawn)
      const payout = noPool - newNoPool;

      return {
        payout,
        newYesPool,
        newNoPool
      };
    } else {
      // Selling NO shares
      // User returns shares to NO inventory
      const newNoPool = noPool + sharesToSell;

      // Maintain constant product
      const newYesPool = newNoPool > 0 ? k / newNoPool : 0;

      // Payout = reduction in YES pool (cash withdrawn)
      const payout = yesPool - newYesPool;

      return {
        payout,
        newYesPool,
        newNoPool
      };
    }
  }
}

export const dbStorage = new DbStorage();