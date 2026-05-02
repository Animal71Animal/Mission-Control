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
  legacy_cost_usd?: number;
  savings_usd?: number;
  savings_pct?: number;
  legacy_model?: string;
}

interface CostData {
  totalCalls: number;
  totalCost: number;
  totalLegacyCost: number;
  totalSavings: number;
  byModel: Record<string, { calls: number; inputTokens: number; outputTokens: number; cost: number; legacyCost: number; savings: number }>;
  byTier: Record<string, { calls: number; cost: number; savings: number }>;
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

const LEGACY_NAMES: Record<string, string> = {
  "kimi-k2.5": "Kimi K2.5",
  "claude-opus": "Claude Opus 4.7",
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
          AI model cost tracking — see savings vs your legacy usage
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
        </div>

        {/* Comparison Reference */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ marginBottom: 16 }}>Your Savings Setup</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { tier: "simple", newModel: "GPT-5 Nano", newCost: "$0.00045", legacyModel: "Kimi K2.5", legacyCost: "$0.0009", desc: "Weather, reminders" },
              { tier: "standard", newModel: "MiniMax M2.7", newCost: "$0.0009", legacyModel: "Kimi K2.5", legacyCost: "$0.0009", desc: "Coding, Mission Control" },
              { tier: "creative", newModel: "Kimi K2.6", newCost: "$0.00545", legacyModel: "Kimi K2.5", legacyCost: "$0.0009", desc: "Vision, creative tasks" },
              { tier: "complex", newModel: "GPT-5.5", newCost: "$0.0175", legacyModel: "Claude Opus", legacyCost: "$0.025", desc: "Investor docs, legal" },
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
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>NEW (Router)</div>
                  <h3 style={{ marginBottom: 4 }}>{t.newModel}</h3>
                  <p style={{ color: "var(--accent2)", fontWeight: 700 }}>{t.newCost}/1K</p>
                </div>
                <div style={{ 
                  borderTop: "1px solid var(--border)", 
                  paddingTop: 12,
                  opacity: 0.7 
                }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>LEGACY (Your Old)</div>
                  <div style={{ fontSize: "0.875rem" }}>{t.legacyModel}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{t.legacyCost}/1K</div>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: 12 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const savingsRate = data.totalLegacyCost > 0 
    ? (data.totalSavings / data.totalLegacyCost * 100) 
    : 0;
  const isSaving = data.totalSavings >= 0;

  return (
    <div style={{ padding: 32, maxWidth: 1200 }}>
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>💸 Cost Tracker</h1>
      <p style={{ color: "var(--muted)", marginBottom: 32 }}>
        AI model cost tracking — see savings vs your legacy usage
      </p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <SummaryCard title="Total Calls" value={data.totalCalls.toString()} icon="📞" />
        <SummaryCard title="Actual Cost" value={`$${data.totalCost.toFixed(8)}`} icon="💰" />
        <SummaryCard title="Legacy Cost" value={`$${data.totalLegacyCost.toFixed(8)}`} icon="📊" />
        <SummaryCard 
          title={isSaving ? "💵 You Saved" : "💸 Extra Spent"} 
          value={`$${Math.abs(data.totalSavings).toFixed(8)}`} 
          icon={isSaving ? "🎉" : "⚠️"}
          highlight={isSaving ? "#00f5d4" : "#f15bb5"}
        />
      </div>

      {/* Savings Banner */}
      <div style={{
        background: isSaving ? "rgba(0, 245, 212, 0.1)" : "rgba(241, 91, 181, 0.1)",
        border: `2px solid ${isSaving ? "#00f5d4" : "#f15bb5"}`,
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
        textAlign: "center",
      }}>
        <div style={{ fontSize: "3rem", marginBottom: 8 }}>{isSaving ? "🎉" : "⚠️"}</div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: 8 }}>
          {isSaving 
            ? `You're saving ${savingsRate.toFixed(1)}% with the router!` 
            : `Spending ${Math.abs(savingsRate).toFixed(1)}% more than legacy`
          }
        </h2>
        <p style={{ color: "var(--muted)" }}>
          {isSaving 
            ? "The router is putting cheap tasks on cheap models." 
            : "Complex tasks cost more, but you're getting better capabilities."
          }
        </p>
      </div>

      {/* By Tier with Savings */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Spend by Tier (with Savings)</h2>
        <div style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
        }}>
          {Object.entries(data.byTier).map(([tier, stats]) => {
            const pct = data.totalCost > 0 ? (stats.cost / data.totalCost) * 100 : 0;
            const tierSavings = stats.savings || 0;
            const tierSavingPct = stats.cost > 0 ? (tierSavings / stats.cost * 100) : 0;
            return (
              <div key={tier} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{tier}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                    {stats.calls} calls
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.875rem" }}>
                  <span>Cost: <strong>${stats.cost.toFixed(8)}</strong></span>
                  <span style={{ color: tierSavings >= 0 ? "#00f5d4" : "#f15bb5" }}>
                    {tierSavings >= 0 ? "💵" : "💸"} ${Math.abs(tierSavings).toFixed(8)} {tierSavings >= 0 ? "saved" : "extra"}
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

      {/* By Model with Comparison */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ marginBottom: 16 }}>Model Comparison</h2>
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
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Actual</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Legacy</th>
                <th style={{ padding: "12px 8px", textAlign: "right" }}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.byModel).map(([model, stats]) => {
                const diff = stats.savings || 0;
                const isPositive = diff >= 0;
                return (
                  <tr key={model} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 600 }}>
                      {MODEL_NAMES[model] || model}
                    </td>
                    <td style={{ padding: "12px 8px" }}>{stats.calls}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>
                      ${stats.cost.toFixed(8)}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "right", color: "var(--muted)" }}>
                      ${stats.legacyCost.toFixed(8)}
                    </td>
                    <td style={{ 
                      padding: "12px 8px", 
                      textAlign: "right", 
                      fontWeight: 600,
                      color: isPositive ? "#00f5d4" : "#f15bb5"
                    }}>
                      {isPositive ? "+" : ""}${diff.toFixed(8)}
                    </td>
                  </tr>
                );
              })}
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
          {data.entries.slice().reverse().map((entry, i) => {
            const entrySavings = entry.savings_usd || 0;
            const isEntrySaving = entrySavings >= 0;
            return (
              <div key={i} style={{
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                    <div style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 12,
                      background: TIER_COLORS[entry.tier] || "#666",
                      color: "#000",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}>
                      {entry.tier}
                    </div>
                    {entry.legacy_model && (
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                        vs {LEGACY_NAMES[entry.legacy_model] || entry.legacy_model}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.prompt_preview || "No preview"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    ${entry.cost_usd.toFixed(8)}
                  </div>
                  <div style={{ 
                    fontSize: "0.75rem", 
                    color: isEntrySaving ? "#00f5d4" : "#f15bb5"
                  }}>
                    {isEntrySaving ? "💵" : "💸"} ${Math.abs(entrySavings).toFixed(8)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, highlight }: { title: string; value: string; icon: string; highlight?: string }) {
  return (
    <div style={{
      background: "var(--card)",
      border: highlight ? `2px solid ${highlight}` : "1px solid var(--border)",
      borderRadius: 12,
      padding: 24,
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: highlight || "inherit" }}>{value}</div>
    </div>
  );
}
