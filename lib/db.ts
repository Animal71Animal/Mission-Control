/**
 * Mission Control v2 - Database Client
 * Uses better-sqlite3 for local SQLite (development / self-hosted)
 *
 * NOTE: This provides a promise-based shim over better-sqlite3's synchronous API
 * so the API routes (which use `await db.execute(...)`) work without changes.
 *
 * ⚠️  PRODUCTION NOTE:
 * Local SQLite does NOT work on Vercel serverless (ephemeral filesystem).
 * For production deployment you need one of:
 *   a) Vercel Postgres / Neon (change lib/db.ts + queries to use pg driver)
 *   b) PlanetScale / Turso with a working auth token
 *   c) A VPS / self-hosted server where the filesystem persists
 */

import Database from 'better-sqlite3';
import { resolve } from 'path';

// ─── Types (mirror @libsql/client's shape) ────────────────────────────────────

type SqlValue = string | number | boolean | null | Uint8Array;

interface ExecuteArgs {
  sql: string;
  args: SqlValue[];
}

interface ResultSet {
  rows: Record<string, SqlValue>[];
  rowsAffected: number;
  lastInsertRowid: number | bigint | null;
}

// ─── Singleton DB connection ──────────────────────────────────────────────────

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  const dbPath =
    process.env.DATABASE_URL?.replace(/^file:/, '') ??
    resolve(process.cwd(), 'mission-control.db');

  _db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  _db.pragma('journal_mode = WAL');
  // Enforce foreign keys
  _db.pragma('foreign_keys = ON');

  return _db;
}

// ─── Execute helper ───────────────────────────────────────────────────────────

function executeSync(query: string | ExecuteArgs): ResultSet {
  const sqlite = getDb();

  const sql = typeof query === 'string' ? query : query.sql;
  const args = typeof query === 'string' ? [] : (query.args ?? []);

  const stmt = sqlite.prepare(sql);

  if (/^\s*(SELECT|PRAGMA|WITH\s)/i.test(sql)) {
    const rows = stmt.all(...args) as Record<string, SqlValue>[];
    return { rows, rowsAffected: 0, lastInsertRowid: null };
  } else {
    const info = stmt.run(...args) as Database.RunResult;
    return {
      rows: [],
      rowsAffected: info.changes,
      lastInsertRowid: info.lastInsertRowid ?? null,
    };
  }
}

// ─── Public client (async façade matching @libsql/client) ────────────────────

export const db = {
  execute(query: string | ExecuteArgs): Promise<ResultSet> {
    return Promise.resolve(executeSync(query));
  },

  /** Run multiple statements in a transaction */
  batch(queries: (string | ExecuteArgs)[]): Promise<ResultSet[]> {
    const sqlite = getDb();
    const results: ResultSet[] = [];
    const tx = sqlite.transaction(() => {
      for (const q of queries) {
        results.push(executeSync(q));
      }
    });
    tx();
    return Promise.resolve(results);
  },

  /** Close the connection (useful for scripts) */
  close(): void {
    if (_db) {
      _db.close();
      _db = null;
    }
  },
};

export type { ResultSet, ExecuteArgs };
