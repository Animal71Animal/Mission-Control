/**
 * Mission Control - OpenClaw Episodes API
 * GitHub API-backed: always live
 */
import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/openclaw-episodes.json';
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
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha };
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
    const { content } = await fetchFile();
    return NextResponse.json(content);
  } catch (err) {
    return NextResponse.json({ episodes: [], last_checked: null, total: 0 }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...changes } = body;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    const { content, sha } = await fetchFile();
    const idx = content.episodes.findIndex((e: any) => e.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    content.episodes[idx] = { ...content.episodes[idx], ...changes };
    await writeFile(content, sha, `fix: update openclaw episode ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// NEW: Persist playlist video completion status
const PLAYLIST_STATE_PATH = 'public/data/playlist-video-state.json';
const PLAYLIST_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${PLAYLIST_STATE_PATH}`;

async function fetchPlaylistFile() {
  const res = await fetch(`${PLAYLIST_API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
  if (res.status === 404) return { content: { completed: [], important: [] }, sha: null };
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha };
}

async function writePlaylistFile(content: unknown, sha: string | null, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const body: any = { message: msg, content: encoded, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(PLAYLIST_API_URL, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, uid, state } = body;
    if (!action || !uid) return NextResponse.json({ ok: false, error: 'Missing action or uid' }, { status: 400 });
    
    const { content, sha } = await fetchPlaylistFile();
    
    if (action === 'toggleDone') {
      const set = new Set(content.completed || []);
      if (state === true) set.add(uid);
      else if (state === false) set.delete(uid);
      else set.has(uid) ? set.delete(uid) : set.add(uid);
      content.completed = [...set];
    } else if (action === 'toggleImportant') {
      const set = new Set(content.important || []);
      if (state === true) set.add(uid);
      else if (state === false) set.delete(uid);
      else set.has(uid) ? set.delete(uid) : set.add(uid);
      content.important = [...set];
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }
    
    await writePlaylistFile(content, sha, `fix: update playlist video state ${action} ${uid}`);
    return NextResponse.json({ ok: true, completed: content.completed, important: content.important });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { content } = await fetchPlaylistFile();
    return NextResponse.json({ completed: content.completed || [], important: content.important || [] });
  } catch (err) {
    return NextResponse.json({ completed: [], important: [] }, { status: 500 });
  }
}
