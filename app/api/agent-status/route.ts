import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ── SQLite import (available at runtime in Vercel if bundled, or local) ────
// We attempt better-sqlite3 first (sync, ideal for serverless).
// If unavailable, we gracefully fall back to reading the JSON snapshot.
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

const JSON_PATHS = [
  path.join(process.cwd(), "public", "data", "agent-status.json"),
  path.join(process.cwd(), "..", "..", "data", "agent-status.json"),
  path.join(process.cwd(), "..", "data", "agent-status.json"),
  path.join(process.cwd(), "data", "agent-status.json"),
  "/home/ubuntu/wlp/data/agent-status.json",
];

// ── Read from SQLite ─────────────────────────────────────────────────────────
function readFromSqlite(): object | null {
  const Database = tryRequireSqlite();
  if (!Database) return null;

  const dbPath = DB_PATHS.find((p) => fs.existsSync(p));
  if (!dbPath) return null;

  try {
    const db = new Database(dbPath, { readonly: true });

    // Verify tables exist
    const tables: { name: string }[] = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='agent_current_state'")
      .all();
    if (tables.length === 0) return null;

    const rows: {
      agent_name: string;
      total_completed: number;
      total_assigned: number;
      current_task: string | null;
      current_status: string;
      current_progress: number;
      blockers: string | null;
      availability_status: string;
      next_deadline: string | null;
      last_updated: string;
    }[] = db.prepare("SELECT * FROM agent_current_state ORDER BY agent_name").all();

    db.close();

    // Shape into the same JSON structure the frontend expects
    const agents: Record<string, object> = {};
    let totalCompleted = 0;
    let totalAssigned = 0;
    let tasksInProgress = 0;
    let blockedTasks = 0;
    let lastUpdate = "";

    // Agent metadata (discipline + model are static)
    const meta: Record<string, { name: string; discipline: string; model: string }> = {
      langostino: { name: "Langostino", discipline: "Marketing",      model: "abacus/claude-sonnet-4-6" },
      homard:     { name: "Homard",     discipline: "Finance",        model: "abacus/claude-haiku-4-5"  },
      clawdia:    { name: "Clawdia",    discipline: "Operations",     model: "abacus/claude-sonnet-4-6" },
      shelly:     { name: "Shelly",     discipline: "A&R/Artists",    model: "abacus/claude-sonnet-4-6" },
      rockwell:   { name: "Rockwell",   discipline: "Production",     model: "abacus/claude-sonnet-4-6" },
      barnaby:    { name: "Barnaby",    discipline: "Business Dev",   model: "abacus/claude-opus-4-6"   },
      sebastian:  { name: "Sebastian",  discipline: "Legal/Admin",    model: "abacus/claude-sonnet-4-6" },
      coral:      { name: "Coral",      discipline: "R&D/Innovation", model: "abacus/claude-opus-4-6"   },
    };

    for (const row of rows) {
      const m = meta[row.agent_name] ?? {
        name: row.agent_name,
        discipline: "Unknown",
        model: "unknown",
      };

      const blockersArr: string[] = row.blockers ? JSON.parse(row.blockers) : [];

      agents[row.agent_name] = {
        name:                 m.name,
        discipline:           m.discipline,
        model:                m.model,
        status:               row.current_status,
        totalTasksCompleted:  row.total_completed,
        totalTasksAssigned:   row.total_assigned,
        tasksInProgress:      row.current_status === "in-progress" ? 1 : 0,
        currentTask:          row.current_task,
        currentTaskStatus:    row.current_task ? row.current_status : null,
        currentTaskProgress:  row.current_progress,
        blockers:             blockersArr,
        lastUpdated:          row.last_updated,
        nextDeadline:         row.next_deadline,
        availabilityStatus:   row.availability_status,
      };

      totalCompleted += row.total_completed;
      totalAssigned  += row.total_assigned;
      if (row.availability_status === "in-progress") tasksInProgress++;
      if (row.availability_status === "blocked") blockedTasks++;
      if (!lastUpdate || row.last_updated > lastUpdate) lastUpdate = row.last_updated;
    }

    const statuses = rows.map((r) => r.availability_status);
    const teamAvailability =
      statuses.some((s) => s === "blocked")     ? "medium" :
      statuses.some((s) => s === "in-progress") ? "high"   : "high";

    return {
      source: "sqlite",
      agents,
      teamStats: {
        totalTasksCompleted: totalCompleted,
        totalTasksAssigned:  totalAssigned,
        tasksInProgress,
        blockedTasks,
        teamAvailability,
        lastTeamUpdate: lastUpdate,
      },
    };
  } catch (err) {
    console.error("[agent-status] SQLite read error:", err);
    return null;
  }
}

// ── Read from JSON (fallback) ─────────────────────────────────────────────────
function readFromJson(): object | null {
  for (const p of JSON_PATHS) {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, "utf-8"));
        return { source: "json-fallback", ...data };
      }
    } catch {
      // try next
    }
  }
  return null;
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const data = readFromSqlite() ?? readFromJson();

    if (!data) {
      return NextResponse.json(
        { error: "Agent status unavailable (SQLite + JSON both failed)" },
        { status: 503 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[agent-status] Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to read agent status" },
      { status: 500 }
    );
  }
}
