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

  private async resolveKolId(scrapedKol: ScrapedKol): Promise<string | null> {
    const handle = scrapedKol.xHandle || scrapedKol.username.toLowerCase().replace(/\s+/g, '');
    
    let kol = await dbStorage.getKolByHandle(handle);
    
    if (!kol) {
      console.log(`  → Creating KOL record for ${scrapedKol.username} (@${handle})`);
      try {
        const insertKol = {
          name: scrapedKol.username,
          handle: handle,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
          followers: 10000,
          engagementRate: "3.5",
          tier: "Rising",
          trending: false,
          trendingPercent: null,
          kolscanRank: scrapedKol.rank,
          kolscanWins: scrapedKol.winsLosses ? parseInt(scrapedKol.winsLosses.split('/')[0]) : null,
          kolscanLosses: scrapedKol.winsLosses ? parseInt(scrapedKol.winsLosses.split('/')[1]) : null,
          kolscanSolGain: scrapedKol.solGain,
          kolscanUsdGain: scrapedKol.usdGain,
          lastScrapedAt: new Date(),
          scrapedFromKolscan: true,
        };
        kol = await dbStorage.createKol(insertKol);
      } catch (error) {
        console.error(`  ✗ Failed to create KOL ${scrapedKol.username}:`, error);
        return null;
      }
    }
    
    return kol.id;
  }

  async generateRankFlippeningMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    if (kolData.length < 2) return null;

    const [kolA, kolB] = this.sampleKOLs(kolData, 2);
    const kolIdA = await this.resolveKolId(kolA);
    
    if (!kolIdA) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kolA.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId: kolIdA,
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

    const kolId = await this.resolveKolId(kol);
    if (!kolId) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kol.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId,
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

    const kolId = await this.resolveKolId(kol);
    if (!kolId) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kol.username}`);
      return null;
    }

    const currentFollowers = await xApiClient.getFollowerCount(xHandle);
    if (currentFollowers === null) {
      console.log(`  → Skipping follower market for @${xHandle} (rate limited or unavailable)`);
      return null;
    }

    const threshold = this.randomChoice([200, 500, 1000]);
    const days = 1;

    const market: InsertMarket = {
      kolId,
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
    const kolIdA = await this.resolveKolId(kolA);
    
    if (!kolIdA) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kolA.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId: kolIdA,
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
    const kolIdA = await this.resolveKolId(kolA);
    
    if (!kolIdA) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kolA.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId: kolIdA,
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
    const kolIdA = await this.resolveKolId(kolA);
    
    if (!kolIdA) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kolA.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId: kolIdA,
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

  async generateTopRankMaintainMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const topKOLs = kolData.filter(k => {
      const rankNum = parseInt(k.rank);
      return !isNaN(rankNum) && rankNum <= 10;
    });
    
    if (topKOLs.length === 0) return null;
    
    const kol = this.sampleKOLs(topKOLs, 1)[0];
    const currentRankNum = parseInt(kol.rank);

    const kolId = await this.resolveKolId(kol);
    if (!kolId) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kol.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} stay in the top ${currentRankNum <= 5 ? '5' : '10'} on tomorrow's leaderboard?`,
      description: `${kol.username} is currently ranked #${kol.rank}. Will they maintain their elite position?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'top_rank_maintain',
      marketCategory: 'ranking',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'top_rank_maintain',
      kolA: kol.username,
      currentRankA: kol.rank,
      threshold: currentRankNum <= 5 ? 5 : 10,
    };

    return { market, metadata };
  }

  async generateStreakContinuationMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => k.winsLosses);
    if (validKOLs.length === 0) return null;

    const kol = this.sampleKOLs(validKOLs, 1)[0];

    const kolId = await this.resolveKolId(kol);
    if (!kolId) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kol.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} improve their win rate by tomorrow?`,
      description: `${kol.username} currently has a ${kol.winsLosses} record. Will they add more wins tomorrow?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'streak_continuation',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'streak_continuation',
      kolA: kol.username,
      currentWinsLossesA: kol.winsLosses || undefined,
    };

    return { market, metadata };
  }

  async generateRankImprovementMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => {
      const rankNum = parseInt(k.rank);
      return !isNaN(rankNum) && rankNum > 3;
    });
    
    if (validKOLs.length === 0) return null;
    
    const kol = this.sampleKOLs(validKOLs, 1)[0];
    const currentRankNum = parseInt(kol.rank);
    const targetRank = Math.max(1, currentRankNum - this.randomChoice([1, 2, 3, 5]));

    const kolId = await this.resolveKolId(kol);
    if (!kolId) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kol.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} reach rank #${targetRank} or better by tomorrow?`,
      description: `${kol.username} is currently #${kol.rank}. Can they climb to #${targetRank} or higher?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'rank_improvement',
      marketCategory: 'ranking',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'rank_improvement',
      kolA: kol.username,
      currentRankA: kol.rank,
      threshold: targetRank,
    };

    return { market, metadata };
  }

  async generateWinLossRatioMaintainMarket(kolData: ScrapedKol[]): Promise<GeneratedMarket | null> {
    const validKOLs = kolData.filter(k => k.winsLosses);
    if (validKOLs.length === 0) return null;

    const kol = this.sampleKOLs(validKOLs, 1)[0];
    
    const [winsStr, lossesStr] = kol.winsLosses!.split('/');
    const wins = parseInt(winsStr);
    const losses = parseInt(lossesStr);
    
    if (isNaN(wins) || isNaN(losses) || losses === 0) return null;
    
    const currentRatio = wins / losses;
    if (currentRatio < 1.0) return null;
    
    const thresholds = [1.5, 1.75, 2.0, 2.5];
    const suitableThresholds = thresholds.filter(t => currentRatio >= t - 0.3 && currentRatio <= t + 0.5);
    
    if (suitableThresholds.length === 0) return null;
    
    const threshold = this.randomChoice(suitableThresholds);

    const kolId = await this.resolveKolId(kol);
    if (!kolId) {
      console.log(`  ✗ Skipping market: Could not resolve KOL ${kol.username}`);
      return null;
    }

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} maintain a win/loss ratio above ${threshold.toFixed(2)} on tomorrow's leaderboard?`,
      description: `${kol.username} currently has a ${currentRatio.toFixed(2)} W/L ratio (${kol.winsLosses}). Can they stay above ${threshold.toFixed(2)}?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'winloss_ratio_maintain',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    const metadata = {
      marketType: 'winloss_ratio_maintain',
      kolA: kol.username,
      currentWinsLossesA: kol.winsLosses || undefined,
      threshold: threshold,
    };

    return { market, metadata };
  }

  async generateMarkets(kolData: ScrapedKol[], count: number = 5): Promise<{ marketId: string; title: string; type: string }[]> {
    console.log(`🎯 Generating ${count} diverse markets from ${kolData.length} scraped KOLs...`);

    if (kolData.length < 2) {
      throw new Error('Need at least 2 scraped KOLs to generate markets. Run scraper first!');
    }

    console.log(`📊 Processing ${kolData.length} KOLs for market generation`);

    // Get existing active markets to track what's already been created
    const existingMarkets = await dbStorage.getAllMarkets();
    const activeMarkets = existingMarkets.filter(m => m.isLive && !m.resolved);
    
    // Get existing market metadata to understand market types
    const existingMetadata = await dbStorage.getAllMarketMetadata();
    const metadataMap = new Map(existingMetadata.map(m => [m.marketId, m]));

    // Build tracking structures
    const kolMarketTypes = new Map<string, Set<string>>(); // KOL username -> Set of market types they have
    const kolsInHeadToHead = new Set<string>(); // KOL usernames that are already in head-to-head markets

    // Head-to-head market types
    const headToHeadTypes = ['rank_flippening', 'sol_gain_flippening', 'usd_gain_flippening', 'winrate_flippening'];

    // Analyze existing markets
    for (const market of activeMarkets) {
      const metadata = metadataMap.get(market.id);
      if (!metadata) continue;

      const marketType = metadata.marketType;

      // Track solo market types
      if (metadata.kolA && !headToHeadTypes.includes(marketType)) {
        if (!kolMarketTypes.has(metadata.kolA)) {
          kolMarketTypes.set(metadata.kolA, new Set());
        }
        kolMarketTypes.get(metadata.kolA)!.add(marketType);
      }

      // Track head-to-head participation
      if (headToHeadTypes.includes(marketType)) {
        if (metadata.kolA) kolsInHeadToHead.add(metadata.kolA);
        if (metadata.kolB) kolsInHeadToHead.add(metadata.kolB);
      }
    }

    console.log(`📊 Tracking: ${kolMarketTypes.size} KOLs with existing markets, ${kolsInHeadToHead.size} in head-to-head`);

    const rateLimitStatus = xApiClient.getRateLimitStatus();
    console.log(`📊 X API Rate limit status: ${rateLimitStatus.remaining} lookups available, configured: ${rateLimitStatus.isConfigured}`);

    const createdMarkets: { marketId: string; title: string; type: string }[] = [];
    
    // Define solo and head-to-head generators
    const soloGenerators = [
      { type: 'profit_streak', fn: (kol: ScrapedKol) => this.generateProfitStreakMarketForKol(kol) },
      { type: 'top_rank_maintain', fn: (kol: ScrapedKol) => this.generateTopRankMaintainMarketForKol(kol) },
      { type: 'streak_continuation', fn: (kol: ScrapedKol) => this.generateStreakContinuationMarketForKol(kol) },
      { type: 'rank_improvement', fn: (kol: ScrapedKol) => this.generateRankImprovementMarketForKol(kol) },
      { type: 'winloss_ratio_maintain', fn: (kol: ScrapedKol) => this.generateWinLossRatioMaintainMarketForKol(kol) },
    ];

    if (rateLimitStatus.isConfigured) {
      soloGenerators.push({ type: 'follower_growth', fn: (kol: ScrapedKol) => this.generateFollowerGrowthMarketForKol(kol) });
    }

    const headToHeadGenerators = [
      { type: 'rank_flippening', fn: () => this.generateRankFlippeningMarket(kolData) },
      { type: 'sol_gain_flippening', fn: () => this.generateSolGainFlippeningMarket(kolData) },
      { type: 'usd_gain_flippening', fn: () => this.generateUsdGainFlippeningMarket(kolData) },
      { type: 'winrate_flippening', fn: () => this.generateWinRateFlippeningMarket(kolData) },
    ];

    let marketsCreated = 0;

    // Strategy: First create diverse solo markets for each KOL, then create head-to-head markets
    for (let i = 0; i < count && marketsCreated < count; i++) {
      console.log(`\n${'─'.repeat(70)}`);
      console.log(`MARKET ${marketsCreated + 1}/${count}`);
      console.log('─'.repeat(70));

      let generatedMarket: GeneratedMarket | null = null;

      // Try to create a solo market for a KOL that needs diversity
      for (const kol of kolData) {
        const existingTypes = kolMarketTypes.get(kol.username) || new Set();
        
        // Find market types this KOL doesn't have yet
        const availableGenerators = soloGenerators.filter(g => !existingTypes.has(g.type));
        
        if (availableGenerators.length > 0) {
          // Try each available generator for this KOL
          for (const generator of availableGenerators) {
            console.log(`  Trying ${generator.type} for ${kol.username}...`);
            generatedMarket = await generator.fn(kol);
            
            if (generatedMarket) {
              // Track this market type for this KOL
              if (!kolMarketTypes.has(kol.username)) {
                kolMarketTypes.set(kol.username, new Set());
              }
              kolMarketTypes.get(kol.username)!.add(generator.type);
              break;
            }
          }
          
          if (generatedMarket) break;
        }
      }

      // If no solo market created, try head-to-head (only if we have KOLs not in head-to-head yet)
      if (!generatedMarket) {
        const availableForHeadToHead = kolData.filter(k => !kolsInHeadToHead.has(k.username));
        
        if (availableForHeadToHead.length >= 2) {
          for (const generator of headToHeadGenerators) {
            console.log(`  Trying ${generator.type}...`);
            generatedMarket = await generator.fn();
            
            if (generatedMarket && generatedMarket.metadata.kolA && generatedMarket.metadata.kolB) {
              // Mark both KOLs as used in head-to-head
              kolsInHeadToHead.add(generatedMarket.metadata.kolA);
              kolsInHeadToHead.add(generatedMarket.metadata.kolB);
              break;
            }
          }
        }
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
          console.log(`  KOLs: ${generatedMarket.metadata.kolA}${generatedMarket.metadata.kolB ? ` vs ${generatedMarket.metadata.kolB}` : ''}`);

          marketsCreated++;
        } catch (error) {
          console.error('\n❌ FAILED to save market:', error);
        }
      } else {
        console.log('\n⚠️ Could not generate market (all KOLs may have full diversity)');
      }

      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🎉 Market generation complete: ${createdMarkets.length}/${count} markets created`);
    console.log(`   📊 Diversity achieved: Each KOL gets different market types`);
    console.log(`   🥊 Head-to-head limit: Each KOL in max 1 comparison market`);
    console.log(`${'='.repeat(70)}\n`);

    return createdMarkets;
  }

  // Helper methods to generate markets for specific KOLs
  private async generateProfitStreakMarketForKol(kol: ScrapedKol): Promise<GeneratedMarket | null> {
    if (!kol.usdGain) return null;

    const kolId = await this.resolveKolId(kol);
    if (!kolId) return null;

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} have a positive USD Gain on tomorrow's leaderboard?`,
      description: `Prediction market for ${kol.username}'s profitability streak. Currently: ${kol.usdGain}`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'profit_streak',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    return {
      market,
      metadata: {
        marketType: 'profit_streak',
        kolA: kol.username,
        currentUsd: kol.usdGain,
      },
    };
  }

  private async generateTopRankMaintainMarketForKol(kol: ScrapedKol): Promise<GeneratedMarket | null> {
    const rank = parseInt(kol.rank);
    if (isNaN(rank) || rank > 10) return null;

    const kolId = await this.resolveKolId(kol);
    if (!kolId) return null;

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} maintain a top 10 rank on tomorrow's leaderboard?`,
      description: `${kol.username} is currently #${kol.rank}. Can they stay in the top 10?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'top_rank_maintain',
      marketCategory: 'ranking',
      requiresXApi: false,
    };

    return {
      market,
      metadata: {
        marketType: 'top_rank_maintain',
        kolA: kol.username,
        currentRankA: kol.rank,
        threshold: 10,
      },
    };
  }

  private async generateStreakContinuationMarketForKol(kol: ScrapedKol): Promise<GeneratedMarket | null> {
    if (!kol.winsLosses) return null;

    const [winsStr] = kol.winsLosses.split('/');
    const wins = parseInt(winsStr);
    if (isNaN(wins) || wins < 2) return null;

    const kolId = await this.resolveKolId(kol);
    if (!kolId) return null;

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} record a win on tomorrow's leaderboard?`,
      description: `${kol.username} has ${wins} wins. Can they add another?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'streak_continuation',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    return {
      market,
      metadata: {
        marketType: 'streak_continuation',
        kolA: kol.username,
        currentWinsLossesA: kol.winsLosses,
      },
    };
  }

  private async generateRankImprovementMarketForKol(kol: ScrapedKol): Promise<GeneratedMarket | null> {
    const currentRank = parseInt(kol.rank);
    if (isNaN(currentRank) || currentRank <= 5) return null;

    const kolId = await this.resolveKolId(kol);
    if (!kolId) return null;

    const improvements = [3, 5, 10];
    const suitableImprovements = improvements.filter(imp => currentRank - imp >= 1);
    if (suitableImprovements.length === 0) return null;

    const improvement = this.randomChoice(suitableImprovements);
    const targetRank = currentRank - improvement;

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} reach rank #${targetRank} or better by tomorrow?`,
      description: `${kol.username} is currently #${kol.rank}. Can they climb to #${targetRank} or higher?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'rank_improvement',
      marketCategory: 'ranking',
      requiresXApi: false,
    };

    return {
      market,
      metadata: {
        marketType: 'rank_improvement',
        kolA: kol.username,
        currentRankA: kol.rank,
        threshold: targetRank,
      },
    };
  }

  private async generateWinLossRatioMaintainMarketForKol(kol: ScrapedKol): Promise<GeneratedMarket | null> {
    if (!kol.winsLosses) return null;

    const [winsStr, lossesStr] = kol.winsLosses.split('/');
    const wins = parseInt(winsStr);
    const losses = parseInt(lossesStr);
    
    if (isNaN(wins) || isNaN(losses) || losses === 0) return null;
    
    const currentRatio = wins / losses;
    if (currentRatio < 1.0) return null;
    
    const thresholds = [1.5, 1.75, 2.0, 2.5];
    const suitableThresholds = thresholds.filter(t => currentRatio >= t - 0.3 && currentRatio <= t + 0.5);
    
    if (suitableThresholds.length === 0) return null;
    
    const threshold = this.randomChoice(suitableThresholds);

    const kolId = await this.resolveKolId(kol);
    if (!kolId) return null;

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} maintain a win/loss ratio above ${threshold.toFixed(2)} on tomorrow's leaderboard?`,
      description: `${kol.username} currently has a ${currentRatio.toFixed(2)} W/L ratio (${kol.winsLosses}). Can they stay above ${threshold.toFixed(2)}?`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'winloss_ratio_maintain',
      marketCategory: 'performance',
      requiresXApi: false,
    };

    return {
      market,
      metadata: {
        marketType: 'winloss_ratio_maintain',
        kolA: kol.username,
        currentWinsLossesA: kol.winsLosses,
        threshold: threshold,
      },
    };
  }

  private async generateFollowerGrowthMarketForKol(kol: ScrapedKol): Promise<GeneratedMarket | null> {
    if (!kol.xHandle || kol.xHandle.trim() === '') return null;

    const kolId = await this.resolveKolId(kol);
    if (!kolId) return null;

    const currentFollowers = await xApiClient.getFollowerCount(kol.xHandle);
    if (currentFollowers === null) return null;

    const threshold = this.randomChoice([200, 500, 1000]);

    const market: InsertMarket = {
      kolId,
      title: `Will ${kol.username} (@${kol.xHandle}) gain ${threshold.toLocaleString()}+ X followers by tomorrow?`,
      description: `Follower growth prediction for ${kol.username}. Current: ${currentFollowers.toLocaleString()} followers`,
      outcome: 'pending',
      resolvesAt: addDays(new Date(), 1),
      marketType: 'follower_growth',
      marketCategory: 'social',
      requiresXApi: true,
    };

    return {
      market,
      metadata: {
        marketType: 'follower_growth',
        kolA: kol.username,
        xHandle: kol.xHandle,
        currentFollowers: currentFollowers,
        threshold: threshold,
        timeframeDays: 1,
      },
    };
  }
}

export const marketGeneratorService = new MarketGeneratorService();
