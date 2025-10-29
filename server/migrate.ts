import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export async function runMigrations() {
  console.log("🔍 Checking DATABASE_URL...");
  
  // Try to get DATABASE_URL or construct from PG* variables
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
    if (PGUSER && PGPASSWORD && PGHOST && PGPORT && PGDATABASE) {
      connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
      console.log("✅ Constructed DATABASE_URL from PG* variables");
    } else {
      console.error("❌ DATABASE_URL not found and unable to construct from PG* variables");
      console.error("Available:", { PGUSER: !!PGUSER, PGHOST: !!PGHOST, PGPORT: !!PGPORT, PGDATABASE: !!PGDATABASE });
      throw new Error("DATABASE_URL is not set - ensure database is provisioned");
    }
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log("🔄 Creating database tables...");

  try {
    // Create tables using raw SQL
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
        total_bets INTEGER NOT NULL DEFAULT 0,
        total_wins INTEGER NOT NULL DEFAULT 0,
        total_profit DECIMAL(10, 2) NOT NULL DEFAULT 0.00
      );

      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS referrer_id VARCHAR REFERENCES users(id);

      CREATE TABLE IF NOT EXISTS kols (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        handle TEXT NOT NULL UNIQUE,
        avatar TEXT NOT NULL,
        followers INTEGER NOT NULL,
        engagement_rate DECIMAL(5, 2) NOT NULL,
        tier TEXT NOT NULL,
        trending BOOLEAN NOT NULL DEFAULT false,
        trending_percent DECIMAL(5, 2)
      );

      CREATE TABLE IF NOT EXISTS markets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        kol_id VARCHAR NOT NULL REFERENCES kols(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        outcome TEXT NOT NULL,
        price DECIMAL(10, 4) NOT NULL,
        supply INTEGER NOT NULL DEFAULT 0,
        total_volume DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        is_live BOOLEAN NOT NULL DEFAULT true,
        resolves_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        engagement DECIMAL(5, 2) NOT NULL DEFAULT 0.00
      );

      CREATE TABLE IF NOT EXISTS bets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        market_id VARCHAR NOT NULL REFERENCES markets(id),
        type TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        price DECIMAL(10, 4) NOT NULL,
        shares INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        profit DECIMAL(10, 2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        market_id VARCHAR NOT NULL REFERENCES markets(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        balance_after DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- User profiles required by social/messaging UI
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
        bio TEXT,
        avatar_url TEXT,
        total_bets INTEGER NOT NULL DEFAULT 0,
        total_wins INTEGER NOT NULL DEFAULT 0,
        total_losses INTEGER NOT NULL DEFAULT 0,
        total_volume DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
        profit_loss DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
        win_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
        roi DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        followers_count INTEGER NOT NULL DEFAULT 0,
        following_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      -- Conversations and messages for direct messaging
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user1_id VARCHAR NOT NULL REFERENCES users(id),
        user2_id VARCHAR NOT NULL REFERENCES users(id),
        last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id VARCHAR NOT NULL REFERENCES conversations(id),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS kol_metrics_history (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        kol_id VARCHAR NOT NULL REFERENCES kols(id),
        followers INTEGER NOT NULL,
        engagement_rate DECIMAL(5, 2) NOT NULL,
        trending BOOLEAN NOT NULL DEFAULT false,
        trending_percent DECIMAL(5, 2),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log("✅ Tables created successfully!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}
