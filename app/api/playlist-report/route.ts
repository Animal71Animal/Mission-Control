/**
 * Mission Control v2 - OpenClaw Playlist Report API
 * GitHub-backed (no redeploy needed for data updates)
 */

import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const FILE_PATH = "public/data/openclaw-playlist-report.md";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const data = await response.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return NextResponse.json({ content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
