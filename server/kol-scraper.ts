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

      console.log('📄 Extracting page content...');
      const bodyText: string = await this.page.evaluate((): string =>
        document.body ? document.body.innerText : ''
      );

      console.log('🔍 Parsing leaderboard data...');
      const kolData = this.parseLeaderboardData(bodyText);

      console.log(`✅ Successfully extracted ${kolData.length} KOL entries`);
      return kolData;

    } catch (error) {
      console.error('❌ Scraping failed:', error);
      throw error;
    }
  }

  private parseLeaderboardData(bodyText: string): KOLData[] {
    const lines = bodyText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log(`📊 Processing ${lines.length} lines of text...`);

    const kolData: KOLData[] = [];
    let i = 0;

    const leaderboardStart = lines.findIndex(line => line.includes('KOL Leaderboard'));
    i = Math.max(0, leaderboardStart + 1);

    let rankCounter = 1;

    while (i < lines.length - 6 && kolData.length < 20) {
      while (i < lines.length && lines[i] && (
        lines[i].includes('Daily') ||
        lines[i].includes('Weekly') ||
        lines[i].includes('Monthly') ||
        lines[i].includes('Leaderboard') ||
        lines[i].length < 2 ||
        /^\d+$/.test(lines[i])
      )) {
        i++;
      }

      if (i >= lines.length - 6) break;

      const potentialUsername = lines[i];
      if (!potentialUsername) {
        i++;
        continue;
      }
      if (this.isValidUsername(potentialUsername)) {
        const entry: KOLData = {
          rank: rankCounter === 1 ? '🏆 1' : rankCounter.toString(),
          username: potentialUsername,
          xHandle: '',
          winsLosses: '',
          solGain: '',
          usdGain: ''
        };

        console.log(`👤 Found KOL: ${potentialUsername} (Rank ${entry.rank})`);

        i++;
        if (i < lines.length && lines[i] && this.isValidXHandle(lines[i])) {
          entry.xHandle = lines[i];
          console.log(`  🐦 X Handle: @${lines[i]}`);
          i++;
        }

        if (i < lines.length - 2 &&
            lines[i] && /^\d+$/.test(lines[i]) &&
            lines[i + 1] === '/' &&
            lines[i + 2] && /^\d+$/.test(lines[i + 2])) {
          const wins = lines[i]!;
          const losses = lines[i + 2]!;
          entry.winsLosses = `${wins}/${losses}`;
          console.log(`  ⚔️ Wins/Losses: ${wins}/${losses}`);
          i += 3;
        } else {
          while (i < lines.length && lines[i] && (/^\d+$/.test(lines[i]) || lines[i] === '/')) {
            i++;
          }
        }

        if (i < lines.length && lines[i] && lines[i].includes('+') && lines[i].includes('Sol')) {
          entry.solGain = lines[i];
          console.log(`  💰 SOL Gain: ${lines[i]}`);
          i++;
        }

        if (i < lines.length && lines[i] && lines[i].includes('$') && lines[i].includes('(') && lines[i].includes(')')) {
          entry.usdGain = lines[i];
          console.log(`  💵 USD Gain: ${lines[i]}`);
          i++;
        }

        kolData.push(entry);
        rankCounter++;

        console.log(`✅ Entry complete: ${potentialUsername}`);

      } else {
        i++;
      }
    }

    return kolData;
  }

  private isValidUsername(text: string | undefined): boolean {
    return text ? (
      text.length > 1 &&
      text.length < 50 &&
      !text.includes('+') &&
      !text.includes('$') &&
      !text.includes('/') &&
      !/^\d+$/.test(text) &&
      !text.includes('Sol') &&
      !text.includes('Leaderboard')
    ) : false;
  }

  private isValidXHandle(text: string): boolean {
    return /^[A-Za-z0-9_]{3,15}$/.test(text);
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
