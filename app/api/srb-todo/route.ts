import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SrbTask {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: string;
  due_date?: string | null;
  [key: string]: unknown;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/srb-todo.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'srb-todo.json');

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
  return { tasks: decoded.tasks, sha: data.sha, last_updated: decoded.last_updated };
}

function fetchFromLocal() {
  try {
    if (fs.existsSync(LOCAL_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('[srb-todo] Local read failed:', e);
  }
  return null;
}

function writeToLocal(tasks: unknown[]) {
  try {
    fs.writeFileSync(LOCAL_PATH, JSON.stringify({ tasks, last_updated: new Date().toISOString() }, null, 2));
    return true;
  } catch (e) {
    console.error('[srb-todo] Local write failed:', e);
    return false;
  }
}

async function writeToGitHub(tasks: unknown[], sha: string, msg: string) {
  const content = Buffer.from(JSON.stringify({ tasks, last_updated: new Date().toISOString() }, null, 2)).toString('base64');
  const res = await fetch(API_URL, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

export async function GET() {
  try {
    const { tasks } = await fetchFromGitHub();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('[srb-todo] GitHub failed, falling back to local:', err);
    const localData = fetchFromLocal();
    if (localData && localData.tasks) {
      return NextResponse.json(localData.tasks);
    }
    return NextResponse.json([], { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...changes } = body;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    let tasks, sha;
    try {
      ({ tasks, sha } = await fetchFromGitHub());
    } catch {
      const localData = fetchFromLocal();
      tasks = localData?.tasks || [];
      sha = null;
    }
    const idx = tasks.findIndex((t: SrbTask) => t.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    tasks[idx] = { ...tasks[idx], ...changes };
    if (sha) await writeToGitHub(tasks, sha, `fix: update srb-todo task ${id}`);
    writeToLocal(tasks);
    return NextResponse.json({ ok: true, task: tasks[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let tasks, sha;
    try {
      ({ tasks, sha } = await fetchFromGitHub());
    } catch {
      const localData = fetchFromLocal();
      tasks = localData?.tasks || [];
      sha = null;
    }
    const newTask = { id: `srb-${Date.now()}`, completed: false, ...body };
    if (sha) await writeToGitHub([...tasks, newTask], sha, `feat: add srb-todo task "${newTask.text}"`);
    writeToLocal([...tasks, newTask]);
    return NextResponse.json({ ok: true, task: newTask });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    let tasks, sha;
    try {
      ({ tasks, sha } = await fetchFromGitHub());
    } catch {
      const localData = fetchFromLocal();
      tasks = localData?.tasks || [];
      sha = null;
    }
    const updated = tasks.filter((t: SrbTask) => t.id !== id);
    if (sha) await writeToGitHub(updated, sha, `chore: delete srb-todo task ${id}`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
