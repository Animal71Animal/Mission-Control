"use client";

import { useEffect, useState } from "react";

interface CostEntry {
  timestamp: string;
  model: string;
  tier: string;
  prompt_preview: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
}

interface CostData {
  totalCalls: number;
  totalCost: number;
  byModel: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number }>;
  byTier: Record<string, { calls: number; cost: number }>;
  entries: CostEntry[];
}

const TIER_COLORS: Record<string, string> = {
  simple: "#00f5d4",
  standard: "#9b5de5",
  creative: "#f15bb5",
  complex: "#fee440",
};

const MODEL_NAMES: Record<string, string> = {
  "gpt-5-nano": "GPT-5 Nano",
  "minimax-m2.7": "MiniMax M2.7",
  "kimi-k2.6": "Kimi K2.6",
  "gpt-5.5": "GPT-5.5",
};

export default function CostTrackerPage() {
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cost-data")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 32 }}>
        <h1>💸 Cost Tracker</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!data || data.totalCalls === 0) {
    return (
      <div style={{ padding: 32, maxWidth: 1200 }}>
        <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>💸 Cost Tracker</h1>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>
          AI model cost tracking — see spend by tier and model
        </p>
        
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 48,
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📊</div>
          <h2 style={{ marginBottom: 8 }}>No Data Yet</h2>
          <p style={{ color: "var(--muted)" }}>
            API calls will be logged here once the cost tracker starts receiving data.
          </p>
          <p style={{ color: "var(--muted)", marginTop: 16, fontSize: "0.875rem" }}>
            Log file: <code>/home/ubuntu/wlp/data/model-cost-log.jsonl</code>
          </p>
        </div>

        {/* Tier Reference */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 16 }}>Model Tiers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { tier: "simple", model: "GPT-5 Nano", cost: "$0.00045", desc: "Weather, reminders, simple chat" },
              { tier: "standard", model: "MiniMax M2.7", cost: "$0.0009", desc: "Mission Control, coding, WLP projects" },
              { tier: "creative", model: "Kimi K2.6", cost: "$0.00545", desc: "Vision, creative tasks" },
              { tier: "complex", model: "GPT-5.5", cost: "$0.0175", desc: "Investor docs, legal, advanced reasoning" },
            ].map((t) => (
              <div key={t.tier} style={{
                background: "var(--card)",
                border: `2px solid ${TIER_COLORS[t.tier]}`,
                borderRadius: 12,
                padding: 20,
              }}>
                <div style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: TIER_COLORS[t.tier],
                  color: "#000",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}>
                  {t.tier}
                </div>
                <h3 style={{ marginBottom: 4 }}>{t.model}</h3>
                <p style={{ color: "var(--accent2)", fontSize: "1.25rem", fontWeight: 700, marginBottom: 8 }}>
                  {t.cost}
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}> / 1K tokens</span>
                </p>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>💸 Cost Tracker</h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>
        AI model cost tracking — see spend by tier and model
      </p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <SummaryCard title="Total Calls" value={data.totalCalls.toString()} icon="📞" />
        <SummaryCard title="Total Cost" value={`$${data.totalCost.toFixed(8)}`} icon="💰" />
        <SummaryCard title="Avg Cost/Call" value={`$${(data.totalCost / data.totalCalls).toFixed(8)}`} icon="📊" />
      </div>

      {/* By Tier */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Spend by Tier</h2>
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}>
          {Object.entries(data.byTier).map(([tier, stats]) => {
            const pct = (stats.cost / data.totalCost) * 100;
            return (
              <div key={tier} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{tier}</span>
                  <span style={{ color: "var(--muted)" }}>
                    {stats.calls} calls · ${stats.cost.toFixed(8)} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div style={{
                  height: 24,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: TIER_COLORS[tier] || "#666",
                    borderRadius: 12,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Model */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Spend by Model</h2>
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                <th style={{ padding: "12px 8px" }}>Model</th>
                <th style={{ padding: "12px 8px" }}>Calls</th>
                <th style={{ padding: "12px 8px" }}>Input Tokens</th>
                <th style={{ padding: "12px 8px" }}>Output Tokens</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.byModel).map(([model, stats]) => (
                <tr key={model} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 600 }}>
                    {MODEL_NAMES[model] || model}
                  </td>
                  <td style={{ padding: "12px 8px" }}>{stats.calls}</td>
                  <td style={{ padding: "12px 8px" }}>{stats.inputTokens.toLocaleString()}</td>
                  <td style={{ padding: "12px 8px" }}>{stats.outputTokens.toLocaleString()}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 600 }}>
                    ${stats.cost.toFixed(8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Entries */}
      <div>
        <h2 style={{ marginBottom: 16 }}>Recent Calls</h2>
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          maxHeight: 500,
          overflow: "auto",
        }}>
          {data.entries.slice().reverse().map((entry, i) => (
            <div key={i} style={{
              padding: "12px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 12,
                  background: TIER_COLORS[entry.tier] || "#666",
                  color: "#000",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}>
                  {entry.tier}
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {entry.prompt_preview || "No preview"}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  ${entry.cost_usd.toFixed(8)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {entry.input_tokens} in / {entry.output_tokens} out
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 24,
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}
