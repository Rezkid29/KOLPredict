
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as fs from "fs";
import * as schema from "./shared/schema";

async function generateSQLDump() {
  console.log("🔍 Connecting to PostgreSQL database...");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    const dumpFile = fs.createWriteStream("database_dump.sql");
    
    // Write header
    dumpFile.write("-- PostgreSQL Database Dump\n");
    dumpFile.write(`-- Generated on ${new Date().toISOString()}\n\n`);
    dumpFile.write("-- Disable triggers and constraints during import\n");
    dumpFile.write("SET session_replication_role = 'replica';\n\n");

    // Helper function to escape SQL strings
    const escapeSQLString = (value: any): string => {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'number') return value.toString();
      if (value instanceof Date) return `'${value.toISOString()}'`;
      // Escape single quotes by doubling them
      const escaped = String(value).replace(/'/g, "''");
      return `'${escaped}'`;
    };

    // Define table order (respecting foreign key dependencies)
    const tableOrder = [
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

    for (const { name, schema: tableSchema } of tableOrder) {
      console.log(`📊 Dumping table: ${name}...`);
      
      try {
        const rows = await db.select().from(tableSchema as any);
        
        if (rows.length === 0) {
          console.log(`   ⚠️  Table ${name} is empty, skipping...`);
          continue;
        }

        dumpFile.write(`-- Table: ${name}\n`);
        dumpFile.write(`-- Rows: ${rows.length}\n\n`);

        // Generate INSERT statements in batches
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          
          if (batch.length === 0) continue;

          // Get column names from first row
          const columns = Object.keys(batch[0]);
          const columnList = columns.join(', ');

          for (const row of batch) {
            const values = columns.map(col => escapeSQLString(row[col])).join(', ');
            dumpFile.write(`INSERT INTO ${name} (${columnList}) VALUES (${values});\n`);
          }
        }

        dumpFile.write('\n');
        console.log(`   ✅ Exported ${rows.length} rows from ${name}`);
        
      } catch (error) {
        console.error(`   ❌ Error dumping table ${name}:`, error);
        dumpFile.write(`-- ERROR dumping table ${name}: ${error}\n\n`);
      }
    }

    // Re-enable triggers and constraints
    dumpFile.write("-- Re-enable triggers and constraints\n");
    dumpFile.write("SET session_replication_role = 'origin';\n\n");
    dumpFile.write("-- End of dump\n");

    dumpFile.end();

    console.log(`\n✅ SQL dump completed successfully!`);
    console.log(`📄 File saved as: database_dump.sql`);
    console.log(`\n💡 To restore this dump, run:`);
    console.log(`   psql $DATABASE_URL < database_dump.sql`);

  } catch (error) {
    console.error("❌ Error generating SQL dump:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateSQLDump().catch(console.error);
