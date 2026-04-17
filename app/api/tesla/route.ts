/**
 * Mission Control - Tesla Charging API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/tesla-charging.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFile() {
  const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { data: decoded, sha: data.sha };
}

async function writeFile(content: unknown, sha: string, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await fetch(API_URL, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

export async function GET() {
  try {
    const { data } = await fetchFile();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ sessions: [], summary: {}, monthly_summary: {} }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, sha } = await fetchFile();
    const newSession = { id: `tesla-${Date.now()}`, created_at: new Date().toISOString(), ...body };
    data.sessions = [newSession, ...(data.sessions || [])];
    data.summary.total_sessions = (data.summary.total_sessions || 0) + 1;
    data.summary.total_cost_usd = +((data.summary.total_cost_usd || 0) + newSession.cost).toFixed(2);
    data.summary.total_kwh = +((data.summary.total_kwh || 0) + newSession.kwh).toFixed(4);
    data.last_updated = new Date().toISOString();
    await writeFile(data, sha, `feat: add tesla charge ${newSession.date} $${newSession.cost}`);
    return NextResponse.json({ ok: true, session: newSession });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
