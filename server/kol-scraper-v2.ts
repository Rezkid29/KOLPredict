
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
        
        // The page uses a specific structure - look for the main container first
        // Based on the screenshot, rows are in a flex/grid layout
        const possibleContainers = [
          'div[class*="leaderboard"]',
          'div[class*="list"]',
          'main',
          '[role="main"]',
          'body'
        ];
        
        let mainContainer: Element | null = null;
        for (const selector of possibleContainers) {
          const el = document.querySelector(selector);
          if (el) {
            mainContainer = el;
            break;
          }
        }
        
        if (!mainContainer) {
          console.log('No main container found');
          return [];
        }
        
        // Find all clickable row elements - they likely wrap each leaderboard entry
        // Look for divs that contain both an avatar image AND text content AND a rank number
        const allDivs = Array.from(mainContainer.querySelectorAll('div'));
        const rows: Element[] = [];
        
        for (const div of allDivs) {
          const hasImage = div.querySelector('img') !== null;
          const hasText = (div.textContent || '').trim().length > 10;
          const hasLinks = div.querySelectorAll('a').length > 0;
          
          // Check if this div looks like a leaderboard row
          if (hasImage && hasText && hasLinks) {
            // Make sure it's not a nested child of another row we already found
            const isNested = rows.some(existingRow => existingRow.contains(div));
            if (!isNested && div.textContent!.match(/\d+\/\d+/)) {
              rows.push(div);
            }
          }
        }
        
        console.log(`Found ${rows.length} potential KOL entry rows`);
        
        for (let i = 0; i < rows.length && extractedEntries.length < 20; i++) {
          const row = rows[i];
          try {
            const text = row.textContent || '';
            
            // Extract rank - look for standalone number at start
            const rank = (i + 1).toString();
            
            // Find username - it's usually in a link or next to the avatar
            let username: string | null = null;
            const allLinks = Array.from(row.querySelectorAll('a'));
            
            // First link that's not twitter/x is usually the username
            for (const link of allLinks) {
              const href = link.getAttribute('href') || '';
              if (!href.includes('twitter') && !href.includes('x.com') && link.textContent) {
                const potentialName = link.textContent.trim();
                if (potentialName.length >= 2 && potentialName.length <= 50 && !potentialName.match(/^\d+$/)) {
                  username = potentialName;
                  break;
                }
              }
            }
            
            if (!username) continue;
            
            // Extract profile URL
            let profileUrl: string | null = null;
            for (const link of allLinks) {
              const href = link.getAttribute('href') || '';
              if (href.includes('/profile/') || href.startsWith('/kol/') || (href.startsWith('/') && !href.includes('twitter'))) {
                profileUrl = href;
                break;
              }
            }
            
            // Extract X handle from twitter/x.com link
            let xHandle: string | null = null;
            for (const link of allLinks) {
              const href = link.getAttribute('href') || '';
              if (href.includes('twitter.com/') || href.includes('x.com/')) {
                const match = href.match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/);
                if (match && match[1]) {
                  xHandle = match[1];
                  break;
                }
              }
            }
            
            // Extract wins/losses - format: "1/0" or "12/4"
            let winsLosses: string | null = null;
            const wlMatch = text.match(/(\d{1,3})\s*\/\s*(\d{1,3})/);
            if (wlMatch) {
              winsLosses = `${wlMatch[1]}/${wlMatch[2]}`;
            }
            
            // Extract SOL gain - look for "+XX.XX Sol" or green text with "Sol"
            let solGain: string | null = null;
            const solMatch = text.match(/\+?([\d,]+\.?\d*)\s*Sol/i);
            if (solMatch) {
              solGain = '+' + solMatch[1] + ' Sol';
            }
            
            // Extract USD gain - format: "($XX,XXX.XX)" or "$XX,XXX"
            let usdGain: string | null = null;
            const usdMatch = text.match(/\$\s*([\d,]+\.?\d*)/);
            if (usdMatch) {
              usdGain = '$' + usdMatch[1];
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

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        await profilePage.waitForSelector('body', { timeout: 5000 });
      } catch (e) {
        console.log('⚠️ Profile page structure different than expected');
      }

      console.log(`📄 Extracting detailed data from ${fullUrl}...`);

      // Extract data using plain JavaScript (no TypeScript types in evaluate context)
      const detailedData = await profilePage.evaluate(() => {
        
        function findStatByLabel(labelRegex) {
          try {
            const allTextNodes = Array.from(document.querySelectorAll('div, span, p, h3, h4'));
            const labelNode = allTextNodes.find((el) => labelRegex.test(el.textContent || ''));
            if (!labelNode) return null;
            
            const parent = labelNode.parentElement;
            let valueNode = labelNode.nextElementSibling || (parent ? parent.querySelector('[class*="value"], [class*="stat"]') : null);
            
            if (valueNode && valueNode.textContent) return valueNode.textContent.trim();

            if (parent && parent.textContent) {
                const parentText = parent.textContent;
                const labelText = labelNode.textContent || '';
                const value = parentText.replace(labelText, '').trim();
                if (value.length > 0 && value.length < 20) return value;
            }
            return null;
          } catch (e) {
            return null;
          }
        }

        const pnl7d = findStatByLabel(/7D PnL/i);
        const pnl30d = findStatByLabel(/30D PnL/i);
        const totalTrades = findStatByLabel(/Total Trades/i);
        const winRatePercent = findStatByLabel(/Win Rate/i);

        const holdings = [];
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

        const tradeHistory = [];
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

        return { 
          pnl7d: pnl7d, 
          pnl30d: pnl30d, 
          totalTrades: totalTrades, 
          winRatePercent: winRatePercent, 
          holdings: holdings, 
          tradeHistory: tradeHistory 
        };
      });

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
