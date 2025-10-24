
import puppeteer, { Browser, Page } from 'puppeteer';
import { dbStorage } from "./db-storage";
import type { InsertScrapedKol } from "@shared/schema";
import { KOLDataParser, type RawKOLData, type FullKOLData, type KOLDetailedData } from './kol-data-parser';

export class KOLScraperV2 {
  private browser?: Browser;
  private leaderboardPage?: Page;

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

    const chromiumPath = process.env.CHROMIUM_EXECUTABLE_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
    console.log(`Using Chromium from: ${chromiumPath}`);
    launchOptions.executablePath = chromiumPath;

    this.browser = await puppeteer.launch(launchOptions);
    this.leaderboardPage = await this.browser.newPage();

    await this.leaderboardPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await this.leaderboardPage.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    console.log('✅ Browser initialized successfully');
  }

  async scrapeLeaderboard(): Promise<{ summary: RawKOLData, profileUrl: string | null }[]> {
    if (!this.leaderboardPage) {
      throw new Error('Scraper not initialized. Call init() first.');
    }

    try {
      console.log('🌐 Navigating to https://kolscan.io/leaderboard...');
      await this.leaderboardPage.goto('https://kolscan.io/leaderboard', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      console.log('⏳ Waiting for dynamic content to load...');
      await this.leaderboardPage.waitForSelector('tr, div[class*="row"]', { timeout: 10000 });
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('📜 Scrolling to load all content...');
      await this.leaderboardPage.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('📄 Extracting leaderboard data and profile URLs...');
      const kolEntries = await this.leaderboardPage.evaluate((): { summary: RawKOLData, profileUrl: string | null }[] => {
        const extractedEntries: { summary: RawKOLData, profileUrl: string | null }[] = [];
        const rows = Array.from(document.querySelectorAll('tr, div[class*="row"], div[class*="item"], div[class*="entry"]'));
        
        let rank = 1;
        for (const row of rows) {
          try {
            const text = row.textContent || '';
            
            const usernameEl = row.querySelector('[class*="name"], [class*="username"], [class*="kol"]');
            const username = usernameEl?.textContent?.trim();
            
            if (!username || username.length < 2 || username.length > 50) continue;
            if (username.includes('Leaderboard') || username.includes('Daily') || username.includes('Weekly')) continue;

            let profileUrl: string | null = null;
            const profileLinkEl = row.querySelector('a[href*="/profile/"], a[href*="/kol/"]');
            if (profileLinkEl) {
              profileUrl = profileLinkEl.getAttribute('href');
            }
            
            let xHandle: string | null = null;
            const handleEl = row.querySelector('a[href*="twitter"], a[href*="x.com"]');
            if (handleEl) {
              const handleText = (handleEl.getAttribute('href') || '').replace('https://twitter.com/', '').replace('https://x.com/', '');
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
            const usdMatch = text.match(/(?:PnL|Gain|Profit):\s*\$\s*([+-]?[\d,.]+)/i) || text.match(/\$\s*([+-]?[\d,.]+)\s*USD/i);
            if (usdMatch) {
              usdGain = usdMatch[1];
            } else {
              const usdFallback = text.match(/\$\s*([+-]?[\d,.]+)/);
              if (usdFallback) {
                usdGain = usdFallback[1];
              }
            }

            extractedEntries.push({
              summary: {
                rank: rank.toString(),
                username,
                xHandle,
                winsLosses,
                solGain,
                usdGain
              },
              profileUrl
            });
            
            rank++;
            
            if (extractedEntries.length >= 20) break;
          } catch (err) {
            continue;
          }
        }
        
        return extractedEntries;
      });

      console.log(`✅ Successfully extracted ${kolEntries.length} KOL entries from leaderboard`);
      return kolEntries;

    } catch (error) {
      console.error('❌ Leaderboard scraping failed:', error);
      throw error;
    }
  }

  async scrapeKOLProfile(profileUrl: string): Promise<KOLDetailedData> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let profilePage: Page | null = null;
    const fullUrl = `https://kolscan.io${profileUrl}`;
    console.log(`🔎 Navigating to profile page: ${fullUrl}`);

    try {
      profilePage = await this.browser.newPage();
      await profilePage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await profilePage.goto(fullUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await profilePage.waitForSelector('[class*="portfolio"], [class*="holdings"], [class*="trades"], [class*="history"]', { timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log(`📄 Extracting detailed data from ${fullUrl}...`);

      const detailedData = await profilePage.evaluate((): KOLDetailedData => {
        
        const findStatByLabel = (labelRegex: RegExp): string | null => {
          try {
            const allTextNodes = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
            const labelNode = allTextNodes.find(el => labelRegex.test(el.textContent || ''));
            if (!labelNode) return null;
            
            const parent = labelNode.parentElement;
            let valueNode = labelNode.nextElementSibling || parent?.querySelector('[class*="value"], [class*="stat"]');
            
            if (valueNode) return valueNode.textContent?.trim() || null;

            if(parent) {
                const parentText = parent.textContent || '';
                const labelText = labelNode.textContent || '';
                const value = parentText.replace(labelText, '').trim();
                if (value.length > 0 && value.length < 20) return value;
            }
            return null;
          } catch (e) {
            return null;
          }
        };

        const pnl7d = findStatByLabel(/7D PnL/i);
        const pnl30d = findStatByLabel(/30D PnL/i);
        const totalTrades = findStatByLabel(/Total Trades/i);
        const winRatePercent = findStatByLabel(/Win Rate/i);

        const holdings: any[] = [];
        const portfolioSection = document.querySelector('[class*="portfolio"], [class*="holdings"]');
        if (portfolioSection) {
          const holdingRows = Array.from(portfolioSection.querySelectorAll('[class*="row"], [class*="asset"], [class*="token-entry"]'));
          
          for (const row of holdingRows) {
            try {
              const nameEl = row.querySelector('[class*="token-name"], [class*="name"]');
              const symbolEl = row.querySelector('[class*="token-symbol"], [class*="symbol"]');
              const valueEl = row.querySelector('[class*="value-usd"], [class*="value"]');
              const amountEl = row.querySelector('[class*="amount"], [class*="balance"]');
              
              const tokenName = nameEl?.textContent?.trim() || 'Unknown';
              const tokenSymbol = symbolEl?.textContent?.trim() || nameEl?.textContent?.split('(')[1]?.replace(')','').trim() || '???';
              
              if (/value/i.test(tokenName) || /amount/i.test(tokenName)) continue;

              holdings.push({
                tokenName,
                tokenSymbol,
                valueUsd: valueEl?.textContent?.trim() || null,
                amount: amountEl?.textContent?.trim() || null
              });
            } catch (e) { continue; }
          }
        }

        const tradeHistory: any[] = [];
        const historySection = document.querySelector('[class*="trades"], [class*="history"]');
        if (historySection) {
          const tradeRows = Array.from(historySection.querySelectorAll('[class*="row"], [class*="trade-entry"]'));
          
          for (const row of tradeRows) {
            try {
              const text = row.textContent?.toLowerCase() || '';
              const type: 'buy' | 'sell' = text.includes('buy') ? 'buy' : 'sell';

              const nameEl = row.querySelector('[class*="token-name"], [class*="name"]');
              const amountEl = row.querySelector('[class*="amount"]');
              const valueEl = row.querySelector('[class*="value-usd"], [class*="value"]');
              const timeEl = row.querySelector('[class*="timestamp"], [class*="time"]');

              if (/amount/i.test(nameEl?.textContent || '')) continue;
              
              tradeHistory.push({
                type,
                tokenName: nameEl?.textContent?.trim() || 'Unknown',
                amount: amountEl?.textContent?.trim() || null,
                valueUsd: valueEl?.textContent?.trim() || null,
                timestamp: timeEl?.textContent?.trim() || null,
              });
            } catch (e) { continue; }
          }
        }

        return { pnl7d, pnl30d, totalTrades, winRatePercent, holdings, tradeHistory };
      });

      return detailedData;

    } catch (error) {
      console.error(`❌ Failed to scrape profile ${fullUrl}:`, error);
      throw error;
    } finally {
      if (profilePage) {
        await profilePage.close();
      }
    }
  }

  async saveToDatabase(data: FullKOLData[]): Promise<number> {
    console.log(`💾 Saving ${data.length} full KOL entries to database...`);
    
    const scrapedKols: InsertScrapedKol[] = KOLDataParser.parseFullKOLDataBatch(data);
    
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
      this.leaderboardPage = undefined;
      console.log('✅ Browser closed');
    }
  }

  async scrapeAndSave(): Promise<{ scraped: number; saved: number }> {
    let allKOLData: FullKOLData[] = [];
    try {
      await this.init();
      const leaderboardEntries = await this.scrapeLeaderboard();
      
      console.log(`Found ${leaderboardEntries.length} KOLs. Now scraping profile pages...`);

      for (const entry of leaderboardEntries) {
        if (!entry.profileUrl) {
          console.warn(`⚠️ Skipping ${entry.summary.username} - no profile URL found`);
          continue;
        }

        try {
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

          const profileData = await this.scrapeKOLProfile(entry.profileUrl);
          
          allKOLData.push({
            ...entry.summary,
            ...profileData,
            profileUrl: entry.profileUrl
          });

        } catch (error) {
          console.error(`❌ Failed to process profile for ${entry.summary.username} (${entry.profileUrl})`, error);
        }
      }

      const saved = await this.saveToDatabase(allKOLData);
      
      return {
        scraped: allKOLData.length,
        saved,
      };
    } catch (e) {
      console.error("❌ Fatal error during scrapeAndSave:", e);
      return { scraped: 0, saved: 0 };
    } finally {
      await this.close();
    }
  }
}
async function main() {
  const scraper = new KOLScraperV2();
  try {
    await scraper.init();
    const { scraped, saved } = await scraper.scrapeAndSave();

    console.log(`✅ Scraped ${scraped} entries and saved ${saved} to the database.`);

    // Optionally, fetch and display the saved KOL data in structured format
    const savedData = await dbStorage.getAllKols(); // Add this method if it doesn't exist
    console.log(JSON.stringify(savedData, null, 2)); // Pretty print the saved data in JSON format
  } catch (error) {
    console.error('💥 Scraping failed:', error);
  } finally {
    await scraper.close();
  }
}
if (require.main === module) {
  main();
}

export const kolScraperV2 = new KOLScraperV2();
