-- Manual resolution queue table
CREATE TABLE IF NOT EXISTS manual_resolution_queue (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id varchar NOT NULL REFERENCES markets(id),
  market_type text NOT NULL,
  reason text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

-- Helpful index for admin listing
CREATE INDEX IF NOT EXISTS idx_manual_resolution_queue_created_at ON manual_resolution_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_resolution_queue_market_id ON manual_resolution_queue(market_id);
