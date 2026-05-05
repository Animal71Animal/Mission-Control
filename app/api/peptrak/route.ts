/**
 * Mission Control - PepTrak API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const GITHUB_BRANCH = "main";
const BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchGHFile(path: string) {
  const res = await fetch(`${BASE}/${path}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: "no-store" });
  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET failed for ${path}: ${res.status}`);
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, "base64").toString("utf-8")), sha: data.sha };
}

async function writeGHFile(path: string, content: unknown, sha: string | null, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString("base64");
  const body: any = { message: msg, content: encoded, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${BASE}/${path}`, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed for ${path}: ${res.status}`);
}

const COMPOUNDS_PATH = "public/data/peptrak-compounds.json";
const CHECKLIST_PATH = "public/data/peptrak-checklist.json";

// GET - returns both compounds and checklist
export async function GET() {
  try {
    const [compounds, checklist] = await Promise.all([
      fetchGHFile(COMPOUNDS_PATH),
      fetchGHFile(CHECKLIST_PATH),
    ]);
    return NextResponse.json({
      compounds: compounds.content || [],
      checklist: checklist.content || {},
    });
  } catch (err) {
    return NextResponse.json({ compounds: [], checklist: {} }, { status: 500 });
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
    const { sha } = await fetchGHFile(COMPOUNDS_PATH);
    await writeGHFile(COMPOUNDS_PATH, compounds, sha, "fix: update peptrak compounds");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PATCH - update checklist
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { checklist } = body;
    if (typeof checklist !== "object" || checklist === null) {
      return NextResponse.json({ error: "checklist must be an object" }, { status: 400 });
    }
    const { sha } = await fetchGHFile(CHECKLIST_PATH);
    await writeGHFile(CHECKLIST_PATH, checklist, sha, "fix: update peptrak checklist");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
