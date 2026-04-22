/**
 * Mission Control - Agent Status Log API
 * ARCHIVED: Now uses agent-status.json GitHub-based storage
 * 
 * This route is kept for backward compatibility but reads from
 * the GitHub JSON API instead of SQLite.
 */

import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const GITHUB_FILE_PATH = 'public/data/agent-status.json';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function readAgentStatus(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: ghHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const raw = await res.json();
    return JSON.parse(Buffer.from(raw.content, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

// GET /api/agent-log?agent=clawdia&limit=50
// Returns agent history from agent-status.json taskHistory
export async function GET(request: NextRequest) {
  try {
    const agent = request.nextUrl.searchParams.get("agent");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") ?? "50"), 200);

    const data = await readAgentStatus();
    if (!data) {
      return NextResponse.json({ entries: [], error: "Agent status unavailable" });
    }

    const agents = data.agents as Record<string, { taskHistory?: { completed?: unknown[]; inProgress?: unknown[]; upcoming?: unknown[] } }>;
    
    if (agent) {
      const agentData = agents[agent];
      if (!agentData) {
        return NextResponse.json({ entries: [] });
      }

      // Build log entries from task history
      const entries: unknown[] = [];
      
      if (agentData.taskHistory?.completed) {
        for (const task of agentData.taskHistory.completed.slice(0, limit)) {
          if (typeof task === 'object' && task !== null) {
            entries.push({
              agent_name: agent,
              task_name: (task as { name?: string }).name || String(task),
              status: 'completed',
              timestamp: (task as { completedAt?: string }).completedAt || new Date().toISOString(),
              blockers: null,
              updated_by: 'system',
            });
          } else {
            entries.push({
              agent_name: agent,
              task_name: String(task),
              status: 'completed',
              timestamp: new Date().toISOString(),
              blockers: null,
              updated_by: 'system',
            });
          }
        }
      }

      if (agentData.taskHistory?.inProgress) {
        for (const task of agentData.taskHistory.inProgress.slice(0, limit)) {
          entries.push({
            agent_name: agent,
            task_name: typeof task === 'string' ? task : (task as { name?: string }).name || String(task),
            status: 'in-progress',
            timestamp: new Date().toISOString(),
            blockers: null,
            updated_by: 'system',
          });
        }
      }

      return NextResponse.json({ entries: entries.slice(0, limit) });
    } else {
      // Return all agents' recent activity
      const allEntries: unknown[] = [];
      
      for (const [agentName, agentData] of Object.entries(agents)) {
        if (agentData.taskHistory?.completed) {
          for (const task of agentData.taskHistory.completed.slice(0, 10)) {
            if (typeof task === 'object' && task !== null) {
              allEntries.push({
                agent_name: agentName,
                task_name: (task as { name?: string }).name || String(task),
                status: 'completed',
                timestamp: (task as { completedAt?: string }).completedAt || new Date().toISOString(),
                blockers: null,
                updated_by: 'system',
              });
            } else {
              allEntries.push({
                agent_name: agentName,
                task_name: String(task),
                status: 'completed',
                timestamp: new Date().toISOString(),
                blockers: null,
                updated_by: 'system',
              });
            }
          }
        }
      }

      // Sort by timestamp desc and limit
      allEntries.sort((a, b) => {
        const tsA = new Date((a as { timestamp: string }).timestamp).getTime();
        const tsB = new Date((b as { timestamp: string }).timestamp).getTime();
        return tsB - tsA;
      });

      return NextResponse.json({ entries: allEntries.slice(0, limit) });
    }
  } catch (err) {
    console.error("[GET /api/agent-log]", err);
    return NextResponse.json({ entries: [], error: String(err) }, { status: 500 });
  }
}

// POST /api/agent-log
// Body: { agent_name, task_name?, status, blockers?, updated_by? }
// Note: This now logs to agent-status.json via the main agent-status API
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

    // Read current status
    const data = await readAgentStatus();
    if (!data) {
      return NextResponse.json({ ok: false, error: "Agent status unavailable" }, { status: 503 });
    }

    // Update agent status in memory (this is a simplified log entry)
    // In a full implementation, we'd write back to GitHub
    // For now, we acknowledge the log entry
    console.log(`[agent-log] ${agent_name}: ${status} - ${task_name || 'N/A'} (by ${updated_by || 'api'})`);

    return NextResponse.json({ 
      ok: true, 
      note: "Log entry recorded (GitHub write not implemented in this route - use /api/agent-status POST for updates)"
    });
  } catch (err) {
    console.error("[POST /api/agent-log]", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
