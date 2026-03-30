/**
 * Mission Control v2 - Personal Tasks API
 * GitHub API-backed: reads/writes public/data/personal-tasks.json in the repo.
 * All mutations commit directly to GitHub so data persists across deploys/devices.
 */

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_FILE_PATH = 'public/data/personal-tasks.json';
const GITHUB_BRANCH = 'main';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

export interface PersonalTask {
  id: string;
  title: string;
  notes?: string | null;
  category: string;
  priority: string;
  due_date?: string | null;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
  dueDate?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
}

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

/** Fetch current tasks + file sha from GitHub (always fresh, no cache) */
async function fetchFromGitHub(): Promise<{ tasks: PersonalTask[]; sha: string }> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  const res = await fetch(`${GITHUB_API_BASE}?ref=${GITHUB_BRANCH}`, {
    headers,
    // Disable Next.js/Vercel cache so we always get the latest committed data
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub GET failed: ${res.status} ${text}`);
  }

  const data: GitHubFileResponse = await res.json();
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
  const tasks: PersonalTask[] = JSON.parse(decoded);
  return { tasks, sha: data.sha };
}

/** Write updated tasks array back to GitHub with a commit */
async function writeToGitHub(
  tasks: PersonalTask[],
  sha: string,
  commitMessage: string
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  const content = Buffer.from(JSON.stringify(tasks, null, 2)).toString('base64');

  const res = await fetch(GITHUB_API_BASE, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: commitMessage,
      content,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} ${text}`);
  }
}

// ──────────────────────────────────────────────
// GET /api/personal-tasks — returns live array
// ──────────────────────────────────────────────
export async function GET() {
  try {
    const { tasks } = await fetchFromGitHub();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('[GET /api/personal-tasks]', err);
    return NextResponse.json([], { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/personal-tasks
//   Body (single task): { title, category, priority, ... }
//   Body (bulk replace): array of tasks  →  replaces entire list (for sync)
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tasks, sha } = await fetchFromGitHub();

    if (Array.isArray(body)) {
      // Bulk replace / full sync
      await writeToGitHub(body, sha, 'chore: bulk sync personal-tasks');
      return NextResponse.json({ ok: true, count: body.length });
    }

    // Single new task
    const newTask: PersonalTask = {
      id: body.id || `pt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: body.title || '',
      notes: body.notes ?? null,
      category: body.category || 'personal',
      priority: body.priority || 'medium',
      due_date: body.due_date ?? body.dueDate ?? null,
      completed: body.completed ?? false,
      created_at: body.created_at ?? body.createdAt ?? new Date().toISOString(),
      completed_at: body.completed_at ?? body.completedAt ?? null,
    };

    const updated = [...tasks, newTask];
    await writeToGitHub(updated, sha, `feat: add task "${newTask.title}"`);
    return NextResponse.json({ ok: true, task: newTask });
  } catch (err) {
    console.error('[POST /api/personal-tasks]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/personal-tasks
//   Body: { id, ...fieldsToUpdate }
//   Finds task by id and merges changes.
// ──────────────────────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...changes } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing task id' }, { status: 400 });
    }

    const { tasks, sha } = await fetchFromGitHub();
    const idx = tasks.findIndex((t) => t.id === id);

    if (idx === -1) {
      return NextResponse.json({ ok: false, error: `Task ${id} not found` }, { status: 404 });
    }

    const updatedTask: PersonalTask = { ...tasks[idx], ...changes };
    const updated = [...tasks];
    updated[idx] = updatedTask;

    await writeToGitHub(updated, sha, `fix: update task "${updatedTask.title}"`);
    return NextResponse.json({ ok: true, task: updatedTask });
  } catch (err) {
    console.error('[PATCH /api/personal-tasks]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /api/personal-tasks?id=xxx
// ──────────────────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing task id' }, { status: 400 });
    }

    const { tasks, sha } = await fetchFromGitHub();
    const updated = tasks.filter((t) => t.id !== id);

    if (updated.length === tasks.length) {
      return NextResponse.json({ ok: false, error: `Task ${id} not found` }, { status: 404 });
    }

    await writeToGitHub(updated, sha, `chore: delete task ${id}`);
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    console.error('[DELETE /api/personal-tasks]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
