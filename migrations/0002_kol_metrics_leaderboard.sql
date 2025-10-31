ALTER TABLE kol_metrics_history
  ADD COLUMN IF NOT EXISTS leaderboard_rank integer,
  ADD COLUMN IF NOT EXISTS leaderboard_wins integer,
  ADD COLUMN IF NOT EXISTS leaderboard_losses integer,
  ADD COLUMN IF NOT EXISTS leaderboard_sol_gain numeric(10, 2),
  ADD COLUMN IF NOT EXISTS leaderboard_usd_gain numeric(10, 2);
