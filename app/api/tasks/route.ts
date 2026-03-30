/**
 * Mission Control v2 - Tasks API
 * Static JSON-backed (Vercel-compatible)
 * Reads from public/data/tasks.json — writes return success stubs
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export interface Task {
  id: string;
  title: string;
  owner: string;
  status: string;
  priority: string;
  due_date?: string | null;
  category?: string | null;
  notes?: string | null;
  created_at: string;
  completed_at?: string | null;
  started_at?: string | null;
  duration_minutes?: number | null;
}

async function loadTasks(): Promise<{ open: Task[]; completed: Task[] }> {
  try {
    const filePath = resolve(process.cwd(), 'public/data/tasks.json');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { open: [], completed: [] };
  }
}

// GET /api/tasks — returns { open: Task[], completed: Task[] }
export async function GET() {
  try {
    const data = await loadTasks();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/tasks]', err);
    return NextResponse.json({ open: [], completed: [], error: String(err) }, { status: 500 });
  }
}

// POST /api/tasks — stub (read-only deployment)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json({ success: true, task: { id, ...body } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create task', detail: String(err) }, { status: 500 });
  }
}

// PATCH /api/tasks — stub
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, task: body });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update task', detail: String(err) }, { status: 500 });
  }
}

// DELETE /api/tasks?id=xxx — stub
export async function DELETE() {
  return NextResponse.json({ success: true });
}
