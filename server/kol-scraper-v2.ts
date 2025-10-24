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
await new Promise(resolve => setTimeout(resolve, 2000));

// --- UPDATED LEADERBOARD EXTRACTION LOGIC ---
console.log('📄 Extracting leaderboard data and profile URLs...');
const kolEntries = await this.leaderboardPage.evaluate((): { summary: RawKOLData, profileUrl: string | null }[] => {
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

// Find username (more resilient)
let username = 'Unknown';
const pEls = Array.from(row.querySelectorAll('p'));
const potentialNameEl = pEls.find(p => {
const text = p.textContent || '';
// Find text that is not PnL, not rank, not W/L
return text.length > 0 && !text.includes('Sol') && !text.includes('$') && !text.match(/^[\d\s\/]+$/);
});
if (potentialNameEl) {
username = potentialNameEl.textContent?.trim() || 'Unknown';
} else {
// Fallback to original
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
const pnlText = pnlEl.textContent;
const solMatch = pnlText.match(/([+-]?[\d,]+\.?\d*)\s*Sol/i);
const usdMatch = pnlText.match(/\$\s*([+-]?[\d,]+\.?\d*)/);
if (solMatch) solGain = solMatch[1].replace(/,/g, '');
if (usdMatch) usdGain = usdMatch[1].replace(/,/g, '');
}

extractedEntries.push({
summary: { rank, username, xHandle, winsLosses, solGain, usdGain },
profileUrl
});

} catch (err) {
console.error('Error processing row:', err);
continue;
}
}

return extractedEntries;
});
// --- END OF UPDATED SECTION ---

console.log(`✅ Successfully extracted ${kolEntries.length} KOL entries from leaderboard`);
return kolEntries;

} catch (error) {
console.error('❌ Leaderboard scraping failed:', error);
throw error;
}
}

// --- MAJORLY UPDATED PROFILE SCRAPING LOGIC ---
async scrapeKOLProfile(profileUrl: string): Promise<KOLDetailedData> {
if (!this.browser) {
throw new Error('Browser not initialized');
}

let profilePage: Page | null = null;
// Always go to the 1d view first
const baseUrl = profileUrl.includes('?') ? profileUrl.split('?')[0] : profileUrl;
const fullUrl = `https://kolscan.io${baseUrl}?timeframe=1`;
console.log(`🔎 Navigating to profile page: ${fullUrl}`);

try {
profilePage = await this.browser.newPage();
await profilePage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

await profilePage.goto(fullUrl, {
waitUntil: 'networkidle2',
timeout: 30000
});

// Wait for the main stats grid to appear
try {
await profilePage.waitForSelector('main div[class*="grid"] p', { timeout: 7000 });
console.log('✅ Profile stats grid found.');
} catch(e) {
console.warn('⚠️ Profile stats grid not found, data may be limited.');
}

console.log(`📄 Extracting detailed data from ${fullUrl}...`);

const detailedData = await profilePage.evaluate(async () => {
// Helper to pause execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper 1: Find a stat value by its label
// This looks for a div containing the label text and returns its sibling's text.
const findStatValueByLabel = (labelRegex: RegExp): string | null => {
try {
// Based on the screenshot, stats are in 'div's with two 'p' tags
const allStatDivs = Array.from(document.querySelectorAll('main div[class*="grid"] > div'));
for (const div of allStatDivs) {
const texts = Array.from(div.querySelectorAll('p')).map(p => p.textContent || '');
if (texts.length === 2) {
// texts[0] is label, texts[1] is value
if (labelRegex.test(texts[0])) {
return texts[1].trim();
}
}
}
return null;
} catch (e) { return null; }
};

// Helper 2: Find the main PnL display
const findMainPnL = (): string | null => {
try {
// "121/241 +164.68 Sol ($31,322.5)"
const pnlEl = Array.from(document.querySelectorAll('h3, div, p')).find(el => 
el.textContent?.includes('Sol') && 
el.textContent.includes('$') &&
el.textContent.match(/\d+\s*\/\s*\d+/)
);
if (!pnlEl) return null;

const pnlRaw = pnlEl.textContent;
const pnlMatch = pnlRaw.match(/([+-]?[\d,]+\.?\d*)\s*Sol\s*\(\$([+-]?[\d,]+\.?\d*)\)/i);
if (pnlMatch) {
// Format as "164.68 Sol ($31322.5)"
return `${pnlMatch[1].replace(/,/g, '')} Sol ($${pnlMatch[2].replace(/,/g, '')})`;
}
return null; // No match
} catch (e) { return null; }
};

// Helper 3: Click a timeframe button
const clickTimeframe = async (label: '1d' | '7d' | '30d'): Promise<string | null> => {
try {
const button = Array.from(document.querySelectorAll('button')).find(
b => b.textContent?.trim().toLowerCase() === label
);
if (!button) return null;

const oldPnL = findMainPnL();
button.click();

// Wait for PnL to update
let newPnL = oldPnL;
for (let i = 0; i < 10; i++) { // Wait up to 5 seconds
await delay(500);
newPnL = findMainPnL();
if (newPnL !== oldPnL) {
return newPnL; // Success
}
}
return newPnL; // Return whatever we have after timeout
} catch (e) {
console.error(`Error clicking ${label}:`, e);
return null;
}
};

// --- Main Extraction Logic ---

// 1. Scrape 1d data (already loaded)
console.log('Extracting 1d data...');
const pnl1d = findMainPnL();
let winRatePercent = findStatValueByLabel(/Win Rate/i);
if (winRatePercent) winRatePercent = winRatePercent.replace('%', '');

// Use "Volume" or "Realized Profits" for Total Trades
let totalTrades = findStatValueByLabel(/Volume/i) || findStatValueByLabel(/Realized Profits/i);
if (totalTrades) totalTrades = totalTrades.replace(/[$,]/g, '');

// 2. Click 7d and scrape PnL
console.log('Clicking 7d and extracting PnL...');
const pnl7d = await clickTimeframe('7d');

// 3. Click 30d and scrape PnL
console.log('Clicking 30d and extracting PnL...');
const pnl30d = await clickTimeframe('30d');

// 4. Extract Holdings (only need to do this once)
let holdings: Array<{tokenName: string; tokenSymbol: string; valueUsd: string | null; amount: string | null}> = [];
const holdingElements = document.querySelectorAll('a[href*="/token/"]');
for (const elem of Array.from(holdingElements).slice(0, 10)) {
const tokenName = elem.textContent?.trim();
if (tokenName && tokenName.length > 0 && tokenName.toUpperCase() !== tokenName) { // Filter out symbols
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

console.log('=== EXTRACTION RESULTS ===');
console.log('PnL 1D:', pnl1d);
console.log('PnL 7D:', pnl7d);
console.log('PnL 30D:', pnl30d);
console.log('Total Trades (Volume):', totalTrades);
console.log('Win Rate %:', winRatePercent);
console.log('========================');

return { 
pnl1d: pnl1d,
pnl7d: pnl7d, 
pnl30d: pnl30d, 
totalTrades: totalTrades, 
winRatePercent: winRatePercent, 
holdings: holdings, 
tradeHistory: [] // Trade history scraping is complex, skipping for now
};
});
// --- END OF UPDATED SECTION ---

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

// --- UPDATED scrapeAndSave LOGIC ---
async scrapeAndSave(): Promise<{ scraped: number; saved: number }> {
let allKOLData: FullKOLData[] = [];
try {
await this.init();
const leaderboardEntries = await this.scrapeLeaderboard();

// Limit to 3 for testing
const limitedEntries = leaderboardEntries.slice(0, 3);
console.log(`Found ${leaderboardEntries.length} KOLs. Processing ${limitedEntries.length} for testing...`);

for (const entry of limitedEntries) {
if (!entry.profileUrl) {
console.warn(`⚠️ Skipping ${entry.summary.username} - no profile URL found`);
continue;
}

try {
// Add a delay between each profile scrape
await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

// Scrape the profile page. The function will handle 1d, 7d, and 30d.
const profileData = await this.scrapeKOLProfile(entry.profileUrl);

// Parse winsLosses from leaderboard data
let wins: string | null = null;
let losses: string | null = null;
if (entry.summary.winsLosses) {
const parts = entry.summary.winsLosses.split('/');
if (parts.length === 2) {
wins = parts[0].trim();
losses = parts[1].trim();
}
}

// Merge leaderboard summary and profile details with proper field mapping
const fullKOLData: FullKOLData = {
rank: entry.summary.rank,
username: entry.summary.username,
xHandle: entry.summary.xHandle,
winsLosses: entry.summary.winsLosses,
wins: wins,
losses: losses,
solGain: entry.summary.solGain,
usdGain: entry.summary.usdGain,
pnl1d: profileData.pnl1d || null,
pnl7d: profileData.pnl7d || null,
pnl30d: profileData.pnl30d || null,
totalTrades: profileData.totalTrades || null,
winRatePercent: profileData.winRatePercent || null,
holdings: profileData.holdings || null,
tradeHistory: profileData.tradeHistory || null,
profileUrl: entry.profileUrl
};

console.log(`✅ Processed ${fullKOLData.username}:`, {
wins: fullKOLData.wins,
losses: fullKOLData.losses,
solGain: fullKOLData.solGain,
pnl7d: fullKOLData.pnl7d,
totalTrades: fullKOLData.totalTrades
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
async function main() {
const scraper = new KOLScraperV2();
try {
await scraper.init();

console.log('\n🎯 Starting KOL scraping process...\n');

const { scraped, saved } = await scraper.scrapeAndSave();

console.log(`\n✅ Scraping Complete: ${scraped} entries scraped, ${saved} saved to database\n`);

const latestScrapedData = await dbStorage.getLatestScrapedKols(20);

console.log('📊 LATEST SCRAPED KOL DATA (Structured Format):\n');
console.log('='.repeat(100));

latestScrapedData.forEach((kol, index) => {
console.log(`\n[${index + 1}] RANK #${kol.rank} - ${kol.username}`);
console.log('-'.repeat(100));
console.log(`  Username:     ${kol.username}`);
console.log(`  X Handle:     ${kol.xHandle || 'N/A'}`);
console.log(`  Wins/Losses:  ${kol.winsLosses || 'N/A'}`);
console.log(`  SOL Gain:     ${kol.solGain || 'N/A'}`);
console.log(`  USD Gain:     ${kol.usdGain || 'N/A'}`);
console.log(`  PNL 1D:       ${(kol as any).pnl1d || 'N/A'}`); 
console.log(`  PNL 7D:       ${kol.pnl7d || 'N/A'}`);
console.log(`  PNL 30D:      ${kol.pnl30d || 'N/A'}`);
console.log(`  Total Trades: ${kol.totalTrades || 'N/A'}`);
console.log(`  Win Rate:     ${kol.winRatePercent || 'N/A'}`);
console.log(`  Scraped At:   ${kol.scrapedAt}`);

if (kol.holdings) {
console.log(`  Holdings:     ${kol.holdings}`);
}
if (kol.tradeHistory) {
console.log(`  Trade Hist:_ ${kol.tradeHistory}`);
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

if (import.meta.url === `file://${process.argv[1]}`) {
main().catch(err => console.error('Error running main:', err));
}

export const kolScraperV2 = new KOLScraperV2();

