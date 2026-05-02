export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

/**
 * POST /api/route-model
 * Body: { "prompt": "your prompt here" }
 * Returns: { "model": "minimax-m2.7", "tier": "standard", "cost_per_1k": "$0.0009" }
 * 
 * Uses the model router to pick the most cost-effective model
 * based on prompt keywords.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    // Call the Python router
    const routerPath = "/home/ubuntu/wlp/skills/model-router/model_router.py";
    const output = execSync(
      `python3 "${routerPath}" "${prompt.replace(/"/g, '\\"')}"`,
      { encoding: "utf8" }
    );

    // Parse the output
    const lines = output.trim().split("\n");
    const model = lines.find((l) => l.startsWith("Model:"))?.split(":")[1]?.trim();
    const tier = lines.find((l) => l.startsWith("Tier:"))?.split(":")[1]?.trim();
    const cost = lines.find((l) => l.startsWith("Cost:"))?.split(":")[1]?.trim();
    const match = lines.find((l) => l.startsWith("Match:"))?.split(":")[1]?.trim();

    return NextResponse.json({
      model: model || "unknown",
      tier: tier || "unknown",
      cost_per_1k: cost || "unknown",
      matched_keyword: match || null,
      prompt_preview: prompt.slice(0, 100),
    });
  } catch (err) {
    console.error("POST /api/route-model error:", err);
    return NextResponse.json(
      { error: "Failed to route model" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/route-model
 * Returns the current router configuration
 */
export async function GET() {
  return NextResponse.json({
    tiers: {
      simple: { model: "gpt-5-nano", cost_per_1k: "$0.00045" },
      standard: { model: "minimax-m2.7", cost_per_1k: "$0.0009" },
      creative: { model: "kimi-k2.6", cost_per_1k: "$0.00545" },
      complex: { model: "gpt-5.5", cost_per_1k: "$0.0175" },
    },
    standard_keywords_count: 30,
    complex_keywords_count: 9,
    creative_keywords_count: 11,
  });
}
