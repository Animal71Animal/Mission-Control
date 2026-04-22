/**
 * Mission Control - Agent Status Log API
 * Reads/writes agent_status_log table in mission-control.db
 * Fixed: was force-static (always returned empty). Now server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function tryRequireSqlite() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("better-sqlite3");
  } catch {
    return null;
  }
}

const DB_PATHS = [
  "/home/ubuntu/wlp/projects/mission-control/mission-control.db",
  path.join(process.cwd(), "mission-control.db"),
];

function openDb(readonly = false) {
  const Database = tryRequireSqlite();
  if (!Database) return null;
  const dbPath = DB_PATHS.find((p) => fs.existsSync(p));
  if (!dbPath) return null;
  const db = new Database(dbPath, { readonly });
  db.pragma("foreign_keys = ON");
  db.pragma("temp_store = MEMORY");
  return db;
}

// GET /api/agent-log?agent=clawdia&limit=50
export async function GET(request: NextRequest) {
  try {
    const db = openDb(true);
    if (!db) {
      return NextResponse.json({ entries: [], error: "DB unavailable" });
    }

    const agent = request.nextUrl.searchParams.get("agent");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "50"), 200);

    let entries;
    if (agent) {
      entries = db
        .prepare(
          "SELECT * FROM agent_status_log WHERE agent_name = ? ORDER BY timestamp DESC LIMIT ?"
        )
        .all(agent, limit);
    } else {
      entries = db
        .prepare("SELECT * FROM agent_status_log ORDER BY timestamp DESC LIMIT ?")
        .all(limit);
    }

    db.close();
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[GET /api/agent-log]", err);
    return NextResponse.json({ entries: [], error: String(err) }, { status: 500 });
  }
}

// POST /api/agent-log
// Body: { agent_name, task_name?, status, blockers?, updated_by? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_name, task_name, status, blockers, updated_by } = body;

    if (!agent_name || !status) {
      return NextResponse.json(
        { ok: false, error: "agent_name and status are required" },
        { status: 400 }
      );
    }

    const db = openDb(false);
    if (!db) {
      return NextResponse.json({ ok: false, error: "DB unavailable" }, { status: 503 });
    }

    const stmt = db.prepare(`
      INSERT INTO agent_status_log (agent_name, task_name, status, blockers, updated_by)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      agent_name,
      task_name ?? null,
      status,
      blockers ?? null,
      updated_by ?? "api"
    );

    db.close();
    return NextResponse.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("[POST /api/agent-log]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
