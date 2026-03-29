import { NextRequest, NextResponse } from 'next/server';
import { getTasks, addTask, updateTask, deleteTask } from '@/lib/data-store';

// GET /api/tasks
export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('Tasks fetch error:', err);
    return NextResponse.json({ open: [], completed: [] }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await addTask(body);
    return NextResponse.json({ success: true, task });
  } catch (err) {
    console.error('Task create error:', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PUT /api/tasks/:id
export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split('/').pop();
    const body = await request.json();
    const task = await updateTask(id!, body);
    return NextResponse.json({ success: true, task });
  } catch (err) {
    console.error('Task update error:', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split('/').pop();
    await deleteTask(id!);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Task delete error:', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
