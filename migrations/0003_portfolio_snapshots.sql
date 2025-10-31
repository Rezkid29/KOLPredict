-- Create portfolio_snapshots table and unique index
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bucket_at TIMESTAMPTZ NOT NULL,
  cash_balance DECIMAL(18,2) NOT NULL,
  equity_balance DECIMAL(18,2) NOT NULL,
  holdings_json JSONB,
  source TEXT NOT NULL DEFAULT 'on_demand',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ensure a user has only one snapshot per bucket time
CREATE UNIQUE INDEX IF NOT EXISTS portfolio_snapshots_user_bucket_idx
ON portfolio_snapshots (user_id, bucket_at);
