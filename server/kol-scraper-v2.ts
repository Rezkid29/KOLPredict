
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
        let pnl1d = null;
        let pnl7d = null;
        let pnl30d = null;
        let totalTrades = null;
        let winRatePercent = null;
        let holdings = [];
        let tradeHistory = [];

        try {
          const url = window.location.href;
          const allText = document.body.innerText;
          
          // Extract PnL based on current timeframe
          // Look for patterns like "+123.45 Sol ($12,345.67)" or "-123.45 Sol ($12,345.67)"
          const pnlMatch = allText.match(/([+-]?[\d,]+\.?\d*)\s*Sol\s*\(\$[\d,]+\.?\d*\)/i);
          if (pnlMatch) {
            const pnlValue = pnlMatch[0]; // Full match with Sol and USD
            
            if (url.includes('timeframe=1')) {
              pnl1d = pnlValue;
            } else if (url.includes('timeframe=7')) {
              pnl7d = pnlValue;
            } else if (url.includes('timeframe=30')) {
              pnl30d = pnlValue;
            }
          }
          
          if (pageMode === 'full') {
            // Extract Win Rate - look for percentage pattern
            const winRateMatch = allText.match(/Win\s*Rate[:\s]*([\d.]+%)/i);
            if (winRateMatch) {
              winRatePercent = winRateMatch[1];
            }
            
            // Extract Total Trades/Volume - look for number patterns near "Volume" or "Trades"
            const volumeMatch = allText.match(/(?:Volume|Total\s*Trades)[:\s]*([\d,]+)/i);
            if (volumeMatch) {
              totalTrades = volumeMatch[1];
            }
            
            // Alternative: look for "Realized Profits"
            if (!totalTrades) {
              const profitsMatch = allText.match(/Realized\s*Profits[:\s]*([\d,]+\.?\d*\s*Sol)/i);
              if (profitsMatch) {
                totalTrades = profitsMatch[1];
              }
            }

            // Try to extract holdings from any table-like structure
            const rows = Array.from(document.querySelectorAll('tr, div[role="row"]'));
            for (const row of rows) {
              const text = row.textContent || '';
              // Look for token names followed by values
              const tokenMatch = text.match(/([A-Z]{3,10})\s+.*?\$?([\d,]+\.?\d*)/);
              if (tokenMatch && holdings.length < 10) {
                holdings.push({
                  tokenName: tokenMatch[1],
                  tokenSymbol: tokenMatch[1],
                  valueUsd: tokenMatch[2],
                  amount: null
                });
              }
            }

            // Try to extract trade history
            const tradeSections = Array.from(document.querySelectorAll('div, section'));
            for (const section of tradeSections) {
              const text = (section.textContent || '').toLowerCase();
              if (text.includes('buy') || text.includes('sell')) {
                const isBuy = text.includes('buy');
                const tradeMatch = text.match(/([A-Z]{3,10}).*?([\d,]+\.?\d*)/);
                if (tradeMatch && tradeHistory.length < 20) {
                  tradeHistory.push({
                    type: isBuy ? 'buy' : 'sell',
                    tokenName: tradeMatch[1],
                    amount: tradeMatch[2],
                    valueUsd: null,
                    timestamp: null
                  });
                }
              }
            }
          }
        } catch (e) {
          console.error('Error during scraping:', e);
        }

        return { 
          pnl1d: pnl1d,
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
          await new Promise(resolve => setTimeout(resolve, 500));
          const pnlData7d = await this.scrapeKOLProfile(url7d, 'pnlOnly');
          await new Promise(resolve => setTimeout(resolve, 500));
          const pnlData30d = await this.scrapeKOLProfile(url30d, 'pnlOnly');
          
          allKOLData.push({
            ...entry.summary,
            ...profileData,
            pnl7d: pnlData7d.pnl7d || profileData.pnl7d,     // Use 7d-specific or fallback
            pnl30d: pnlData30d.pnl30d || profileData.pnl30d,  // Use 30d-specific or fallback
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
