"use client";

import { useEffect, useState, useMemo } from "react";

interface DailySummary {
  date: string;
  earnings: number;
  trips: number;
  tips: number;
  basefare: number;
  surge: number;
  promotions: number;
  expenses: number;
  netPayout: number;
}

interface EarningsData {
  dailySummaries: DailySummary[];
  lastUpdated: string;
}

type SortKey = "date" | "earnings" | "trips" | "tips";
type SortDir = "asc" | "desc";

function fmt$(n: number) {
  return `$${n.toFixed(2)}`;
}

function dayColor(earnings: number, avg: number) {
  if (earnings >= avg * 1.2) return "#00c87c";
  if (earnings >= avg * 0.8) return "#fee440";
  return "#f15bb5";
}

export default function UberProfitPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetch("/data/uber-earnings.json")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const summaries = data?.dailySummaries ?? [];

  const totals = useMemo(() => {
    const totalEarnings = summaries.reduce((s, d) => s + d.earnings, 0);
    const totalTrips = summaries.reduce((s, d) => s + d.trips, 0);
    const totalTips = summaries.reduce((s, d) => s + d.tips, 0);
    const totalNet = summaries.reduce((s, d) => s + d.netPayout, 0);
    const avgPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
    const avgPerDay = summaries.length > 0 ? totalEarnings / summaries.length : 0;
    return { totalEarnings, totalTrips, totalTips, totalNet, avgPerTrip, avgPerDay };
  }, [summaries]);

  // Month totals (current month)
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthSummaries = summaries.filter((d) => d.date.startsWith(thisMonth));
  const monthEarnings = monthSummaries.reduce((s, d) => s + d.earnings, 0);
  const monthTrips = monthSummaries.reduce((s, d) => s + d.trips, 0);

  // Chart data — last 14 days
  const chartData = useMemo(() => {
    const sorted = [...summaries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
    const max = Math.max(...sorted.map((d) => d.earnings), 1);
    return sorted.map((d) => ({ ...d, pct: (d.earnings / max) * 100 }));
  }, [summaries]);

  const sorted = useMemo(() => {
    return [...summaries].sort((a, b) => {
      let av: number | string = a[sortKey];
      let bv: number | string = b[sortKey];
      if (sortKey === "date") {
        av = a.date; bv = b.date;
        return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
      }
      av = a[sortKey] as number; bv = b[sortKey] as number;
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [summaries, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === "desc" ? " ▼" : " ▲") : " ⇅";

  if (!loaded) return <p style={{ color: "var(--muted)" }}>Loading Uber earnings…</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>🚗 Uber Earnings</h1>
          <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.82rem" }}>Daily summaries — trips, tips &amp; breakdown</p>
        </div>
        {data?.lastUpdated && (
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", textAlign: "right", lineHeight: 1.6 }}>
            🕐 Updated<br />
            {new Date(data.lastUpdated).toLocaleString("en-US", { timeZone: "America/Denver", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}
          </div>
        )}
      </div>

      {/* Running Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "This Month", value: fmt$(monthEarnings), sub: `${monthTrips} trips`, color: "#00f5d4" },
          { label: "All-Time Earnings", value: fmt$(totals.totalEarnings), sub: `${summaries.length} days`, color: "#00c87c" },
          { label: "All-Time Trips", value: totals.totalTrips.toString(), sub: "total rides", color: "#fee440" },
          { label: "All-Time Tips", value: fmt$(totals.totalTips), sub: `${totals.totalTrips > 0 ? fmt$(totals.totalTips / totals.totalTrips) : "$0"}/trip avg`, color: "#9b5de5" },
          { label: "Avg / Trip", value: fmt$(totals.avgPerTrip), sub: "earnings per ride", color: "#00bbf9" },
          { label: "Avg / Day", value: fmt$(totals.avgPerDay), sub: "daily average", color: "#f15bb5" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📈 Earnings Trend — Last {chartData.length} Days</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {chartData.map((d) => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: "0.6rem", color: "var(--muted)" }}>{fmt$(d.earnings)}</div>
                <div
                  title={`${d.date}: ${fmt$(d.earnings)} • ${d.trips} trips`}
                  style={{
                    width: "100%",
                    height: `${Math.max(d.pct * 0.55, 4)}px`,
                    background: dayColor(d.earnings, totals.avgPerDay),
                    borderRadius: "3px 3px 0 0",
                    minHeight: 4,
                    transition: "height 0.3s",
                    cursor: "default",
                  }}
                />
                <div style={{ fontSize: "0.55rem", color: "var(--muted)", whiteSpace: "nowrap", transform: "rotate(-30deg)", marginTop: 4 }}>
                  {d.date.slice(5)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 20, fontSize: "0.72rem", color: "var(--muted)" }}>
            <span><span style={{ color: "#00c87c" }}>●</span> Strong day (≥120% avg)</span>
            <span><span style={{ color: "#fee440" }}>●</span> Normal day</span>
            <span><span style={{ color: "#f15bb5" }}>●</span> Slow day (&lt;80% avg)</span>
          </div>
        </div>
      )}

      {/* Daily Earnings Table */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>📋 Daily Earnings</h2>
        </div>

        {summaries.length === 0 ? (
          <div style={{ padding: 24, color: "var(--muted)", fontSize: "0.9rem" }}>No earnings data yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {(["date", "earnings", "trips", "tips"] as SortKey[]).map((k) => (
                    <th
                      key={k}
                      onClick={() => toggleSort(k)}
                      style={{ padding: "10px 16px", textAlign: k === "date" ? "left" : "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}{sortIcon(k)}
                    </th>
                  ))}
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>Base</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>Surge</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>Promos</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>Net Payout</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, i) => {
                  const color = dayColor(d.earnings, totals.avgPerDay);
                  return (
                    <tr
                      key={d.date}
                      style={{
                        borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none",
                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 600 }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: color, marginRight: 8, verticalAlign: "middle" }} />
                        {d.date}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color, fontSize: "0.95rem" }}>{fmt$(d.earnings)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text)", fontWeight: 600 }}>
                        <span style={{ background: "rgba(0,187,249,0.15)", color: "#00bbf9", borderRadius: 4, padding: "2px 6px", fontSize: "0.8rem" }}>
                          {d.trips} trips
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#9b5de5", fontWeight: 600 }}>{fmt$(d.tips)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--muted)" }}>{fmt$(d.basefare)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: d.surge > 0 ? "#fee440" : "var(--muted)" }}>{fmt$(d.surge)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: d.promotions > 0 ? "#00f5d4" : "var(--muted)" }}>{fmt$(d.promotions)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#00c87c", fontWeight: 700 }}>{fmt$(d.netPayout)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(0,187,249,0.05)", border: "1px solid rgba(0,187,249,0.15)", borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>
          📂 Data source: <code style={{ color: "#00bbf9" }}>/public/data/uber-earnings.json</code> — updated by uber-scraper script
        </p>
      </div>
    </div>
  );
}
