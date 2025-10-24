
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
      // Wait for network to be idle instead of specific selectors
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Try to wait for any table or list structure, but don't fail if not found
      try {
        await this.leaderboardPage.waitForSelector('body', { timeout: 5000 });
      } catch (e) {
        console.log('⚠️ Page structure different than expected, continuing anyway...');
      }

      console.log('📜 Scrolling to load all content...');
      await this.leaderboardPage.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('📄 Extracting leaderboard data and profile URLs...');
      const kolEntries = await this.leaderboardPage.evaluate((): { summary: RawKOLData, profileUrl: string | null }[] => {
        const extractedEntries: { summary: RawKOLData, profileUrl: string | null }[] = [];
        
        // Use reliable selector: all <a> tags whose href starts with "/account/"
        const rows = Array.from(document.querySelectorAll('a[href^="/account/"]'));
        
        console.log(`Found ${rows.length} potential KOL entry rows`);
        
        for (let i = 0; i < rows.length && extractedEntries.length < 20; i++) {
          const row = rows[i];
          try {
            const text = row.textContent || '';
            
            // 1. Get Profile URL (easy, it's the row itself)
            const profileUrl = row.getAttribute('href');

            // 2. Get Rank
            const rankEl = row.querySelector('div > span, div > p');
            const rank = rankEl ? (rankEl.textContent || (i + 1).toString()).trim() : (i + 1).toString();

            // 3. Get Username - finds the most prominent text
            const usernameEl = row.querySelector('p[class*="font-semibold"], p[class*="font-bold"]');
            let username = usernameEl ? usernameEl.textContent?.trim() : 'Unknown';
            
            // Fallback if the first selector fails
            if (username === 'Unknown') {
                const textNodes = Array.from(row.querySelectorAll('p, span'));
                const nameNode = textNodes.find(n => n.textContent && n.textContent.length > 2 && !n.textContent.match(/[\d\/\$]/));
                if (nameNode) username = nameNode.textContent.trim();
            }

            // 4. Get X Handle
            const xLinkEl = row.querySelector('a[href*="x.com/"], a[href*="twitter.com/"]');
            let xHandle: string | null = null;
            if (xLinkEl) {
                const href = xLinkEl.getAttribute('href') || '';
                const match = href.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/);
                if (match && match[1]) {
                  xHandle = match[1];
                }
            }
            
            // 5. Get Wins/Losses
            let winsLosses: string | null = null;
            const wlMatch = text.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
            if (wlMatch) {
              winsLosses = `${wlMatch[1]}/${wlMatch[2]}`;
            }
            
            // 6. Get SOL Gain
            let solGain: string | null = null;
            const solMatch = text.match(/\+?([\d,]+\.?\d*)\s*Sol/i);
            if (solMatch) {
              solGain = solMatch[1]; // Store just the number
            }
            
            // 7. Get USD Gain - look for ($X,XXX.XX)
            let usdGain: string | null = null;
            const usdMatch = text.match(/\$\s*([\d,]+\.?\d*)/);
            if (usdMatch) {
              usdGain = usdMatch[1].replace(/,/g, ''); // Store just the number
            }

            extractedEntries.push({
              summary: {
                rank,
                username,
                xHandle,
                winsLosses,
                solGain,
                usdGain
              },
              profileUrl
            });
            
          } catch (err) {
            console.error('Error processing row:', err);
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

  async scrapeKOLProfile(profileUrl: string, mode: 'full' | 'pnlOnly' = 'full'): Promise<KOLDetailedData> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    let profilePage: Page | null = null;
    const fullUrl = `https://kolscan.io${profileUrl}`;
    console.log(`🔎 Navigating to profile page: ${fullUrl} (Mode: ${mode})`);

    try {
      profilePage = await this.browser.newPage();
      await profilePage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await profilePage.goto(fullUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for stats to appear
      try {
        await profilePage.waitForSelector('div[class*="border-b"] > div[class*="grid"]', { timeout: 7000 });
      } catch (e) {
        console.log('⚠️ Profile page stats container not found. Content may be limited.');
      }

      console.log(`📄 Extracting detailed data from ${fullUrl}...`);

      const detailedData = await profilePage.evaluate((pageMode) => {
        
        // Robust helper function - finds a label and returns the text of its sibling
        const findStatValueByLabel = (labelRegex: RegExp): string | null => {
          try {
            const allTextNodes = Array.from(document.querySelectorAll('main p, main span'));
            const labelNode = allTextNodes.find((el) => labelRegex.test(el.textContent || ''));
            
            if (!labelNode) return null;

            // The value is usually in the next element sibling
            let valueNode = labelNode.nextElementSibling;
            
            // Or, they are both wrapped in a div, and the value is the last child
            if (!valueNode && labelNode.parentElement) {
                valueNode = labelNode.parentElement.lastElementChild;
            }

            if (valueNode && valueNode.textContent && valueNode.textContent !== labelNode.textContent) {
                return valueNode.textContent.trim();
            }
            
            // Fallback: check parent text (e.g., "Win Rate33.4%")
            if(labelNode.parentElement && labelNode.parentElement.textContent) {
                const parentText = labelNode.parentElement.textContent;
                const labelText = labelNode.textContent || '';
                const value = parentText.replace(labelText, '').trim();
                if (value.length > 0 && value.length < 20) return value;
            }

            return null;
          } catch (e) {
            return null;
          }
        };
        
        // Helper finds the main PnL display, which changes per page
        const findMainPnL = (): string | null => {
            try {
                // Find all elements that look like a PnL value (e.g., "+19.90 Sol ($3,784.8)")
                const pnlNodes = Array.from(document.querySelectorAll('div[class*="text-green"], span[class*="text-green"], div[class*="text-red"], span[class*="text-red"]'));
                const pnlNode = pnlNodes.find(el => el.textContent && el.textContent.includes('Sol') && el.textContent.includes('$'));
                
                if (pnlNode) return pnlNode.textContent.trim();
                
                // Fallback for timeframe PnL
                return findStatValueByLabel(/PnL/i);
            } catch (e) {
                return null;
            }
        };

        // --- Data Extraction Logic ---
        
        let pnl: string | null = null;
        let pnl7d: string | null = null;
        let pnl30d: string | null = null;
        
        let totalTrades: string | null = null;
        let winRatePercent: string | null = null;
        let holdings: any[] = [];
        let tradeHistory: any[] = [];

        // Find the main PnL for the current page (1d, 7d, or 30d)
        pnl = findMainPnL();
        
        const url = window.location.href;
        if (url.includes('timeframe=7')) {
            pnl7d = pnl;
        } else if (url.includes('timeframe=30')) {
            pnl30d = pnl;
        }
        
        // If we are in 'full' mode, scrape everything else
        if (pageMode === 'full') {
            totalTrades = findStatValueByLabel(/Volume/i) || findStatValueByLabel(/Realized Profits/i);
            winRatePercent = findStatValueByLabel(/Win Rate/i);

            // Holdings logic
            const portfolioSection = document.querySelector('[class*="portfolio"], [class*="holdings"]');
            if (portfolioSection) {
              const holdingRows = Array.from(portfolioSection.querySelectorAll('[class*="row"], [class*="asset"], [class*="token-entry"]'));
              
              for (let i = 0; i < holdingRows.length; i++) {
                try {
                  const row = holdingRows[i];
                  const nameEl = row.querySelector('[class*="token-name"], [class*="name"]');
                  const symbolEl = row.querySelector('[class*="token-symbol"], [class*="symbol"]');
                  const valueEl = row.querySelector('[class*="value-usd"], [class*="value"]');
                  const amountEl = row.querySelector('[class*="amount"], [class*="balance"]');
                  
                  const tokenName = (nameEl && nameEl.textContent) ? nameEl.textContent.trim() : 'Unknown';
                  const tokenSymbol = (symbolEl && symbolEl.textContent) ? symbolEl.textContent.trim() : 
                                      (nameEl && nameEl.textContent && nameEl.textContent.includes('(')) ? 
                                      nameEl.textContent.split('(')[1].replace(')', '').trim() : '???';
                  
                  if (/value/i.test(tokenName) || /amount/i.test(tokenName)) continue;

                  holdings.push({
                    tokenName: tokenName,
                    tokenSymbol: tokenSymbol,
                    valueUsd: (valueEl && valueEl.textContent) ? valueEl.textContent.trim() : null,
                    amount: (amountEl && amountEl.textContent) ? amountEl.textContent.trim() : null
                  });
                } catch (e) { 
                  continue; 
                }
              }
            }

            // Trade history logic
            const historySection = document.querySelector('[class*="trades"], [class*="history"]');
            if (historySection) {
              const tradeRows = Array.from(historySection.querySelectorAll('[class*="row"], [class*="trade-entry"]'));
              
              for (let j = 0; j < tradeRows.length; j++) {
                try {
                  const row = tradeRows[j];
                  const text = (row.textContent || '').toLowerCase();
                  const type = text.includes('buy') ? 'buy' : 'sell';

                  const nameEl = row.querySelector('[class*="token-name"], [class*="name"]');
                  const amountEl = row.querySelector('[class*="amount"]');
                  const valueEl = row.querySelector('[class*="value-usd"], [class*="value"]');
                  const timeEl = row.querySelector('[class*="timestamp"], [class*="time"]');

                  if (nameEl && nameEl.textContent && /amount/i.test(nameEl.textContent)) continue;
                  
                  tradeHistory.push({
                    type: type,
                    tokenName: (nameEl && nameEl.textContent) ? nameEl.textContent.trim() : 'Unknown',
                    amount: (amountEl && amountEl.textContent) ? amountEl.textContent.trim() : null,
                    valueUsd: (valueEl && valueEl.textContent) ? valueEl.textContent.trim() : null,
                    timestamp: (timeEl && timeEl.textContent) ? timeEl.textContent.trim() : null,
                  });
                } catch (e) { 
                  continue; 
                }
              }
            }
        }

        return { 
          pnl7d: pnl7d, 
          pnl30d: pnl30d, 
          totalTrades: totalTrades, 
          winRatePercent: winRatePercent, 
          holdings: holdings, 
          tradeHistory: tradeHistory 
        };
      }, mode);

      return detailedData as KOLDetailedData;

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

          // Ensure the base URL is set to timeframe=1 for 1d stats
          const baseUrl = entry.profileUrl.includes('?') 
              ? entry.profileUrl.split('?')[0]
              : entry.profileUrl;
          
          const url1d = `${baseUrl}?timeframe=1`;
          const url7d = `${baseUrl}?timeframe=7`;
          const url30d = `${baseUrl}?timeframe=30`;

          // Scrape the main 1d page for Win Rate, Volume, etc.
          const profileData = await this.scrapeKOLProfile(url1d, 'full');
          
          // Scrape the 7d and 30d pages just for PnL
          const pnlData7d = await this.scrapeKOLProfile(url7d, 'pnlOnly');
          await new Promise(resolve => setTimeout(resolve, 500)); // small delay
          const pnlData30d = await this.scrapeKOLProfile(url30d, 'pnlOnly');
          
          allKOLData.push({
            ...entry.summary,
            ...profileData,
            pnl7d: pnlData7d.pnl7d,     // Overwrite with 7d data
            pnl30d: pnlData30d.pnl30d,  // Overwrite with 30d data
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
    
    console.log('\n🎯 Starting KOL scraping process...\n');
    
    const { scraped, saved } = await scraper.scrapeAndSave();

    console.log(`\n✅ Scraping Complete: ${scraped} entries scraped, ${saved} saved to database\n`);

    // Fetch and display the latest scraped data in structured format
    const latestScrapedData = await dbStorage.getLatestScrapedKols(20);
    
    console.log('📊 LATEST SCRAPED KOL DATA (Structured Format):\n');
    console.log('='.repeat(100));
    
    latestScrapedData.forEach((kol, index) => {
      console.log(`\n[${index + 1}] RANK #${kol.rank} - ${kol.username}`);
      console.log('-'.repeat(100));
      console.log(`  Username:     ${kol.username}`);
      console.log(`  X Handle:     ${kol.xHandle || 'N/A'}`);
      console.log(`  Wins/Losses:  ${kol.winsLosses || 'N/A'}`);
      console.log(`  SOL Gain:     ${kol.solGain || 'N/A'}`);
      console.log(`  USD Gain:     ${kol.usdGain || 'N/A'}`);
      console.log(`  PNL 7D:       ${kol.pnl7d || 'N/A'}`);
      console.log(`  PNL 30D:      ${kol.pnl30d || 'N/A'}`);
      console.log(`  Total Trades: ${kol.totalTrades || 'N/A'}`);
      console.log(`  Win Rate:     ${kol.winRatePercent || 'N/A'}`);
      console.log(`  Scraped At:   ${kol.scrapedAt}`);
      
      if (kol.holdings) {
        console.log(`  Holdings:     ${kol.holdings}`);
      }
      if (kol.tradeHistory) {
        console.log(`  Trade Hist:   ${kol.tradeHistory}`);
      }
    });
    
    console.log('\n' + '='.repeat(100));
    console.log('\n📋 JSON FORMAT (for programmatic use):\n');
    console.log(JSON.stringify(latestScrapedData, null, 2));
    
  } catch (error) {
    console.error('💥 Scraping failed:', error);
  } finally {
    await scraper.close();
  }
}

// Run main if this file is executed directly (ES module pattern)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => console.error('Error running main:', err));
}

export const kolScraperV2 = new KOLScraperV2();
