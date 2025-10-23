import { TwitterApi } from 'twitter-api-v2';
import { dbStorage } from "./db-storage";

class RateLimitTracker {
  private lookups: Date[] = [];
  private readonly maxLookups = 3;
  private readonly windowMs = 15 * 60 * 1000;

  canMakeLookup(): boolean {
    const now = new Date();
    this.lookups = this.lookups.filter(time =>
      now.getTime() - time.getTime() < this.windowMs
    );
    return this.lookups.length < this.maxLookups;
  }

  recordLookup(): void {
    this.lookups.push(new Date());
    const remaining = this.maxLookups - this.lookups.length;
    console.log(`📊 X API Rate Limit: ${remaining} user lookups remaining in this window`);
  }

  getRemainingLookups(): number {
    this.canMakeLookup();
    return this.maxLookups - this.lookups.length;
  }
}

export class XAPIClient {
  private twitterClient?: TwitterApi;
  private rateLimiter = new RateLimitTracker();
  private isConfigured = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
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
      this.isConfigured = true;
      console.log('✅ X (Twitter) API client initialized (Free Tier: 3 lookups/15min)');
    } else {
      console.log('⚠️ X API credentials not found - follower verification disabled');
      console.log('   Set environment variables: X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
    }
  }

  async getFollowerCount(xHandle: string): Promise<number | null> {
    const cleanHandle = xHandle.replace('@', '');

    const cached = await dbStorage.getFollowerCache(cleanHandle);
    if (cached) {
      const cacheAge = new Date().getTime() - new Date(cached.cachedAt).getTime();
      const hoursOld = cacheAge / (1000 * 60 * 60);

      if (hoursOld < 24) {
        console.log(`  💾 Cache hit: @${cleanHandle} has ${cached.followers.toLocaleString()} followers (${hoursOld.toFixed(1)}h ago)`);
        return cached.followers;
      }
    }

    if (!this.isConfigured || !this.twitterClient) {
      console.log(`  ⏭️ Skipping @${cleanHandle} (X API not configured)`);
      return null;
    }

    if (!this.rateLimiter.canMakeLookup()) {
      console.log(`  ⏭️ Skipping @${cleanHandle} (rate limited)`);
      return null;
    }

    try {
      const user = await this.twitterClient.v2.userByUsername(cleanHandle);
      const followerCount = user.data.public_metrics?.followers_count || 0;

      await dbStorage.upsertFollowerCache({
        xHandle: cleanHandle,
        followers: followerCount,
      });

      this.rateLimiter.recordLookup();
      console.log(`  🐦 API fetch: @${cleanHandle} has ${followerCount.toLocaleString()} followers`);

      return followerCount;
    } catch (error) {
      console.error(`  ❌ Failed to fetch @${cleanHandle}:`, error);
      return null;
    }
  }

  getRateLimitStatus(): { remaining: number; isConfigured: boolean } {
    return {
      remaining: this.rateLimiter.getRemainingLookups(),
      isConfigured: this.isConfigured,
    };
  }

  isAPIConfigured(): boolean {
    return this.isConfigured;
  }
}

export const xApiClient = new XAPIClient();
