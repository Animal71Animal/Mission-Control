export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

// === MODEL ROUTER CONFIGURATION ===
const TIER_SIMPLE = "gpt-5-nano";
const TIER_STANDARD = "minimax-m2.7";
const TIER_COMPLEX = "gpt-5.5";
const TIER_CREATIVE = "kimi-k2.6";

const COST_RATES: Record<string, string> = {
  [TIER_SIMPLE]: "$0.00045",
  [TIER_STANDARD]: "$0.0009",
  [TIER_CREATIVE]: "$0.00545",
  [TIER_COMPLEX]: "$0.0175",
};

const M2_7_KEYWORDS = [
  "mission control", "vercel deploy", "github", "workout tracker",
  "data file", "update page", "add feature", "fix bug", "dashboard",
  "api route", "react", "nextjs", "javascript", "typescript", "exercise",
  "wlp project", "deploy script", "build error", "uber earnings",
  "srb tip", "srb tips", "tesla charging", "spearmint rhino", "push to github",
  "redeploy", "peptides", "openclaw youtube", "action items"
];

const COMPLEX_KEYWORDS = [
  "investor", "legal", "contract", "terms", "agreement",
  "advanced reasoning", "deep analysis", "complex problem",
  "multi-step", "strategic planning", "financial model"
];

const CREATIVE_KEYWORDS = [
  "image", "vision", "creative", "art", "design", "generate image",
  "visual", "logo", "album art", "cover art", "illustration"
];

function routeModel(prompt: string): { model: string; tier: string; matchedKeyword: string | null } {
  const promptLower = prompt.toLowerCase();

  for (const keyword of CREATIVE_KEYWORDS) {
    if (promptLower.includes(keyword)) {
      return { model: TIER_CREATIVE, tier: "creative", matchedKeyword: keyword };
    }
  }

  for (const keyword of COMPLEX_KEYWORDS) {
    if (promptLower.includes(keyword)) {
      return { model: TIER_COMPLEX, tier: "complex", matchedKeyword: keyword };
    }
  }

  for (const keyword of M2_7_KEYWORDS) {
    if (promptLower.includes(keyword)) {
      return { model: TIER_STANDARD, tier: "standard", matchedKeyword: keyword };
    }
  }

  return { model: TIER_SIMPLE, tier: "simple", matchedKeyword: null };
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json(
        { error: "Invalid JSON body", details: String(parseErr) },
        { status: 400 }
      );
    }

    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid prompt", received: body },
        { status: 400 }
      );
    }

    const result = routeModel(prompt);

    return NextResponse.json({
      model: result.model,
      tier: result.tier,
      cost_per_1k: COST_RATES[result.model] || "unknown",
      matched_keyword: result.matchedKeyword,
      prompt_preview: prompt.slice(0, 100),
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("POST /api/route-model error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to route model", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    tiers: {
      simple: { model: TIER_SIMPLE, cost_per_1k: COST_RATES[TIER_SIMPLE] },
      standard: { model: TIER_STANDARD, cost_per_1k: COST_RATES[TIER_STANDARD] },
      creative: { model: TIER_CREATIVE, cost_per_1k: COST_RATES[TIER_CREATIVE] },
      complex: { model: TIER_COMPLEX, cost_per_1k: COST_RATES[TIER_COMPLEX] },
    },
    standard_keywords_count: M2_7_KEYWORDS.length,
    complex_keywords_count: COMPLEX_KEYWORDS.length,
    creative_keywords_count: CREATIVE_KEYWORDS.length,
  });
}
