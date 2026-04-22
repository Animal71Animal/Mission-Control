/**
 * Mission Control v2 - Database Client (ARCHIVED)
 *
 * ⚠️ DEPRECATED: This file is kept for reference only.
 * Mission Control now uses GitHub JSON API as the source of truth.
 * All agent status and task data is stored in public/data/*.json files.
 *
 * Previous SQLite implementation has been archived.
 * See: app/api/agent-status/route.ts for the new GitHub-based implementation.
 */

// No-op implementation - all data now lives in GitHub JSON
export const db = {
  execute: async () => ({ rows: [], rowsAffected: 0, lastInsertRowid: null }),
  batch: async () => [],
  close: () => {},
};

export type { ResultSet, ExecuteArgs } from './types';

interface ResultSet {
  rows: Record<string, unknown>[];
  rowsAffected: number;
  lastInsertRowid: number | bigint | null;
}

interface ExecuteArgs {
  sql: string;
  args: (string | number | boolean | null | Uint8Array)[];
}
