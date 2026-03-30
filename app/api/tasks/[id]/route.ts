/**
 * Mission Control v2 - Individual Task API
 * Static JSON-backed (Vercel-compatible)
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

type RouteContext = { params: Promise<{ id: string }> };

async function loadTasks(): Promise<{ open: any[]; completed: any[] }> {
  try {
    const filePath = resolve(process.cwd(), 'public/data/tasks.json');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { open: [], completed: [] };
  }
}

// GET /api/tasks/[id]
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const data = await loadTasks();
    const all = [...data.open, ...data.completed];
    const task = all.find((t) => t.id === id);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (err) {
    console.error('[GET /api/tasks/[id]]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/tasks/[id] — stub
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json({
      success: true,
      task: { id, ...body },
      message: 'Task updated (read-only mode)',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update task', detail: String(err) }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] — stub
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    void id;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete task', detail: String(err) }, { status: 500 });
  }
}
