export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "public", "data", "personal-tasks.json");

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const tasks = JSON.parse(raw);
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const tasks = await req.json();
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("personal-tasks POST error:", err);
    return NextResponse.json({ ok: false, error: "Write failed" }, { status: 500 });
  }
}
