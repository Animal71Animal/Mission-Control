export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
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

async function fetchGitHubFile() {
  const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return { content: decoded, sha: data.sha };
}

async function writeGitHubFile(content: string, sha: string, msg: string) {
  const encoded = Buffer.from(content).toString("base64");
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
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

function writeLocalLog(content: string) {
  try {
    writeFileSync(LOCAL_LOG_FILE, content, "utf8");
  } catch {
    // Local write may fail on Vercel
  }
  try {
    writeFileSync(PUBLIC_LOG_FILE, content, "utf8");
  } catch {
    // Public write may fail on Vercel
  }
}

/**
 * POST /api/log-model
 * Body: { "model": "minimax-m2.7", "tier": "standard", "prompt": "...", "input_tokens": 1000, "output_tokens": 500 }
 * Logs a model call to the cost tracker in real-time and syncs to GitHub
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

    // Read existing log
    const existingLog = readLocalLog();
    const newLog = existingLog + JSON.stringify(entry) + "\n";

    // Write locally
    writeLocalLog(newLog);

    // Sync to GitHub
    try {
      const { sha } = await fetchGitHubFile();
      await writeGitHubFile(newLog, sha, `🦞 PriScylla: Log model call ${model} ${tier}`);
    } catch (ghErr) {
      console.error("GitHub sync failed:", ghErr);
      // Don't fail the request if GitHub sync fails
    }

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
