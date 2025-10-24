import { dbStorage } from "./db-storage";
import type { InsertKol, InsertMarket, InsertUser } from "@shared/schema";

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
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=sarah`,
        followers: 125000,
        engagementRate: "4.8",
        tier: "Elite",
        trending: true,
        trendingPercent: "12.5",
      },
      {
        name: "Alex Morgan",
        handle: "alexmorgan",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=alex`,
        followers: 89000,
        engagementRate: "3.2",
        tier: "Rising",
        trending: true,
        trendingPercent: "8.3",
      },
      {
        name: "Jordan Lee",
        handle: "jordanlee",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=jordan`,
        followers: 210000,
        engagementRate: "5.6",
        tier: "Elite",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Taylor Swift",
        handle: "taylorswift",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=taylor`,
        followers: 340000,
        engagementRate: "6.2",
        tier: "Legendary",
        trending: true,
        trendingPercent: "15.7",
      },
      {
        name: "Chris Evans",
        handle: "chrisevans",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=chris`,
        followers: 56000,
        engagementRate: "2.9",
        tier: "Growing",
        trending: false,
        trendingPercent: null,
      },
      {
        name: "Emma Watson",
        handle: "emmawatson",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=emma`,
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
        yesPool: "10000.00",
        noPool: "10000.00",
        yesPrice: "0.5000",
        noPrice: "0.5000",
        totalVolume: (Math.random() * 5000).toFixed(2),
        isLive: true,
        resolvesAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        engagement: (Math.random() * 3).toFixed(2),
      };

      const createdMarket = await dbStorage.createMarket(market);
      console.log(`✅ Created market for ${kol.name}: ${createdMarket.title}`);
    }

    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export { seed };

// Run seed if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}