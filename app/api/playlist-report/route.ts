export const dynamic = "force-static";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const reportPath = path.join("/home/ubuntu", "wlp/data", "openclaw-playlist-report.md");
    const content = fs.readFileSync(reportPath, "utf-8");
    return NextResponse.json({ content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
