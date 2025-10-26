
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as fs from "fs";
import * as schema from "./shared/schema";

async function exportDatabaseToJSON() {
  console.log("🔍 Connecting to PostgreSQL database...");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    // Create export directory
    const exportDir = "database-json-export";
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // Define tables to export
    const tables = [
      { name: 'users', schema: schema.users },
      { name: 'kols', schema: schema.kols },
      { name: 'markets', schema: schema.markets },
      { name: 'bets', schema: schema.bets },
      { name: 'positions', schema: schema.positions },
      { name: 'comments', schema: schema.comments },
      { name: 'transactions', schema: schema.transactions },
      { name: 'kol_metrics_history', schema: schema.kolMetricsHistory },
      { name: 'scraped_kols', schema: schema.scrapedKols },
      { name: 'follower_cache', schema: schema.followerCache },
      { name: 'market_metadata', schema: schema.marketMetadata },
      { name: 'solana_deposits', schema: schema.solanaDeposits },
      { name: 'solana_withdrawals', schema: schema.solanaWithdrawals },
      { name: 'platform_fees', schema: schema.platformFees },
      { name: 'user_profiles', schema: schema.userProfiles },
      { name: 'user_follows', schema: schema.userFollows },
      { name: 'activities', schema: schema.activities },
      { name: 'conversations', schema: schema.conversations },
      { name: 'messages', schema: schema.messages },
      { name: 'forum_threads', schema: schema.forumThreads },
      { name: 'forum_comments', schema: schema.forumComments },
      { name: 'forum_thread_votes', schema: schema.forumThreadVotes },
      { name: 'forum_comment_votes', schema: schema.forumCommentVotes },
      { name: 'notifications', schema: schema.notifications },
      { name: 'achievements', schema: schema.achievements },
      { name: 'user_achievements', schema: schema.userAchievements },
      { name: 'faqs', schema: schema.faqs },
    ];

    const allData: Record<string, any[]> = {};
    let totalRecords = 0;

    for (const { name, schema: tableSchema } of tables) {
      console.log(`📊 Exporting table: ${name}...`);
      
      try {
        const rows = await db.select().from(tableSchema as any);
        
        if (rows.length === 0) {
          console.log(`   ⚠️  Table ${name} is empty, skipping...`);
          continue;
        }

        // Write individual table JSON file
        const jsonContent = JSON.stringify(rows, null, 2);
        const filePath = `${exportDir}/${name}.json`;
        fs.writeFileSync(filePath, jsonContent);
        
        // Add to combined export
        allData[name] = rows;
        totalRecords += rows.length;

        console.log(`   ✅ Exported ${rows.length} rows to ${name}.json`);
        
      } catch (error) {
        console.error(`   ❌ Error exporting table ${name}:`, error);
      }
    }

    // Write combined JSON file with all tables
    const combinedPath = `${exportDir}/complete-database.json`;
    fs.writeFileSync(combinedPath, JSON.stringify(allData, null, 2));
    console.log(`\n📦 Combined export: ${combinedPath}`);

    // Write JSONL file (one JSON object per line) - useful for large datasets
    const jsonlPath = `${exportDir}/complete-database.jsonl`;
    const jsonlStream = fs.createWriteStream(jsonlPath);
    
    for (const [tableName, rows] of Object.entries(allData)) {
      for (const row of rows) {
        jsonlStream.write(JSON.stringify({ table: tableName, data: row }) + '\n');
      }
    }
    jsonlStream.end();
    console.log(`📄 JSONL export: ${jsonlPath}`);

    // Create metadata file
    const metadata = {
      exportDate: new Date().toISOString(),
      totalTables: Object.keys(allData).length,
      totalRecords: totalRecords,
      tables: Object.entries(allData).map(([name, rows]) => ({
        name,
        recordCount: rows.length
      }))
    };
    
    fs.writeFileSync(
      `${exportDir}/export-metadata.json`,
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\n✅ JSON export completed successfully!`);
    console.log(`📁 Export location: ${exportDir}/`);
    console.log(`📊 Total tables exported: ${Object.keys(allData).length}`);
    console.log(`📝 Total records exported: ${totalRecords}`);
    console.log(`\n💡 Files created:`);
    console.log(`   • Individual table files: ${exportDir}/<table_name>.json`);
    console.log(`   • Combined export: ${exportDir}/complete-database.json`);
    console.log(`   • JSONL export: ${exportDir}/complete-database.jsonl`);
    console.log(`   • Metadata: ${exportDir}/export-metadata.json`);

  } catch (error) {
    console.error("❌ Error exporting database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

exportDatabaseToJSON().catch(console.error);
