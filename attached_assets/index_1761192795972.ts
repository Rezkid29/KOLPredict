import { main as scrapeMain } from './services/scraper.js';
import { KOLMarketGenerator } from './services/marketGenerator.js';

// Main application
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--scrape-only')) {
    // Run only the scraper
    console.log('🔍 Running scraper only...');
    await scrapeMain();
  } else if (args.includes('--markets-only')) {
    // Run only market generation
    console.log('🎯 Running market generator only...');
    const generator = new KOLMarketGenerator();
    await generator.generateMarkets(5);
  } else {
    // Run both scraper and market generator
    console.log('🚀 Running full pipeline: Scraper + Market Generator');
    console.log('='.repeat(70));

    try {
      // First scrape the data
      console.log('📊 PHASE 1: Scraping KOL leaderboard...');
      await scrapeMain();

      console.log('\n' + '='.repeat(70));
      console.log('🎯 PHASE 2: Generating prediction markets...');
      console.log('='.repeat(70));

      // Then generate markets
      const generator = new KOLMarketGenerator();
      const markets = await generator.generateMarkets(5);

      console.log('\n' + '='.repeat(70));
      console.log('🎉 PIPELINE COMPLETE!');
      console.log(`Generated ${markets.length} prediction markets`);
      console.log('='.repeat(70));

    } catch (error) {
      console.error('💥 Pipeline failed:', error);
    }
  }
}

// Run the application
main().catch(console.error);
