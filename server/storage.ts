import { 
  type User, type InsertUser,
  type Kol, type InsertKol,
  type Market, type InsertMarket, type MarketWithKol,
  type Bet, type InsertBet, type BetWithMarket,
  type LeaderboardEntry
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, balance: string): Promise<void>;
  updateUserStats(id: string, totalBets: number, totalWins: number, totalProfit: string): Promise<void>;
  
  // KOL methods
  getKol(id: string): Promise<Kol | undefined>;
  getAllKols(): Promise<Kol[]>;
  createKol(kol: InsertKol): Promise<Kol>;
  
  // Market methods
  getMarket(id: string): Promise<Market | undefined>;
  getAllMarkets(): Promise<Market[]>;
  getMarketWithKol(id: string): Promise<MarketWithKol | undefined>;
  getAllMarketsWithKols(): Promise<MarketWithKol[]>;
  createMarket(market: InsertMarket): Promise<Market>;
  updateMarketPrice(id: string, price: string, supply: number): Promise<void>;
  updateMarketVolume(id: string, volume: string): Promise<void>;
  
  // Bet methods
  getBet(id: string): Promise<Bet | undefined>;
  getUserBets(userId: string): Promise<Bet[]>;
  getRecentBets(limit?: number): Promise<BetWithMarket[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(id: string, status: string, profit?: string): Promise<void>;
  
  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private kols: Map<string, Kol>;
  private markets: Map<string, Market>;
  private bets: Map<string, Bet>;

  constructor() {
    this.users = new Map();
    this.kols = new Map();
    this.markets = new Map();
    this.bets = new Map();
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create default user
    const defaultUser: User = {
      id: randomUUID(),
      username: "trader1",
      balance: "1000.00",
      totalBets: 0,
      totalWins: 0,
      totalProfit: "0.00",
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create mock KOLs
    const mockKols: InsertKol[] = [
      {
        name: "Sarah Chen",
        handle: "sarahchen",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sarah`,
        followers: 125000,
        engagementRate: "4.8",
        tier: "Elite",
        trending: true,
        trendingPercent: "12.5",
      },
      {
        name: "Alex Morgan",
        handle: "alexmorgan",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=alex`,
        followers: 89000,
        engagementRate: "3.2",
        tier: "Rising",
        trending: true,
        trendingPercent: "8.3",
      },
      {
        name: "Jordan Lee",
        handle: "jordanlee",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=jordan`,
        followers: 210000,
        engagementRate: "5.6",
        tier: "Elite",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Taylor Swift",
        handle: "taylorswift",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=taylor`,
        followers: 340000,
        engagementRate: "6.2",
        tier: "Legendary",
        trending: true,
        trendingPercent: "15.7",
      },
      {
        name: "Chris Evans",
        handle: "chrisevans",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=chris`,
        followers: 56000,
        engagementRate: "2.9",
        tier: "Growing",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Emma Watson",
        handle: "emmawatson",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=emma`,
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
      const market: Market = {
        id: randomUUID(),
        kolId: kol.id,
        title: marketTitles[index],
        description: `Prediction market for ${kol.name}'s performance metrics`,
        outcome: "pending",
        price: (0.10 + Math.random() * 0.15).toFixed(4),
        supply: Math.floor(Math.random() * 1000),
        totalVolume: (Math.random() * 5000).toFixed(2),
        isLive: true,
        resolvesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(),
        engagement: (Math.random() * 3).toFixed(2),
      };
      this.markets.set(market.id, market);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      balance: "1000.00",
      totalBets: 0,
      totalWins: 0,
      totalProfit: "0.00",
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

  async getAllKols(): Promise<Kol[]> {
    return Array.from(this.kols.values());
  }

  async createKol(insertKol: InsertKol): Promise<Kol> {
    const id = randomUUID();
    const kol: Kol = { ...insertKol, id };
    this.kols.set(id, kol);
    return kol;
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
    
    const kol = this.kols.get(market.kolId);
    if (!kol) return undefined;
    
    return { ...market, kol };
  }

  async getAllMarketsWithKols(): Promise<MarketWithKol[]> {
    const markets = Array.from(this.markets.values());
    return markets
      .map((market) => {
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
    };
    this.markets.set(id, market);
    return market;
  }

  async updateMarketPrice(id: string, price: string, supply: number): Promise<void> {
    const market = this.markets.get(id);
    if (market) {
      market.price = price;
      market.supply = supply;
      this.markets.set(id, market);
    }
  }

  async updateMarketVolume(id: string, volume: string): Promise<void> {
    const market = this.markets.get(id);
    if (market) {
      market.totalVolume = volume;
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

  async getRecentBets(limit: number = 20): Promise<BetWithMarket[]> {
    const bets = Array.from(this.bets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return bets
      .map((bet) => {
        const market = this.markets.get(bet.marketId);
        if (!market) return null;
        
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
    };
    this.bets.set(id, bet);
    return bet;
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
    }));
  }
}

export const storage = new MemStorage();
