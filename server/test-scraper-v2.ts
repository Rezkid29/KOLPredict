import { kolScraperV2 } from './kol-scraper-v2';

async function testScraper() {
  console.log('🧪 Testing KOL Scraper V2...\n');
  
  try {
    const result = await kolScraperV2.scrapeAndSave();
    
    console.log('\n✅ Test completed successfully!');
    console.log(`📊 Results: ${result.saved}/${result.scraped} KOLs scraped and saved`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testScraper();
