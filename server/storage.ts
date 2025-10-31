import { 
  type User, type InsertUser,
  type Kol, type InsertKol,
  type Market, type InsertMarket, type MarketWithKol,
  type Bet, type InsertBet, type BetWithMarket,
  type Position, type InsertPosition, type PositionWithMarket,
  type Comment, type InsertComment, type CommentWithUser,
  type Transaction, type InsertTransaction,
  type KolMetricsHistory, type InsertKolMetricsHistory,
  type ScrapedKol, type InsertScrapedKol,
  type FollowerCacheEntry, type InsertFollowerCache,
  type MarketMetadata, type InsertMarketMetadata,
  type SolanaDeposit, type InsertSolanaDeposit,
  type SolanaWithdrawal, type InsertSolanaWithdrawal,
  type PlatformFee, type InsertPlatformFee,
  type UserProfile, type InsertUserProfile,
  type UserFollow, type InsertUserFollow,
  type Activity, type InsertActivity,
  type Conversation, type InsertConversation, type ConversationWithParticipants,
  type Message, type InsertMessage,
  type ForumThread, type InsertForumThread,
  type ForumComment, type InsertForumComment,
  type Notification, type InsertNotification,
  type Achievement, type InsertAchievement,
  type UserAchievement, type InsertUserAchievement,
  type Faq, type InsertFaq,
  type LeaderboardEntry,
  type PriceHistoryPoint,
  type ParlayTicket,
  type InsertParlayTicket,
  type ParlayLeg,
  type InsertParlayLeg,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByTwitterId(twitterId: string): Promise<User | undefined>;
  getAllUsers(limit?: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, balance: string): Promise<void>;
  updateUserSolanaBalance(id: string, solanaBalance: string): Promise<void>;
  updateUserDepositAddress(id: string, address: string): Promise<void>;
  updateUserStats(id: string, totalBets: number, totalWins: number, totalProfit: string): Promise<void>;
  updateUserPassword(id: string, passwordHash: string, passwordUpdatedAt?: Date): Promise<void>;
  updateUserLastLogin(id: string, timestamp?: Date): Promise<void>;

  // KOL methods
  getKol(id: string): Promise<Kol | undefined>;
  getKolByHandle(handle: string): Promise<Kol | undefined>;
  getAllKols(): Promise<Kol[]>;
  createKol(kol: InsertKol): Promise<Kol>;
  updateKol(id: string, updates: Partial<Omit<Kol, 'id'>>): Promise<Kol>;

  // Market methods
  getMarket(id: string): Promise<Market | undefined>;
  getAllMarkets(): Promise<Market[]>;
  getMarketWithKol(id: string): Promise<MarketWithKol | undefined>;
  getAllMarketsWithKols(): Promise<MarketWithKol[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarket(id: string, updates: Partial<Omit<Market, 'id' | 'createdAt'>>): Promise<void>;
  updateMarketVolume(id: string, volume: string): Promise<void>;
  resolveMarket(id: string, resolvedValue: string): Promise<void>;

  // Bet methods
  getBet(id: string): Promise<Bet | undefined>;
  getUserBets(userId: string): Promise<Bet[]>;
  getUserBetsWithMarkets(userId: string): Promise<BetWithMarket[]>;
  getRecentBets(limit?: number): Promise<BetWithMarket[]>;
  getMarketBets(marketId: string): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(id: string, status: string, profit?: string): Promise<void>;

  // Enhanced transactional bet placement with row-level locking and slippage protection
  placeBetWithLocking(params: {
    userId: string;
    marketId: string;
    position: "YES" | "NO";
    amount: number;
    action: "buy" | "sell";
    slippageTolerance?: number;
  }): Promise<{
    bet: Bet;
    priceImpact: number;
    platformFee?: number;
  }>;

  // Position methods
  getUserPosition(userId: string, marketId: string, position: string): Promise<Position | undefined>;
  getUserPositions(userId: string): Promise<Position[]>;
  getUserPositionsWithMarkets(userId: string): Promise<PositionWithMarket[]>;
  getMarketPositions(marketId: string): Promise<Position[]>;
  updateUserPosition(userId: string, marketId: string, position: string, shares: number, action: string): Promise<void>;

  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;

  // Price history
  getMarketPriceHistory(marketId: string, days?: number): Promise<PriceHistoryPoint[]>;

  // Parlays
  quoteParlay(
    legs: Array<{ marketId: string; position: "YES" | "NO" }>,
    stake: number
  ): Promise<{ combinedOdds: string; potentialPayout: string; marginApplied: string; legs: Array<{ marketId: string; position: "YES"|"NO"; entryPrice: string }> }>;
  createParlayTicket(
    userId: string,
    stake: number,
    legs: Array<{ marketId: string; position: "YES" | "NO" }>
  ): Promise<ParlayTicket & { legs: ParlayLeg[] }>;
  getParlayTicket(userId: string, ticketId: string): Promise<(ParlayTicket & { legs: ParlayLeg[] }) | undefined>;
  listParlayTickets(userId: string, status?: ParlayTicket["status"]): Promise<Array<ParlayTicket & { legs: ParlayLeg[] }>>;
  cancelParlayTicket(userId: string, ticketId: string): Promise<void>;
  settleParlaysForMarket(marketId: string, outcome: "yes" | "no"): Promise<void>;

  // Comments
  getMarketComments(marketId: string): Promise<CommentWithUser[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;

  // KOL metrics history
  createKolMetricsHistory(history: InsertKolMetricsHistory): Promise<KolMetricsHistory>;
  getKolMetricsHistory(kolId: string, days?: number): Promise<KolMetricsHistory[]>;

  // Scraped KOLs
  createScrapedKols(kols: InsertScrapedKol[]): Promise<ScrapedKol[]>;
  getLatestScrapedKols(limit?: number): Promise<ScrapedKol[]>;
  getScrapedKolsByDate(date: Date): Promise<ScrapedKol[]>;

  // Follower cache
  getFollowerCache(xHandle: string): Promise<FollowerCacheEntry | undefined>;
  upsertFollowerCache(cache: InsertFollowerCache): Promise<FollowerCacheEntry>;
  getAllFollowerCache(): Promise<FollowerCacheEntry[]>;

  // Market metadata
  createMarketMetadata(metadata: InsertMarketMetadata): Promise<MarketMetadata>;
  getMarketMetadata(marketId: string): Promise<MarketMetadata | undefined>;
  getAllMarketMetadata(): Promise<MarketMetadata[]>;

  // Solana deposits
  createDeposit(deposit: InsertSolanaDeposit): Promise<SolanaDeposit>;
  getPendingDeposits(): Promise<SolanaDeposit[]>;
  getUserDeposits(userId: string, limit?: number): Promise<SolanaDeposit[]>;
  updateDepositStatus(id: string, status: string, confirmations: number): Promise<void>;

  // Solana withdrawals
  createWithdrawal(withdrawal: InsertSolanaWithdrawal): Promise<SolanaWithdrawal>;
  getPendingWithdrawals(): Promise<SolanaWithdrawal[]>;
  getUserWithdrawals(userId: string, limit?: number): Promise<SolanaWithdrawal[]>;
  updateWithdrawalStatus(id: string, status: string, signature?: string, error?: string): Promise<void>;

  // Platform fees
  createPlatformFee(fee: InsertPlatformFee): Promise<PlatformFee>;
  getTotalPlatformFees(): Promise<string>;
  getUserPlatformFees(userId: string): Promise<PlatformFee[]>;

  // User profiles
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  getProfileByUsername(username: string): Promise<{ user: User; profile: UserProfile } | undefined>;
  ensureUserProfile(userId: string): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'bio' | 'avatarUrl'>>): Promise<UserProfile>;

  // Follow system
  followUser(followerId: string, followingId: string): Promise<UserFollow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string, limit?: number): Promise<Array<{ user: User; followedAt: Date }>>;
  getFollowing(userId: string, limit?: number): Promise<Array<{ user: User; followedAt: Date }>>;

  // Activities
  createActivity(activity: InsertActivity): Promise<Activity>;
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  getFollowingActivities(userId: string, limit?: number): Promise<Activity[]>;

  // Messaging
  createConversation(user1Id: string, user2Id: string): Promise<Conversation>;
  getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string, limit?: number): Promise<ConversationWithParticipants[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string, limit?: number): Promise<Message[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  deleteConversation(conversationId: string, userId: string): Promise<void>;

  // Forum
  createForumThread(thread: InsertForumThread): Promise<ForumThread>;
  getForumThreads(category?: string, limit?: number): Promise<ForumThread[]>;
  getForumThread(threadId: string): Promise<ForumThread | undefined>;
  updateForumThread(threadId: string, updates: Partial<Pick<ForumThread, 'title' | 'content' | 'isPinned' | 'isLocked'>>): Promise<ForumThread>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  getForumComments(threadId: string, limit?: number): Promise<ForumComment[]>;
  voteForumThread(threadId: string, userId: string, vote: 'up' | 'down'): Promise<void>;
  voteForumComment(commentId: string, userId: string, vote: 'up' | 'down'): Promise<void>;

  // Achievements
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievements(): Promise<Achievement[]>;
  awardAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  getUserAchievements(userId: string): Promise<Array<UserAchievement & { achievement: Achievement }>>;
  hasAchievement(userId: string, achievementId: string): Promise<boolean>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // FAQs
  createFaq(faq: InsertFaq): Promise<Faq>;
  getFaqs(category?: string): Promise<Faq[]>;
  updateFaq(faqId: string, updates: Partial<Pick<Faq, 'question' | 'answer' | 'category' | 'order'>>): Promise<Faq>;
  deleteFaq(faqId: string): Promise<void>;

  // Manual resolution queue
  enqueueManualReview(item: { marketId: string; marketType: string; reason: string }): Promise<void>;
  listManualReview(limit?: number): Promise<Array<{ id: string; marketId: string; marketType: string; reason: string; createdAt: Date }>>;
  deleteManualReview(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private kols: Map<string, Kol>;
  private markets: Map<string, Market>;
  private bets: Map<string, Bet>;
  private positions: Map<string, Position>;
  private comments: Map<string, Comment>;
  private scrapedKols: ScrapedKol[];
  private parlayTickets: Map<string, ParlayTicket & { legs: ParlayLeg[] }>;
  private followerCache: Map<string, FollowerCacheEntry>;
  private solanaDeposits: Map<string, SolanaDeposit>;
  private solanaWithdrawals: Map<string, SolanaWithdrawal>;
  private platformFees: Map<string, PlatformFee>;
  private manualReviewQueue: Array<{ id: string; marketId: string; marketType: string; reason: string; createdAt: Date }>;

  constructor() {
    this.users = new Map();
    this.kols = new Map();
    this.markets = new Map();
    this.bets = new Map();
    this.positions = new Map();
    this.comments = new Map();
    this.parlayTickets = new Map();
    this.followerCache = new Map();
    this.solanaDeposits = new Map();
    this.solanaWithdrawals = new Map();
    this.platformFees = new Map();
    this.parlayTickets = new Map();
    this.manualReviewQueue = [];
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create default user
    const defaultUser: User = {
      id: randomUUID(),
      username: "trader1",
      walletAddress: null,
      passwordHash: null,
      passwordUpdatedAt: null,
      lastLoginAt: null,
      authProvider: "username",
      isGuest: false,
      twitterId: null,
      twitterHandle: null,
      balance: "1000.00",
      solanaDepositAddress: null,
      solanaBalance: "0.000000000",
      totalBets: 0,
      totalWins: 0,
      totalProfit: "0.00",
      referrerId: null,
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create mock KOLs
    const mockKols: InsertKol[] = [
      {
        name: "Sarah Chen",
        handle: "sarahchen",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=sarah`,
        followers: 125000,
        engagementRate: "4.8",
        tier: "Elite",
        trending: true,
        trendingPercent: "12.5",
      },
      {
        name: "Alex Morgan",
        handle: "alexmorgan",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=alex`,
        followers: 89000,
        engagementRate: "3.2",
        tier: "Rising",
        trending: true,
        trendingPercent: "8.3",
      },
      {
        name: "Jordan Lee",
        handle: "jordanlee",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=jordan`,
        followers: 210000,
        engagementRate: "5.6",
        tier: "Elite",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Taylor Swift",
        handle: "taylorswift",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=taylor`,
        followers: 340000,
        engagementRate: "6.2",
        tier: "Legendary",
        trending: true,
        trendingPercent: "15.7",
      },
      {
        name: "Chris Evans",
        handle: "chrisevans",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=chris`,
        followers: 56000,
        engagementRate: "2.9",
        tier: "Growing",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Emma Watson",
        handle: "emmawatson",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=emma`,
        followers: 178000,
        engagementRate: "4.1",
        tier: "Elite",
        trending: true,
        trendingPercent: "6.9",
      },
    ];

    mockKols.forEach((kolData) => {
      const kol: Kol = {
        id: randomUUID(),
        ...kolData,
        trending: kolData.trending ?? false,
        trendingPercent: kolData.trendingPercent ?? null,
        kolscanRank: null,
        kolscanWins: null,
        kolscanLosses: null,
        kolscanSolGain: null,
        kolscanUsdGain: null,
        lastScrapedAt: null,
        scrapedFromKolscan: false,
      };
      this.kols.set(kol.id, kol);
    });

    // Create mock markets
    const kolsArray = Array.from(this.kols.values());
    const marketTitles = [
      "Will reach 150K followers by end of month?",
      "Engagement rate will exceed 5% this week?",
      "Will gain 10K+ followers in next 7 days?",
      "Next campaign will get 50K+ interactions?",
      "Will trending rate stay above 10%?",
      "Will collaborate with major brand this month?",
    ];

    kolsArray.forEach((kol, index) => {
      const yesPrice = 0.40 + Math.random() * 0.20; // Random between 0.40 and 0.60
      const market: Market = {
        id: randomUUID(),
        kolId: kol.id,
        title: marketTitles[index],
        description: `Prediction market for ${kol.name}'s performance metrics`,
        outcome: "pending",
        yesPool: "100.00",
        noPool: "100.00",
        yesPrice: yesPrice.toFixed(4),
        noPrice: (1.0 - yesPrice).toFixed(4),
        yesSharePool: "20000.00",
        yesCollateralPool: "10000.00",
        noSharePool: "20000.00",
        noCollateralPool: "10000.00",
        currentYesPrice: yesPrice.toFixed(4),
        currentNoPrice: (1.0 - yesPrice).toFixed(4),
        totalVolume: (Math.random() * 5000).toFixed(2),
        isLive: true,
        resolved: false,
        resolvedValue: null,
        resolvesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        engagement: (Math.random() * 3).toFixed(2),
        marketType: "standard",
        marketCategory: "social",
        requiresXApi: false,
        bundleSafe: true,
      };
      this.markets.set(market.id, market);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUserPassword(id: string, passwordHash: string, passwordUpdatedAt: Date = new Date()): Promise<void> {
    const user = this.users.get(id);
    if (!user) return;
    user.passwordHash = passwordHash;
    user.passwordUpdatedAt = passwordUpdatedAt;
    this.users.set(id, user);
  }

  async updateUserLastLogin(id: string, timestamp: Date = new Date()): Promise<void> {
    const user = this.users.get(id);
    if (!user) return;
    user.lastLoginAt = timestamp;
    this.users.set(id, user);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async getUserByTwitterId(twitterId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.twitterId === twitterId,
    );
  }

  async getAllUsers(limit: number = 100): Promise<User[]> {
    return Array.from(this.users.values()).slice(0, limit);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      username: null,
      walletAddress: null,
      authProvider: "username",
      isGuest: false,
      twitterId: null,
      twitterHandle: null,
      ...insertUser,
      id,
      referrerId: insertUser.referrerId ?? null,
      passwordHash: insertUser.passwordHash ?? null,
      passwordUpdatedAt: insertUser.passwordHash ? new Date() : null,
      lastLoginAt: null,
      balance: "1000.00",
      solanaDepositAddress: null,
      solanaBalance: "0.000000000",
      totalBets: 0,
      totalWins: 0,
      totalProfit: "0.00",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: string, balance: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.balance = balance;
      this.users.set(id, user);
    }
  }

  async updateUserSolanaBalance(id: string, solanaBalance: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.solanaBalance = solanaBalance;
      this.users.set(id, user);
    }
  }

  async updateUserDepositAddress(id: string, address: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.solanaDepositAddress = address;
      this.users.set(id, user);
    }
  }

  async updateUserStats(id: string, totalBets: number, totalWins: number, totalProfit: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.totalBets = totalBets;
      user.totalWins = totalWins;
      user.totalProfit = totalProfit;
      this.users.set(id, user);
    }
  }

  // KOL methods
  async getKol(id: string): Promise<Kol | undefined> {
    return this.kols.get(id);
  }

  async getKolByHandle(handle: string): Promise<Kol | undefined> {
    return Array.from(this.kols.values()).find(
      (kol) => kol.handle === handle,
    );
  }

  async getAllKols(): Promise<Kol[]> {
    return Array.from(this.kols.values());
  }

  async createKol(insertKol: InsertKol): Promise<Kol> {
    const id = randomUUID();
    const kol: Kol = {
      ...insertKol,
      id,
      trending: insertKol.trending ?? false,
      trendingPercent: insertKol.trendingPercent ?? null,
      kolscanRank: insertKol.kolscanRank ?? null,
      kolscanWins: insertKol.kolscanWins ?? null,
      kolscanLosses: insertKol.kolscanLosses ?? null,
      kolscanSolGain: insertKol.kolscanSolGain ?? null,
      kolscanUsdGain: insertKol.kolscanUsdGain ?? null,
      lastScrapedAt: insertKol.lastScrapedAt ?? null,
      scrapedFromKolscan: insertKol.scrapedFromKolscan ?? false,
    };
    this.kols.set(id, kol);
    return kol;
  }

  async updateKol(id: string, updates: Partial<Omit<Kol, 'id'>>): Promise<Kol> {
    const kol = this.kols.get(id);
    if (!kol) {
      throw new Error(`KOL with id ${id} not found`);
    }
    const updatedKol = { ...kol, ...updates };
    this.kols.set(id, updatedKol);
    return updatedKol;
  }

  // Market methods
  async getMarket(id: string): Promise<Market | undefined> {
    return this.markets.get(id);
  }

  async getAllMarkets(): Promise<Market[]> {
    return Array.from(this.markets.values());
  }

  async getMarketWithKol(id: string): Promise<MarketWithKol | undefined> {
    const market = this.markets.get(id);
    if (!market) return undefined;
    if (!market.kolId) return undefined;

    const kol = this.kols.get(market.kolId);
    if (!kol) return undefined;

    return { ...market, kol };
  }

  async getAllMarketsWithKols(): Promise<MarketWithKol[]> {
    const markets = Array.from(this.markets.values());
    return markets
      .map((market) => {
        if (!market.kolId) return null;
        const kol = this.kols.get(market.kolId);
        if (!kol) return null;
        return { ...market, kol };
      })
      .filter((m): m is MarketWithKol => m !== null);
  }

  async createMarket(insertMarket: InsertMarket): Promise<Market> {
    const id = randomUUID();
    const market: Market = {
      ...insertMarket,
      id,
      createdAt: new Date(),
      yesPool: insertMarket.yesPool ?? "100.00",
      noPool: insertMarket.noPool ?? "100.00",
      yesPrice: insertMarket.yesPrice ?? "0.5000",
      noPrice: insertMarket.noPrice ?? "0.5000",
      yesSharePool: insertMarket.yesSharePool ?? "20000.00",
      yesCollateralPool: insertMarket.yesCollateralPool ?? "10000.00",
      noSharePool: insertMarket.noSharePool ?? "20000.00",
      noCollateralPool: insertMarket.noCollateralPool ?? "10000.00",
      currentYesPrice: insertMarket.currentYesPrice ?? "0.5000",
      currentNoPrice: insertMarket.currentNoPrice ?? "0.5000",
      totalVolume: insertMarket.totalVolume ?? "0.00",
      isLive: insertMarket.isLive ?? true,
      resolved: false,
      resolvedValue: null,
      engagement: insertMarket.engagement ?? "0.00",
      marketType: insertMarket.marketType ?? "standard",
      marketCategory: insertMarket.marketCategory ?? null,
      requiresXApi: insertMarket.requiresXApi ?? false,
      kolId: insertMarket.kolId ?? null,
      bundleSafe: insertMarket.bundleSafe ?? false,
    };
    this.markets.set(id, market);
    return market;
  }

  async updateMarket(id: string, updates: Partial<Omit<Market, 'id' | 'createdAt'>>): Promise<void> {
    const market = this.markets.get(id);
    if (market) {
      const updatedMarket = { ...market, ...updates };
      this.markets.set(id, updatedMarket);
    }
  }

  async updateMarketVolume(id: string, volume: string): Promise<void> {
    const market = this.markets.get(id);
    if (market) {
      market.totalVolume = volume;
      this.markets.set(id, market);
    }
  }

  async resolveMarket(id: string, resolvedValue: string): Promise<void> {
    const market = this.markets.get(id);
    if (market) {
      market.resolved = true;
      market.resolvedValue = resolvedValue;
      market.isLive = false;
      this.markets.set(id, market);
    }
  }

  // Bet methods
  async getBet(id: string): Promise<Bet | undefined> {
    return this.bets.get(id);
  }

  async getUserBets(userId: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.userId === userId,
    );
  }

  async getUserBetsWithMarkets(userId: string): Promise<BetWithMarket[]> {
    const bets = Array.from(this.bets.values())
      .filter((bet) => bet.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return bets
      .map((bet) => {
        const market = this.markets.get(bet.marketId);
        if (!market) return null;
        if (!market.kolId) return null;

        const kol = this.kols.get(market.kolId);
        if (!kol) return null;

        return {
          ...bet,
          market: { ...market, kol },
        };
      })
      .filter((b): b is BetWithMarket => b !== null);
  }

  async getRecentBets(limit: number = 20): Promise<BetWithMarket[]> {
    const bets = Array.from(this.bets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return bets
      .map((bet) => {
        const market = this.markets.get(bet.marketId);
        if (!market) return null;
        if (!market.kolId) return null;

        const kol = this.kols.get(market.kolId);
        if (!kol) return null;

        return {
          ...bet,
          market: { ...market, kol },
        };
      })
      .filter((b): b is BetWithMarket => b !== null);
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = randomUUID();
    const bet: Bet = {
      ...insertBet,
      id,
      createdAt: new Date(),
      status: "open",
      profit: null,
      averageCost: insertBet.averageCost ?? null,
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getMarketBets(marketId: string): Promise<Bet[]> {
    return Array.from(this.bets.values()).filter(
      (bet) => bet.marketId === marketId,
    );
  }

  async updateBetStatus(id: string, status: string, profit?: string): Promise<void> {
    const bet = this.bets.get(id);
    if (bet) {
      bet.status = status;
      if (profit !== undefined) {
        bet.profit = profit;
      }
      this.bets.set(id, bet);
    }
  }

  // Simplified placeBetWithLocking for MemStorage (not truly atomic but functional for dev/test)
  async placeBetWithLocking(params: {
    userId: string;
    marketId: string;
    position: "YES" | "NO";
    amount: number;
    action: "buy" | "sell";
    slippageTolerance?: number;
  }): Promise<{
    bet: Bet;
    priceImpact: number;
    platformFee?: number;
  }> {
    const PLATFORM_FEE_PERCENTAGE = 0.02;
    const market = this.markets.get(params.marketId);
    const user = this.users.get(params.userId);

    if (!market) {
      throw new Error(`Market ${params.marketId} not found`);
    }
    if (!user) {
      throw new Error(`User ${params.userId} not found`);
    }
    if (!market.isLive) {
      throw new Error("Market is not live");
    }

    const userBalance = parseFloat(user.balance);
    const betAmount = params.amount;

    if (params.action === "buy" && userBalance < betAmount) {
      throw new Error("Insufficient balance");
    }

    const platformFee = params.action === "buy" ? betAmount * PLATFORM_FEE_PERCENTAGE : 0;
    const amountAfterFee = betAmount - platformFee;

    const currentPrice = parseFloat(params.position === "YES" ? market.yesPrice : market.noPrice);
    const shares = amountAfterFee / currentPrice;

    const bet: Bet = {
      id: randomUUID(),
      userId: params.userId,
      marketId: params.marketId,
      position: params.position,
      amount: betAmount.toFixed(2),
      price: currentPrice.toFixed(4),
      shares: shares.toFixed(2),
      status: "pending",
      profit: null,
      averageCost: null,
      createdAt: new Date(),
    };

    this.bets.set(bet.id, bet);

    const newBalance = params.action === "buy"
      ? (userBalance - betAmount).toFixed(2)
      : (userBalance + betAmount).toFixed(2);
    user.balance = newBalance;
    user.totalBets += 1;
    this.users.set(user.id, user);

    return {
      bet,
      priceImpact: 0.01,
      platformFee: platformFee > 0 ? platformFee : undefined,
    };
  }

  // Position methods
  async getUserPosition(userId: string, marketId: string, position: string): Promise<Position | undefined> {
    return Array.from(this.positions.values()).find(
      (pos) => pos.userId === userId && pos.marketId === marketId && pos.position === position
    );
  }

  async getUserPositions(userId: string): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (pos) => pos.userId === userId && parseFloat(pos.shares) > 0
    );
  }

  async getUserPositionsWithMarkets(userId: string): Promise<PositionWithMarket[]> {
    const positions = await this.getUserPositions(userId);
    return positions
      .map((position) => {
        const market = this.markets.get(position.marketId);
        if (!market) return null;
        if (!market.kolId) return null;

        const kol = this.kols.get(market.kolId);
        if (!kol) return null;

        return {
          ...position,
          market: { ...market, kol },
        };
      })
      .filter((p): p is PositionWithMarket => p !== null);
  }

  async getMarketPositions(marketId: string): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (pos) => pos.marketId === marketId && parseFloat(pos.shares) > 0
    );
  }

  async updateUserPosition(userId: string, marketId: string, position: string, shares: number, action: string): Promise<void> {
    const existing = await this.getUserPosition(userId, marketId, position);

    if (existing) {
      const currentShares = parseFloat(existing.shares);
      const currentAvgPrice = parseFloat(existing.averagePrice);

      if (action === "buy") {
        const newShares = currentShares + shares;
        const newAvgPrice = ((currentShares * currentAvgPrice) + (shares * parseFloat(existing.averagePrice))) / newShares;
        existing.shares = newShares.toFixed(2);
        existing.averagePrice = newAvgPrice.toFixed(4);
      } else {
        existing.shares = Math.max(0, currentShares - shares).toFixed(2);
      }
      existing.updatedAt = new Date();
      this.positions.set(existing.id, existing);
    } else if (action === "buy") {
      const id = randomUUID();
      const market = this.markets.get(marketId);
      const price = position === "YES" ? market?.yesPrice : market?.noPrice;
      const newPosition: Position = {
        id,
        userId,
        marketId,
        position,
        shares: shares.toFixed(2),
        averagePrice: price ?? "0.5000",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.positions.set(id, newPosition);
    }
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = Array.from(this.users.values())
      .filter((u) => u.totalBets > 0)
      .sort((a, b) => parseFloat(b.totalProfit) - parseFloat(a.totalProfit));

    return users.map((user, index) => ({
      userId: user.id,
      username: user.username,
      totalProfit: user.totalProfit,
      totalBets: user.totalBets,
      totalWins: user.totalWins,
      winRate: user.totalBets > 0 ? (user.totalWins / user.totalBets) * 100 : 0,
      rank: index + 1,
      avatarUrl: null,
    }));
  }

  // Price history - Generate historical data with dynamic intervals based on time until resolution
  async getMarketPriceHistory(marketId: string, days: number = 7): Promise<PriceHistoryPoint[]> {
    const market = this.markets.get(marketId);
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

  // Parlays (in-memory)
  private getParlayMargin(): number {
    const raw = process.env.PARLAY_MARGIN;
    const val = raw ? parseFloat(raw) : 0.05;
    if (Number.isFinite(val) && val >= 0 && val <= 0.2) return val;
    return 0.05;
  }

  async quoteParlay(
    legs: Array<{ marketId: string; position: "YES" | "NO" }>,
    stake: number
  ): Promise<{ combinedOdds: string; potentialPayout: string; marginApplied: string; legs: Array<{ marketId: string; position: "YES"|"NO"; entryPrice: string }> }> {
    if (!Array.isArray(legs) || legs.length < 2 || legs.length > 3) {
      throw new Error("Parlays must have 2-3 legs");
    }
    if (!Number.isFinite(stake) || stake <= 0) throw new Error("Invalid stake");

    const seen = new Set<string>();
    const legsWithPrice: Array<{ marketId: string; position: "YES"|"NO"; entryPrice: string }> = legs.map(({ marketId, position }) => {
      const m = this.markets.get(marketId);
      if (!m) throw new Error(`Market ${marketId} not found`);
      if (m.resolved) throw new Error(`Market ${marketId} already resolved`);
      if (!m.bundleSafe) throw new Error(`Market ${marketId} not bundle-safe`);
      if (seen.has(marketId)) throw new Error("Duplicate market in parlay");
      seen.add(marketId);
      const price = position === "YES" ? parseFloat(m.currentYesPrice) : parseFloat(m.currentNoPrice);
      const clamped = Math.min(0.99, Math.max(0.01, price));
      return { marketId, position, entryPrice: clamped.toFixed(4) };
    });

    const combinedProb = legsWithPrice.reduce((acc, l) => acc * parseFloat(l.entryPrice), 1);
    const grossOdds = 1 / combinedProb;
    const margin = this.getParlayMargin();
    const netOdds = grossOdds * (1 - margin);
    const potentialPayout = stake * netOdds;

    return {
      combinedOdds: netOdds.toFixed(6),
      potentialPayout: potentialPayout.toFixed(2),
      marginApplied: margin.toFixed(4),
      legs: legsWithPrice,
    };
  }

  async createParlayTicket(
    userId: string,
    stake: number,
    legs: Array<{ marketId: string; position: "YES" | "NO" }>
  ): Promise<ParlayTicket & { legs: ParlayLeg[] }> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    const balance = parseFloat(user.balance);
    if (balance < stake) throw new Error("Insufficient balance");

    const quote = await this.quoteParlay(legs, stake);
    const id = randomUUID();
    const ticket: ParlayTicket = {
      id,
      userId,
      stake: stake.toFixed(2) as any,
      combinedOdds: quote.combinedOdds as any,
      potentialPayout: quote.potentialPayout as any,
      marginApplied: quote.marginApplied as any,
      status: "pending",
      createdAt: new Date(),
      settledAt: null,
    } as unknown as ParlayTicket;

    const createdLegs: ParlayLeg[] = quote.legs.map((l) => ({
      id: randomUUID(),
      ticketId: id,
      marketId: l.marketId,
      position: l.position,
      entryPrice: l.entryPrice as any,
      settlementPrice: null,
      status: "pending",
      resolvedAt: null,
    } as unknown as ParlayLeg));

    user.balance = (balance - stake).toFixed(2) as any;

    this.parlayTickets.set(id, { ...ticket, legs: createdLegs });
    return { ...ticket, legs: createdLegs };
  }

  async getParlayTicket(userId: string, ticketId: string): Promise<(ParlayTicket & { legs: ParlayLeg[] }) | undefined> {
    const t = this.parlayTickets.get(ticketId);
    if (!t || t.userId !== userId) return undefined;
    return t;
  }

  async listParlayTickets(userId: string, status?: ParlayTicket["status"]): Promise<Array<ParlayTicket & { legs: ParlayLeg[] }>> {
    const all = Array.from(this.parlayTickets.values()).filter(t => t.userId === userId);
    return status ? all.filter(t => t.status === status) : all;
  }

  async cancelParlayTicket(userId: string, ticketId: string): Promise<void> {
    const t = this.parlayTickets.get(ticketId);
    if (!t || t.userId !== userId) throw new Error("Ticket not found");
    if (t.status !== "pending") throw new Error("Only pending tickets can be canceled");
    const anyResolved = t.legs.some(l => l.status !== "pending");
    if (anyResolved) throw new Error("Cannot cancel after any leg has resolved");
    t.status = "cancelled" as any;
    const u = this.users.get(userId);
    if (u) u.balance = (parseFloat(u.balance) + parseFloat(t.stake as any)).toFixed(2) as any;
  }

  async settleParlaysForMarket(marketId: string, outcome: "yes" | "no"): Promise<void> {
    const impacted = Array.from(this.parlayTickets.values()).filter(t => t.legs.some(l => l.marketId === marketId && l.status === "pending"));
    if (impacted.length === 0) return;

    for (const ticket of impacted) {
      for (const l of ticket.legs) {
        if (l.marketId !== marketId || l.status !== "pending") continue;
        const win = (l.position.toLowerCase() === "yes" && outcome === "yes") || (l.position.toLowerCase() === "no" && outcome === "no");
        l.status = (win ? "won" : "lost") as any;
        l.settlementPrice = (win ? "1.0000" : "0.0000") as any;
        l.resolvedAt = new Date();
      }

      // Compute ticket status
      const hasLost = ticket.legs.some(l => l.status === ("lost" as any));
      const allWon = ticket.legs.every(l => l.status === ("won" as any));
      const hasVoided = ticket.legs.some(l => l.status === ("voided" as any));

      if (hasLost && ticket.status === "pending") {
        ticket.status = "lost" as any;
      } else if (allWon && ticket.status === "pending") {
        ticket.status = "won" as any;
        ticket.settledAt = new Date();
        const u = this.users.get(ticket.userId);
        if (u) u.balance = (parseFloat(u.balance) + parseFloat(ticket.potentialPayout as any)).toFixed(2) as any;
      } else if (hasVoided && ticket.status === "pending") {
        ticket.status = "voided" as any;
        const u = this.users.get(ticket.userId);
        if (u) u.balance = (parseFloat(u.balance) + parseFloat(ticket.stake as any)).toFixed(2) as any;
      }
    }
  }

  // Comments
  async getMarketComments(marketId: string): Promise<CommentWithUser[]> {
    const comments = Array.from(this.comments.values())
      .filter((comment) => comment.marketId === marketId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return comments.map((comment) => {
      const user = this.users.get(comment.userId);
      return {
        ...comment,
        user: {
          username: user?.username || "Unknown",
        },
      };
    });
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Transaction methods (stub - not persisted in memory)
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    return transaction;
  }

  async getUserTransactions(userId: string, limit: number = 50): Promise<Transaction[]> {
    return [];
  }

  // KOL metrics history methods (stub - not persisted in memory)
  async createKolMetricsHistory(insertHistory: InsertKolMetricsHistory): Promise<KolMetricsHistory> {
    const id = randomUUID();
    const history: KolMetricsHistory = {
      ...insertHistory,
      id,
      createdAt: new Date(),
      trending: insertHistory.trending ?? false,
      trendingPercent: insertHistory.trendingPercent ?? null,
    };
    return history;
  }

  async getKolMetricsHistory(kolId: string, days: number = 30): Promise<KolMetricsHistory[]> {
    return [];
  }

  // Scraped KOLs methods
  async createScrapedKols(kols: InsertScrapedKol[]): Promise<ScrapedKol[]> {
    const defaultScrapedAt = new Date();
    const newScrapedKols: ScrapedKol[] = kols.map(kol => ({
      id: randomUUID(),
      rank: kol.rank,
      username: kol.username,
      xHandle: kol.xHandle ?? null,
      wins: kol.wins ?? null,
      losses: kol.losses ?? null,
      solGain: kol.solGain ?? null,
      usdGain: kol.usdGain ?? null,
      pnl1d: kol.pnl1d ?? null,
      pnl7d: kol.pnl7d ?? null,
      pnl30d: kol.pnl30d ?? null,
      winRate1d: kol.winRate1d ?? null,
      winRate7d: kol.winRate7d ?? null,
      winRate30d: kol.winRate30d ?? null,
      totalTrades1d: kol.totalTrades1d ?? null,
      totalTrades7d: kol.totalTrades7d ?? null,
      totalTrades30d: kol.totalTrades30d ?? null,
      profileUrl: kol.profileUrl ?? null,
      scrapedAt: kol.scrapedAt ?? defaultScrapedAt,
    }));
    this.scrapedKols.push(...newScrapedKols);
    return newScrapedKols;
  }

  async getLatestScrapedKols(limit: number = 20): Promise<ScrapedKol[]> {
    if (this.scrapedKols.length === 0) return [];

    const sorted = [...this.scrapedKols].sort((a, b) =>
      b.scrapedAt.getTime() - a.scrapedAt.getTime()
    );

    const latestScrapedAt = sorted[0].scrapedAt;
    const latest = sorted.filter(k =>
      k.scrapedAt.getTime() === latestScrapedAt.getTime()
    );

    return latest.slice(0, limit);
  }

  async getScrapedKolsByDate(date: Date): Promise<ScrapedKol[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.scrapedKols.filter(k =>
      k.scrapedAt >= startOfDay && k.scrapedAt <= endOfDay
    );
  }

  // Follower cache methods
  async getFollowerCache(xHandle: string): Promise<FollowerCacheEntry | undefined> {
    return this.followerCache.get(xHandle);
  }

  async upsertFollowerCache(cache: InsertFollowerCache): Promise<FollowerCacheEntry> {
    const existing = this.followerCache.get(cache.xHandle);
    const entry: FollowerCacheEntry = {
      id: existing?.id || randomUUID(),
      xHandle: cache.xHandle,
      followers: cache.followers,
      cachedAt: new Date(),
    };
    this.followerCache.set(cache.xHandle, entry);
    return entry;
  }

  async getAllFollowerCache(): Promise<FollowerCacheEntry[]> {
    return Array.from(this.followerCache.values());
  }

  // Market metadata methods (stub - not persisted in memory)
  async createMarketMetadata(metadata: InsertMarketMetadata): Promise<MarketMetadata> {
    return {
      ...metadata,
      id: randomUUID(),
      createdAt: new Date(),
      xHandle: metadata.xHandle ?? null,
      kolA: metadata.kolA ?? null,
      kolB: metadata.kolB ?? null,
      currentFollowers: metadata.currentFollowers ?? null,
      currentRankA: metadata.currentRankA ?? null,
      currentRankB: metadata.currentRankB ?? null,
      currentUsd: metadata.currentUsd ?? null,
      currentSolA: metadata.currentSolA ?? null,
      currentSolB: metadata.currentSolB ?? null,
      currentUsdA: metadata.currentUsdA ?? null,
      currentUsdB: metadata.currentUsdB ?? null,
      currentWinsLossesA: metadata.currentWinsLossesA ?? null,
      currentWinsLossesB: metadata.currentWinsLossesB ?? null,
      threshold: metadata.threshold ?? null,
      timeframeDays: metadata.timeframeDays ?? null,
    };
  }

  async getMarketMetadata(marketId: string): Promise<MarketMetadata | undefined> {
    return undefined;
  }

  async getAllMarketMetadata(): Promise<MarketMetadata[]> {
    return [];
  }

  // Solana deposits methods
  async createDeposit(insertDeposit: InsertSolanaDeposit): Promise<SolanaDeposit> {
    const id = randomUUID();
    const deposit: SolanaDeposit = {
      ...insertDeposit,
      id,
      status: "pending",
      confirmations: 0,
      createdAt: new Date(),
      confirmedAt: null,
    };
    this.solanaDeposits.set(id, deposit);
    return deposit;
  }

  async getPendingDeposits(): Promise<SolanaDeposit[]> {
    return Array.from(this.solanaDeposits.values())
      .filter((deposit) => deposit.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserDeposits(userId: string, limit: number = 50): Promise<SolanaDeposit[]> {
    return Array.from(this.solanaDeposits.values())
      .filter((deposit) => deposit.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateDepositStatus(id: string, status: string, confirmations: number): Promise<void> {
    const deposit = this.solanaDeposits.get(id);
    if (deposit) {
      deposit.status = status;
      deposit.confirmations = confirmations;
      if (status === "confirmed" && !deposit.confirmedAt) {
        deposit.confirmedAt = new Date();
      }
      this.solanaDeposits.set(id, deposit);
    }
  }

  // Solana withdrawals methods
  async createWithdrawal(insertWithdrawal: InsertSolanaWithdrawal): Promise<SolanaWithdrawal> {
    const id = randomUUID();
    const withdrawal: SolanaWithdrawal = {
      ...insertWithdrawal,
      id,
      signature: null,
      status: "pending",
      error: null,
      createdAt: new Date(),
      processedAt: null,
    };
    this.solanaWithdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async getPendingWithdrawals(): Promise<SolanaWithdrawal[]> {
    return Array.from(this.solanaWithdrawals.values())
      .filter((withdrawal) => withdrawal.status === "pending")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUserWithdrawals(userId: string, limit: number = 50): Promise<SolanaWithdrawal[]> {
    return Array.from(this.solanaWithdrawals.values())
      .filter((withdrawal) => withdrawal.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async updateWithdrawalStatus(id: string, status: string, signature?: string, error?: string): Promise<void> {
    const withdrawal = this.solanaWithdrawals.get(id);
    if (withdrawal) {
      withdrawal.status = status;
      if (signature !== undefined) {
        withdrawal.signature = signature;
      }
      if (error !== undefined) {
        withdrawal.error = error;
      }
      if ((status === "completed" || status === "failed") && !withdrawal.processedAt) {
        withdrawal.processedAt = new Date();
      }
      this.solanaWithdrawals.set(id, withdrawal);
    }
  }

  // Platform fees methods
  async createPlatformFee(insertFee: InsertPlatformFee): Promise<PlatformFee> {
    const id = randomUUID();
    const fee: PlatformFee = {
      ...insertFee,
      id,
      betId: insertFee.betId ?? null,
      createdAt: new Date(),
    };
    this.platformFees.set(id, fee);
    return fee;
  }

  async getTotalPlatformFees(): Promise<string> {
    const total = Array.from(this.platformFees.values())
      .reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    return total.toFixed(9);
  }

  async getUserPlatformFees(userId: string): Promise<PlatformFee[]> {
    return Array.from(this.platformFees.values())
      .filter((fee) => fee.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // User profile methods (stub implementations - not used since we use DbStorage)
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    throw new Error("MemStorage profile methods not implemented - use DbStorage");
  }

  async getProfileByUsername(username: string): Promise<{ user: User; profile: UserProfile } | undefined> {
    throw new Error("MemStorage profile methods not implemented - use DbStorage");
  }

  async ensureUserProfile(userId: string): Promise<UserProfile> {
    throw new Error("MemStorage profile methods not implemented - use DbStorage");
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'bio' | 'avatarUrl'>>): Promise<UserProfile> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // Follow system (stub implementations)
  async followUser(followerId: string, followingId: string): Promise<UserFollow> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getFollowers(userId: string, limit?: number): Promise<Array<{ user: User; followedAt: Date }>> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getFollowing(userId: string, limit?: number): Promise<Array<{ user: User; followedAt: Date }>> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // Activities (stub implementations)
  async createActivity(activity: InsertActivity): Promise<Activity> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getUserActivities(userId: string, limit?: number): Promise<Activity[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getFollowingActivities(userId: string, limit?: number): Promise<Activity[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // Messaging (stub implementations)
  async createConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getConversation(user1Id: string, user2Id: string): Promise<Conversation | undefined> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getUserConversations(userId: string, limit?: number): Promise<ConversationWithParticipants[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getConversationMessages(conversationId: string, limit?: number): Promise<Message[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // Forum (stub implementations)
  async createForumThread(thread: InsertForumThread): Promise<ForumThread> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getForumThreads(category?: string, limit?: number): Promise<ForumThread[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getForumThread(threadId: string): Promise<ForumThread | undefined> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async updateForumThread(threadId: string, updates: Partial<Pick<ForumThread, 'title' | 'content' | 'isPinned' | 'isLocked'>>): Promise<ForumThread> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getForumComments(threadId: string, limit?: number): Promise<ForumComment[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async voteForumThread(threadId: string, userId: string, vote: 'up' | 'down'): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async voteForumComment(commentId: string, userId: string, vote: 'up' | 'down'): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // Achievements (stub implementations)
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getAchievements(): Promise<Achievement[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async awardAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getUserAchievements(userId: string): Promise<Array<UserAchievement & { achievement: Achievement }>> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // Notifications (stub implementations)
  async createNotification(notification: InsertNotification): Promise<Notification> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getUserNotifications(userId: string, limit?: number): Promise<Notification[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  // FAQs (stub implementations)
  async createFaq(faq: InsertFaq): Promise<Faq> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async getFaqs(category?: string): Promise<Faq[]> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async updateFaq(faqId: string, updates: Partial<Pick<Faq, 'question' | 'answer' | 'category' | 'order'>>): Promise<Faq> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }

  async deleteFaq(faqId: string): Promise<void> {
    throw new Error("MemStorage social methods not implemented - use DbStorage");
  }
}

export const storage = new MemStorage();