// @ts-nocheck - Disable strict type checking for this file
import { TwitterApi } from 'twitter-api-v2';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { format, addDays } from 'date-fns';
import { KOLData, Market, FollowerCache } from '../types.js';
import { RateLimitTracker, loadFollowerCache, saveFollowerCache, cacheMarketData, sampleKOLs, randomChoice } from '../utils.js';

export class KOLMarketGenerator {
  private twitterClient?: TwitterApi;
  private rateLimiter = new RateLimitTracker();
  private followerCache: FollowerCache = {};

  constructor() {
    this.initTwitterClient();
    this.followerCache = loadFollowerCache();
  }

  private initTwitterClient(): void {
    const apiKey = process.env.X_API_KEY;
    const apiSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (apiKey && apiSecret && accessToken && accessTokenSecret) {
      this.twitterClient = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessTokenSecret,
      });
      console.log('✅ X API client initialized (Free Tier: 3 lookups/15min)');
    } else {
      console.log('⚠️ X API credentials not found - follower markets disabled');
      console.log('   Set environment variables: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
    }
  }

  private async getFollowerCount(xHandle: string): Promise<number | null> {
    // Check cache first (24h validity)
    if (this.followerCache[xHandle]) {
      const cacheAge = new Date().getTime() - new Date(this.followerCache[xHandle].cachedAt).getTime();
      const hoursOld = cacheAge / (1000 * 60 * 60);

      if (hoursOld < 24) {
        console.log(`  💾 Cache hit: @${xHandle} has ${this.followerCache[xHandle].followers.toLocaleString()} followers (${hoursOld.toFixed(1)}h ago)`);
        return this.followerCache[xHandle].followers;
      }
    }

    // Fetch from API if available and within rate limits
    if (this.twitterClient && this.rateLimiter.canMakeLookup()) {
      try {
        const user = await this.twitterClient.v2.userByUsername(xHandle);
        const followerCount = user.data.public_metrics?.followers_count || 0;

        // Cache result
        this.followerCache[xHandle] = {
          followers: followerCount,
          cachedAt: new Date().toISOString()
        };
        saveFollowerCache(this.followerCache);

        this.rateLimiter.recordLookup();
        console.log(`  🐦 API fetch: @${xHandle} has ${followerCount.toLocaleString()} followers`);

        return followerCount;
      } catch (error) {
        console.error(`  ❌ Failed to fetch @${xHandle}:`, error);
        return null;
      }
    }

    console.log(`  ⏭️ Skipping @${xHandle} (rate limited or API unavailable)`);
    return null;
  }

  private loadLatestKOLData(): KOLData[] {
    const csvFiles = readdirSync('.')
      .filter(file => file.startsWith('kol_leaderboard_') && file.endsWith('.csv'))
      .sort()
      .reverse();

    if (csvFiles.length === 0) {
      throw new Error('No KOL leaderboard CSV found. Run scraper first!');
    }

    const latestCsv = csvFiles[0];
    console.log(`📂 Loading KOL data from: ${latestCsv}`);

    const csvContent = readFileSync(latestCsv, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    const kolData: KOLData[] = [];
    for (let i = 1; i < lines.length; i++) { // Skip header
      const cols = lines[i].split(',').map(col => col.replace(/"/g, ''));
      if (cols.length >= 6) {
        kolData.push({
          rank: cols[0],
          username: cols[1],
          xHandle: cols[2],
          winsLosses: cols[3],
          solGain: cols[4],
          usdGain: cols[5]
        });
      }
    }

    return kolData;
  }

  // --- MARKET TEMPLATES ---

  private generateRankFlippeningMarket(kolData: KOLData[]): Market | null {
    const [kolA, kolB] = sampleKOLs(kolData, 2);
    const marketId = `rank_flip_${format(new Date(), 'yyyyMMdd_HHmmss')}`;

    cacheMarketData(marketId, {
      type: 'rank_flippening',
      kolA: kolA.username,
      kolB: kolB.username,
      currentRankA: kolA.rank,
      currentRankB: kolB.rank,
      createdAt: new Date().toISOString()
    });

    return {
      id: marketId,
      question: `Will ${kolA.username} rank higher than ${kolB.username} on tomorrow's kolscan.io leaderboard?`,
      resolution: 'Tomorrow\'s kolscan.io CSV comparison',
      endTime: format(addDays(new Date(), 1), 'yyyy-MM-dd 23:00:00'),
      requiresXApi: false,
      type: 'rank_flippening'
    };
  }

  private generateProfitStreakMarket(kolData: KOLData[]): Market | null {
    const kol = sampleKOLs(kolData, 1)[0];
    const marketId = `profit_${format(new Date(), 'yyyyMMdd_HHmmss')}`;

    cacheMarketData(marketId, {
      type: 'profit_streak',
      kol: kol.username,
      currentUsd: kol.usdGain,
      createdAt: new Date().toISOString()
    });

    return {
      id: marketId,
      question: `Will ${kol.username} have a positive USD Gain on tomorrow's leaderboard?`,
      resolution: 'Tomorrow\'s kolscan.io CSV check',
      endTime: format(addDays(new Date(), 1), 'yyyy-MM-dd 23:00:00'),
      requiresXApi: false,
      type: 'profit_streak'
    };
  }

  private async generateFollowerGrowthMarket(kolData: KOLData[]): Promise<Market | null> {
    const validKOLs = kolData.filter(k => k.xHandle && k.xHandle.trim() !== '');
    if (validKOLs.length === 0) return null;

    const kol = sampleKOLs(validKOLs, 1)[0];
    const xHandle = kol.xHandle;

    // Try to get current follower count (respects rate limits)
    const currentFollowers = await this.getFollowerCount(xHandle);
    if (currentFollowers === null) {
      console.log(`  → Skipping follower market for @${xHandle} (rate limited or unavailable)`);
      return null;
    }

    const threshold = randomChoice([500, 1000, 2000]);
    const days = randomChoice([3, 7]);

    const marketId = `followers_${xHandle}_${format(new Date(), 'yyyyMMdd_HHmmss')}`;
    const question = `Will ${kol.username} (@${xHandle}) gain ${threshold.toLocaleString()}+ X followers in the next ${days} days?`;

    cacheMarketData(marketId, {
      type: 'follower_growth',
      kol: kol.username,
      xHandle: xHandle,
      currentFollowers,
      threshold,
      timeframeDays: days,
      createdAt: new Date().toISOString()
    });

    return {
      id: marketId,
      question,
      resolution: `X API check after ${days} days`,
      endTime: format(addDays(new Date(), days), 'yyyy-MM-dd HH:mm:ss'),
      requiresXApi: true,
      currentValue: `${currentFollowers.toLocaleString()} followers`,
      type: 'follower_growth'
    };
  }

  async generateMarkets(count: number = 5): Promise<Market[]> {
    const kolData = this.loadLatestKOLData();
    if (kolData.length < 2) {
      throw new Error('Need at least 2 KOLs to generate markets');
    }

    console.log(`🎯 Generating ${count} markets from ${kolData.length} KOLs...`);
    console.log(`📊 Rate limit status: ${this.rateLimiter.getRemainingLookups()} lookups available`);

    const markets: Market[] = [];
    const generators = [
      () => this.generateRankFlippeningMarket(kolData),
      () => this.generateProfitStreakMarket(kolData),
      () => this.generateFollowerGrowthMarket(kolData)
    ];

    for (let i = 0; i < count; i++) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`MARKET ${i + 1}`);
      console.log('─'.repeat(70));

      let market: Market | null = null;
      let attempts = 0;

      while (!market && attempts < 3) {
        // Favor non-X-API markets to preserve rate limits
        const useXApi = Math.random() < 0.3 && !!this.twitterClient;
        const availableGenerators = useXApi ? generators : generators.slice(0, 2);

        const generator = randomChoice(availableGenerators);
        market = await generator();
        attempts++;
      }

      if (market) {
        markets.push(market);
        console.log('\n✅ CREATED');
        console.log(`  ID: ${market.id}`);
        console.log(`  Question: ${market.question}`);
        console.log(`  End Time: ${market.endTime}`);
        console.log(`  Resolution: ${market.resolution}`);
        if (market.currentValue) {
          console.log(`  Current: ${market.currentValue}`);
        }
        console.log(`  X API Required: ${market.requiresXApi}`);
        console.log(`  Type: ${market.type}`);
      } else {
        console.log('\n❌ FAILED (likely rate limited)');
      }

      // Small delay between markets to be respectful
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return markets;
  }
}