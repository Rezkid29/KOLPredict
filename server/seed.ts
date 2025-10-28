import { dbStorage } from "./db-storage";
import type { InsertKol, InsertMarket, InsertUser, InsertAchievement, InsertFaq } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create default user
    const defaultUser: InsertUser = {
      username: "trader1",
    };

    let user;
    try {
      user = await dbStorage.createUser(defaultUser);
      console.log("✅ Created default user:", user.username);
    } catch (error) {
      console.log("ℹ️  Default user already exists");
      user = await dbStorage.getUserByUsername("trader1");
    }

    // Check if KOLs already exist
    const existingKols = await dbStorage.getAllKols();
    if (existingKols.length > 0) {
      console.log("ℹ️  KOLs already seeded, skipping...");
      return;
    }

    // Create mock KOLs
    const mockKols: InsertKol[] = [
      {
        name: "Sarah Chen",
        handle: "sarahchen",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=sarah`,
        followers: 125000,
        engagementRate: "4.8",
        tier: "Elite",
        trending: true,
        trendingPercent: "12.5",
      },
      {
        name: "Alex Morgan",
        handle: "alexmorgan",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=alex`,
        followers: 89000,
        engagementRate: "3.2",
        tier: "Rising",
        trending: true,
        trendingPercent: "8.3",
      },
      {
        name: "Jordan Lee",
        handle: "jordanlee",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=jordan`,
        followers: 210000,
        engagementRate: "5.6",
        tier: "Elite",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Taylor Swift",
        handle: "taylorswift",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=taylor`,
        followers: 340000,
        engagementRate: "6.2",
        tier: "Legendary",
        trending: true,
        trendingPercent: "15.7",
      },
      {
        name: "Chris Evans",
        handle: "chrisevans",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=chris`,
        followers: 56000,
        engagementRate: "2.9",
        tier: "Growing",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Emma Watson",
        handle: "emmawatson",
        avatar: `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=emma`,
        followers: 178000,
        engagementRate: "4.1",
        tier: "Elite",
        trending: true,
        trendingPercent: "6.9",
      },
    ];

    const createdKols = [];
    for (const kolData of mockKols) {
      const kol = await dbStorage.createKol(kolData);
      createdKols.push(kol);
      console.log(`✅ Created KOL: ${kol.name}`);
    }

    // Create mock markets
    const marketTitles = [
      "Will reach 150K followers by end of month?",
      "Engagement rate will exceed 5% this week?",
      "Will gain 10K+ followers in next 7 days?",
      "Next campaign will get 50K+ interactions?",
      "Will trending rate stay above 10%?",
      "Will collaborate with major brand this month?",
    ];

    for (let i = 0; i < createdKols.length; i++) {
      const kol = createdKols[i];
      const market: InsertMarket = {
        kolId: kol.id,
        title: marketTitles[i],
        description: `Prediction market for ${kol.name}'s performance metrics`,
        outcome: "pending",
        // Seed pools to achieve target price
        // For 50/50 odds: yesPrice = yesCollateral/yesShares = 0.5
        // Set yesShares = 20000, yesCollateral = 10000
        yesSharePool: 20000,
        yesCollateralPool: 10000,
        noSharePool: 20000,
        noCollateralPool: 10000,
        currentYesPrice: 10000 / 20000, // 0.5
        currentNoPrice: 10000 / 20000, // 0.5
        totalVolume: (Math.random() * 5000).toFixed(2),
        isLive: true,
        resolvesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        engagement: (Math.random() * 3).toFixed(2),
      };

      const createdMarket = await dbStorage.createMarket(market);
      console.log(`✅ Created market for ${kol.name}: ${createdMarket.title}`);
    }

    // Seed achievements
    const achievements: InsertAchievement[] = [
      {
        name: "First Bet",
        description: "Place your first bet on any market",
        icon: "🎯",
        category: "betting",
        requirement: JSON.stringify({ type: "total_bets", threshold: 1 }),
      },
      {
        name: "Betting Enthusiast",
        description: "Place 10 bets",
        icon: "🔥",
        category: "betting",
        requirement: JSON.stringify({ type: "total_bets", threshold: 10 }),
      },
      {
        name: "High Roller",
        description: "Place 50 bets",
        icon: "💎",
        category: "betting",
        requirement: JSON.stringify({ type: "total_bets", threshold: 50 }),
      },
      {
        name: "First Win",
        description: "Win your first bet",
        icon: "🏆",
        category: "betting",
        requirement: JSON.stringify({ type: "total_wins", threshold: 1 }),
      },
      {
        name: "Winning Streak",
        description: "Win 5 bets in a row",
        icon: "🔥",
        category: "streak",
        requirement: JSON.stringify({ type: "win_streak", threshold: 5 }),
      },
      {
        name: "Profitable Trader",
        description: "Earn 100 PTS in total profit",
        icon: "💰",
        category: "betting",
        requirement: JSON.stringify({ type: "total_profit", threshold: 100 }),
      },
      {
        name: "Market Master",
        description: "Earn 500 PTS in total profit",
        icon: "👑",
        category: "betting",
        requirement: JSON.stringify({ type: "total_profit", threshold: 500 }),
      },
      {
        name: "Volume Trader",
        description: "Trade 1000 PTS total volume",
        icon: "📊",
        category: "volume",
        requirement: JSON.stringify({ type: "total_volume", threshold: 1000 }),
      },
      {
        name: "Social Butterfly",
        description: "Get 10 followers",
        icon: "🦋",
        category: "social",
        requirement: JSON.stringify({ type: "followers", threshold: 10 }),
      },
      {
        name: "Influencer",
        description: "Get 50 followers",
        icon: "⭐",
        category: "social",
        requirement: JSON.stringify({ type: "followers", threshold: 50 }),
      },
    ];

    for (const achievement of achievements) {
      try {
        await dbStorage.createAchievement(achievement);
        console.log(`✅ Created achievement: ${achievement.name}`);
      } catch (error) {
        console.log(`ℹ️  Achievement "${achievement.name}" already exists`);
      }
    }

    // Seed FAQs
    const faqs: InsertFaq[] = [
      {
        question: "What is KOL Market?",
        answer: "KOL Market is a prediction market platform where you can bet on the performance of Key Opinion Leaders (KOLs). Trade on outcomes related to follower growth, engagement rates, and other social media metrics.",
        category: "getting_started",
        order: 1,
      },
      {
        question: "How do I place a bet?",
        answer: "Browse the available markets on the home page. Click on a market you're interested in, choose YES or NO position, enter your bet amount, and click Buy. Your bet will be placed immediately.",
        category: "betting",
        order: 2,
      },
      {
        question: "What are YES and NO positions?",
        answer: "When you buy YES, you're betting that the market outcome will be true. When you buy NO, you're betting it will be false. Prices adjust based on supply and demand using an automated market maker.",
        category: "betting",
        order: 3,
      },
      {
        question: "How does pricing work?",
        answer: "Markets use a constant product automated market maker (AMM). Prices adjust dynamically based on betting activity. The more people bet on one side, the more expensive that position becomes.",
        category: "betting",
        order: 4,
      },
      {
        question: "When do markets resolve?",
        answer: "Each market has a resolution date. Markets automatically resolve based on real KOL data scraped from kolscan.io. Winners receive 1 PTS per share, while losers receive nothing.",
        category: "betting",
        order: 5,
      },
      {
        question: "What is the platform fee?",
        answer: "We charge a 2% fee on buy orders to maintain the platform and ensure liquidity. There are no fees on sell orders.",
        category: "betting",
        order: 6,
      },
      {
        question: "Can I sell my position before resolution?",
        answer: "Yes! You can sell your shares at any time before the market resolves. The sell price depends on current market conditions and may be higher or lower than your purchase price.",
        category: "betting",
        order: 7,
      },
      {
        question: "How do I deposit SOL?",
        answer: "Go to the Wallet page and connect your Solana wallet. You'll receive a unique deposit address. Send SOL to this address and it will be credited to your account after confirmation.",
        category: "technical",
        order: 8,
      },
      {
        question: "How do I withdraw SOL?",
        answer: "Go to the Wallet page, enter your destination Solana address and withdrawal amount, then submit. Withdrawals are processed automatically within minutes.",
        category: "technical",
        order: 9,
      },
      {
        question: "What are KOLs?",
        answer: "KOLs (Key Opinion Leaders) are influential figures on social media. We track their performance metrics like follower count, engagement rate, and trading success on kolscan.io.",
        category: "kols",
        order: 10,
      },
    ];

    for (const faq of faqs) {
      try {
        await dbStorage.createFaq(faq);
        console.log(`✅ Created FAQ: ${faq.question}`);
      } catch (error) {
        console.error(`Error creating FAQ: ${error}`);
      }
    }

console.log("🎉 Database seeded successfully!");
} catch (error) {
  console.error(`Error seeding database: ${error}`);
  throw error;
}
}

export { seed };