ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_hash" text,
  ADD COLUMN IF NOT EXISTS "password_updated_at" timestamp,
  ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;