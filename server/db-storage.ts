import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc, sql } from "drizzle-orm";
import ws from "ws";

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

  async getAllKols(): Promise<Kol[]> {
    return await db.select().from(kols);
  }

  async createKol(insertKol: InsertKol): Promise<Kol> {
    const result = await db.insert(kols).values(insertKol).returning();
    return result[0];
  }

  async updateKol(id: string, updates: Partial<Omit<Kol, 'id'>>): Promise<void> {
    await db.update(kols).set(updates).where(eq(kols.id, id));
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

  // Transactional bet placement - all operations succeed or all fail
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
}

export const dbStorage = new DbStorage();
