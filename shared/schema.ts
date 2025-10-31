import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, real, jsonb, unique, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  passwordHash: text("password_hash"),
  passwordUpdatedAt: timestamp("password_updated_at"),
  lastLoginAt: timestamp("last_login_at"),
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
  referrerId: varchar("referrer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Manual resolution queue for markets requiring operator action
export const manualResolutionQueue = pgTable("manual_resolution_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  marketType: text("market_type").notNull(),
  reason: text("reason").notNull(),
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
  // Legacy pool fields (deprecated but kept for backwards compatibility)
  yesPool: decimal("yes_pool", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  noPool: decimal("no_pool", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  yesPrice: decimal("yes_price", { precision: 5, scale: 4 }).notNull().default("0.5000"),
  noPrice: decimal("no_price", { precision: 5, scale: 4 }).notNull().default("0.5000"),
  // New CPMM pool fields (share pool and collateral pool)
  yesSharePool: decimal("yes_share_pool", { precision: 10, scale: 2 }).notNull().default("20000.00"),
  yesCollateralPool: decimal("yes_collateral_pool", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  noSharePool: decimal("no_share_pool", { precision: 10, scale: 2 }).notNull().default("20000.00"),
  noCollateralPool: decimal("no_collateral_pool", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  currentYesPrice: decimal("current_yes_price", { precision: 10, scale: 4 }).notNull().default("0.5000"),
  currentNoPrice: decimal("current_no_price", { precision: 10, scale: 4 }).notNull().default("0.5000"),
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
  bundleSafe: boolean("bundle_safe").notNull().default(false),
});

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  position: text("position").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  price: decimal("price", { precision: 18, scale: 9 }).notNull(),
  shares: decimal("shares", { precision: 18, scale: 9 }).notNull(),
  status: text("status").notNull().default("open"), // open, settled, won, lost, refunded
  profit: decimal("profit", { precision: 18, scale: 9 }),
  averageCost: decimal("average_cost", { precision: 18, scale: 9 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  position: text("position").notNull(),
  shares: decimal("shares", { precision: 18, scale: 9 }).notNull().default("0.000000000"),
  averagePrice: decimal("average_price", { precision: 18, scale: 9 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bucketAt: timestamp("bucket_at", { withTimezone: true }).notNull(),
  cashBalance: decimal("cash_balance", { precision: 18, scale: 2 }).notNull(),
  equityBalance: decimal("equity_balance", { precision: 18, scale: 2 }).notNull(),
  holdingsJson: jsonb("holdings_json"),
  source: text("source").notNull().default("on_demand"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userBucketIdx: uniqueIndex("portfolio_snapshots_user_bucket_idx").on(table.userId, table.bucketAt),
}));

// Parlay (Bundles) tables
export const parlayTickets = pgTable("parlay_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  stake: decimal("stake", { precision: 12, scale: 2 }).notNull(),
  combinedOdds: decimal("combined_odds", { precision: 12, scale: 6 }).notNull(),
  potentialPayout: decimal("potential_payout", { precision: 12, scale: 2 }).notNull(),
  marginApplied: decimal("margin_applied", { precision: 6, scale: 4 }).notNull().default("0.00"),
  status: text("status").notNull().default("pending"), // pending, won, lost, cancelled, voided
  bundleSafe: boolean("bundle_safe").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  settledAt: timestamp("settled_at"),
});

export const parlayLegs = pgTable("parlay_legs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => parlayTickets.id, { onDelete: "cascade" }),
  marketId: varchar("market_id").notNull().references(() => markets.id),
  position: text("position").notNull(), // YES or NO
  entryPrice: decimal("entry_price", { precision: 6, scale: 4 }).notNull(),
  settlementPrice: decimal("settlement_price", { precision: 6, scale: 4 }),
  status: text("status").notNull().default("pending"), // pending, won, lost, voided
  bundleSafe: boolean("bundle_safe").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
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
  leaderboardRank: integer("leaderboard_rank"),
  leaderboardWins: integer("leaderboard_wins"),
  leaderboardLosses: integer("leaderboard_losses"),
  leaderboardSolGain: decimal("leaderboard_sol_gain", { precision: 10, scale: 2 }),
  leaderboardUsdGain: decimal("leaderboard_usd_gain", { precision: 10, scale: 2 }),
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
  // PnL metrics for each timeframe
  pnl1d: decimal("pnl_1d", { precision: 10, scale: 2 }),
  pnl7d: decimal("pnl_7d", { precision: 10, scale: 2 }),
  pnl30d: decimal("pnl_30d", { precision: 10, scale: 2 }),
  // Win Rate for each timeframe
  winRate1d: decimal("win_rate_1d", { precision: 5, scale: 2 }),
  winRate7d: decimal("win_rate_7d", { precision: 5, scale: 2 }),
  winRate30d: decimal("win_rate_30d", { precision: 5, scale: 2 }),
  // Total Trades (Volume) for each timeframe
  totalTrades1d: integer("total_trades_1d"),
  totalTrades7d: integer("total_trades_7d"),
  totalTrades30d: integer("total_trades_30d"),
  profileUrl: text("profile_url"),
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
  passwordUpdatedAt: true,
  lastLoginAt: true,
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

export const insertManualResolutionQueueSchema = createInsertSchema(manualResolutionQueue).omit({
  id: true,
  createdAt: true,
});

// Parlay insert schemas
export const insertParlayTicketSchema = createInsertSchema(parlayTickets).omit({
  id: true,
  createdAt: true,
  settledAt: true,
  status: true,
});

export const insertParlayLegSchema = createInsertSchema(parlayLegs).omit({
  id: true,
  resolvedAt: true,
  status: true,
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
export type InsertManualResolutionQueue = z.infer<typeof insertManualResolutionQueueSchema>;
export type ManualResolutionQueueItem = typeof manualResolutionQueue.$inferSelect;

export type InsertParlayTicket = z.infer<typeof insertParlayTicketSchema>;
export type ParlayTicket = typeof parlayTickets.$inferSelect;
export type InsertParlayLeg = z.infer<typeof insertParlayLegSchema>;
export type ParlayLeg = typeof parlayLegs.$inferSelect;

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
  avatarUrl: string | null;
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
  volume?: number;
};

// Social Features Tables
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  totalBets: integer("total_bets").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalLosses: integer("total_losses").notNull().default(0),
  totalVolume: decimal("total_volume", { precision: 18, scale: 2 }).notNull().default("0.00"),
  profitLoss: decimal("profit_loss", { precision: 18, scale: 2 }).notNull().default("0.00"),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).notNull().default("0.00"),
  roi: decimal("roi", { precision: 10, scale: 2 }).notNull().default("0.00"),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueFollow: unique().on(table.followerId, table.followingId),
}));

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // new_bet, bet_won, bet_lost, followed_user, followed_kol
  data: text("data").notNull(), // JSON string with activity details
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id),
  user2Id: varchar("user2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const forumThreads = pgTable("forum_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // general, strategies, kols, markets
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forumComments = pgTable("forum_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => forumThreads.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: varchar("parent_id").references((): any => forumComments.id), // For nested replies
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// New tables for forum voting
export const forumThreadVotes = pgTable("forum_thread_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => forumThreads.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueThreadVote: unique().on(table.threadId, table.userId),
}));

export const forumCommentVotes = pgTable("forum_comment_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").notNull().references(() => forumComments.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueCommentVote: unique().on(table.commentId, table.userId),
}));

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // new_follower, new_message, forum_reply, achievement_earned, bet_won, bet_lost
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: text("data"), // JSON string with notification details
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(), // betting, social, volume, streak
  requirement: text("requirement").notNull(), // JSON string with requirement logic
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(), // getting_started, betting, kols, technical
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas for social features
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  followersCount: true,
  followingCount: true,
  totalBets: true,
  totalWins: true,
  totalLosses: true,
  totalVolume: true,
  profitLoss: true,
  winRate: true,
  roi: true,
});

export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  downvotes: true,
  commentsCount: true,
  isPinned: true,
  isLocked: true,
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  downvotes: true,
});

// Insert schemas for new vote tables
export const insertForumThreadVoteSchema = createInsertSchema(forumThreadVotes).omit({
  id: true,
  createdAt: true,
});

export const insertForumCommentVoteSchema = createInsertSchema(forumCommentVotes).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types for social features
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;
export type UserFollow = typeof userFollows.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = typeof forumThreads.$inferSelect;

export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type ForumComment = typeof forumComments.$inferSelect;

// Types for new vote tables
export type InsertForumThreadVote = z.infer<typeof insertForumThreadVoteSchema>;
export type ForumThreadVote = typeof forumThreadVotes.$inferSelect;

export type InsertForumCommentVote = z.infer<typeof insertForumCommentVoteSchema>;
export type ForumCommentVote = typeof forumCommentVotes.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;

export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

// Composite types
export type UserProfileWithStats = UserProfile & {
  user: { username: string | null };
  achievementsCount: number;
  isFollowing?: boolean;
};

export type ForumThreadWithUser = ForumThread & {
  user: { username: string | null; avatarUrl: string | null };
};

export type ForumCommentWithUser = ForumComment & {
  user: { username: string | null; avatarUrl: string | null };
};

export type ConversationWithParticipants = Conversation & {
  user1: { username: string | null; avatarUrl: string | null };
  user2: { username: string | null; avatarUrl: string | null };
  unreadCount: number;
};