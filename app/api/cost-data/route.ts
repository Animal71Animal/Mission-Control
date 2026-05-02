export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readFileSync } from "fs";

const LOG_FILE = "/home/ubuntu/wlp/data/model-cost-log.jsonl";

/**
 * GET /api/cost-data
 * Returns parsed cost tracker data for the dashboard
 */
export async function GET() {
  try {
    const data = readFileSync(LOG_FILE, "utf8");
    const lines = data.trim().split("\n").filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line));

    // Aggregate by model
    const byModel: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number }> = {};
    const byTier: Record<string, { calls: number; cost: number }> = {};

    for (const entry of entries) {
      const model = entry.model;
      const tier = entry.tier || "unknown";

      if (!byModel[model]) {
        byModel[model] = { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
      }
      byModel[model].calls += 1;
      byModel[model].inputTokens += entry.input_tokens;
      byModel[model].outputTokens += entry.output_tokens;
      byModel[model].cost += entry.cost_usd;

      if (!byTier[tier]) {
        byTier[tier] = { calls: 0, cost: 0 };
      }
      byTier[tier].calls += 1;
      byTier[tier].cost += entry.cost_usd;
    }

    const totalCost = entries.reduce((sum: number, e: any) => sum + e.cost_usd, 0);
    const totalCalls = entries.length;

    return NextResponse.json({
      totalCalls,
      totalCost: Math.round(totalCost * 100000000) / 100000000,
      byModel,
      byTier,
      entries: entries.slice(-50), // Last 50 entries
    });
  } catch (err) {
    // Return empty data if file doesn't exist yet
    return NextResponse.json({
      totalCalls: 0,
      totalCost: 0,
      byModel: {},
      byTier: {},
      entries: [],
    });
  }
}
