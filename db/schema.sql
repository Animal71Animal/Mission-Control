-- SQLite schema for Mission Control
-- Run this to initialize the database

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  owner TEXT NOT NULL DEFAULT 'animal',
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TEXT NOT NULL,
  completed_at TEXT
);

-- Tesla charging sessions
CREATE TABLE IF NOT EXISTS charging_sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT,
  duration_minutes INTEGER,
  rate_per_kwh REAL,
  cost REAL NOT NULL,
  kwh REAL NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Personal tasks (browser-synced, but backup here)
CREATE TABLE IF NOT EXISTS personal_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  notes TEXT,
  category TEXT NOT NULL DEFAULT 'Personal',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT,
  completed BOOLEAN NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

-- YouTube episodes
CREATE TABLE IF NOT EXISTS youtube_episodes (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TEXT NOT NULL,
  summary TEXT,
  key_takeaways TEXT, -- JSON array
  topic_breakdown TEXT, -- JSON array
  tools_covered TEXT, -- JSON array
  topics TEXT, -- JSON array
  processed_at TEXT
);

-- SRB Tips data
CREATE TABLE IF NOT EXISTS srb_tips (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  dancer_name TEXT,
  amount REAL NOT NULL,
  shift TEXT,
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Insert existing Tesla data
INSERT OR IGNORE INTO charging_sessions (id, date, time, duration_minutes, rate_per_kwh, cost, kwh, location, notes, created_at)
VALUES 
  ('session-001', '2026-03-28', '20:45', 50, 0.18, 14.92, 82.92, 'North Orchard St', '', datetime('now'));

-- Insert existing tasks
INSERT OR IGNORE INTO tasks (id, title, notes, owner, status, priority, created_at)
VALUES 
  ('T1', 'Fill weekly tip data from Google Sheets to SRB Tips', NULL, 'animal', 'pending', 'medium', datetime('now')),
  ('T3', 'Install NI plugins (Kontakt, Reaktor, Massive)', NULL, 'animal', 'pending', 'medium', datetime('now')),
  ('T4', 'Download free plugins (MJUCjr, TAL NoiseMaker, Bass Station, DrumTROOP)', NULL, 'animal', 'pending', 'low', datetime('now')),
  ('T5', 'TikTok handles / Postiz setup (5 accounts)', 'Strategy doc ready: wlp/projects/ai-artists/tiktok-social-strategy.md — Eric needs to create accounts', 'animal', 'pending', 'medium', datetime('now')),
  ('T6', 'Social media accounts for Kade, Madison, Aria', 'Bio copy + handle targets ready in tiktok-social-strategy.md', 'animal', 'pending', 'medium', datetime('now')),
  ('T7', 'Artist Spotify pages for Kade, Madison, Aria', 'Setup guide ready: wlp/projects/ai-artists/spotify-setup-guide.md — Eric needs DistroKid account + first tracks', 'animal', 'pending', 'high', datetime('now')),
  ('T9', 'Make Tailscale + node auto-reconnect persistent', NULL, 'priscylla', 'pending', 'low', datetime('now'));
