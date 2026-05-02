export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { appendFileSync } from "fs";

const LOG_FILE = "/home/ubuntu/wlp/data/model-cost-log.jsonl";

/**
 * POST /api/log-model
 * Body: { "model": "minimax-m2.7", "tier": "standard", "prompt": "...", "input_tokens": 1000, "output_tokens": 500 }
 * Logs a model call to the cost tracker in real-time
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model, tier, prompt, input_tokens, output_tokens } = body;

    if (!model || !input_tokens || !output_tokens) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate costs
    const costRates: Record<string, { input: number; output: number }> = {
      "gpt-5-nano": { input: 0.00000005, output: 0.0000004 },
      "minimax-m2.7": { input: 0.0000003, output: 0.0000012 },
      "kimi-k2.6": { input: 0.00000095, output: 0.000004 },
      "claude-opus-4.7": { input: 0.000005, output: 0.000025 },
    };

    const legacyRates: Record<string, { input: number; output: number }> = {
      "kimi-k2.5": { input: 0.0000006, output: 0.000003 },
      "claude-opus": { input: 0.000005, output: 0.000025 },
    };

    const rates = costRates[model] || { input: 0, output: 0 };
    const cost = (input_tokens / 1000) * rates.input + (output_tokens / 1000) * rates.output;

    // Determine legacy model based on tier
    const legacyModel = tier === "complex" ? "claude-opus" : "kimi-k2.5";
    const legacyRate = legacyRates[legacyModel] || { input: 0, output: 0 };
    const legacyCost = (input_tokens / 1000) * legacyRate.input + (output_tokens / 1000) * legacyRate.output;
    const savings = legacyCost - cost;

    const entry = {
      timestamp: new Date().toISOString(),
      model,
      tier: tier || "unknown",
      prompt_preview: prompt?.slice(0, 100) || "",
      input_tokens,
      output_tokens,
      cost_usd: Math.round(cost * 100000000) / 100000000,
      legacy_model: legacyModel,
      legacy_cost_usd: Math.round(legacyCost * 100000000) / 100000000,
      savings_usd: Math.round(savings * 100000000) / 100000000,
      savings_pct: legacyCost > 0 ? Math.round((savings / legacyCost) * 1000) / 10 : 0,
    };

    appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");

    return NextResponse.json({
      success: true,
      logged: entry,
    });
  } catch (err) {
    console.error("POST /api/log-model error:", err);
    return NextResponse.json(
      { error: "Failed to log model call" },
      { status: 500 }
    );
  }
}
