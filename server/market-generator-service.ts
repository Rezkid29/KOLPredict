import { dbStorage } from "./db-storage";
import { xApiClient } from "./x-api-client";
import type { InsertMarket, ScrapedKol } from "@shared/schema";
import { addDays, format } from 'date-fns';

interface GeneratedMarket {
  market: InsertMarket;
  metadata: {
    marketType: string;
    kolA?: string;
    kolB?: string;
    xHandle?: string;
    currentFollowers?: number;
    currentRankA?: string;
    currentRankB?: string;
    currentUsd?: string;
    currentSolA?: string;
    currentSolB?: string;
    currentUsdA?: string;
    currentUsdB?: string;
    currentWinsLossesA?: string;
    currentWinsLossesB?: string;
    threshold?: number;
    timeframeDays?: number;
  };
}

export class MarketGeneratorService {
  private sampleKOLs<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]!;
  }

  async generateRankFlippeningMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    if (kolData.length < 2) return null;

    const [kolA, kolB] = this.sampleKOLs(kolData, 2);

    const market: InsertMarket = {
      kolId: null,
      title: `Will ${kolA.username} rank higher than ${kolB.username} on tomorrow's kolscan.io leaderboard?`,
      description: `Prediction market comparing ranks of ${kolA.username} (currently #${kolA.rank}) vs ${kolB.username} (currently #${kolB.rank})`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'rank_flippening',
      marketCategory: 'ranking',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'rank_flippening',
      kolA: kolA.username,
      kolB: kolB.username,
      currentRankA: kolA.rank,
      currentRankB: kolB.rank,
    };

    return { market, metadata };
  }

  async generateProfitStreakMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    if (kolData.length === 0) return null;

    const kol = this.sampleKOLs(kolData, 1)[0];
    if (!kol.usdGain) return null;

    const market: InsertMarket = {
      kolId: null,
      title: `Will ${kol.username} have a positive USD Gain on tomorrow's leaderboard?`,
      description: `Prediction market for ${kol.username}'s profitability streak. Currently: ${kol.usdGain}`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'profit_streak',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'profit_streak',
      kolA: kol.username,
      currentUsd: kol.usdGain,
    };

    return { market, metadata };
  }

  async generateFollowerGrowthMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => k.xHandle && k.xHandle.trim() !== '');
    if (validKOLs.length === 0) return null;

    const kol = this.sampleKOLs(validKOLs, 1)[0];
    const xHandle = kol.xHandle!;

    const currentFollowers = await xApiClient.getFollowerCount(xHandle);
    if (currentFollowers === null) {
      console.log(`  → Skipping follower market for @${xHandle} (rate limited or unavailable)`);
      return null;
    }

    const threshold = this.randomChoice([200, 500, 1000]);
    const days = 1;

    const market: InsertMarket = {
      kolId: null,
      title: `Will ${kol.username} (@${xHandle}) gain ${threshold.toLocaleString()}+ X followers by tomorrow?`,
      description: `Follower growth prediction for ${kol.username}. Current: ${currentFollowers.toLocaleString()} followers`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), days),
      marketType: 'follower_growth',
      marketCategory: 'social',
      requiresXApi: true,
    };

    const metadata = {
      marketType: 'follower_growth',
      kolA: kol.username,
      xHandle: xHandle,
      currentFollowers: currentFollowers,
      threshold: threshold,
      timeframeDays: days,
    };

    return { market, metadata };
  }

  async generateSolGainFlippeningMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => k.solGain);
    if (validKOLs.length < 2) return null;

    const [kolA, kolB] = this.sampleKOLs(validKOLs, 2);

    const market: InsertMarket = {
      kolId: null,
      title: `Will ${kolA.username} have higher SOL gains than ${kolB.username} on tomorrow's leaderboard?`,
      description: `SOL gain comparison: ${kolA.username} (${kolA.solGain}) vs ${kolB.username} (${kolB.solGain})`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'sol_gain_flippening',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'sol_gain_flippening',
      kolA: kolA.username,
      kolB: kolB.username,
      currentSolA: kolA.solGain || undefined,
      currentSolB: kolB.solGain || undefined,
    };

    return { market, metadata };
  }

  async generateUsdGainFlippeningMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => k.usdGain);
    if (validKOLs.length < 2) return null;

    const [kolA, kolB] = this.sampleKOLs(validKOLs, 2);

    const market: InsertMarket = {
      kolId: null,
      title: `Will ${kolA.username} have higher USD gains than ${kolB.username} on tomorrow's leaderboard?`,
      description: `USD gain comparison: ${kolA.username} (${kolA.usdGain}) vs ${kolB.username} (${kolB.usdGain})`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'usd_gain_flippening',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'usd_gain_flippening',
      kolA: kolA.username,
      kolB: kolB.username,
      currentUsdA: kolA.usdGain || undefined,
      currentUsdB: kolB.usdGain || undefined,
    };

    return { market, metadata };
  }

  async generateWinRateFlippeningMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => k.winsLosses);
    if (validKOLs.length < 2) return null;

    const [kolA, kolB] = this.sampleKOLs(validKOLs, 2);

    const market: InsertMarket = {
      kolId: null,
      title: `Will ${kolA.username} have a better win rate than ${kolB.username} on tomorrow's leaderboard?`,
      description: `Win rate comparison: ${kolA.username} (${kolA.winsLosses}) vs ${kolB.username} (${kolB.winsLosses})`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'winrate_flippening',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'winrate_flippening',
      kolA: kolA.username,
      kolB: kolB.username,
      currentWinsLossesA: kolA.winsLosses || undefined,
      currentWinsLossesB: kolB.winsLosses || undefined,
    };

    return { market, metadata };
  }

  async generateMarkets(count: number = 5): Promise<{ marketId: string; title: string; type: string }[]> {
    console.log(`🎯 Generating ${count} markets from scraped KOL data...`);

    const kolData = await dbStorage.getLatestScrapedKols(20);
    if (kolData.length < 2) {
      throw new Error('Need at least 2 scraped KOLs to generate markets. Run scraper first!');
    }

    console.log(`📊 Loaded ${kolData.length} KOLs from latest scrape`);

    const rateLimitStatus = xApiClient.getRateLimitStatus();
    console.log(`📊 X API Rate limit status: ${rateLimitStatus.remaining} lookups available, configured: ${rateLimitStatus.isConfigured}`);

    const createdMarkets: { marketId: string; title: string; type: string }[] = [];
    
    const generators = [
      () => this.generateRankFlippeningMarket(kolData),
      () => this.generateProfitStreakMarket(kolData),
      () => this.generateSolGainFlippeningMarket(kolData),
      () => this.generateUsdGainFlippeningMarket(kolData),
      () => this.generateWinRateFlippeningMarket(kolData),
    ];
    
    const followerGrowthGenerator = () => this.generateFollowerGrowthMarket(kolData);
    
    let generatorIndex = 0;

    for (let i = 0; i < count; i++) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`MARKET ${i + 1}/${count}`);
      console.log('─'.repeat(70));

      let generatedMarket: GeneratedMarket | null = null;
      let attempts = 0;

      while (!generatedMarket && attempts < generators.length + 1) {
        let generator;
        
        if (attempts === 0 && rateLimitStatus.isConfigured && Math.random() < 0.15) {
          generator = followerGrowthGenerator;
        } else {
          const tryIndex = (generatorIndex + attempts) % generators.length;
          generator = generators[tryIndex];
        }
        
        generatedMarket = await generator();
        attempts++;
      }
      
      if (generatedMarket) {
        generatorIndex = (generatorIndex + 1) % generators.length;
      }

      if (generatedMarket) {
        try {
          const createdMarket = await dbStorage.createMarket(generatedMarket.market);

          await dbStorage.createMarketMetadata({
            marketId: createdMarket.id,
            marketType: generatedMarket.metadata.marketType,
            kolA: generatedMarket.metadata.kolA || null,
            kolB: generatedMarket.metadata.kolB || null,
            xHandle: generatedMarket.metadata.xHandle || null,
            currentFollowers: generatedMarket.metadata.currentFollowers || null,
            currentRankA: generatedMarket.metadata.currentRankA || null,
            currentRankB: generatedMarket.metadata.currentRankB || null,
            currentUsd: generatedMarket.metadata.currentUsd || null,
            currentSolA: generatedMarket.metadata.currentSolA || null,
            currentSolB: generatedMarket.metadata.currentSolB || null,
            currentUsdA: generatedMarket.metadata.currentUsdA || null,
            currentUsdB: generatedMarket.metadata.currentUsdB || null,
            currentWinsLossesA: generatedMarket.metadata.currentWinsLossesA || null,
            currentWinsLossesB: generatedMarket.metadata.currentWinsLossesB || null,
            threshold: generatedMarket.metadata.threshold || null,
            timeframeDays: generatedMarket.metadata.timeframeDays || null,
          });

          createdMarkets.push({
            marketId: createdMarket.id,
            title: createdMarket.title,
            type: generatedMarket.metadata.marketType,
          });

          console.log('\n✅ CREATED');
          console.log(`  ID: ${createdMarket.id}`);
          console.log(`  Title: ${createdMarket.title}`);
          console.log(`  Resolves: ${format(createdMarket.resolvesAt, 'yyyy-MM-dd HH:mm:ss')}`);
          console.log(`  Type: ${generatedMarket.metadata.marketType}`);
          console.log(`  Requires X API: ${createdMarket.requiresXApi}`);
        } catch (error) {
          console.error('\n❌ FAILED to save market:', error);
        }
      } else {
        console.log('\n❌ FAILED (likely rate limited or insufficient data)');
      }

      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎉 Market generation complete: ${createdMarkets.length}/${count} markets created`);
    console.log(`${'='.repeat(70)}\n`);

    return createdMarkets;
  }
}

export const marketGeneratorService = new MarketGeneratorService();
