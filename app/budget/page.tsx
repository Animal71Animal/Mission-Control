"use client";
import { useEffect, useState, useMemo } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  is_business: boolean;
  status: string;
}

interface BudgetData {
  transactions: Transaction[];
  last_updated: string;
  source: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Income": "#00f5d4",
  "Transfer": "#9b5de5",
  "Fixed Bills": "#ff6b6b",
  "Debt Repayment": "#ff4444",
  "Subscriptions": "#f15bb5",
  "Personal": "#fee440",
  "Business Expense": "#00bbf9",
  "Vehicle": "#fd8b50",
  "Health": "#51cf66",
  "Savings": "#00c87c",
  "DJ/Music": "#cc5de8",
  "❓ Uncategorized": "#aaa",
};

const EXPENSE_CATS = ["Fixed Bills","Debt Repayment","Subscriptions","Personal","Business Expense","Vehicle","Health","DJ/Music","Savings"];

const fmt = (n: number) => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtSigned = (n: number) => (n >= 0 ? "+" : "-") + fmt(n);

export default function BudgetPage() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [view, setView] = useState<"overview" | "transactions" | "subscriptions">("overview");

  useEffect(() => {
    fetch("/api/budget")
      .then(r => r.json())
      .then(d => { setData(d); setLoaded(true); })
      .catch(() => {
        fetch("/data/budget-transactions.json").then(r => r.json()).then(d => { setData(d); setLoaded(true); });
      });
  }, []);

  const months = useMemo(() => {
    if (!data) return [];
    const ms = new Set(data.transactions.map(t => t.date.slice(0, 7)));
    return Array.from(ms).sort().reverse();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return selectedMonth === "all"
      ? data.transactions
      : data.transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [data, selectedMonth]);

  const catTotals = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of filtered) {
      m[t.category] = (m[t.category] || 0) + t.amount;
    }
    return m;
  }, [filtered]);

  const subTotals = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of filtered) {
      const key = `${t.category} > ${t.subcategory}`;
      m[key] = (m[key] || 0) + t.amount;
    }
    return m;
  }, [filtered]);

  const totalIncome = catTotals["Income"] || 0;
  const totalExpenses = EXPENSE_CATS.reduce((s, c) => s + Math.abs(catTotals[c] || 0), 0);
  const net = totalIncome - totalExpenses;

  const subscriptions = useMemo(() => {
    return filtered
      .filter(t => t.category === "Subscriptions")
      .reduce((acc, t) => {
        const k = t.subcategory;
        acc[k] = (acc[k] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
  }, [filtered]);

  const catTransactions = useMemo(() => {
    if (!selectedCat) return [];
    return filtered
      .filter(t => t.category === selectedCat)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered, selectedCat]);

  if (!loaded) return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 700 }}>💰 Budget Tracker</h1>
      <p style={{ color: "var(--muted)", marginTop: 16 }}>Loading transactions...</p>
    </div>
  );

  if (!data) return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "var(--text)" }}>💰 Budget Tracker</h1>
      <p style={{ color: "#ff6b6b" }}>Failed to load data.</p>
    </div>
  );

  const card = (label: string, value: string, color: string, sub?: string) => (
    <div style={{ background: "var(--card)", border: `1px solid ${color}40`, borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #fee440, #f15bb5)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>💰 Budget Tracker</h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.85rem" }}>
          {data.source} · {data.transactions.length} transactions · updated {data.last_updated?.slice(0, 10)}
        </p>
      </div>

      {/* Month Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {["all", ...months].map(m => (
          <button key={m} onClick={() => setSelectedMonth(m)} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: "0.82rem", cursor: "pointer",
            background: selectedMonth === m ? "#fee440" : "var(--card)",
            color: selectedMonth === m ? "#000" : "var(--muted)",
            border: selectedMonth === m ? "none" : "1px solid var(--border)",
            fontWeight: selectedMonth === m ? 700 : 400,
          }}>
            {m === "all" ? "All Time" : m}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {card("Total Income", fmt(totalIncome), "#00f5d4", `${filtered.filter(t => t.category === "Income").length} sources`)}
        {card("Total Expenses", fmt(totalExpenses), "#ff6b6b", `excl. transfers`)}
        {card("Net Cash Flow", fmtSigned(net), net >= 0 ? "#00c87c" : "#ff4444", net >= 0 ? "✅ Positive" : "⚠️ Spending > Income")}
        {card("Subscriptions", fmt(Math.abs(catTotals["Subscriptions"] || 0)), "#f15bb5", `${Object.keys(subscriptions).length} active`)}
        {card("Debt Payments", fmt(Math.abs(catTotals["Debt Repayment"] || 0)), "#ff4444", "advances + personal")}
        {card("Savings", fmt(Math.abs(catTotals["Savings"] || 0)), "#00c87c", "Atlas SmartSave")}
      </div>

      {/* View Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
        {(["overview", "transactions", "subscriptions"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "6px 16px", borderRadius: 8, fontSize: "0.83rem", cursor: "pointer", border: "none",
            background: view === v ? "#fee440" : "transparent",
            color: view === v ? "#000" : "var(--muted)",
            fontWeight: view === v ? 700 : 400,
          }}>
            {v === "overview" ? "📊 Overview" : v === "transactions" ? "📋 Transactions" : "🔄 Subscriptions"}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {view === "overview" && (
        <div>
          {/* Income breakdown */}
          <h3 style={{ color: "#00f5d4", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>📥 Income Sources</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 28 }}>
            {Object.entries(subTotals)
              .filter(([k, v]) => k.startsWith("Income >") && v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <div key={k} style={{ background: "var(--card)", border: "1px solid #00f5d420", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 4 }}>{k.replace("Income > ", "")}</div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#00f5d4" }}>{fmt(v)}</div>
                </div>
              ))}
          </div>

          {/* Expense categories */}
          <h3 style={{ color: "#ff6b6b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>📤 Expense Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {EXPENSE_CATS.filter(c => catTotals[c]).sort((a, b) => Math.abs(catTotals[b] || 0) - Math.abs(catTotals[a] || 0)).map(c => {
              const total = Math.abs(catTotals[c] || 0);
              const pct = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
              const color = CATEGORY_COLORS[c] || "#aaa";
              return (
                <div key={c}
                  onClick={() => setSelectedCat(selectedCat === c ? null : c)}
                  style={{ background: "var(--card)", border: `1px solid ${selectedCat === c ? color : "var(--border)"}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>{c}</span>
                    <span style={{ color, fontWeight: 700, fontSize: "1rem" }}>{fmt(total)}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 4 }}>{pct.toFixed(1)}% of total spending</div>

                  {/* Subcategory drill-down */}
                  {selectedCat === c && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      {Object.entries(subTotals)
                        .filter(([k]) => k.startsWith(`${c} >`))
                        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                        .map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "0.82rem" }}>
                            <span style={{ color: "var(--muted)" }}>{k.replace(`${c} > `, "")}</span>
                            <span style={{ color }}>{fmt(Math.abs(v))}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ⚠️ Budget Alerts */}
          <h3 style={{ color: "#fee440", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>⚠️ Budget Alerts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {net < 0 && (
              <div style={{ background: "#ff444420", border: "1px solid #ff4444", borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", color: "#ff4444" }}>
                🚨 Spending exceeds income by {fmt(Math.abs(net))} for this period
              </div>
            )}
            {Math.abs(catTotals["Debt Repayment"] || 0) > 1000 && (
              <div style={{ background: "#ff444415", border: "1px solid #ff444460", borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", color: "#ff6b6b" }}>
                💸 Debt repayment is {fmt(Math.abs(catTotals["Debt Repayment"] || 0))} — cash advances are costing you
              </div>
            )}
            {Math.abs(catTotals["Subscriptions"] || 0) > 300 && (
              <div style={{ background: "#f15bb520", border: "1px solid #f15bb560", borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", color: "#f15bb5" }}>
                🔄 Subscriptions total {fmt(Math.abs(catTotals["Subscriptions"] || 0))} — see Subscriptions tab
              </div>
            )}
            {Math.abs(catTotals["Personal"] || 0) > 1500 && (
              <div style={{ background: "#fee44015", border: "1px solid #fee44060", borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", color: "#fee440" }}>
                🛍️ Personal spending is {fmt(Math.abs(catTotals["Personal"] || 0))} — biggest variable expense category
              </div>
            )}
          </div>
        </div>
      )}

      {/* TRANSACTIONS */}
      {view === "transactions" && (
        <div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Description", "Category", "Subcategory", "Amount"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: h === "Amount" ? "right" : "left", color: "var(--muted)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map(t => {
                  const color = CATEGORY_COLORS[t.category] || "#aaa";
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "9px 12px", color: "var(--muted)", whiteSpace: "nowrap" }}>{t.date}</td>
                      <td style={{ padding: "9px 12px", color: "var(--text)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</td>
                      <td style={{ padding: "9px 12px" }}>
                        <span style={{ background: `${color}20`, color, padding: "2px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 600 }}>{t.category}</span>
                      </td>
                      <td style={{ padding: "9px 12px", color: "var(--muted)", fontSize: "0.78rem" }}>{t.subcategory}</td>
                      <td style={{ padding: "9px 12px", textAlign: "right", color: t.amount >= 0 ? "#00f5d4" : "#ff6b6b", fontWeight: 600 }}>{fmtSigned(t.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 200 && <p style={{ color: "var(--muted)", fontSize: "0.78rem", padding: "12px 0" }}>Showing 200 of {filtered.length} transactions. Filter by month to see more.</p>}
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS */}
      {view === "subscriptions" && (
        <div>
          <div style={{ background: "#f15bb510", border: "1px solid #f15bb540", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 4 }}>Total Subscription Spend ({selectedMonth === "all" ? "all time" : selectedMonth})</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#f15bb5" }}>{fmt(Math.abs(catTotals["Subscriptions"] || 0))}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(subscriptions).sort((a, b) => b[1] - a[1]).map(([name, total]) => {
              const txCount = filtered.filter(t => t.subcategory === name && t.category === "Subscriptions").length;
              const monthly = selectedMonth === "all" ? total / Math.max(months.length, 1) : total;
              return (
                <div key={name} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>{name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: 3 }}>{txCount} charge{txCount !== 1 ? "s" : ""} · ~{fmt(monthly)}/mo</div>
                  </div>
                  <div style={{ color: "#f15bb5", fontWeight: 700, fontSize: "1rem" }}>{fmt(total)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
