import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { mkdirSync } from "fs";
import path from "path";

const DATA_DIR = "/home/ubuntu/wlp/data";
const CHECKLIST_FILE = path.join(DATA_DIR, "peptide-checklist-state.json");

// Ensure data directory exists
function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Get current checklist state
function getChecklist(): Record<string, boolean> {
  ensureDir();
  if (!existsSync(CHECKLIST_FILE)) {
    return {};
  }
  try {
    const data = readFileSync(CHECKLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// Save checklist state
function saveChecklist(checklist: Record<string, boolean>) {
  ensureDir();
  writeFileSync(CHECKLIST_FILE, JSON.stringify(checklist, null, 2));
}

export async function GET() {
  try {
    const checklist = getChecklist();
    return NextResponse.json(checklist);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch checklist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const checklist = getChecklist();
    
    // Update with new state
    const updated = { ...checklist, ...body };
    saveChecklist(updated);
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
  }
}
