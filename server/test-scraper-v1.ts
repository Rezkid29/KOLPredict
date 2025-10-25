import { kolScraper } from './kol-scraper';

async function testV1Scraper() {
  console.log('🧪 Testing KOL Scraper V1...\n');
  
  try {
    await kolScraper.init();
    const data = await kolScraper.scrapeLeaderboard();
    console.log(`\n✅ V1 Test completed! Scraped ${data.length} KOLs`);
    await kolScraper.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ V1 Test failed:', error);
    process.exit(1);
  }
}

testV1Scraper();
