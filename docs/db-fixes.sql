-- ============================================================
-- Mission Control DB Fixes
-- Generated: 2026-04-22 by Clawdia (Operations Audit)
-- Apply: python3 -c "import sqlite3; conn=sqlite3.connect('mission-control.db'); conn.executescript(open('docs/db-fixes.sql').read()); conn.commit()"
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- SAFETY: Enable WAL + FK enforcement
-- ──────────────────────────────────────────────────────────────
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;

-- ──────────────────────────────────────────────────────────────
-- FIX C2: Repair SRB night totals (37/47 nights drifted)
-- Recomputes total from actual srb_entries for every night
-- ──────────────────────────────────────────────────────────────
UPDATE srb_nights
SET total = (
    SELECT COALESCE(SUM(e.amount), 0)
    FROM srb_entries e
    WHERE e.night_id = srb_nights.id
);

-- Verify: should return 0 rows after fix
-- SELECT id, total, (SELECT SUM(amount) FROM srb_entries WHERE night_id = srb_nights.id) as computed
-- FROM srb_nights WHERE total != (SELECT COALESCE(SUM(amount),0) FROM srb_entries WHERE night_id = srb_nights.id);

-- ──────────────────────────────────────────────────────────────
-- FIX W2: Add triggers to keep srb_nights.total accurate
-- ──────────────────────────────────────────────────────────────

-- After INSERT into srb_entries
CREATE TRIGGER IF NOT EXISTS trg_srb_entries_insert
AFTER INSERT ON srb_entries
BEGIN
    UPDATE srb_nights
    SET total = (SELECT COALESCE(SUM(amount), 0) FROM srb_entries WHERE night_id = NEW.night_id)
    WHERE id = NEW.night_id;
END;

-- After UPDATE of amount in srb_entries
CREATE TRIGGER IF NOT EXISTS trg_srb_entries_update
AFTER UPDATE OF amount ON srb_entries
BEGIN
    UPDATE srb_nights
    SET total = (SELECT COALESCE(SUM(amount), 0) FROM srb_entries WHERE night_id = NEW.night_id)
    WHERE id = NEW.night_id;
    -- Also update old night if night_id changed
    UPDATE srb_nights
    SET total = (SELECT COALESCE(SUM(amount), 0) FROM srb_entries WHERE night_id = OLD.night_id)
    WHERE id = OLD.night_id AND OLD.night_id != NEW.night_id;
END;

-- After DELETE from srb_entries
CREATE TRIGGER IF NOT EXISTS trg_srb_entries_delete
AFTER DELETE ON srb_entries
BEGIN
    UPDATE srb_nights
    SET total = (SELECT COALESCE(SUM(amount), 0) FROM srb_entries WHERE night_id = OLD.night_id)
    WHERE id = OLD.night_id;
END;

-- ──────────────────────────────────────────────────────────────
-- FIX W3: Drop redundant index (agent_name IS the PK)
-- ──────────────────────────────────────────────────────────────
DROP INDEX IF EXISTS idx_state_agent;

-- ──────────────────────────────────────────────────────────────
-- FIX O1: Add missing indexes for common query patterns
-- ──────────────────────────────────────────────────────────────

-- srb_entries lookup by night (most common SRB query)
CREATE INDEX IF NOT EXISTS idx_srb_entries_night_id 
ON srb_entries(night_id);

-- srb_nights filtered by month (monthly summary queries)
CREATE INDEX IF NOT EXISTS idx_srb_nights_month 
ON srb_nights(month);

-- srb_nights ordered by date (chronological listing)
CREATE INDEX IF NOT EXISTS idx_srb_nights_date 
ON srb_nights(date);

-- tesla_sessions by date range
CREATE INDEX IF NOT EXISTS idx_tesla_date 
ON tesla_sessions(date);

-- tasks by owner + status (most common task query)
CREATE INDEX IF NOT EXISTS idx_tasks_owner_status 
ON tasks(owner, status);

-- artist_assets by artist name
CREATE INDEX IF NOT EXISTS idx_assets_artist 
ON artist_assets(artist_name);

-- agent_status_log composite: agent + timestamp (for log history queries)
CREATE INDEX IF NOT EXISTS idx_log_agent_time 
ON agent_status_log(agent_name, timestamp DESC);

-- ──────────────────────────────────────────────────────────────
-- FIX O5: Add log retention cleanup (keep last 90 days)
-- Run this periodically (or add to cron)
-- ──────────────────────────────────────────────────────────────
-- DELETE FROM agent_status_log 
-- WHERE timestamp < datetime('now', '-90 days');

-- ──────────────────────────────────────────────────────────────
-- DOCUMENT dead tables (no data changes, just comments via views)
-- These tables exist but GitHub JSON is the live source of truth
-- ──────────────────────────────────────────────────────────────
-- personal_tasks  → live data: public/data/personal-tasks.json
-- tasks           → live data: public/data/tasks.json  
-- tesla_sessions  → live data: public/data/tesla-charging.json (9 sessions ahead)
-- artist_assets   → live data: public/data/artist-assets.json (5 assets ahead)

-- ──────────────────────────────────────────────────────────────
-- USEFUL VIEWS (add for future query convenience)
-- ──────────────────────────────────────────────────────────────

-- SRB monthly summary view
CREATE VIEW IF NOT EXISTS v_srb_monthly AS
SELECT 
    month,
    COUNT(DISTINCT id)       AS nights,
    SUM(total)               AS month_total,
    AVG(total)               AS avg_per_night,
    MAX(total)               AS best_night,
    MIN(date)                AS first_date,
    MAX(date)                AS last_date
FROM srb_nights
GROUP BY month
ORDER BY month DESC;

-- SRB dancer leaderboard view
CREATE VIEW IF NOT EXISTS v_srb_dancer_totals AS
SELECT 
    dancer_name,
    COUNT(*)                 AS nights_worked,
    SUM(amount)              AS total_tips,
    AVG(amount)              AS avg_per_entry,
    MAX(amount)              AS best_tip,
    COUNT(CASE WHEN amount = 0 THEN 1 END) AS zero_entries
FROM srb_entries
GROUP BY dancer_name
ORDER BY total_tips DESC;

-- Agent status summary view
CREATE VIEW IF NOT EXISTS v_agent_summary AS
SELECT
    agent_name,
    current_status,
    availability_status,
    total_completed,
    total_assigned,
    CASE 
        WHEN total_assigned > 0 
        THEN ROUND(100.0 * total_completed / total_assigned, 1)
        ELSE 0 
    END AS completion_pct,
    current_task,
    last_updated
FROM agent_current_state
ORDER BY agent_name;

-- ──────────────────────────────────────────────────────────────
-- CHECKPOINT WAL (clean state after all changes)
-- ──────────────────────────────────────────────────────────────
PRAGMA wal_checkpoint(TRUNCATE);
