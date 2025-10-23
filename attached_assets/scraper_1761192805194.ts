// @ts-nocheck - Disable strict type checking for this file
import puppeteer, { Browser, Page } from 'puppeteer';
import { writeFileSync } from 'fs';
import { format } from 'date-fns';
import { KOLData } from '../types.js';

export class KOLScraper {
  private browser?: Browser;
  private page?: Page;

  async init(): Promise<void> {
    console.log('🚀 Initializing Puppeteer browser...');
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

    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Stealth mode - hide webdriver property
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

      // Scroll to ensure all content is loaded
      console.log('📜 Scrolling to load all content...');
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Extract the body text
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

    // Find leaderboard section start
    const leaderboardStart = lines.findIndex(line => line.includes('KOL Leaderboard'));
    i = Math.max(0, leaderboardStart + 1);

    let rankCounter = 1;

    while (i < lines.length - 6 && kolData.length < 20) {
      // Skip navigation elements
      while (i < lines.length && lines[i] && (
        lines[i].includes('Daily') ||
        lines[i].includes('Weekly') ||
        lines[i].includes('Monthly') ||
        lines[i].includes('Leaderboard') ||
        lines[i].length < 2 ||
        /^\d+$/.test(lines[i]) // Skip standalone numbers that aren't ranks
      )) {
        i++;
      }

      if (i >= lines.length - 6) break;

      // Check if this looks like a username
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

        // Try to get X handle (next field should be short alphanumeric)
        i++;
        if (i < lines.length && lines[i] && this.isValidXHandle(lines[i])) {
          entry.xHandle = lines[i];
          console.log(`  🐦 X Handle: @${lines[i]}`);
          i++;
        }

        // Try to get wins/losses (wins number, /, losses number)
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
          // Skip any remaining numbers or separators
          while (i < lines.length && lines[i] && (/^\d+$/.test(lines[i]) || lines[i] === '/')) {
            i++;
          }
        }

        // Try to get SOL gain
        if (i < lines.length && lines[i] && lines[i].includes('+') && lines[i].includes('Sol')) {
          entry.solGain = lines[i];
          console.log(`  💰 SOL Gain: ${lines[i]}`);
          i++;
        }

        // Try to get USD gain
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
    return /^[A-Za-z0-9]{4,8}$/.test(text);
  }

  async saveToCSV(data: KOLData[]): Promise<string> {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filename = `kol_leaderboard_${timestamp}.csv`;

    const csvContent = [
      'Rank,Username,X Handle,Wins/Losses,SOL Gain,USD Gain',
      ...data.map(row =>
        `"${row.rank}","${row.username}","${row.xHandle}","${row.winsLosses}","${row.solGain}","${row.usdGain}"`
      )
    ].join('\n');

    writeFileSync(filename, csvContent, 'utf-8');
    console.log(`💾 Saved ${data.length} KOL entries to ${filename}`);

    return filename;
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔒 Closing browser...');
      await this.browser.close();
      console.log('✅ Browser closed');
    }
  }
}

// Main execution function
export async function main(): Promise<void> {
  console.log('='.repeat(70));
  console.log('KOL LEADERBOARD SCRAPER - TYPESCRIPT EDITION');
  console.log('='.repeat(70));

  const scraper = new KOLScraper();

  try {
    await scraper.init();
    const kolData = await scraper.scrapeLeaderboard();

    if (kolData.length > 0) {
      await scraper.saveToCSV(kolData);
      console.log(`\n${'='.repeat(70)}`);
      console.log('SCRAPING COMPLETED SUCCESSFULLY!');
      console.log(`Extracted ${kolData.length} KOL entries`);
      console.log(`${'='.repeat(70)}`);
    } else {
      console.log('❌ No data was extracted');
    }

  } catch (error) {
    console.error('💥 Scraping failed:', error);
  } finally {
    await scraper.close();
  }
}

