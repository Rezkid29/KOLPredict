import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  walletAddress: text("wallet_address").unique(),
  authProvider: text("auth_provider").notNull().default("username"),
  isGuest: boolean("is_guest").notNull().default(false),
  twitterId: text("twitter_id").unique(),
  twitterHandle: text("twitter_handle"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  solanaDepositAddress: text("solana_deposit_address").unique(),
  solanaBalance: decimal("solana_balance", { precision: 18, scale: 9 }).notNull().default("0.000000000"),
  totalBets: integer("total_bets").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalProfit: decimal("total_profit", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  kolscanRank: text("kolscan_rank"),
  kolscanWins: integer("kolscan_wins"),
  kolscanLosses: integer("kolscan_losses"),
  kolscanSolGain: text("kolscan_sol_gain"),
  kolscanUsdGain: text("kolscan_usd_gain"),
  lastScrapedAt: timestamp("last_scraped_at"),
  scrapedFromKolscan: boolean("scraped_from_kolscan").notNull().default(false),
});

export const markets = pgTable("markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kolId: varchar("kol_id").references(() => kols.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  outcome: text("outcome").notNull(),
  yesPool: decimal("yes_pool", { precision: 10, scale: 2 }).notNull().default("100.00"),
  noPool: decimal("no_pool", { precision: 10, scale: 2 }).notNull().default("100.00"),
  yesPrice: decimal("yes_price", { precision: 5, scale: 4 }).notNull().default("0.5000"),
  noPrice: decimal("no_price", { precision: 5, scale: 4 }).notNull().default("0.5000"),
  totalVolume: decimal("total_volume", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isLive: boolean("is_live").notNull().default(true),
  resolved: boolean("resolved").notNull().default(false),
  resolvedValue: text("resolved_value"),
  resolvesAt: timestamp("resolves_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  engagement: decimal("engagement", { precision: 5, scale: 2 }).notNull().default("0.00"),
  marketType: text("market_type").default("standard"),
  marketCategory: text("market_category").default("general"),
  requiresXApi: boolean("requires_x_api").notNull().default(false),
});

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  position: text("position").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  shares: decimal("shares", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("open"),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  position: text("position").notNull(),
  shares: decimal("shares", { precision: 10, scale: 2 }).notNull().default("0.00"),
  averagePrice: decimal("average_price", { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const kolMetricsHistory = pgTable("kol_metrics_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kolId: varchar("kol_id").notNull().references(() => kols.id),
  followers: integer("followers").notNull(),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull(),
  trending: boolean("trending").notNull().default(false),
  trendingPercent: decimal("trending_percent", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scrapedKols = pgTable("scraped_kols", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rank: integer("rank").notNull(),
  username: text("username").notNull(),
  xHandle: text("x_handle"),
  wins: integer("wins"),
  losses: integer("losses"),
  solGain: decimal("sol_gain", { precision: 10, scale: 2 }),
  usdGain: decimal("usd_gain", { precision: 10, scale: 2 }),
  scrapedAt: timestamp("scraped_at").notNull().defaultNow(),
});

export const followerCache = pgTable("follower_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  xHandle: text("x_handle").notNull().unique(),
  followers: integer("followers").notNull(),
  cachedAt: timestamp("cached_at").notNull().defaultNow(),
});

export const marketMetadata = pgTable("market_metadata", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  marketType: text("market_type").notNull(),
  kolA: text("kol_a"),
  kolB: text("kol_b"),
  xHandle: text("x_handle"),
  currentFollowers: integer("current_followers"),
  currentRankA: text("current_rank_a"),
  currentRankB: text("current_rank_b"),
  currentUsd: text("current_usd"),
  currentSolA: text("current_sol_a"),
  currentSolB: text("current_sol_b"),
  currentUsdA: text("current_usd_a"),
  currentUsdB: text("current_usd_b"),
  currentWinsLossesA: text("current_wins_losses_a"),
  currentWinsLossesB: text("current_wins_losses_b"),
  threshold: decimal("threshold", { precision: 5, scale: 2 }),
  timeframeDays: integer("timeframe_days"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const solanaDeposits = pgTable("solana_deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  signature: text("signature").notNull().unique(),
  amount: decimal("amount", { precision: 18, scale: 9 }).notNull(),
  depositAddress: text("deposit_address").notNull(),
  status: text("status").notNull().default("pending"),
  confirmations: integer("confirmations").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const solanaWithdrawals = pgTable("solana_withdrawals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  destinationAddress: text("destination_address").notNull(),
  amount: decimal("amount", { precision: 18, scale: 9 }).notNull(),
  signature: text("signature").unique(),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const platformFees = pgTable("platform_fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  betId: varchar("bet_id").references(() => bets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 18, scale: 9 }).notNull(),
  feePercentage: decimal("fee_percentage", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSolanaDepositSchema = createInsertSchema(solanaDeposits).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
  status: true,
  confirmations: true,
});

export const insertSolanaWithdrawalSchema = createInsertSchema(solanaWithdrawals).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  status: true,
  signature: true,
  error: true,
});

export const insertPlatformFeeSchema = createInsertSchema(platformFees).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  balance: true,
  solanaBalance: true,
  solanaDepositAddress: true,
  totalBets: true,
  totalWins: true,
  totalProfit: true,
  createdAt: true,
});

export const insertKolSchema = createInsertSchema(kols).omit({
  id: true,
});

export const insertMarketSchema = createInsertSchema(markets).omit({
  id: true,
  createdAt: true,
  resolved: true,
  resolvedValue: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  createdAt: true,
  profit: true,
  status: true,
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertKolMetricsHistorySchema = createInsertSchema(kolMetricsHistory).omit({
  id: true,
  createdAt: true,
});

export const insertScrapedKolSchema = createInsertSchema(scrapedKols).omit({
  id: true,
}).extend({
  scrapedAt: z.date().optional(),
});

export const insertFollowerCacheSchema = createInsertSchema(followerCache).omit({
  id: true,
  cachedAt: true,
});

export const insertMarketMetadataSchema = createInsertSchema(marketMetadata).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertKol = z.infer<typeof insertKolSchema>;
export type Kol = typeof kols.$inferSelect;

export type InsertMarket = z.infer<typeof insertMarketSchema>;
export type Market = typeof markets.$inferSelect;

export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertKolMetricsHistory = z.infer<typeof insertKolMetricsHistorySchema>;
export type KolMetricsHistory = typeof kolMetricsHistory.$inferSelect;

export type InsertScrapedKol = z.infer<typeof insertScrapedKolSchema>;
export type ScrapedKol = typeof scrapedKols.$inferSelect;

export type InsertFollowerCache = z.infer<typeof insertFollowerCacheSchema>;
export type FollowerCacheEntry = typeof followerCache.$inferSelect;

export type InsertMarketMetadata = z.infer<typeof insertMarketMetadataSchema>;
export type MarketMetadata = typeof marketMetadata.$inferSelect;

export type InsertSolanaDeposit = z.infer<typeof insertSolanaDepositSchema>;
export type SolanaDeposit = typeof solanaDeposits.$inferSelect;

export type InsertSolanaWithdrawal = z.infer<typeof insertSolanaWithdrawalSchema>;
export type SolanaWithdrawal = typeof solanaWithdrawals.$inferSelect;

export type InsertPlatformFee = z.infer<typeof insertPlatformFeeSchema>;
export type PlatformFee = typeof platformFees.$inferSelect;

export type MarketWithKol = Market & { kol: Kol };
export type BetWithMarket = Bet & { market: MarketWithKol };
export type CommentWithUser = Comment & { user: { username: string | null } };
export type PositionWithMarket = Position & { market: MarketWithKol };

export type LeaderboardEntry = {
  userId: string;
  username: string | null;
  totalProfit: string;
  totalBets: number;
  totalWins: number;
  winRate: number;
  rank: number;
};

export type PriceHistoryPoint = {
  time: string;
  yesPrice: number;
  noPrice: number;
};
