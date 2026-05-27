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
}

interface MonthlySummary {
  income: number;
  expenses: number;
  net: number;
  by_category: Record<string, number>;
  by_subcategory: Record<string, number>;
  transaction_count: number;
}

interface BudgetData {
  transactions: Transaction[];
  monthly_summaries: Record<string, MonthlySummary>;
  last_updated: string;
  source: string;
}

const CAT_COLORS: Record<string, string> = {
  "Income":           "#00f5d4",
  "Fixed Bills":      "#ff6b6b",
  "Debt Repayment":   "#ff4444",
  "Subscriptions":    "#f15bb5",
  "Personal":         "#fee440",
  "Business Expense": "#00bbf9",
  "Vehicle":          "#fd8b50",
  "Health":           "#51cf66",
  "Savings":          "#00c87c",
  "DJ/Music":         "#cc5de8",
  "Transfer":         "#9b5de5",
  "Fees & Interest":  "#ff8c00",
};

const EXPENSE_CATS = [
  "Fixed Bills","Debt Repayment","Subscriptions",
  "Personal","Business Expense","Vehicle","Health","Savings","DJ/Music",
  "Fees & Interest",
];

const MONTH_LABELS: Record<string, string> = {
  "2026-02": "Feb '26", "2026-03": "Mar '26",
  "2026-04": "Apr '26", "2026-05": "May '26",
};

const fmt  = (n: number) => `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtS = (n: number) => (n >= 0 ? "+" : "−") + fmt(n);

type ViewMode = "monthly" | "categories" | "subscriptions" | "transactions";

export default function BudgetPage() {
  const [data, setData]         = useState<BudgetData | null>(null);
  const [loaded, setLoaded]     = useState(false);
  const [view, setView]         = useState<ViewMode>("monthly");
  const [drillMonth, setDrillMonth] = useState<string | null>(null);
  const [drillCat, setDrillCat]     = useState<string | null>(null);
  const [txFilter, setTxFilter]     = useState<string>("all");

  useEffect(() => {
    fetch("/api/budget")
      .then(r => r.json())
      .then(d => { setData(d); setLoaded(true); })
      .catch(() =>
        fetch("/data/budget-transactions.json").then(r => r.json())
          .then(d => { setData(d); setLoaded(true); })
      );
  }, []);

  const months = useMemo(() =>
    data ? Object.keys(data.monthly_summaries).sort() : [], [data]);

  // Subcategories that belong to the Transfer category (Dave advances/repayments)
  // These are excluded from expense line-item displays — only Dave fees show as real costs
  const transferSubcats = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.transactions.filter(t => t.category === "Transfer").map(t => t.subcategory));
  }, [data]);

  // All-time totals (exclude Feb which is just a carryover)
  const activeMonths = useMemo(() => months.filter(m => m >= "2026-03"), [months]);

  const allTimeSummary = useMemo(() => {
    if (!data) return null;
    const totals: Record<string, number> = {};
    let income = 0, expenses = 0;
    for (const m of activeMonths) {
      const s = data.monthly_summaries[m];
      income += s.income;
      expenses += s.expenses;
      for (const [k, v] of Object.entries(s.by_category)) {
        totals[k] = (totals[k] || 0) + v;
      }
    }
    return { income, expenses, net: income - expenses, by_category: totals };
  }, [data, activeMonths]);

  const filteredTx = useMemo(() => {
    if (!data) return [];
    return txFilter === "all"
      ? data.transactions
      : data.transactions.filter(t => {
          const parts = t.date.split("/");
          return `${parts[2]}-${parts[0]}` === txFilter;
        });
  }, [data, txFilter]);

  if (!loaded) return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "var(--text)", fontSize: "1.5rem", fontWeight: 700 }}>💵 Budget Tracker</h1>
      <p style={{ color: "var(--muted)", marginTop: 16 }}>Loading...</p>
    </div>
  );
  if (!data || !allTimeSummary) return null;

  const Tab = ({ id, label }: { id: ViewMode; label: string }) => (
    <button onClick={() => setView(id)} style={{
      padding: "7px 16px", borderRadius: 8, fontSize: "0.83rem", cursor: "pointer", border: "none",
      background: view === id ? "#fee440" : "transparent",
      color: view === id ? "#000" : "var(--muted)",
      fontWeight: view === id ? 700 : 400,
    }}>{label}</button>
  );

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #fee440, #f15bb5)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>💵 Budget Tracker</h1>
        <p style={{ color: "var(--muted)", marginTop: 5, fontSize: "0.82rem" }}>
          {data.source} · {data.transactions.length} transactions · {data.last_updated?.slice(0, 10)}
        </p>
      </div>

      {/* All-Time KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Income",   value: fmt(allTimeSummary.income),   color: "#00f5d4", sub: `${activeMonths.length} months` },
          { label: "Total Expenses", value: fmt(allTimeSummary.expenses),  color: "#ff6b6b", sub: "excl. Dave advances" },
          { label: "Net Cash Flow",  value: fmtS(allTimeSummary.net),      color: allTimeSummary.net >= 0 ? "#00c87c" : "#ff4444",
            sub: allTimeSummary.net >= 0 ? "✅ Positive" : "⚠️ Spending > Income" },
          { label: "Avg Monthly",    value: fmt(allTimeSummary.expenses / activeMonths.length), color: "#fd8b50", sub: "expenses/month" },
        ].map(c => (
          <div key={c.label} style={{ background: "var(--card)", border: `1px solid ${c.color}40`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{c.label}</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, color: c.color }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 3 }}>{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
        <Tab id="monthly"       label="📅 Monthly" />
        <Tab id="categories"    label="📊 Categories" />
        <Tab id="subscriptions" label="🔄 Subscriptions" />
        <Tab id="transactions"  label="📋 Transactions" />
      </div>

      {/* ── MONTHLY VIEW ── */}
      {view === "monthly" && (
        <div>
          {/* Month cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
            {activeMonths.map(m => {
              const s = data.monthly_summaries[m];
              const net = s.net;
              const isSelected = drillMonth === m;
              return (
                <div key={m} onClick={() => setDrillMonth(isSelected ? null : m)} style={{
                  background: isSelected ? "rgba(254,228,64,0.1)" : "var(--card)",
                  border: `1px solid ${isSelected ? "#fee440" : "var(--border)"}`,
                  borderRadius: 14, padding: 18, cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
                    {MONTH_LABELS[m] || m}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Income</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#00f5d4" }}>{fmt(s.income)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Expenses</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ff6b6b" }}>{fmt(s.expenses)}</span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Net</span>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: net >= 0 ? "#00c87c" : "#ff4444" }}>{fmtS(net)}</span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 6 }}>{s.transaction_count} transactions</div>
                </div>
              );
            })}
          </div>

          {/* Monthly drill-down */}
          {drillMonth && data.monthly_summaries[drillMonth] && (() => {
            const s = data.monthly_summaries[drillMonth];
            return (
              <div style={{ background: "var(--card)", border: "1px solid #fee44060", borderRadius: 14, padding: 20, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, color: "#fee440", fontSize: "1rem" }}>{MONTH_LABELS[drillMonth] || drillMonth} — Breakdown</h3>
                  <button onClick={() => setDrillMonth(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.9rem" }}>✕</button>
                </div>
                {EXPENSE_CATS.filter(c => s.by_category[c]).sort((a, b) => Math.abs(s.by_category[b] || 0) - Math.abs(s.by_category[a] || 0)).map(c => {
                  const val = Math.abs(s.by_category[c] || 0);
                  const pct = s.expenses > 0 ? (val / s.expenses) * 100 : 0;
                  const color = CAT_COLORS[c] || "#aaa";
                  return (
                    <div key={c} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "var(--text)", fontSize: "0.85rem" }}>{c}</span>
                        <span style={{ color, fontWeight: 700, fontSize: "0.85rem" }}>{fmt(val)}</span>
                      </div>
                      <div style={{ height: 5, background: "var(--border)", borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
                {/* Top subcategories — Transfer (Dave advances/repayments) excluded; only real expenses shown */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Top Line Items</div>
                  {Object.entries(s.by_subcategory)
                    .filter(([k, v]) => v < 0 && !transferSubcats.has(k))
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 8)
                    .map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: "0.82rem" }}>
                        <span style={{ color: "var(--muted)" }}>{k}</span>
                        <span style={{ color: "#ff6b6b", fontWeight: 600 }}>{fmt(Math.abs(v))}</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })()}

          {/* Monthly comparison table */}
          <h3 style={{ color: "var(--muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Month-over-Month Comparison</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "8px 14px", textAlign: "left", color: "var(--muted)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase" }}>Category</th>
                  {activeMonths.map(m => (
                    <th key={m} style={{ padding: "8px 14px", textAlign: "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.7rem", textTransform: "uppercase" }}>{MONTH_LABELS[m] || m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Income", ...EXPENSE_CATS].map(c => (
                  <tr key={c} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "9px 14px", color: CAT_COLORS[c] || "var(--text)", fontWeight: 600 }}>{c}</td>
                    {activeMonths.map(m => {
                      const val = data.monthly_summaries[m].by_category[c] || 0;
                      const isIncome = c === "Income";
                      const display = val === 0 ? "—" : fmt(Math.abs(val));
                      const color = val === 0 ? "var(--border)" : isIncome ? "#00f5d4" : "#ff6b6b";
                      return (
                        <td key={m} style={{ padding: "9px 14px", textAlign: "right", color, fontWeight: val !== 0 ? 600 : 400 }}>{display}</td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid var(--border)", background: "var(--card)" }}>
                  <td style={{ padding: "10px 14px", color: "var(--text)", fontWeight: 700 }}>NET</td>
                  {activeMonths.map(m => {
                    const net = data.monthly_summaries[m].net;
                    return (
                      <td key={m} style={{ padding: "10px 14px", textAlign: "right", color: net >= 0 ? "#00c87c" : "#ff4444", fontWeight: 700 }}>{fmtS(net)}</td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CATEGORIES VIEW ── */}
      {view === "categories" && (
        <div>
          {EXPENSE_CATS.filter(c => allTimeSummary.by_category[c]).sort((a, b) =>
            Math.abs(allTimeSummary.by_category[b] || 0) - Math.abs(allTimeSummary.by_category[a] || 0)
          ).map(c => {
            const total = Math.abs(allTimeSummary.by_category[c] || 0);
            const pct = allTimeSummary.expenses > 0 ? (total / allTimeSummary.expenses) * 100 : 0;
            const color = CAT_COLORS[c] || "#aaa";
            const isOpen = drillCat === c;
            // Subcategory totals across all months
            const subs: Record<string, number> = {};
            for (const m of activeMonths) {
              for (const [k, v] of Object.entries(data.monthly_summaries[m].by_subcategory)) {
                if (v < 0) subs[k] = (subs[k] || 0) + v;
              }
            }
            const catSubs = Object.entries(subs)
              .filter(([k]) => {
                const txForSub = data.transactions.filter(t => t.subcategory === k && t.category === c);
                return txForSub.length > 0;
              })
              .sort((a, b) => a[1] - b[1]);

            return (
              <div key={c} style={{ marginBottom: 10 }}>
                <div onClick={() => setDrillCat(isOpen ? null : c)} style={{
                  background: "var(--card)", border: `1px solid ${isOpen ? color : "var(--border)"}`,
                  borderRadius: 12, padding: "14px 18px", cursor: "pointer",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ color: "var(--text)", fontWeight: 600 }}>{c}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{pct.toFixed(1)}%</span>
                      <span style={{ color, fontWeight: 700, fontSize: "1rem" }}>{fmt(total)}</span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "var(--border)", borderRadius: 4 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
                  </div>
                  {isOpen && catSubs.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                      {catSubs.map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "0.82rem" }}>
                          <span style={{ color: "var(--muted)" }}>{k}</span>
                          <span style={{ color, fontWeight: 600 }}>{fmt(Math.abs(v))}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Budget alerts */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ color: "#fee440", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>⚠️ Where Your Money Is Going</h3>
            {[
              allTimeSummary.net < 0 && { color: "#ff4444", bg: "#ff444420", msg: `🚨 Spending exceeds income by ${fmt(Math.abs(allTimeSummary.net))} over ${activeMonths.length} months` },
              Math.abs(allTimeSummary.by_category["Fees & Interest"] || 0) > 0 && { color: "#ff8c00", bg: "#ff8c0020", msg: `💳 ${fmt(Math.abs(allTimeSummary.by_category["Fees & Interest"] || 0))} in Dave cash advance fees — this is your true cost of using Dave` },
              Math.abs(allTimeSummary.by_category["Debt Repayment"] || 0) > 500 && { color: "#ff6b6b", bg: "#ff444415", msg: `💸 ${fmt(Math.abs(allTimeSummary.by_category["Debt Repayment"] || 0))} in debt repayments` },
              Math.abs(allTimeSummary.by_category["Subscriptions"] || 0) > 400 && { color: "#f15bb5", bg: "#f15bb520", msg: `🔄 ${fmt(Math.abs(allTimeSummary.by_category["Subscriptions"] || 0))} in subscriptions — review Subscriptions tab` },
              Math.abs(allTimeSummary.by_category["Personal"] || 0) > 1000 && { color: "#fee440", bg: "#fee44015", msg: `🛍️ ${fmt(Math.abs(allTimeSummary.by_category["Personal"] || 0))} in personal spending — largest variable category` },
            ].filter(Boolean).map((alert: any, i) => (
              <div key={i} style={{ background: alert.bg, border: `1px solid ${alert.color}60`, borderRadius: 10, padding: "12px 16px", fontSize: "0.85rem", color: alert.color, marginBottom: 8 }}>
                {alert.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTIONS VIEW ── */}
      {view === "subscriptions" && (() => {
        const subs: Record<string, { total: number; count: number; months: Set<string> }> = {};
        for (const m of activeMonths) {
          for (const t of data.transactions) {
            const parts = t.date.split("/");
            const tm = `${parts[2]}-${parts[0]}`;
            if (tm !== m || t.category !== "Subscriptions") continue;
            const k = t.subcategory;
            if (!subs[k]) subs[k] = { total: 0, count: 0, months: new Set() };
            subs[k].total += Math.abs(t.amount);
            subs[k].count += 1;
            subs[k].months.add(m);
          }
        }
        const totalSubs = Object.values(subs).reduce((s, v) => s + v.total, 0);
        return (
          <div>
            <div style={{ background: "#f15bb510", border: "1px solid #f15bb540", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 4 }}>Total Subscriptions ({activeMonths.length} months)</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f15bb5" }}>{fmt(totalSubs)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 4 }}>Monthly Average</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f15bb5" }}>{fmt(totalSubs / activeMonths.length)}</div>
              </div>
            </div>
            {Object.entries(subs).sort((a, b) => b[1].total - a[1].total).map(([name, info]) => {
              const isCancel = name.includes("CANCEL");
              return (
                <div key={name} style={{ background: "var(--card)", border: `1px solid ${isCancel ? "#ff444460" : "var(--border)"}`, borderRadius: 10, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: isCancel ? "#ff6b6b" : "var(--text)", fontWeight: 600, fontSize: "0.9rem" }}>{name}</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.72rem", marginTop: 3 }}>
                      {info.count} charge{info.count !== 1 ? "s" : ""} · {info.months.size} month{info.months.size !== 1 ? "s" : ""} · ~{fmt(info.total / info.months.size)}/mo
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: isCancel ? "#ff6b6b" : "#f15bb5", fontWeight: 700, fontSize: "1rem" }}>{fmt(info.total)}</div>
                    {isCancel && <div style={{ fontSize: "0.68rem", color: "#ff6b6b", marginTop: 2 }}>⚠️ CANCEL</div>}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── TRANSACTIONS VIEW ── */}
      {view === "transactions" && (
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {["all", ...activeMonths].map(m => (
              <button key={m} onClick={() => setTxFilter(m)} style={{
                padding: "5px 12px", borderRadius: 8, fontSize: "0.8rem", cursor: "pointer",
                background: txFilter === m ? "#fee440" : "var(--card)",
                color: txFilter === m ? "#000" : "var(--muted)",
                border: txFilter === m ? "none" : "1px solid var(--border)",
                fontWeight: txFilter === m ? 700 : 400,
              }}>{m === "all" ? "All" : MONTH_LABELS[m] || m}</button>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Date","Description","Category","Subcategory","Amount"].map(h => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: h === "Amount" ? "right" : "left", color: "var(--muted)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTx.slice(0, 250).map(t => {
                  const color = CAT_COLORS[t.category] || "#aaa";
                  return (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px 12px", color: "var(--muted)", whiteSpace: "nowrap" }}>{t.date}</td>
                      <td style={{ padding: "8px 12px", color: "var(--text)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ background: `${color}20`, color, padding: "2px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 600 }}>{t.category}</span>
                      </td>
                      <td style={{ padding: "8px 12px", color: "var(--muted)", fontSize: "0.76rem" }}>{t.subcategory}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", color: t.amount >= 0 ? "#00f5d4" : "#ff6b6b", fontWeight: 600 }}>
                        {t.amount >= 0 ? "+" : "−"}{fmt(t.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTx.length > 250 && <p style={{ color: "var(--muted)", fontSize: "0.75rem", padding: "10px 0" }}>Showing 250 of {filteredTx.length}. Filter by month above.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
