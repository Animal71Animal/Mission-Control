import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

const LOCAL_JSON_PATHS = [
  path.join(process.cwd(), "public", "data", "agent-status.json"),
  "/home/ubuntu/wlp/data/agent-status.json",
];

// ── Read from GitHub API ──────────────────────────────────────────────────────
async function readFromGitHub(): Promise<object | null> {
  try {
    const res = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: ghHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const raw = await res.json();
    const decoded = JSON.parse(Buffer.from(raw.content, 'base64').toString('utf-8'));
    return { source: 'github', ...decoded };
  } catch {
    return null;
  }
}

// ── Read from JSON (local fallback) ───────────────────────────────────────────
function readFromJson(): object | null {
  for (const p of LOCAL_JSON_PATHS) {
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

// ── Write to GitHub API ───────────────────────────────────────────────────────
async function writeToGitHub(data: object): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.error('[agent-status] No GITHUB_TOKEN available for write');
    return false;
  }

  try {
    // First, get the current file to get its SHA
    const getRes = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: ghHeaders(),
      cache: 'no-store',
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    // Prepare the content
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    // Create/update the file
    const body: Record<string, string> = {
      message: `Update agent-status.json - ${new Date().toISOString()}`,
      content,
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(GITHUB_API_URL, {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const error = await putRes.text();
      console.error('[agent-status] GitHub write failed:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[agent-status] GitHub write error:', err);
    return false;
  }
}

// ── Write to local JSON (fallback) ────────────────────────────────────────────
function writeToJson(data: object): boolean {
  try {
    const localPath = LOCAL_JSON_PATHS[0];
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('[agent-status] Local JSON write error:', err);
    return false;
  }
}

// ── GET handler ───────────────────────────────────────────────────────────────
export async function GET() {
  try {
    // Try GitHub first, then local fallback
    const data = await readFromGitHub() ?? readFromJson();

    if (!data) {
      return NextResponse.json(
        { error: "Agent status unavailable (GitHub + JSON both failed)" },
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

// ── POST handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the body has the expected structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Ensure we have agents and teamStats
    if (!body.agents || !body.teamStats) {
      return NextResponse.json(
        { error: "Missing required fields: agents, teamStats" },
        { status: 400 }
      );
    }

    // Strip source field if present (internal metadata)
    const dataToWrite = {
      agents: body.agents,
      teamStats: body.teamStats,
    };

    // Try GitHub first, fall back to local
    const success = await writeToGitHub(dataToWrite) || writeToJson(dataToWrite);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to write agent status (GitHub + local both failed)" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      source: GITHUB_TOKEN ? 'github' : 'local',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[agent-status] POST error:", error);
    return NextResponse.json(
      { error: "Failed to write agent status" },
      { status: 500 }
    );
  }
}

// ── PATCH handler (partial update) ────────────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const updates = await request.json();
    
    // Read current data
    const currentData = await readFromGitHub() ?? readFromJson();
    
    if (!currentData) {
      return NextResponse.json(
        { error: "Could not read current agent status" },
        { status: 503 }
      );
    }

    // Remove source field if present
    const { source, ...current } = currentData as Record<string, unknown>;

    // Merge updates
    const mergedData = {
      ...current,
      ...updates,
      // Deep merge agents if provided
      agents: updates.agents 
        ? { ...(current.agents as object), ...(updates.agents as object) }
        : current.agents,
      teamStats: updates.teamStats
        ? { ...(current.teamStats as object), ...(updates.teamStats as object) }
        : current.teamStats,
    };

    // Write back
    const success = await writeToGitHub(mergedData) || writeToJson(mergedData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to write agent status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      source: GITHUB_TOKEN ? 'github' : 'local',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[agent-status] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to patch agent status" },
      { status: 500 }
    );
  }
}
