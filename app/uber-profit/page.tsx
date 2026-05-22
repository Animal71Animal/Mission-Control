"use client";

import { useEffect, useState } from "react";

interface DailyEntry {
  date: string;
  earnings: number;
  gross?: number;
  trips: number;
  miles?: number;
  tips: number;
  surge?: number;
  pro_perk?: number;
  promotions?: number;
  charging_cost?: number;
  netPayout?: number;
  basefare?: number;
  expenses?: number;
}

interface MonthlyTotal {
  // Official Uber tax summary fields
  total_gross?: number;
  total_net?: number;
  total_trips?: number;
  online_miles?: number;
  total_tips?: number;
  total_incentives?: number;
  total_expenses?: number;
  trip_earnings?: number;
  source?: string;
  note?: string;
  // May partial fields (manual tracking)
  total_earnings?: number;
  total_miles?: number;
  total_charging_cost?: number;
  total_surge?: number;
  total_pro_perk?: number;
  total_promotions?: number;
}

interface UberEarningsData {
  dailySummaries: DailyEntry[];
  monthlyTotals: Record<string, MonthlyTotal>;
  last_updated?: string;
}

const MONTH_LABELS: Record<string, string> = {
  "2026-01": "January",
  "2026-02": "February",
  "2026-03": "March",
  "2026-04": "April",
  "2026-05": "May",
};

const MONTH_ORDER = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"];

function getNet(_key: string, m: MonthlyTotal): number {
  return m.total_net ?? 0;
}

function getGross(_key: string, m: MonthlyTotal): number {
  return m.total_gross ?? m.total_earnings ?? 0;
}

function getTrips(_key: string, m: MonthlyTotal): number {
  return m.total_trips ?? 0;
}

function getTips(_key: string, m: MonthlyTotal): number {
  return m.total_tips ?? 0;
}

function getMiles(_key: string, m: MonthlyTotal): number {
  return m.online_miles ?? m.total_miles ?? 0;
}

export default function UberEarningsPage() {
  const [data, setData] = useState<UberEarningsData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/uber-profit")
      .then((r) => r.json())
      .then((d) => {
        // API returns uber-earnings.json directly
        if (d && d.dailySummaries) {
          setData(d);
        } else {
          // fallback to static
          fetch("/data/uber-earnings.json").then(r => r.json()).then(setData).catch(() => {});
        }
        setLoaded(true);
      })
      .catch(() => {
        fetch("/data/uber-earnings.json").then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoaded(true));
      });
  }, []);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!loaded) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🚗 Uber Earnings</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🚗 Uber Earnings</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>No data available.</p>
      </div>
    );
  }

  const { dailySummaries, monthlyTotals } = data;

  // Build daily lookup by month key
  const dailyByMonth: Record<string, DailyEntry[]> = {};
  for (const entry of dailySummaries) {
    const mk = entry.date.slice(0, 7); // "2026-05"
    if (!dailyByMonth[mk]) dailyByMonth[mk] = [];
    dailyByMonth[mk].push(entry);
  }

  // YTD totals from official sources
  const ytdNet = MONTH_ORDER.reduce((sum, k) => sum + getNet(k, monthlyTotals[k] ?? {}), 0);
  const ytdGross = MONTH_ORDER.reduce((sum, k) => sum + getGross(k, monthlyTotals[k] ?? {}), 0);
  const ytdTrips = MONTH_ORDER.reduce((sum, k) => sum + getTrips(k, monthlyTotals[k] ?? {}), 0);
  const ytdTips = MONTH_ORDER.reduce((sum, k) => sum + getTips(k, monthlyTotals[k] ?? {}), 0);

  // Best month by net
  const bestMonthKey = MONTH_ORDER.reduce((best, k) => {
    const m = monthlyTotals[k];
    if (!m) return best;
    return getNet(k, m) > getNet(best, monthlyTotals[best] ?? {}) ? k : best;
  }, MONTH_ORDER[0]);

  const selectedMonthData = selectedMonth ? monthlyTotals[selectedMonth] : null;
  const selectedDailyEntries = selectedMonth ? (dailyByMonth[selectedMonth] ?? []).sort((a, b) => b.date.localeCompare(a.date)) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #00bbf9, #00f5d4)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          🚗 Uber Earnings
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          2026 earnings · Jan–May · official Uber tax summaries
        </p>
      </div>

      {/* Monthly Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14,
        marginBottom: 28,
      }}>
        {MONTH_ORDER.map((key) => {
          const m = monthlyTotals[key];
          if (!m) return null;
          const net = getNet(key, m);
          const trips = getTrips(key, m);
          const isOfficial = m.source === "uber_tax_summary";
          const isSelected = selectedMonth === key;
          const isBest = key === bestMonthKey;
          return (
            <button
              key={key}
              onClick={() => setSelectedMonth(isSelected ? null : key)}
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, rgba(0,187,249,0.3), rgba(0,245,212,0.3))"
                  : "var(--card)",
                border: isSelected
                  ? "1px solid #00bbf9"
                  : isBest
                  ? "1px solid rgba(0,245,212,0.5)"
                  : "1px solid var(--border)",
                borderRadius: 12,
                padding: 18,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              {isBest && (
                <div style={{
                  position: "absolute", top: 8, right: 10,
                  fontSize: "0.6rem", color: "#00f5d4",
                  fontWeight: 700, letterSpacing: "0.05em",
                }}>BEST</div>
              )}
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 4 }}>
                {MONTH_LABELS[key]} 2026
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--text)" }}>
                ${net.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                {trips} trips · net payout
              </div>
              {!isOfficial && (
                <div style={{ fontSize: "0.65rem", color: "#fee440", marginTop: 4 }}>⚠ partial / manual</div>
              )}
            </button>
          );
        })}

        {/* YTD Card */}
        <button
          onClick={() => setSelectedMonth(selectedMonth === "ytd" ? null : "ytd")}
          style={{
            background: selectedMonth === "ytd"
              ? "linear-gradient(135deg, rgba(255,204,0,0.4), rgba(255,230,0,0.3))"
              : "linear-gradient(135deg, rgba(255,204,0,0.15), rgba(255,230,0,0.1))",
            border: "1px solid #ffcc00",
            borderRadius: 12,
            padding: 18,
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "0.78rem", color: "#ffcc00", marginBottom: 4 }}>2026 YTD</div>
          <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "#ffcc00" }}>
            ${ytdNet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
            {ytdTrips} trips · net payout
          </div>
        </button>
      </div>

      {/* Selected Month Detail */}
      {selectedMonth && selectedMonth !== "ytd" && selectedMonthData && (
        <div style={{
          background: "var(--card)",
          border: "1px solid #00bbf9",
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              {MONTH_LABELS[selectedMonth]} 2026 — Detail
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.9rem" }}
            >
              ✕ Close
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Gross Payment", value: `$${getGross(selectedMonth, selectedMonthData).toFixed(2)}`, color: "#00f5d4" },
              { label: "Net Payout", value: `$${getNet(selectedMonth, selectedMonthData).toFixed(2)}`, color: "#00c87c" },
              { label: "Completed Trips", value: getTrips(selectedMonth, selectedMonthData), color: "#00bbf9" },
              { label: "Tips", value: `$${getTips(selectedMonth, selectedMonthData).toFixed(2)}`, color: "#fee440" },
              ...(selectedMonthData.total_incentives !== undefined ? [{ label: "Incentives", value: `$${selectedMonthData.total_incentives.toFixed(2)}`, color: "#9b5de5" }] : []),
              ...(selectedMonthData.total_expenses !== undefined ? [{ label: "Uber Fees", value: `$${selectedMonthData.total_expenses.toFixed(2)}`, color: "#ff6b6b" }] : []),
              { label: "Online Miles", value: `${getMiles(selectedMonth, selectedMonthData).toLocaleString()} mi`, color: "#f15bb5" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 14,
              }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: s.color }}>{String(s.value)}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {selectedMonthData.source === "uber_tax_summary" && (
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: selectedDailyEntries.length > 0 ? 16 : 0 }}>
              ✅ Source: Official Uber Tax Summary
              {selectedMonthData.note && <span> · ⚠ {selectedMonthData.note}</span>}
            </div>
          )}

          {/* Daily entries for this month (manual tracking only — not shown for official tax summary months) */}
          {selectedDailyEntries.length > 0 && selectedMonthData.source !== "uber_tax_summary" && (
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📋 Tracked Shifts ({selectedDailyEntries.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Date", "Earnings", "Trips", "Tips", "Miles", "Net"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: h === "Date" ? "left" : "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDailyEntries.map((e, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 12px", color: "var(--text)" }}>{e.date}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#00f5d4", fontWeight: 600 }}>${e.earnings.toFixed(2)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text)" }}>{e.trips}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#fee440" }}>${e.tips.toFixed(2)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>{(e.miles ?? 0).toFixed(1)} mi</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#51cf66", fontWeight: 600 }}>
                          ${(e.netPayout ?? e.earnings - (e.charging_cost ?? 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* YTD Detail */}
      {selectedMonth === "ytd" && (
        <div style={{
          background: "var(--card)",
          border: "1px solid #ffcc00",
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "#ffcc00" }}>
              2026 Year to Date
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
            >
              ✕ Close
            </button>
          </div>

          {/* Big YTD numbers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Net Payout", value: `$${ytdNet.toFixed(2)}`, color: "#00c87c" },
              { label: "Gross Payment", value: `$${ytdGross.toFixed(2)}`, color: "#00f5d4" },
              { label: "Total Trips", value: ytdTrips, color: "#00bbf9" },
              { label: "Total Tips", value: `$${ytdTips.toFixed(2)}`, color: "#fee440" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{String(s.value)}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Month-by-month breakdown */}
          <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Month by Month
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MONTH_ORDER.map((key) => {
              const m = monthlyTotals[key];
              if (!m) return null;
              const net = getNet(key, m);
              const pct = ytdNet > 0 ? (net / ytdNet) * 100 : 0;
              return (
                <div key={key} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{MONTH_LABELS[key]}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700, color: "#00c87c" }}>${net.toFixed(2)}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: 8 }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: "linear-gradient(90deg, #00bbf9, #00f5d4)",
                      borderRadius: 3,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapsible Daily Log by Month */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
            📅 Daily Shift Log
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "4px 0 0" }}>
            Manually tracked shifts — click a month to expand
          </p>
        </div>

        {MONTH_ORDER.slice().reverse().map((key) => {
          const entries = (dailyByMonth[key] ?? []).sort((a, b) => b.date.localeCompare(a.date));
          if (entries.length === 0) return null;
          const isOpen = expandedMonths[key];
          const monthNet = entries.reduce((s, e) => s + (e.netPayout ?? e.earnings), 0);
          const monthTrips = entries.reduce((s, e) => s + e.trips, 0);

          return (
            <div key={key} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => toggleMonth(key)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "14px 20px",
                  background: isOpen ? "rgba(0,187,249,0.08)" : "transparent",
                  border: "none", color: "var(--text)",
                  fontSize: "0.95rem", fontWeight: 600,
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s", fontSize: "0.8rem", color: "var(--muted)",
                  }}>▶</span>
                  <span>{MONTH_LABELS[key]} 2026</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 400 }}>
                    {entries.length} shifts · {monthTrips} trips
                  </span>
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#00f5d4" }}>
                  ${monthNet.toFixed(2)}
                </span>
              </button>

              {isOpen && (
                <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          {["Date", "Earnings", "Trips", "Tips", "Miles", "Surge", "Pro Perk", "Net"].map(h => (
                            <th key={h} style={{
                              padding: "8px 14px", textAlign: h === "Date" ? "left" : "right",
                              color: "var(--muted)", fontWeight: 600,
                              fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((e, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "10px 14px", color: "var(--text)", fontWeight: 500 }}>{e.date}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#00f5d4", fontWeight: 600 }}>${e.earnings.toFixed(2)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--text)" }}>{e.trips}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#fee440" }}>${e.tips.toFixed(2)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>{(e.miles ?? 0).toFixed(1)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>${(e.surge ?? 0).toFixed(2)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#9b5de5" }}>${(e.pro_perk ?? 0).toFixed(2)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#51cf66", fontWeight: 600 }}>
                              ${(e.netPayout ?? e.earnings - (e.charging_cost ?? 0)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ padding: 14, background: "rgba(0,187,249,0.05)", border: "1px solid rgba(0,187,249,0.15)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>
          ℹ️ Monthly totals (Jan–Apr) sourced from official Uber Tax Summaries. May reflects manually tracked shifts only and may be incomplete.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
