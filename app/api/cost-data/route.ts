export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const LOCAL_LOG_FILE = "/home/ubuntu/wlp/data/model-cost-log.jsonl";
const PUBLIC_LOG_FILE = join(process.cwd(), "public", "data", "cost-log.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const GITHUB_BRANCH = "main";
const FILE_PATH = "public/data/cost-log.json";
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchGitHubFile(): Promise<string> {
  const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}

function readLocalLog(): string {
  try {
    return readFileSync(LOCAL_LOG_FILE, "utf8");
  } catch {
    try {
      return readFileSync(PUBLIC_LOG_FILE, "utf8");
    } catch {
      return "";
    }
  }
}

// Model display names
const MODEL_NAMES: Record<string, string> = {
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "claude-opus-4-6": "Claude Opus 4.6",
  "claude-haiku-4-5": "Claude Haiku 4.5",
  "gemini-3-flash-preview": "Gemini 3 Flash",
  "m2.7": "MiniMax M2.7",
  "kimi-k2.6": "Kimi K2.6",
};

const TIER_COLORS: Record<string, string> = {
  simple: "#00f5d4",
  standard: "#9b5de5",
  creative: "#f15bb5",
  complex: "#fee440",
};

/**
 * GET /api/cost-data
 * Returns parsed cost tracker data with legacy comparison
 * Reads from GitHub (live) or local fallback
 */
export async function GET() {
  try {
    // Try GitHub first for live data
    let rawData: string;
    try {
      rawData = await fetchGitHubFile();
    } catch {
      // Fallback to local file
      rawData = readLocalLog();
    }

    const lines = rawData.trim().split("\n").filter(Boolean);
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
      modelNames: MODEL_NAMES,
      tierColors: TIER_COLORS,
    });
  } catch (err) {
    console.error("GET /api/cost-data error:", err);
    return NextResponse.json({
      totalCalls: 0,
      totalCost: 0,
      totalLegacyCost: 0,
      totalSavings: 0,
      byModel: {},
      byTier: {},
      entries: [],
      modelNames: MODEL_NAMES,
      tierColors: TIER_COLORS,
    });
  }
}
