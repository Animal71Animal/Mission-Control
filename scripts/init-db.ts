/**
 * Mission Control v2 - Database Schema Initialization
 * Uses better-sqlite3 (local SQLite file)
 * Run: npm run db:init
 */
import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const rawUrl = process.env.DATABASE_URL ?? 'file:./mission-control.db';
const dbPath = rawUrl.replace(/^file:/, '');
const resolvedPath = resolve(process.cwd(), dbPath);

console.log('🚀 Initializing Mission Control v2 database...');
console.log(`📁 Database path: ${resolvedPath}`);

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema: string[] = [
  // Tasks
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    category TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    started_at TEXT,
    duration_minutes INTEGER
  )`,

  // Personal Tasks
  `CREATE TABLE IF NOT EXISTS personal_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    notes TEXT,
    category TEXT DEFAULT 'Other',
    priority TEXT DEFAULT 'medium',
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  )`,

  // SRB Nights (nightly tip sessions)
  `CREATE TABLE IF NOT EXISTS srb_nights (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    month TEXT NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // SRB Entries (per-dancer per-night tips)
  `CREATE TABLE IF NOT EXISTS srb_entries (
    id TEXT PRIMARY KEY,
    night_id TEXT NOT NULL,
    dancer_name TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    tipper_name TEXT,
    FOREIGN KEY (night_id) REFERENCES srb_nights(id) ON DELETE CASCADE
  )`,

  // Tesla Charging Sessions
  `CREATE TABLE IF NOT EXISTS tesla_sessions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT NOT NULL,
    kwh REAL NOT NULL DEFAULT 0,
    cost REAL NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    rate_per_kwh REAL,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // Artist Assets
  `CREATE TABLE IF NOT EXISTS artist_assets (
    id TEXT PRIMARY KEY,
    artist_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    url TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
];

for (const sql of schema) {
  const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] ?? '?';
  try {
    db.exec(sql);
    console.log(`  ✅ Table: ${tableName}`);
  } catch (err) {
    console.error(`  ❌ Table ${tableName} failed:`, err);
    process.exit(1);
  }
}

db.close();
console.log('\n✨ Database initialized successfully!');
console.log('Next: run `npm run db:migrate` to import existing data');
