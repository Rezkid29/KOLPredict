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

  async updateMarketPrice(id: string, price: string, supply: number): Promise<void> {
    await db.update(markets).set({ price, supply }).where(eq(markets.id, id));
  }

  async updateMarket(id: string, updates: Partial<Omit<Market, 'id' | 'createdAt'>>): Promise<void> {
    await db.update(markets).set(updates).where(eq(markets.id, id));
  }

  async updateMarketVolume(id: string, volume: string): Promise<void> {
    await db.update(markets).set({ totalVolume: volume }).where(eq(markets.id, id));
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

  // Price history
  async getMarketPriceHistory(marketId: string, days: number = 7): Promise<PriceHistoryPoint[]> {
    const market = await this.getMarket(marketId);
    if (!market) return [];

    const currentPrice = parseFloat(market.price);
    const history: PriceHistoryPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const progress = (days - i) / days;
      const basePrice = currentPrice * (0.7 + progress * 0.3);
      const randomVariation = (Math.random() - 0.5) * 0.02 * currentPrice;
      const price = Math.max(0.01, basePrice + randomVariation);

      history.push({
        time: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: parseFloat(price.toFixed(4)),
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
