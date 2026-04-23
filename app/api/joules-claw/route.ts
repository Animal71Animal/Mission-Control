import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const GITHUB_FILE_PATH = 'public/data/joules-claw.json';
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
  path.join(process.cwd(), "public", "data", "joules-claw.json"),
  "/home/ubuntu/wlp/projects/mission-control/public/data/joules-claw.json",
];

interface Video {
  id: string;
  title: string;
  url: string;
  channel: string;
  addedAt: string;
  addedBy: string;
  episodeNumber?: number;
  publishedDate?: string;
}

interface Pairing {
  code: string;
  telegramId: string;
  telegramUsername?: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

interface JoulesClaw {
  videos: Video[];
  pairings: Pairing[];
  lastUpdated: string;
}

// ── Read from GitHub API ──────────────────────────────────────────────────────
async function readFromGitHub(): Promise<JoulesClaw | null> {
  try {
    const res = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: ghHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const raw = await res.json();
    const decoded = JSON.parse(Buffer.from(raw.content, 'base64').toString('utf-8'));
    return decoded;
  } catch {
    return null;
  }
}

// ── Read from JSON (local fallback) ───────────────────────────────────────────
function readFromJson(): JoulesClaw | null {
  for (const p of LOCAL_JSON_PATHS) {
    try {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, "utf-8"));
        return data;
      }
    } catch {
      // try next
    }
  }
  return null;
}

// ── Write to GitHub API ───────────────────────────────────────────────────────
async function writeToGitHub(data: JoulesClaw): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.error('[joules-claw] No GITHUB_TOKEN available for write');
    return false;
  }

  try {
    const getRes = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
      headers: ghHeaders(),
      cache: 'no-store',
    });

    let sha: string | undefined;
    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    }

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    const body: Record<string, string> = {
      message: `Update joules-claw.json - ${new Date().toISOString()}`,
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
      console.error('[joules-claw] GitHub write failed:', error);
      return false;
    }

    console.log('[joules-claw] Successfully wrote to GitHub');
    return true;
  } catch (err) {
    console.error('[joules-claw] GitHub write error:', err);
    return false;
  }
}

// ── Write to local JSON (fallback) ────────────────────────────────────────────
function writeToJson(data: JoulesClaw): boolean {
  try {
    const localPath = LOCAL_JSON_PATHS[0];
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
    console.log('[joules-claw] Wrote to local JSON:', localPath);
    return true;
  } catch (err) {
    console.error('[joules-claw] Local JSON write error:', err);
    return false;
  }
}

// ── GET: Fetch all videos (or paired view if code provided) ──────────────────
export async function GET(request: NextRequest) {
  try {
    const data = await readFromGitHub() ?? readFromJson();
    if (!data) {
      return NextResponse.json({ videos: [], pairings: [] });
    }

    const code = request.nextUrl.searchParams.get("code");
    
    // If a pairing code is provided, verify it and return paired view
    if (code) {
      const pairing = data.pairings.find(p => p.code === code && p.active && new Date(p.expiresAt) > new Date());
      if (!pairing) {
        return NextResponse.json({ error: "Invalid or expired pairing code" }, { status: 403 });
      }
      // Return videos for paired user
      return NextResponse.json({ videos: data.videos, pairingInfo: { telegramUsername: pairing.telegramUsername } });
    }

    // Normal view (owner only)
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/joules-claw]", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// ── POST: Add video ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, channel, episodeNumber, publishedDate } = body;

    if (!id || !title || !url) {
      return NextResponse.json(
        { error: "Missing required fields: id, title, url" },
        { status: 400 }
      );
    }

    const currentData = await readFromGitHub() ?? readFromJson();
    if (!currentData) {
      return NextResponse.json(
        { error: "Could not read joules-claw data" },
        { status: 503 }
      );
    }

    // Check if video already exists
    if (currentData.videos.find(v => v.id === id)) {
      return NextResponse.json({ error: "Video already in Joules Claw" }, { status: 409 });
    }

    const newVideo: Video = {
      id,
      title,
      url,
      channel: channel || "Unknown",
      addedAt: new Date().toISOString(),
      addedBy: "eric",
      ...(episodeNumber && { episodeNumber }),
      ...(publishedDate && { publishedDate }),
    };

    currentData.videos.push(newVideo);
    currentData.lastUpdated = new Date().toISOString();

    const success = await writeToGitHub(currentData) || writeToJson(currentData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save video" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error) {
    console.error("[POST /api/joules-claw]", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}

// ── DELETE: Remove video ──────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing video id" },
        { status: 400 }
      );
    }

    const currentData = await readFromGitHub() ?? readFromJson();
    if (!currentData) {
      return NextResponse.json(
        { error: "Could not read joules-claw data" },
        { status: 503 }
      );
    }

    currentData.videos = currentData.videos.filter(v => v.id !== id);
    currentData.lastUpdated = new Date().toISOString();

    const success = await writeToGitHub(currentData) || writeToJson(currentData);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove video" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/joules-claw]", error);
    return NextResponse.json({ error: "Failed to remove video" }, { status: 500 });
  }
}

// ── POST /api/joules-claw/pairing: Generate pairing code ─────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get("action");

    if (action === "create-pairing") {
      const { telegramId, telegramUsername } = body;

      if (!telegramId) {
        return NextResponse.json(
          { error: "Missing telegramId" },
          { status: 400 }
        );
      }

      const currentData = await readFromGitHub() ?? readFromJson();
      if (!currentData) {
        return NextResponse.json(
          { error: "Could not read joules-claw data" },
          { status: 503 }
        );
      }

      // Generate 6-character alphanumeric code
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();

      const pairing: Pairing = {
        code,
        telegramId,
        telegramUsername: telegramUsername || `user_${telegramId}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        active: true,
      };

      currentData.pairings.push(pairing);
      currentData.lastUpdated = new Date().toISOString();

      const success = await writeToGitHub(currentData) || writeToJson(currentData);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to create pairing code" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, code, expiresAt: pairing.expiresAt });
    }

    if (action === "revoke-pairing") {
      const { code } = body;

      if (!code) {
        return NextResponse.json(
          { error: "Missing code" },
          { status: 400 }
        );
      }

      const currentData = await readFromGitHub() ?? readFromJson();
      if (!currentData) {
        return NextResponse.json(
          { error: "Could not read joules-claw data" },
          { status: 503 }
        );
      }

      const pairing = currentData.pairings.find(p => p.code === code);
      if (!pairing) {
        return NextResponse.json({ error: "Pairing not found" }, { status: 404 });
      }

      pairing.active = false;
      currentData.lastUpdated = new Date().toISOString();

      const success = await writeToGitHub(currentData) || writeToJson(currentData);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to revoke pairing" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[PUT /api/joules-claw]", error);
    return NextResponse.json({ error: "Failed to manage pairing" }, { status: 500 });
  }
}
