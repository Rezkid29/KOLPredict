
import { kolScraperV2Playwright } from './kol-scraper-v2-playwright';

async function testPlaywrightScraper() {
  console.log('🧪 Testing KOL Scraper V2 with Playwright...\n');
  
  try {
    const result = await kolScraperV2Playwright.scrapeAndSave();
    
    console.log('\n✅ Playwright test completed successfully!');
    console.log(`📊 Results: ${result.saved}/${result.scraped} KOLs scraped and saved`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Playwright test failed:', error);
    process.exit(1);
  }
}

testPlaywrightScraper();
