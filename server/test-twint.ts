
import { twintClient } from './twint-client';

async function testTwint() {
  console.log('🧪 Testing Twint follower scraper...\n');

  try {
    // Test single user
    console.log('Testing single user scrape...');
    const followerCount = await twintClient.getFollowerCount('elonmusk');
    
    if (followerCount !== null) {
      console.log(`✅ Success! Elon Musk has ${followerCount.toLocaleString()} followers\n`);
    } else {
      console.log('❌ Failed to get follower count\n');
    }

    // Test multiple users
    console.log('Testing multiple user scrape...');
    const users = await twintClient.scrapeMultipleUsers(['elonmusk', 'BillGates', 'BarackObama']);
    
    console.log(`✅ Scraped ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`  @${user.username}: ${user.followers.toLocaleString()} followers`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTwint();
