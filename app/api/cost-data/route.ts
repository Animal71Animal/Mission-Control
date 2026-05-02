export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * GET /api/cost-data
 * Returns parsed cost tracker data with legacy comparison
 * Reads from public/data/cost-log.json (synced from local log)
 */
export async function GET() {
  try {
    // Try local file first (dev server)
    let data: string;
    try {
      data = readFileSync("/home/ubuntu/wlp/data/model-cost-log.jsonl", "utf8");
    } catch {
      // Fallback to public file (Vercel deployment)
      const publicPath = join(process.cwd(), "public", "data", "cost-log.json");
      data = readFileSync(publicPath, "utf8");
    }

    const lines = data.trim().split("\n").filter(Boolean);
    const entries = lines.map((line) => JSON.parse(line));

    // Aggregate by model
    const byModel: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number; legacyCost: number; savings: number }> = {};
    const byTier: Record<string, { calls: number; cost: number; savings: number }> = {};

    for (const entry of entries) {
      const model = entry.model;
      const tier = entry.tier || "unknown";

      if (!byModel[model]) {
        byModel[model] = { calls: 0, inputTokens: 0, outputTokens: 0, cost: 0, legacyCost: 0, savings: 0 };
      }
      byModel[model].calls += 1;
      byModel[model].inputTokens += entry.input_tokens;
      byModel[model].outputTokens += entry.output_tokens;
      byModel[model].cost += entry.cost_usd;
      byModel[model].legacyCost += entry.legacy_cost_usd || 0;
      byModel[model].savings += entry.savings_usd || 0;

      if (!byTier[tier]) {
        byTier[tier] = { calls: 0, cost: 0, savings: 0 };
      }
      byTier[tier].calls += 1;
      byTier[tier].cost += entry.cost_usd;
      byTier[tier].savings += entry.savings_usd || 0;
    }

    const totalCost = entries.reduce((sum: number, e: any) => sum + e.cost_usd, 0);
    const totalLegacyCost = entries.reduce((sum: number, e: any) => sum + (e.legacy_cost_usd || 0), 0);
    const totalSavings = entries.reduce((sum: number, e: any) => sum + (e.savings_usd || 0), 0);
    const totalCalls = entries.length;

    return NextResponse.json({
      totalCalls,
      totalCost: Math.round(totalCost * 100000000) / 100000000,
      totalLegacyCost: Math.round(totalLegacyCost * 100000000) / 100000000,
      totalSavings: Math.round(totalSavings * 100000000) / 100000000,
      byModel,
      byTier,
      entries: entries.slice(-50),
    });
  } catch (err) {
    return NextResponse.json({
      totalCalls: 0,
      totalCost: 0,
      totalLegacyCost: 0,
      totalSavings: 0,
      byModel: {},
      byTier: {},
      entries: [],
    });
  }
}
