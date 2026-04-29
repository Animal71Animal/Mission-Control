/**
 * Mission Control - Workout Tracker API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/workout-logs.json';
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
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

// GET - return all workout logs
export async function GET() {
  try {
    const { data } = await fetchFile();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ logs: {}, weights: {} }, { status: 500 });
  }
}

// POST - save a workout log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, completed, exercises } = body;
    const { data, sha } = await fetchFile();

    const updated = {
      ...data,
      logs: {
        ...data.logs,
        [date]: { date, completed, exercises },
      },
    };

    await writeFile(updated, sha, `workout: log ${date} — ${completed ? 'completed' : 'updated'}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// PATCH - update weights (progressive overload)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { weights } = body;
    const { data, sha } = await fetchFile();

    const updated = {
      ...data,
      weights: { ...data.weights, ...weights },
    };

    await writeFile(updated, sha, 'workout: update weights');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
