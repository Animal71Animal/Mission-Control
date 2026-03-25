export const dynamic = "force-static";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { marked } from "marked";

export async function GET() {
  try {
    // Read from the workspace data directory
    const filePath = path.join("/home/ubuntu/wlp/data", "live-pa-setup.md");
    const md = fs.readFileSync(filePath, "utf8");
    const html = await marked(md);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return new NextResponse("<p>Unable to load Live PA setup guide: " + String(error) + "</p>", {
      headers: { "Content-Type": "text/html" },
    });
  }
}
