export const dynamic = "force-static";

import { execSync } from "child_process";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const output = execSync("openclaw config get agents.defaults.model.primary", {
      encoding: "utf8",
    }).trim();
    return NextResponse.json({ model: output });
  } catch (err) {
    console.error("GET /api/model error:", err);
    return NextResponse.json(
      { error: "Failed to read model config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model } = body;

    if (!model || typeof model !== "string") {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    execSync(`openclaw config set agents.defaults.model.primary "${model}"`, {
      encoding: "utf8",
    });

    // Restart gateway in background (fire-and-forget)
    try {
      execSync("openclaw gateway restart", { encoding: "utf8", timeout: 15000 });
    } catch (restartErr) {
      console.warn("Gateway restart warning:", restartErr);
      // Non-fatal — model was set, restart may still complete
    }

    return NextResponse.json({ success: true, model });
  } catch (err) {
    console.error("POST /api/model error:", err);
    return NextResponse.json(
      { error: "Failed to set model" },
      { status: 500 }
    );
  }
}
