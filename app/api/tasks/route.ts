import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TASKS_FILE = path.join(process.cwd(), "public", "data", "tasks.json");

interface Task {
  id: string;
  title: string;
  notes?: string;
  owner: "priscylla" | "animal";
  status: "pending" | "in-progress" | "blocked" | "done";
  priority: "high" | "medium" | "low";
  completedAt?: string;
}

interface TasksData {
  tasks: Task[];
  completed: Task[];
}

async function readTasks(): Promise<TasksData> {
  try {
    const content = await fs.readFile(TASKS_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return { tasks: [], completed: [] };
  }
}

async function writeTasks(data: TasksData): Promise<void> {
  await fs.mkdir(path.dirname(TASKS_FILE), { recursive: true });
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
}

// GET /api/tasks
export async function GET() {
  try {
    const data = await readTasks();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read tasks" }, { status: 500 });
  }
}

// POST /api/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await readTasks();
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: body.title,
      notes: body.notes || "",
      owner: body.owner || "animal",
      status: "pending",
      priority: body.priority || "medium",
    };
    
    data.tasks.push(newTask);
    await writeTasks(data);
    
    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PUT /api/tasks/:id - Update task
export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    const body = await request.json();
    const data = await readTasks();
    
    // Find in tasks array
    let taskIndex = data.tasks.findIndex((t) => t.id === id);
    let task: Task | undefined;
    let inCompleted = false;
    
    if (taskIndex >= 0) {
      task = data.tasks[taskIndex];
    } else {
      // Check completed array
      taskIndex = data.completed.findIndex((t) => t.id === id);
      if (taskIndex >= 0) {
        task = data.completed[taskIndex];
        inCompleted = true;
      }
    }
    
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    // Update fields
    if (body.title !== undefined) task.title = body.title;
    if (body.notes !== undefined) task.notes = body.notes;
    if (body.status !== undefined) {
      const oldStatus = task.status;
      task.status = body.status;
      
      // Handle status transitions
      if (body.status === "done" && oldStatus !== "done") {
        task.completedAt = new Date().toISOString();
        // Move to completed array
        if (!inCompleted) {
          data.tasks = data.tasks.filter((t) => t.id !== id);
          data.completed.push(task);
        }
      } else if (body.status !== "done" && oldStatus === "done") {
        // Moving from done back to active
        delete task.completedAt;
        if (inCompleted) {
          data.completed = data.completed.filter((t) => t.id !== id);
          data.tasks.push(task);
        }
      }
    }
    if (body.priority !== undefined) task.priority = body.priority;
    if (body.owner !== undefined) task.owner = body.owner;
    
    await writeTasks(data);
    
    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/:id - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    const data = await readTasks();
    
    data.tasks = data.tasks.filter((t) => t.id !== id);
    data.completed = data.completed.filter((t) => t.id !== id);
    
    await writeTasks(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
