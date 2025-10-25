
import { chromium, Browser, Page } from 'playwright';
import { dbStorage } from "./db-storage";
import type { InsertScrapedKol } from "@shared/schema";
import { KOLDataParser, type RawKOLData, type FullKOLData, type KOLDetailedData } from './kol-data-parser';

export class KOLScraperV2Playwright {
  private browser?: Browser;
  private leaderboardPage?: Page;

  async init(): Promise<void> {
    if (this.browser) {
      console.log('✅ Browser already initialized, reusing instance');
      return;
    }

    console.log('🚀 Initializing Playwright browser with stealth configuration...');

    const chromiumPath = process.env.CHROMIUM_EXECUTABLE_PATH || '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium';
    console.log(`Using Chromium from: ${chromiumPath}`);

    this.browser = await chromium.launch({
      headless: true,
      executablePath: chromiumPath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.141 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    this.leaderboardPage = await context.newPage();

    console.log('✅ Browser initialized successfully with Playwright');
  }

  async scrapeLeaderboard(): Promise<{ summary: RawKOLData, profileUrl: string | null }[]> {
    if (!this.leaderboardPage) {
      throw new Error('Scraper not initialized. Call init() first.');
    }

    try {
      console.log('🌐 Navigating to https://kolscan.io/leaderboard...');
      await this.leaderboardPage.goto('https://kolscan.io/leaderboard', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log('⏳ Waiting for dynamic content to load...');
      try {
        await this.leaderboardPage.waitForSelector('a[href^="/account/"]', { timeout: 7000 });
        console.log('✅ Leaderboard rows found.');
      } catch (e) {
        console.log('⚠️ Page structure different than expected, continuing anyway...');
      }

      console.log('📜 Scrolling to load all content...');
      await this.leaderboardPage.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await this.leaderboardPage.waitForTimeout(2000);

      console.log('📄 Extracting leaderboard data and profile URLs...');
      const kolEntries = await this.leaderboardPage.evaluate(() => {
        const extractedEntries: { summary: RawKOLData, profileUrl: string | null }[] = [];

        const rows = Array.from(document.querySelectorAll('a[href^="/account/"]'));
        console.log(`Found ${rows.length} potential KOL entry rows`);

        for (let i = 0; i < rows.length && extractedEntries.length < 20; i++) {
          const row = rows[i];
          try {
            const fullText = row.textContent || '';
            const profileUrl = row.getAttribute('href');

            const rankEl = row.querySelector('span, p');
            const rank = rankEl ? rankEl.textContent?.trim() : (i + 1).toString();

            let username = 'Unknown';
            const pEls = Array.from(row.querySelectorAll('p'));
            const potentialNameEl = pEls.find(p => {
              const text = p.textContent || '';
              return text.length > 0 && !text.includes('Sol') && !text.includes('$') && !text.match(/^[\d\s\/]+$/);
            });
            if (potentialNameEl) {
              username = potentialNameEl.textContent?.trim() || 'Unknown';
            } else {
              const usernameEl = row.querySelector('p[class*="font-semibold"], p[class*="font-bold"]');
              if (usernameEl) username = usernameEl.textContent?.trim() || 'Unknown';
            }

            let xHandle: string | null = null;
            const xLinkEl = row.querySelector('a[href*="x.com/"], a[href*="twitter.com/"]');
            if (xLinkEl) {
              const href = xLinkEl.getAttribute('href') || '';
              const match = href.match(/(?:x\.com|twitter\.com)\/([A-Za-z0-9_]+)/);
              if (match && match[1]) xHandle = match[1];
            }

            let winsLosses: string | null = null;
            const wlMatch = fullText.match(/(\d{1,4})\s*\/\s*(\d{1,4})/);
            if (wlMatch) winsLosses = `${wlMatch[1]}/${wlMatch[2]}`;

            let solGain: string | null = null;
            let usdGain: string | null = null;
            const pnlEl = Array.from(row.querySelectorAll('p, span')).find(el =>
              el.textContent?.includes('Sol') && el.textContent.includes('$')
            );
            if (pnlEl) {
              const pnlText = pnlEl.textContent || '';
              const solMatch = pnlText.match(/([+-]?[\d,]+\.?\d*)\s*Sol/i);
              const usdMatch = pnlText.match(/\$\s*([+-]?[\d,]+\.?\d*)/);
              if (solMatch) solGain = solMatch[1].replace(/,/g, '');
              if (usdMatch) usdGain = usdMatch[1].replace(/,/g, '');
            }

            extractedEntries.push({
              summary: { rank: rank || '', username, xHandle, winsLosses, solGain, usdGain },
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

    const baseUrl = profileUrl.includes('?') ? profileUrl.split('?')[0] : profileUrl;
    const fullUrl = `https://kolscan.io${baseUrl}?timeframe=1`;
    console.log(`🔎 Navigating to profile page: ${fullUrl}`);

    const context = this.browser.contexts()[0];
    const profilePage = await context.newPage();

    try {
      await profilePage.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      try {
        await profilePage.waitForSelector('main div[class*="grid"] p', { timeout: 7000 });
        console.log('✅ Profile stats grid found.');
      } catch (e) {
        console.warn('⚠️ Profile stats grid not found, data may be limited.');
      }

      console.log(`📄 Extracting detailed data from ${fullUrl}...`);

      const detailedData = await profilePage.evaluate(async () => {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const findStatValueByLabel = (labelRegex: RegExp): string | null => {
          try {
            const allStatDivs = Array.from(document.querySelectorAll('main div[class*="grid"] > div'));
            for (let i = 0; i < allStatDivs.length; i++) {
              const div = allStatDivs[i];
              const texts = Array.from(div.querySelectorAll('p')).map(p => p.textContent || '');
              if (texts.length === 2 && labelRegex.test(texts[0])) {
                return texts[1].trim();
              }
            }
            return null;
          } catch (e) {
            return null;
          }
        };

        const extractSolFromPnL = (): string | null => {
          try {
            const pnlEl = Array.from(document.querySelectorAll('h3, div, p')).find(el =>
              el.textContent && el.textContent.includes('Sol') &&
              el.textContent.includes('$') &&
              el.textContent.match(/\d+\s*\/\s*\d+/)
            );
            if (!pnlEl || !pnlEl.textContent) return null;

            const pnlMatch = pnlEl.textContent.match(/([+-]?[\d,]+\.?\d*)\s*Sol/i);
            return pnlMatch ? pnlMatch[1].replace(/,/g, '') : null;
          } catch (e) {
            return null;
          }
        };

        const extractCurrentTimeframeData = () => {
          let pnl = extractSolFromPnL();
          let winRate = findStatValueByLabel(/Win Rate/i);
          if (winRate) winRate = winRate.replace('%', '');
          let volume = findStatValueByLabel(/Volume/i);
          if (volume) volume = volume.replace(/[$,]/g, '');
          return { pnl, winRate, volume };
        };

        const clickTimeframeAndExtract = async (label: string) => {
          try {
            const button = Array.from(document.querySelectorAll('button')).find(b =>
              b.textContent && b.textContent.trim().toLowerCase() === label
            );
            if (!button) {
              console.error('Button ' + label + ' not found');
              return { pnl: null, winRate: null, volume: null };
            }

            const oldData = extractCurrentTimeframeData();
            button.click();
            await delay(1500);
            let newData = extractCurrentTimeframeData();

            if (newData.pnl === oldData.pnl && newData.winRate === oldData.winRate) {
              await delay(1500);
              return extractCurrentTimeframeData();
            }
            return newData;
          } catch (e) {
            console.error('Error clicking ' + label + ':', e);
            return { pnl: null, winRate: null, volume: null };
          }
        };

        console.log('Extracting 1d data...');
        const data1d = extractCurrentTimeframeData();

        console.log('Clicking 7d button...');
        const data7d = await clickTimeframeAndExtract('7d');

        console.log('Clicking 30d button...');
        const data30d = await clickTimeframeAndExtract('30d');

        console.log('=== EXTRACTION RESULTS ===');
        console.log('1D - PnL:', data1d.pnl, 'Win Rate:', data1d.winRate, 'Volume:', data1d.volume);
        console.log('7D - PnL:', data7d.pnl, 'Win Rate:', data7d.winRate, 'Volume:', data7d.volume);
        console.log('30D - PnL:', data30d.pnl, 'Win Rate:', data30d.winRate, 'Volume:', data30d.volume);
        console.log('========================');

        return {
          pnl1d: data1d.pnl,
          pnl7d: data7d.pnl,
          pnl30d: data30d.pnl,
          winRate1d: data1d.winRate,
          winRate7d: data7d.winRate,
          winRate30d: data30d.winRate,
          totalTrades1d: data1d.volume,
          totalTrades7d: data7d.volume,
          totalTrades30d: data30d.volume
        };
      });

      return detailedData as KOLDetailedData;

    } catch (error) {
      console.error(`❌ Failed to scrape profile ${fullUrl}:`, error);
      throw error;
    } finally {
      await profilePage.close();
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

      const limitedEntries = leaderboardEntries.slice(0, 3);
      console.log(`Found ${leaderboardEntries.length} KOLs. Processing ${limitedEntries.length} for testing...`);

      for (const entry of limitedEntries) {
        if (!entry.profileUrl) {
          console.warn(`⚠️ Skipping ${entry.summary.username} - no profile URL found`);
          continue;
        }

        try {
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

          const profileData = await this.scrapeKOLProfile(entry.profileUrl);

          const fullKOLData: FullKOLData = {
            rank: entry.summary.rank,
            username: entry.summary.username,
            xHandle: entry.summary.xHandle,
            winsLosses: entry.summary.winsLosses,
            solGain: entry.summary.solGain,
            usdGain: entry.summary.usdGain,
            pnl1d: profileData.pnl1d,
            pnl7d: profileData.pnl7d,
            pnl30d: profileData.pnl30d,
            winRate1d: profileData.winRate1d,
            winRate7d: profileData.winRate7d,
            winRate30d: profileData.winRate30d,
            totalTrades1d: profileData.totalTrades1d,
            totalTrades7d: profileData.totalTrades7d,
            totalTrades30d: profileData.totalTrades30d,
            profileUrl: entry.profileUrl
          };

          console.log(`✅ Processed ${fullKOLData.username}:`, {
            pnl7d: fullKOLData.pnl7d,
            winRate7d: fullKOLData.winRate7d,
            totalTrades7d: fullKOLData.totalTrades7d
          });

          allKOLData.push(fullKOLData);

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

export const kolScraperV2Playwright = new KOLScraperV2Playwright();
