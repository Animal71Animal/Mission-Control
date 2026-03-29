// Simple JSON-based data store that auto-syncs to git
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DATA_DIR = join(process.cwd(), 'public', 'data');

// Helper to read JSON file
export async function readJson(filename: string) {
  try {
    const data = await readFile(join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Helper to write JSON file and trigger sync
export async function writeJson(filename: string, data: any, sync: boolean = true) {
  await writeFile(join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  
  if (sync) {
    // Trigger background sync
    syncToGit(filename).catch(console.error);
  }
  
  return true;
}

// Sync data files to git and redeploy
async function syncToGit(filename: string) {
  try {
    console.log(`[AutoSync] Syncing ${filename}...`);
    
    // Add, commit, push
    await execAsync(`cd ${process.cwd()} && git add public/data/${filename}`);
    await execAsync(`cd ${process.cwd()} && git commit -m "Auto-sync: ${filename} updated"`);
    await execAsync(`cd ${process.cwd()} && git push origin master`);
    
    console.log(`[AutoSync] ${filename} synced successfully`);
  } catch (err) {
    console.error('[AutoSync] Failed:', err);
  }
}

// Tasks API
export async function getTasks() {
  const data = await readJson('tasks.json');
  if (!data) {
    return { open: [], completed: [] };
  }
  return {
    open: data.open || [],
    completed: data.completed || []
  };
}

export async function addTask(task: any) {
  const data = await readJson('tasks.json') || { open: [], completed: [] };
  const newTask = {
    id: `task-${Date.now()}`,
    ...task,
    createdAt: new Date().toISOString()
  };
  data.open.push(newTask);
  await writeJson('tasks.json', data);
  return newTask;
}

export async function updateTask(id: string, updates: any) {
  const data = await readJson('tasks.json') || { open: [], completed: [] };
  
  // Find in open
  let task = data.open.find((t: any) => t.id === id);
  if (task) {
    Object.assign(task, updates);
    if (updates.status === 'done') {
      data.open = data.open.filter((t: any) => t.id !== id);
      data.completed.push({ ...task, completedAt: new Date().toISOString() });
    }
  } else {
    // Find in completed
    task = data.completed.find((t: any) => t.id === id);
    if (task) Object.assign(task, updates);
  }
  
  await writeJson('tasks.json', data);
  return task;
}

export async function deleteTask(id: string) {
  const data = await readJson('tasks.json') || { open: [], completed: [] };
  data.open = data.open.filter((t: any) => t.id !== id);
  data.completed = data.completed.filter((t: any) => t.id !== id);
  await writeJson('tasks.json', data);
}

// Tesla API
export async function getTeslaSessions() {
  const data = await readJson('tesla-charging.json');
  if (!data) return { sessions: [], summary: {}, monthly_summary: {} };
  
  // Calculate totals
  const sessions = data.sessions || [];
  const totals = {
    total_sessions: sessions.length,
    total_cost_usd: sessions.reduce((sum: number, s: any) => sum + (s.cost || 0), 0),
    total_kwh: sessions.reduce((sum: number, s: any) => sum + (s.kwh || 0), 0),
    total_minutes: sessions.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0),
    avg_cost_per_session: sessions.length > 0 
      ? sessions.reduce((sum: number, s: any) => sum + (s.cost || 0), 0) / sessions.length 
      : 0,
    avg_duration_minutes: sessions.length > 0 
      ? sessions.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) / sessions.length 
      : 0,
  };
  
  return { ...data, summary: totals };
}

export async function addTeslaSession(session: any) {
  const data = await readJson('tesla-charging.json') || { sessions: [], monthly_summary: {} };
  const newSession = {
    id: `session-${Date.now()}`,
    ...session
  };
  data.sessions = [newSession, ...(data.sessions || [])];
  await writeJson('tesla-charging.json', data);
  return newSession;
}
