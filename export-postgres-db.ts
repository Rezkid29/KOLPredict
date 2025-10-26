
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./shared/schema";
import * as fs from "fs";

async function exportDatabase() {
  console.log("🔍 Connecting to PostgreSQL database...");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    const exportData: Record<string, any> = {};

    // Export users
    console.log("📊 Exporting users...");
    const users = await db.select().from(schema.users);
    exportData.users = users;
    console.log(`✅ Exported ${users.length} users`);

    // Export markets
    console.log("📊 Exporting markets...");
    const markets = await db.select().from(schema.markets);
    exportData.markets = markets;
    console.log(`✅ Exported ${markets.length} markets`);

    // Export bets
    console.log("📊 Exporting bets...");
    const bets = await db.select().from(schema.bets);
    exportData.bets = bets;
    console.log(`✅ Exported ${bets.length} bets`);

    // Export positions
    console.log("📊 Exporting positions...");
    const positions = await db.select().from(schema.positions);
    exportData.positions = positions;
    console.log(`✅ Exported ${positions.length} positions`);

    // Export scraped KOLs
    console.log("📊 Exporting scraped KOLs...");
    const scrapedKols = await db.select().from(schema.scrapedKols);
    exportData.scrapedKols = scrapedKols;
    console.log(`✅ Exported ${scrapedKols.length} scraped KOLs`);

    // Export follower cache
    console.log("📊 Exporting follower cache...");
    const followerCache = await db.select().from(schema.followerCache);
    exportData.followerCache = followerCache;
    console.log(`✅ Exported ${followerCache.length} follower cache entries`);

    // Export achievements
    console.log("📊 Exporting achievements...");
    const achievements = await db.select().from(schema.achievements);
    exportData.achievements = achievements;
    console.log(`✅ Exported ${achievements.length} achievements`);

    // Export notifications
    console.log("📊 Exporting notifications...");
    const notifications = await db.select().from(schema.notifications);
    exportData.notifications = notifications;
    console.log(`✅ Exported ${notifications.length} notifications`);

    // Export messages
    console.log("📊 Exporting messages...");
    const messages = await db.select().from(schema.messages);
    exportData.messages = messages;
    console.log(`✅ Exported ${messages.length} messages`);

    // Export follows
    console.log("📊 Exporting follows...");
    const follows = await db.select().from(schema.follows);
    exportData.follows = follows;
    console.log(`✅ Exported ${follows.length} follows`);

    // Export forum threads
    console.log("📊 Exporting forum threads...");
    const forumThreads = await db.select().from(schema.forumThreads);
    exportData.forumThreads = forumThreads;
    console.log(`✅ Exported ${forumThreads.length} forum threads`);

    // Export forum comments
    console.log("📊 Exporting forum comments...");
    const forumComments = await db.select().from(schema.forumComments);
    exportData.forumComments = forumComments;
    console.log(`✅ Exported ${forumComments.length} forum comments`);

    // Export Solana deposits
    console.log("📊 Exporting Solana deposits...");
    const solanaDeposits = await db.select().from(schema.solanaDeposits);
    exportData.solanaDeposits = solanaDeposits;
    console.log(`✅ Exported ${solanaDeposits.length} Solana deposits`);

    // Export Solana withdrawals
    console.log("📊 Exporting Solana withdrawals...");
    const solanaWithdrawals = await db.select().from(schema.solanaWithdrawals);
    exportData.solanaWithdrawals = solanaWithdrawals;
    console.log(`✅ Exported ${solanaWithdrawals.length} Solana withdrawals`);

    // Export platform fees
    console.log("📊 Exporting platform fees...");
    const platformFees = await db.select().from(schema.platformFees);
    exportData.platformFees = platformFees;
    console.log(`✅ Exported ${platformFees.length} platform fees`);

    // Convert to JSON
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Save to file
    const filename = `database-export-${Date.now()}.json`;
    fs.writeFileSync(filename, jsonData);
    console.log(`\n✅ Database exported successfully to ${filename}`);
    
    // Also print to console for copying
    console.log("\n📋 JSON Data (copy below):\n");
    console.log(jsonData);

  } catch (error) {
    console.error("❌ Error exporting database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

exportDatabase().catch(console.error);
