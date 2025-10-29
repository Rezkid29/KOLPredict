import puppeteer, { Browser, Page } from 'puppeteer';
import type { InsertScrapedKol } from "@shared/schema";

export interface KOLData {
  rank: string;
  username: string;
  xHandle: string;
  winsLosses: string;
  solGain: string;
  usdGain: string;
}

export class KOLScraperService {
  private browser?: Browser;
  private page?: Page;

  async init(): Promise<void> {
    console.log('🚀 Initializing Puppeteer browser for scraping...');
    this.browser = await puppeteer.launch({
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
    });

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
    return /^[A-Za-z0-9_]{1,15}$/.test(text);
  }

  toInsertSchema(data: KOLData[]): InsertScrapedKol[] {
    return data.map(kol => {
      let wins: number | null = null;
      let losses: number | null = null;
      if (kol.winsLosses) {
        const [wStr, lStr] = kol.winsLosses.split('/');
        const w = parseInt(wStr, 10);
        const l = parseInt(lStr, 10);
        wins = Number.isFinite(w) ? w : null;
        losses = Number.isFinite(l) ? l : null;
      }

      const rankNum = typeof kol.rank === 'string' ? parseInt(kol.rank, 10) : kol.rank;
      return {
        rank: Number.isFinite(rankNum as number) ? (rankNum as number) : 0,
        username: kol.username,
        xHandle: kol.xHandle ? kol.xHandle.replace(/^@/, '') : null,
        wins,
        losses,
        solGain: kol.solGain ?? null,
        usdGain: kol.usdGain ?? null,
      };
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔒 Closing browser...');
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }
}

export const kolScraperService = new KOLScraperService();
