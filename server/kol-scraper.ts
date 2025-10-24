import puppeteer, { Browser, Page } from 'puppeteer';
import { dbStorage } from "./db-storage";
import type { InsertScrapedKol } from "@shared/schema";
import { KOLDataParser, type RawKOLData } from './kol-data-parser';

type KOLData = RawKOLData;

export class KOLScraper {
  private browser?: Browser;
  private page?: Page;

  async init(): Promise<void> {
    if (this.browser) {
      console.log('✅ Browser already initialized, reusing instance');
      return;
    }

    console.log('🚀 Initializing Puppeteer browser...');
    
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    };

    // Use environment variable if set, otherwise use system chromium for Replit
    const chromiumPath = process.env.CHROMIUM_EXECUTABLE_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
    console.log(`Using Chromium from: ${chromiumPath}`);
    launchOptions.executablePath = chromiumPath;

    this.browser = await puppeteer.launch(launchOptions);

    this.page = await this.browser.newPage();

    await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    console.log('✅ Browser initialized successfully');
  }

  async scrapeLeaderboard(): Promise<KOLData[]> {
    if (!this.page) {
      throw new Error('Scraper not initialized. Call init() first.');
    }

    try {
      console.log('🌐 Navigating to https://kolscan.io/leaderboard...');
      await this.page.goto('https://kolscan.io/leaderboard', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('⏳ Waiting for dynamic content to load...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log('📜 Scrolling to load all content...');
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('📄 Extracting leaderboard data using DOM selectors...');
      const kolData = await this.page.evaluate((): RawKOLData[] => {
        const extractedData: RawKOLData[] = [];
        
        const rows = Array.from(document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="entry"]'));
        
        let rank = 1;
        for (const row of rows) {
          try {
            const text = row.textContent || '';
            
            const usernameEl = row.querySelector('[class*="name"], [class*="username"], [class*="kol"]');
            const username = usernameEl?.textContent?.trim();
            
            if (!username || username.length < 2 || username.length > 50) continue;
            if (username.includes('Leaderboard') || username.includes('Daily') || username.includes('Weekly')) continue;
            
            let xHandle: string | null = null;
            const handleEl = row.querySelector('[class*="handle"], [class*="twitter"], [class*="x-"], a[href*="twitter"], a[href*="x.com"]');
            if (handleEl) {
              const handleText = (handleEl.textContent || handleEl.getAttribute('href') || '').trim().replace('@', '').replace('https://twitter.com/', '').replace('https://x.com/', '');
              if (/^[A-Za-z0-9_]{3,15}$/.test(handleText)) {
                xHandle = handleText;
              }
            }
            
            let winsLosses: string | null = null;
            const statsText = text.match(/(\d+)\s*\/\s*(\d+)/);
            if (statsText) {
              winsLosses = `${statsText[1]}/${statsText[2]}`;
            }
            
            let solGain: string | null = null;
            const solMatch = text.match(/([+-]?[\d,.]+)\s*Sol/i);
            if (solMatch) {
              solGain = solMatch[1];
            }
            
            let usdGain: string | null = null;
            const usdMatch = text.match(/\$\s*([+-]?[\d,.]+)/);
            if (usdMatch) {
              usdGain = usdMatch[1];
            }
            
            extractedData.push({
              rank: rank.toString(),
              username,
              xHandle,
              winsLosses,
              solGain,
              usdGain
            });
            
            rank++;
            
            if (extractedData.length >= 20) break;
          } catch (err) {
            continue;
          }
        }
        
        return extractedData;
      });

      console.log(`✅ Successfully extracted ${kolData.length} KOL entries`);
      return kolData;

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    }
  }


  async saveToDatabase(data: KOLData[]): Promise<number> {
    console.log(`💾 Saving ${data.length} KOL entries to database...`);
    
    const scrapedKols: InsertScrapedKol[] = KOLDataParser.parseRawKOLDataBatch(data);
    
    try {
      const saved = await dbStorage.createScrapedKols(scrapedKols);
      console.log(`✅ Saved ${saved.length}/${data.length} KOL entries to database`);
      return saved.length;
    } catch (error) {
      console.error(`Failed to save KOLs to database:`, error);
      return 0;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔒 Closing browser...');
      await this.browser.close();
      this.browser = undefined;
      this.page = undefined;
      console.log('✅ Browser closed');
    }
  }

  async scrapeAndSave(): Promise<{ scraped: number; saved: number }> {
    try {
      await this.init();
      const kolData = await this.scrapeLeaderboard();
      const saved = await this.saveToDatabase(kolData);
      
      return {
        scraped: kolData.length,
        saved,
      };
    } finally {
      await this.close();
    }
  }
}

export const kolScraper = new KOLScraper();
