import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  totalBets: integer("total_bets").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).notNull().default("0.00"),
});

export const kols = pgTable("kols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  avatar: text("avatar").notNull(),
  followers: integer("followers").notNull(),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull(),
  tier: text("tier").notNull(),
  trending: boolean("trending").notNull().default(false),
  trendingPercent: decimal("trending_percent", { precision: 5, scale: 2 }),
});

export const markets = pgTable("markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kolId: varchar("kol_id").notNull().references(() => kols.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  outcome: text("outcome").notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  supply: integer("supply").notNull().default(0),
  totalVolume: decimal("total_volume", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isLive: boolean("is_live").notNull().default(true),
  resolvesAt: timestamp("resolves_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  engagement: decimal("engagement", { precision: 5, scale: 2 }).notNull().default("0.00"),
});

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  shares: integer("shares").notNull(),
  status: text("status").notNull().default("pending"),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
  totalBets: true,
  totalWins: true,
  totalProfit: true,
});

export const insertKolSchema = createInsertSchema(kols).omit({
  id: true,
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
  createdAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
  profit: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertKol = z.infer<typeof insertKolSchema>;
export type Kol = typeof kols.$inferSelect;

export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type Market = typeof markets.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type MarketWithKol = Market & { kol: Kol };
export type BetWithMarket = Bet & { market: MarketWithKol };

export type LeaderboardEntry = {
  userId: string;
  username: string;
  totalProfit: string;
  totalBets: number;
  totalWins: number;
  winRate: number;
  rank: number;
};
