/**
 * Mission Control - Tesla Charging API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/tesla-charging.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'tesla-charging.json');

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFromGitHub() {
  const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { data: decoded, sha: data.sha };
}

function fetchFromLocal() {
  try {
    if (fs.existsSync(LOCAL_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('[tesla] Local read failed:', e);
  }
  return null;
}

function writeToLocal(content: unknown) {
  try {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(content, null, 2));
    return true;
  } catch (e) {
    console.error('[tesla] Local write failed:', e);
    return false;
  }
}

async function writeToGitHub(content: unknown, sha: string, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await fetch(API_URL, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

export async function GET() {
  try {
    const { data } = await fetchFromGitHub();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[tesla] GitHub failed, falling back to local:', err);
    const localData = fetchFromLocal();
    if (localData) {
      return NextResponse.json(localData);
    }
    return NextResponse.json({ sessions: [], summary: {}, monthly_summary: {} }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let data, sha;
    try {
      ({ data, sha } = await fetchFromGitHub());
    } catch {
      data = fetchFromLocal() || { sessions: [], summary: { total_sessions: 0, total_cost_usd: 0, total_kwh: 0 }, monthly_summary: {} };
      sha = null;
    }
    const newSession = { id: `tesla-${Date.now()}`, created_at: new Date().toISOString(), ...body };
    data.sessions = [newSession, ...(data.sessions || [])];
    data.summary.total_sessions = (data.summary.total_sessions || 0) + 1;
    data.summary.total_cost_usd = +((data.summary.total_cost_usd || 0) + newSession.cost).toFixed(2);
    data.summary.total_kwh = +((data.summary.total_kwh || 0) + newSession.kwh).toFixed(4);
    data.last_updated = new Date().toISOString();
    if (sha) {
      await writeToGitHub(data, sha, `feat: add tesla charge ${newSession.date} $${newSession.cost}`);
    }
    writeToLocal(data);
    return NextResponse.json({ ok: true, session: newSession });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
