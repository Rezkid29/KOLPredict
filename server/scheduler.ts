import cron from 'node-cron';
import { kolScraper } from './kol-scraper';
import { marketGeneratorService } from './market-generator-service';
import { metricsUpdater } from './metrics-updater';
import { marketResolver } from './market-resolver';

interface SchedulerConfig {
  scrapingEnabled: boolean;
  scrapingSchedule: string;
  marketGenerationEnabled: boolean;
  marketGenerationSchedule: string;
  marketGenerationCount: number;
}

export class Scheduler {
  private scrapingTask: cron.ScheduledTask | null = null;
  private marketGenerationTask: cron.ScheduledTask | null = null;
  
  private config: SchedulerConfig = {
    scrapingEnabled: true,
    scrapingSchedule: '0 2 * * *', // 2 AM daily
    marketGenerationEnabled: true,
    marketGenerationSchedule: '0 3 * * *', // 3 AM daily
    marketGenerationCount: 5,
  };

  async performScraping(): Promise<{ success: boolean; scraped: number; saved: number; error?: string }> {
    console.log('\n' + '='.repeat(70));
    console.log('SCHEDULED SCRAPING TASK STARTED');
    console.log('='.repeat(70));
    
    try {
      const result = await kolScraper.scrapeAndSave();
      console.log('='.repeat(70));
      console.log(`SCRAPING COMPLETED: ${result.saved}/${result.scraped} KOLs saved`);
      console.log('='.repeat(70) + '\n');
      
      return {
        success: true,
        scraped: result.scraped,
        saved: result.saved,
      };
    } catch (error) {
      console.error('❌ SCRAPING FAILED:', error);
      console.log('='.repeat(70) + '\n');
      
      return {
        success: false,
        scraped: 0,
        saved: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async performMarketGeneration(): Promise<{ success: boolean; created: number; error?: string }> {
    console.log('\n' + '='.repeat(70));
    console.log('SCHEDULED MARKET GENERATION TASK STARTED');
    console.log('='.repeat(70));
    
    try {
      const markets = await marketGeneratorService.generateMarkets(this.config.marketGenerationCount);
      console.log('='.repeat(70));
      console.log(`MARKET GENERATION COMPLETED: ${markets.length} markets created`);
      console.log('='.repeat(70) + '\n');
      
      return {
        success: true,
        created: markets.length,
      };
    } catch (error) {
      console.error('❌ MARKET GENERATION FAILED:', error);
      console.log('='.repeat(70) + '\n');
      
      return {
        success: false,
        created: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  startScrapingSchedule(): void {
    if (this.scrapingTask) {
      console.log('⚠️ Scraping schedule already running');
      return;
    }

    if (!this.config.scrapingEnabled) {
      console.log('⚠️ Scraping schedule is disabled');
      return;
    }

    this.scrapingTask = cron.schedule(this.config.scrapingSchedule, async () => {
      await this.performScraping();
    });

    console.log(`✅ Scraping scheduled: ${this.config.scrapingSchedule}`);
  }

  stopScrapingSchedule(): void {
    if (this.scrapingTask) {
      this.scrapingTask.stop();
      this.scrapingTask = null;
      console.log('🛑 Scraping schedule stopped');
    }
  }

  startMarketGenerationSchedule(): void {
    if (this.marketGenerationTask) {
      console.log('⚠️ Market generation schedule already running');
      return;
    }

    if (!this.config.marketGenerationEnabled) {
      console.log('⚠️ Market generation schedule is disabled');
      return;
    }

    this.marketGenerationTask = cron.schedule(this.config.marketGenerationSchedule, async () => {
      await this.performMarketGeneration();
    });

    console.log(`✅ Market generation scheduled: ${this.config.marketGenerationSchedule}`);
  }

  stopMarketGenerationSchedule(): void {
    if (this.marketGenerationTask) {
      this.marketGenerationTask.stop();
      this.marketGenerationTask = null;
      console.log('🛑 Market generation schedule stopped');
    }
  }

  startAllSchedules(): void {
    console.log('\n🚀 Starting all scheduled tasks...');
    this.startScrapingSchedule();
    this.startMarketGenerationSchedule();
    console.log('✅ All schedules configured\n');
  }

  stopAllSchedules(): void {
    console.log('\n🛑 Stopping all scheduled tasks...');
    this.stopScrapingSchedule();
    this.stopMarketGenerationSchedule();
    console.log('✅ All schedules stopped\n');
  }

  updateConfig(updates: Partial<SchedulerConfig>): void {
    const restartScraping = this.scrapingTask && (
      updates.scrapingSchedule !== undefined ||
      updates.scrapingEnabled !== undefined
    );
    
    const restartMarketGen = this.marketGenerationTask && (
      updates.marketGenerationSchedule !== undefined ||
      updates.marketGenerationEnabled !== undefined
    );

    this.config = { ...this.config, ...updates };

    if (restartScraping) {
      this.stopScrapingSchedule();
      this.startScrapingSchedule();
    }

    if (restartMarketGen) {
      this.stopMarketGenerationSchedule();
      this.startMarketGenerationSchedule();
    }

    console.log('✅ Scheduler configuration updated:', updates);
  }

  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  getStatus() {
    return {
      scraping: {
        enabled: this.config.scrapingEnabled,
        schedule: this.config.scrapingSchedule,
        running: this.scrapingTask !== null,
      },
      marketGeneration: {
        enabled: this.config.marketGenerationEnabled,
        schedule: this.config.marketGenerationSchedule,
        count: this.config.marketGenerationCount,
        running: this.marketGenerationTask !== null,
      },
      metricsUpdater: {
        running: true,
      },
      marketResolver: {
        running: true,
      },
    };
  }
}

export const scheduler = new Scheduler();
