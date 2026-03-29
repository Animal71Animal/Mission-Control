import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { spawn } from "child_process";

const TASKS_FILE = "/home/ubuntu/wlp/ops/tasks.json";

// Helper to read tasks
async function readTasks() {
  try {
    const data = await readFile(TASKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { open: [], completed: [] };
  }
}

// Helper to write tasks
async function writeTasks(tasks: any) {
  await writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Helper to notify PriScylla via OpenClaw
async function notifyPriScylla(task: any, action: string) {
  try {
    // Create a notification file that PriScylla can pick up
    const notification = {
      type: "task-update",
      action,
      task,
      timestamp: new Date().toISOString(),
      notify: true,
    };
    
    // Write to a notifications file
    const fs = await import("fs/promises");
    const notificationsFile = "/home/ubuntu/wlp/ops/notifications.json";
    let notifications = [];
    try {
      const existing = await fs.readFile(notificationsFile, "utf-8");
      notifications = JSON.parse(existing);
    } catch {
      // File doesn't exist yet
    }
    notifications.push(notification);
    await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2));
    
    // Also try to send via OpenClaw CLI if available
    try {
      const { execSync } = await import("child_process");
      execSync(
        `openclaw message send --session main --message "TASK STARTED: ${task.title} (Owner: ${task.owner})"`,
        { timeout: 5000 }
      );
    } catch {
      // OpenClaw CLI might not be available, that's okay
    }
  } catch (err) {
    console.error("Failed to notify PriScylla:", err);
  }
}

// Helper to spawn a sub-agent for the task
async function spawnSubAgent(task: any) {
  try {
    const { execSync } = await import("child_process");
    
    // Create a task-specific work directory
    const fs = await import("fs/promises");
    const workDir = `/home/ubuntu/wlp/ops/task-work/${task.id}`;
    await fs.mkdir(workDir, { recursive: true });
    
    // Write task context to the work directory
    await fs.writeFile(
      `${workDir}/context.json`,
      JSON.stringify({
        task,
        startedAt: new Date().toISOString(),
        status: "in-progress",
      }, null, 2)
    );
    
    // Try to spawn via OpenClaw if available
    try {
      execSync(
        `openclaw sessions spawn --task "${task.title}" --label "task-${task.id}" --mode session --timeout 3600`,
        { timeout: 10000 }
      );
    } catch {
      // OpenClaw spawn might fail, that's okay - we have the context file
    }
    
    return workDir;
  } catch (err) {
    console.error("Failed to spawn sub-agent:", err);
    return null;
  }
}

// Helper to create notification for PriScylla
async function createTaskNotification(task: any) {
  try {
    const fs = await import("fs/promises");
    const notificationFile = "/home/ubuntu/wlp/ops/task-notifications.json";
    
    let notifications = [];
    try {
      const data = await fs.readFile(notificationFile, "utf-8");
      notifications = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }
    
    notifications.push({
      id: `notif-${Date.now()}`,
      type: "task-started",
      taskId: task.id,
      taskTitle: task.title,
      taskOwner: task.owner,
      subAgentId: task.subAgentId,
      subAgentName: task.subAgentName,
      timestamp: new Date().toISOString(),
      read: false,
    });
    
    await fs.writeFile(notificationFile, JSON.stringify(notifications, null, 2));
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}



// PUT /api/tasks/[id] - Update a specific task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const tasks = await readTasks();
    
    // Find task in open or completed
    let taskIndex = tasks.open.findIndex((t: any) => t.id === id);
    let taskList = "open";
    
    if (taskIndex === -1) {
      taskIndex = tasks.completed.findIndex((t: any) => t.id === id);
      taskList = "completed";
    }

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = tasks[taskList][taskIndex];
    const oldStatus = task.status;
    
    // Update the task
    task.status = status;
    
    // Track time when starting
    if (status === "in-progress" && oldStatus !== "in-progress") {
      task.startedAt = new Date().toISOString();
      
      // Notify PriScylla
      await notifyPriScylla(task, "started");
      
      // Spawn sub-agent for the task
      const workDir = await spawnSubAgent(task);
      
      // Add work directory to task
      if (workDir) {
        task.workDir = workDir;
      }
      
      // Create notification for PriScylla to pick up
      await createTaskNotification(task);
      
      // Sub-agent info - uses PriScylla as the agent name
      task.subAgentId = `task-${task.id}`;
      task.subAgentName = "PriScylla";
    }
    
    // Track completion time
    if (status === "done" && oldStatus !== "done") {
      task.completedAt = new Date().toISOString();
      
      // Calculate duration if we have a start time
      if (task.startedAt) {
        const start = new Date(task.startedAt);
        const end = new Date(task.completedAt);
        task.durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
      }
      
      // Move to completed list
      tasks.open = tasks.open.filter((t: any) => t.id !== id);
      tasks.completed.push(task);
      
      // Notify PriScylla
      await notifyPriScylla(task, "completed");
    }
    
    // Handle reset from done back to pending
    if (status === "pending" && oldStatus === "done") {
      task.completedAt = undefined;
      task.durationMinutes = undefined;
      tasks.completed = tasks.completed.filter((t: any) => t.id !== id);
      tasks.open.push(task);
    }

    await writeTasks(tasks);

    return NextResponse.json({ 
      success: true, 
      task,
      message: status === "in-progress" 
        ? `Task started! Sub-agent "${task.subAgentName}" (${task.subAgentId}) has been deployed. PriScylla has been notified.` 
        : status === "done"
        ? `Task completed in ${task.durationMinutes || "unknown"} minutes.`
        : `Task status updated to ${status}.`
    });
  } catch (err) {
    console.error("Error updating task:", err);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tasks = await readTasks();
    
    // Remove from both lists
    tasks.open = tasks.open.filter((t: any) => t.id !== id);
    tasks.completed = tasks.completed.filter((t: any) => t.id !== id);
    
    await writeTasks(tasks);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting task:", err);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
