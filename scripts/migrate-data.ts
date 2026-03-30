/**
 * Mission Control v2 - Data Migration
 * Migrates existing JSON data into the local SQLite database
 * Uses better-sqlite3 (synchronous, transaction-based)
 * Run: npm run db:migrate
 */
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const rawUrl = process.env.DATABASE_URL ?? 'file:./mission-control.db';
const dbPath = rawUrl.replace(/^file:/, '');
const resolvedPath = resolve(process.cwd(), dbPath);

const db = new Database(resolvedPath);
db.pragma('foreign_keys = ON');

function readJson(filePath: string): any {
  try {
    return JSON.parse(readFileSync(resolve(process.cwd(), filePath), 'utf-8'));
  } catch (err) {
    console.warn(`  ⚠️  Could not read ${filePath}:`, (err as Error).message);
    return null;
  }
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── TASKS ────────────────────────────────────────────────────────────────────

function migrateTasks() {
  console.log('\n📋 Migrating tasks...');
  const data = readJson('public/data/tasks.json');
  if (!data) return;

  const allTasks = [
    ...(data.open || []).map((t: any) => ({ ...t, listStatus: 'open' })),
    ...(data.completed || []).map((t: any) => ({ ...t, listStatus: 'completed' })),
  ];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO tasks (id, title, owner, status, priority, notes, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const run = db.transaction(() => {
    let count = 0;
    for (const task of allTasks) {
      const status =
        task.status === 'done' || task.listStatus === 'completed' ? 'completed' : 'open';
      stmt.run(
        task.id || `task-${Date.now()}-${count}`,
        task.title,
        task.owner || 'animal',
        status,
        task.priority || 'medium',
        task.notes || null,
        task.createdAt || new Date().toISOString(),
        task.completedAt || (status === 'completed' ? new Date().toISOString() : null)
      );
      count++;
    }
    return count;
  });

  const count = run();
  console.log(`  ✅ ${count} tasks migrated`);
}

// ─── PERSONAL TASKS ───────────────────────────────────────────────────────────

function migratePersonalTasks() {
  console.log('\n📝 Migrating personal tasks...');
  const data = readJson('public/data/personal-tasks.json');
  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.log('  ℹ️  No personal tasks to migrate');
    return;
  }

  const tasks = Array.isArray(data) ? data : [];
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO personal_tasks (id, title, notes, category, priority, due_date, completed, created_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const run = db.transaction(() => {
    let count = 0;
    for (const task of tasks) {
      stmt.run(
        task.id || `pt-${Date.now()}-${count}`,
        task.title,
        task.notes || null,
        task.category || 'Other',
        task.priority || 'medium',
        task.dueDate || null,
        task.completed ? 1 : 0,
        task.createdAt || new Date().toISOString(),
        task.completedAt || null
      );
      count++;
    }
    return count;
  });

  const count = run();
  console.log(`  ✅ ${count} personal tasks migrated`);
}

// ─── TESLA SESSIONS ───────────────────────────────────────────────────────────

function migrateTeslaSessions() {
  console.log('\n🚗 Migrating Tesla charging sessions...');
  const data = readJson('public/data/tesla-charging.json');
  if (!data) return;

  const sessions = data.sessions || [];
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO tesla_sessions (id, date, time, location, kwh, cost, duration_minutes, rate_per_kwh, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const run = db.transaction(() => {
    let count = 0;
    for (const session of sessions) {
      const id = `tesla-${session.date.replace(/-/g, '')}-${count}`;
      stmt.run(
        id,
        session.date,
        session.time || null,
        session.location || 'Unknown',
        session.kwh,
        session.cost,
        session.duration_minutes || 0,
        session.rate_per_kwh || null,
        session.notes || null,
        new Date().toISOString()
      );
      count++;
    }
    return count;
  });

  const count = run();
  console.log(`  ✅ ${count} Tesla sessions migrated`);
}

// ─── SRB TIPS ─────────────────────────────────────────────────────────────────

function migrateSrbTips() {
  console.log('\n💰 Migrating SRB tips...');
  const data = readJson('public/data/srb-tips-data.json');
  if (!data) return;

  const nightlyData = data.nightlyData || {};

  const nightStmt = db.prepare(
    `INSERT OR IGNORE INTO srb_nights (id, date, month, total, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const entryStmt = db.prepare(
    `INSERT OR IGNORE INTO srb_entries (id, night_id, dancer_name, amount, tipper_name)
     VALUES (?, ?, ?, ?, ?)`
  );

  const monthMap: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04',
    May: '05', Jun: '06', Jul: '07', Aug: '08',
    Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };

  const run = db.transaction(() => {
    let nightCount = 0;
    let entryCount = 0;

    for (const [month, nights] of Object.entries(nightlyData) as [string, any[]][]) {
      for (const night of nights) {
        const nightId = `srb-${month.toLowerCase()}-${slugify(night.date)}`;

        let isoDate = '2026-01-01';
        try {
          const parts = night.date.split(' '); // ["Fri", "Jan", "2"]
          if (parts.length >= 3) {
            const m = monthMap[parts[1]] || '01';
            const d = parts[2].padStart(2, '0');
            isoDate = `2026-${m}-${d}`;
          }
        } catch {
          // keep default
        }

        nightStmt.run(nightId, isoDate, month, night.total || 0, null, new Date().toISOString());
        nightCount++;

        for (const dancer of night.dancers || []) {
          const entryId = `${nightId}-${slugify(dancer.name)}`;
          entryStmt.run(entryId, nightId, dancer.name, dancer.amount || 0, null);
          entryCount++;
        }
      }
    }

    return { nightCount, entryCount };
  });

  const { nightCount, entryCount } = run();
  console.log(`  ✅ ${nightCount} nights, ${entryCount} entries migrated`);
}

// ─── ARTIST ASSETS ────────────────────────────────────────────────────────────

function migrateArtistAssets() {
  console.log('\n🎨 Migrating artist assets...');

  const artists = ['Kade Rivers', 'Madison Blair', 'Aria Vale', 'ANIMAL'];
  const assetTypes = ['lyrics', 'audio', 'cover', 'social'];

  const stmt = db.prepare(
    `INSERT OR IGNORE INTO artist_assets (id, artist_name, asset_type, status, url, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const run = db.transaction(() => {
    let count = 0;
    for (const artist of artists) {
      for (const assetType of assetTypes) {
        const id = `asset-${slugify(artist)}-${assetType}`;
        stmt.run(id, artist, assetType, 'draft', null, null, new Date().toISOString());
        count++;
      }
    }
    return count;
  });

  const count = run();
  console.log(`  ✅ ${count} artist asset records created`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

console.log('🚀 Mission Control v2 - Data Migration');
console.log('='.repeat(50));
console.log(`📁 Database: ${resolvedPath}`);

migrateTasks();
migratePersonalTasks();
migrateTeslaSessions();
migrateSrbTips();
migrateArtistAssets();

db.close();
console.log('\n✨ Migration complete!');
console.log('All data has been imported into the local SQLite database.');
