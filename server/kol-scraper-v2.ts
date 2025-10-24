
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
            // Get full text content for pattern matching
            const fullText = row.textContent || '';
            
            // 1. Get Profile URL
            const profileUrl = row.getAttribute('href');

            // 2. Get Rank - first number in the row
            let rank = (i + 1).toString();
            const rankMatch = fullText.match(/^(\d+)/);
            if (rankMatch) {
              rank = rankMatch[1];
            }

            // 3. Get Username - look for text that's NOT a number, $, or /
            let username = 'Unknown';
            const allParagraphs = Array.from(row.querySelectorAll('p'));
            for (const p of allParagraphs) {
              const pText = p.textContent?.trim() || '';
              if (pText.length > 1 && 
                  !pText.match(/^[\d.]+$/) && 
                  !pText.includes('$') && 
                  !pText.includes('/') &&
                  !pText.includes('Sol') &&
                  !pText.match(/^\d+$/)) {
                username = pText;
                break;
              }
            }
            
            // 4. Get X Handle from nested link
            let xHandle: string | null = null;
            const xLink = row.querySelector('a[href*="x.com"], a[href*="twitter.com"]');
            if (xLink) {
              const href = xLink.getAttribute('href') || '';
              const match = href.match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/);
              if (match && match[1]) {
                xHandle = match[1];
              }
            }
            
            // 5. Get Wins/Losses - pattern: "32/35" or similar
            let winsLosses: string | null = null;
            const wlMatch = fullText.match(/(\d{1,4})\s*\/\s*(\d{1,4})/);
            if (wlMatch) {
              winsLosses = `${wlMatch[1]}/${wlMatch[2]}`;
            }
            
            // 6. Get SOL Gain - pattern: "+82.83 Sol" or "82.83 Sol"
            let solGain: string | null = null;
            const solMatch = fullText.match(/([+-]?[\d,]+\.?\d*)\s*Sol/i);
            if (solMatch) {
              solGain = solMatch[1].replace(/,/g, '');
            }
            
            // 7. Get USD Gain - pattern: "$15,745.30" or similar
            let usdGain: string | null = null;
            const usdMatch = fullText.match(/\$\s*([+-]?[\d,]+\.?\d*)/);
            if (usdMatch) {
              usdGain = usdMatch[1].replace(/,/g, '');
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

      // Wait for page content to load - use more generic selector
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
          const lines = allText.split('\n').map(l => l.trim()).filter(l => l);
          
          console.log('Extracted lines from profile page:', lines.slice(0, 50).join(' | '));
          
          // Extract PnL from "Token PnL" header - multiple patterns
          // Pattern 1: "0/4 +9.00 Sol ($0.0)"
          const pnlPattern1 = /(\d+\/\d+)\s+([+-][\d,]+\.?\d*)\s*Sol\s*\((\$[\d,]+\.?\d*)\)/i;
          // Pattern 2: Just "+9.00 Sol ($0.0)" without the fraction
          const pnlPattern2 = /([+-][\d,]+\.?\d*)\s*Sol\s*\((\$[\d,]+\.?\d*)\)/i;
          
          const pnlMatch = allText.match(pnlPattern1) || allText.match(pnlPattern2);
          
          if (pnlMatch) {
            let solAmount, usdAmount;
            if (pnlMatch.length === 4) {
              // Pattern 1 matched (with wins/losses)
              solAmount = pnlMatch[2];
              usdAmount = pnlMatch[3];
            } else {
              // Pattern 2 matched (without wins/losses)
              solAmount = pnlMatch[1];
              usdAmount = pnlMatch[2];
            }
            
            const pnlValue = `${solAmount} Sol (${usdAmount})`;
            
            if (url.includes('timeframe=1')) {
              pnl1d = pnlValue;
            } else if (url.includes('timeframe=7')) {
              pnl7d = pnlValue;
            } else if (url.includes('timeframe=30')) {
              pnl30d = pnlValue;
            }
          }
          
          if (pageMode === 'full') {
            // Extract stats from the Stats/Holdings section
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              const nextLine = lines[i + 1] || '';
              
              // Win Rate - look for percentage after "Win Rate"
              if (line === 'Win Rate' || line.includes('Win Rate')) {
                const percentMatch = nextLine.match(/([\d.]+)%/) || line.match(/([\d.]+)%/);
                if (percentMatch) {
                  winRatePercent = percentMatch[1];
                }
              }
              
              // Total Trades - look for "Total Trades" label specifically
              if (line === 'Total Trades' || line.includes('Total Trades')) {
                const numMatch = nextLine.match(/([\d,]+)/);
                if (numMatch) {
                  totalTrades = numMatch[1].replace(/,/g, '');
                }
              }
              
              // Also check for "Volume" which might contain trade count
              if ((line === 'Volume' || line.includes('Volume')) && !totalTrades) {
                const numMatch = nextLine.match(/([\d,]+)/);
                if (numMatch) {
                  totalTrades = numMatch[1].replace(/,/g, '');
                }
              }
            }
            
            // If still no totalTrades, try pattern matching in full text
            if (!totalTrades) {
              const tradeMatch = allText.match(/Total Trades[:\s]+([\d,]+)/i);
              if (tradeMatch) {
                totalTrades = tradeMatch[1].replace(/,/g, '');
              }
            }

            // Extract holdings from token links
            const holdingElements = document.querySelectorAll('a[href*="/token/"]');
            for (const elem of Array.from(holdingElements).slice(0, 10)) {
              const tokenName = elem.textContent?.trim();
              if (tokenName && tokenName.length > 0) {
                const parent = elem.closest('tr, div[class*="flex"], div[class*="grid"]');
                const parentText = parent?.textContent || '';
                const valueMatch = parentText.match(/\$([\d,]+\.?\d*)/);
                
                holdings.push({
                  tokenName: tokenName,
                  tokenSymbol: tokenName,
                  valueUsd: valueMatch ? valueMatch[1].replace(/,/g, '') : null,
                  amount: null
                });
              }
            }
          }
          
          console.log('Extracted data:', { pnl1d, pnl7d, pnl30d, totalTrades, winRatePercent, holdingsCount: holdings.length });
        } catch (e) {
          console.error('Error during profile scraping:', e);
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
