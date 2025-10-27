import cron, { type ScheduledTask } from 'node-cron';
import type { IStorage } from './storage';
import type { InsertKol, Kol, InsertMarket, Market } from '@shared/schema';
import { kolScraperV2, KOLScraperV2 } from './kol-scraper-v2';

interface KOLData {
  rank: string;
  username: string;
  xHandle: string | null;
  winsLosses: string | null;
  solGain: string | null;
  usdGain: string | null;
}

export class KolscanScraperService {
  private storage: IStorage;
  private cronJob?: ScheduledTask;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  parseWinsLosses(winsLosses: string | null): { wins: number | null; losses: number | null } {
    if (!winsLosses) return { wins: null, losses: null };
    const match = winsLosses.match(/^(\d+)\/(\d+)$/);
    if (match) {
      return {
        wins: parseInt(match[1], 10),
        losses: parseInt(match[2], 10),
      };
    }
    return { wins: null, losses: null };
  }

  parseSolGain(solGain: string): number {
    const cleaned = solGain.replace(/[^0-9.+-]/g, '');
    const match = cleaned.match(/[+-]?[\d,.]+/);
    if (!match) return 0;
    
    const numStr = match[0].replace(/,/g, '');
    return parseFloat(numStr) || 0;
  }

  async transformScrapedKol(scrapedData: KOLData): Promise<InsertKol> {
    const { wins, losses } = this.parseWinsLosses(scrapedData.winsLosses);
    const totalTrades = (wins || 0) + (losses || 0);
    const winRate = totalTrades > 0 ? ((wins || 0) / totalTrades) * 100 : 0;

    const solGain = this.parseSolGain(scrapedData.solGain || '0');
    
    let tier: string;
    if (solGain >= 1000) tier = 'Elite';
    else if (solGain >= 500) tier = 'Pro';
    else if (solGain >= 100) tier = 'Rising';
    else tier = 'Rookie';

    const handle = scrapedData.xHandle ? scrapedData.xHandle.replace('@', '').toLowerCase() : scrapedData.username.toLowerCase().replace(/\s+/g, '');
    
    return {
      name: scrapedData.username,
      handle: handle,
      avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${handle}`,
      followers: Math.floor(Math.random() * 50000) + 10000,
      engagementRate: winRate.toFixed(2),
      tier,
      trending: solGain > 100,
      trendingPercent: solGain > 0 ? ((solGain / 1000) * 100).toFixed(2) : null,
      kolscanRank: scrapedData.rank,
      kolscanWins: wins,
      kolscanLosses: losses,
      kolscanSolGain: scrapedData.solGain || null,
      kolscanUsdGain: scrapedData.usdGain || null,
      lastScrapedAt: new Date(),
      scrapedFromKolscan: true,
    };
  }

  async importOrUpdateKols(scrapedKols: KOLData[]): Promise<Kol[]> {
    console.log(`🔄 Importing/updating ${scrapedKols.length} KOLs from kolscan...`);
    
    const importedKols: Kol[] = [];

    for (const scrapedKol of scrapedKols) {
      try {
        const handle = scrapedKol.xHandle ? scrapedKol.xHandle.replace('@', '').toLowerCase() : scrapedKol.username.toLowerCase().replace(/\s+/g, '');
        const existingKol = await this.storage.getKolByHandle(handle);

        const kolData = await this.transformScrapedKol(scrapedKol);

        let kol: Kol;
        if (existingKol) {
          console.log(`  📝 Updating existing KOL: ${scrapedKol.username}`);
          kol = await this.storage.updateKol(existingKol.id, kolData);
        } else {
          console.log(`  ✨ Creating new KOL: ${scrapedKol.username}`);
          kol = await this.storage.createKol(kolData);
        }

        importedKols.push(kol);
      } catch (error) {
        console.error(`  ❌ Failed to import/update KOL ${scrapedKol.username}:`, error);
      }
    }

    console.log(`✅ Imported/updated ${importedKols.length}/${scrapedKols.length} KOLs`);
    return importedKols;
  }

  async generateMarketsForKol(kol: Kol): Promise<InsertMarket[]> {
    const markets: InsertMarket[] = [];
    const currentSolGain = this.parseSolGain(kol.kolscanSolGain || '0');

    const solGainThresholds = [15, 20, 25, 30, 35, 40, 45, 50];
    const threshold = solGainThresholds.find(t => t > currentSolGain) || 1000;

    const marketTypes = [
      {
        title: `${kol.name} to gain +${threshold} SOL`,
        description: `Will ${kol.name} (${kol.handle}) achieve a total SOL gain of +${threshold} or more by the end of the week?`,
        outcome: `Total SOL gain reaches +${threshold} or higher`,
        timeframeDays: 7,
      },
      {
        title: `${kol.name} to reach 70% win rate`,
        description: `Will ${kol.name} maintain or achieve a win rate of 70% or higher by the end of the week?`,
        outcome: 'Win rate of 70% or higher',
        timeframeDays: 7,
      },
      {
        title: `${kol.name} to rank in top 10`,
        description: `Will ${kol.name} rank in the top 10 on kolscan leaderboard by the end of the week?`,
        outcome: 'Ranks in top 10 on kolscan',
        timeframeDays: 7,
      },
    ];

    const resolvesAt = new Date();
    resolvesAt.setDate(resolvesAt.getDate() + 7);

    for (const marketType of marketTypes.slice(0, 1)) {
      markets.push({
        kolId: kol.id,
        title: marketType.title,
        description: marketType.description,
        // Status field must be 'pending' for live/open markets
        outcome: 'pending',
        resolvesAt,
        marketType: 'kolscan',
        requiresXApi: false,
      });
    }

    return markets;
  }

  async generateMarkets(kols: Kol[]): Promise<number> {
    console.log(`🎲 Generating markets for ${kols.length} KOLs...`);
    let createdCount = 0;

    const existingMarkets = await this.storage.getAllMarkets();

    for (const kol of kols) {
      try {
        const kolPendingMarkets = existingMarkets.filter(
          (m: Market) => m.kolId === kol.id && m.isLive && !m.resolved && m.outcome === 'pending'
        );

        if (kolPendingMarkets.length > 0) {
          console.log(`  ⏭️  ${kol.name} already has ${kolPendingMarkets.length} pending market(s), skipping...`);
          continue;
        }

        const marketTemplates = await this.generateMarketsForKol(kol);
        
        for (const marketTemplate of marketTemplates) {
          const duplicateExists = existingMarkets.some(
            (m: Market) => 
              m.kolId === kol.id && 
              m.title === marketTemplate.title && 
              m.isLive
          );

          if (duplicateExists) {
            console.log(`  ⏭️  Market "${marketTemplate.title}" already exists, skipping...`);
            continue;
          }

          await this.storage.createMarket(marketTemplate);
          createdCount++;
          console.log(`  ✅ Created market: "${marketTemplate.title}"`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to generate markets for ${kol.name}:`, error);
      }
    }

    console.log(`✅ Created ${createdCount} new markets`);
    return createdCount;
  }

  async runFullImportAndGenerate(): Promise<{
    scraped: number;
    imported: number;
    marketsCreated: number;
  }> {
    console.log('='.repeat(70));
    console.log('🚀 KOLSCAN IMPORT & MARKET GENERATION');
    console.log('='.repeat(70));

    try {
      await kolScraperV2.init();
      const leaderboardData = await kolScraperV2.scrapeLeaderboard();
      const scrapedKols = leaderboardData.map(entry => ({
        rank: entry.summary.rank,
        username: entry.summary.username,
        xHandle: entry.summary.xHandle,
        winsLosses: entry.summary.winsLosses,
        solGain: entry.summary.solGain,
        usdGain: entry.summary.usdGain,
      }));
      console.log(`📊 Scraped ${scrapedKols.length} KOLs from kolscan`);
      
      const importedKols = await this.importOrUpdateKols(scrapedKols);
      
      const marketsCreated = await this.generateMarkets(importedKols);

      console.log('='.repeat(70));
      console.log('✅ IMPORT & GENERATION COMPLETE');
      console.log(`   Scraped: ${scrapedKols.length} KOLs`);
      console.log(`   Imported/Updated: ${importedKols.length} KOLs`);
      console.log(`   Markets Created: ${marketsCreated}`);
      console.log('='.repeat(70));

      return {
        scraped: scrapedKols.length,
        imported: importedKols.length,
        marketsCreated,
      };
    } catch (error) {
      console.error('❌ Import & generation failed:', error);
      throw error;
    } finally {
      await kolScraperV2.close();
    }
  }

  startScheduledScraping(cronExpression: string = '0 2 * * *'): void {
    if (this.cronJob) {
      console.log('⚠️  Scheduled scraping already running');
      return;
    }

    console.log(`⏰ Starting scheduled kolscan scraping: ${cronExpression}`);
    console.log('   Default: Daily at 2:00 AM');

    this.cronJob = cron.schedule(cronExpression, async () => {
      console.log('⏰ Scheduled kolscan scraping triggered');
      try {
        await this.runFullImportAndGenerate();
      } catch (error) {
        console.error('❌ Scheduled scraping failed:', error);
      }
    });

    console.log('✅ Scheduled scraping started');
  }

  stopScheduledScraping(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = undefined;
      console.log('🛑 Scheduled scraping stopped');
    }
  }
}
