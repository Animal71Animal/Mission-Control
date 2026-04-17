/**
 * Mission Control - WLP Tasks API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/tasks.json';
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
  return { tasks: decoded, sha: data.sha };
}

async function writeFile(tasks: unknown[], sha: string, msg: string) {
  const content = Buffer.from(JSON.stringify(tasks, null, 2)).toString('base64');
  const res = await fetch(API_URL, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

export async function GET() {
  try {
    const { tasks } = await fetchFile();
    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks, sha } = await fetchFile();
    const newTask = { id: `T${Date.now()}`, created_at: new Date().toISOString(), status: 'todo', ...body };
    await writeFile([...tasks, newTask], sha, `feat: add task "${newTask.title}"`);
    return NextResponse.json({ ok: true, task: newTask });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...changes } = body;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    const { tasks, sha } = await fetchFile();
    const idx = tasks.findIndex((t: any) => t.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    (tasks as any[])[idx] = { ...(tasks as any[])[idx], ...changes };
    await writeFile(tasks, sha, `fix: update task ${id}`);
    return NextResponse.json({ ok: true, task: (tasks as any[])[idx] });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    const { tasks, sha } = await fetchFile();
    const updated = (tasks as any[]).filter((t: any) => t.id !== id);
    await writeFile(updated, sha, `chore: delete task ${id}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
