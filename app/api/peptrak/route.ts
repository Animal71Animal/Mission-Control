/**
 * Mission Control - PepTrak API
 * Flat key format: "Day-compoundId" e.g. "Monday-reta-001"
 */
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const GITHUB_BRANCH = "main";
const BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;
const LOCAL_DIR = path.join(process.cwd(), "public", "data");

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFromGitHub(filePath: string) {
  const res = await fetch(`${BASE}/${filePath}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: "no-store" });
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET failed for ${filePath}: ${res.status}`);
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, "base64").toString("utf-8")), sha: data.sha };
}

function fetchFromLocal(filePath: string) {
  const localPath = path.join(LOCAL_DIR, path.basename(filePath));
  try {
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, "utf-8"));
    }
  } catch (e) {
    console.error(`[peptrak] Local read failed for ${filePath}:`, e);
  }
  return null;
}

function writeToLocal(filePath: string, content: unknown) {
  const localPath = path.join(LOCAL_DIR, path.basename(filePath));
  try {
    fs.writeFileSync(localPath, JSON.stringify(content, null, 2));
    return true;
  } catch (e) {
    console.error(`[peptrak] Local write failed for ${filePath}:`, e);
    return false;
  }
}

async function writeToGitHub(filePath: string, content: unknown, sha: string | null, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");
  const body: any = { message: msg, content: encoded, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${BASE}/${filePath}`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed for ${filePath}: ${res.status}`);
}

const COMPOUNDS_PATH = "public/data/peptrak-compounds.json";
const CHECKLIST_PATH = "public/data/peptrak-checklist.json";

// GET - returns both compounds and checklist (flat key format)
export async function GET() {
  try {
    const [compoundsGH, checklistGH] = await Promise.all([
      fetchFromGitHub(COMPOUNDS_PATH),
      fetchFromGitHub(CHECKLIST_PATH),
    ]);
    return NextResponse.json({
      compounds: compoundsGH.content || fetchFromLocal(COMPOUNDS_PATH) || [],
      checklist: checklistGH.content || fetchFromLocal(CHECKLIST_PATH) || {},
    });
  } catch (err) {
    console.error("[peptrak] GitHub failed, falling back to local:", err);
    return NextResponse.json({
      compounds: fetchFromLocal(COMPOUNDS_PATH) || [],
      checklist: fetchFromLocal(CHECKLIST_PATH) || {},
    });
  }
}

// POST - update compounds
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { compounds } = body;
    if (!Array.isArray(compounds)) {
      return NextResponse.json({ error: "compounds must be an array" }, { status: 400 });
    }
    let sha = null;
    try {
      const gh = await fetchFromGitHub(COMPOUNDS_PATH);
      sha = gh.sha;
    } catch {}
    if (sha) {
      await writeToGitHub(COMPOUNDS_PATH, compounds, sha, "fix: update peptrak compounds");
    }
    writeToLocal(COMPOUNDS_PATH, compounds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH - update checklist (merge into existing flat key store)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { checklist } = body;
    if (typeof checklist !== "object" || checklist === null) {
      return NextResponse.json({ error: "checklist must be an object" }, { status: 400 });
    }

    // Fetch current flat key store
    let currentData: Record<string, boolean> = {};
    let sha: string | null = null;
    try {
      const gh = await fetchFromGitHub(CHECKLIST_PATH);
      if (gh.content && typeof gh.content === "object") {
        currentData = gh.content as Record<string, boolean>;
      }
      sha = gh.sha;
    } catch {}

    // Merge: new values override existing
    const merged = { ...currentData, ...checklist };

    if (sha) {
      await writeToGitHub(CHECKLIST_PATH, merged, sha, "fix: update peptrak checklist");
    }
    writeToLocal(CHECKLIST_PATH, merged);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}