/**
 * Mission Control - Workout Tracker API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/workout-logs.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'workout-logs.json');

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
    console.error('[workout] Local read failed:', e);
  }
  return null;
}

function writeToLocal(content: unknown) {
  try {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(content, null, 2));
    return true;
  } catch (e) {
    console.error('[workout] Local write failed:', e);
    return false;
  }
}

async function writeToGitHub(content: unknown, sha: string, msg: string) {
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
    const { data } = await fetchFromGitHub();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[workout] GitHub failed, falling back to local:', err);
    const localData = fetchFromLocal();
    if (localData) {
      return NextResponse.json(localData);
    }
    return NextResponse.json({ logs: {}, weights: {} }, { status: 500 });
  }
}

// POST - save a workout log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, completed, exercises } = body;
    let data, sha;
    try {
      ({ data, sha } = await fetchFromGitHub());
    } catch {
      data = fetchFromLocal() || { logs: {}, weights: {} };
      sha = null;
    }

    const updated = {
      ...data,
      logs: {
        ...data.logs,
        [date]: { date, completed, exercises },
      },
    };

    if (sha) {
      await writeToGitHub(updated, sha, `workout: log ${date} — ${completed ? 'completed' : 'updated'}`);
    }
    writeToLocal(updated);
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
    let data, sha;
    try {
      ({ data, sha } = await fetchFromGitHub());
    } catch {
      data = fetchFromLocal() || { logs: {}, weights: {} };
      sha = null;
    }

    const updated = {
      ...data,
      weights: { ...data.weights, ...weights },
    };

    if (sha) {
      await writeToGitHub(updated, sha, 'workout: update weights');
    }
    writeToLocal(updated);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
