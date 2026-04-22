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

interface Shift {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  start_odometer: number;
  end_odometer: number;
  miles_driven: number;
  gross_earnings: number;
  proportional_charging_cost?: number;
  net_profit: number;
  hourly_rate: number;
  notes?: string;
}

interface EarningsData {
  dailySummaries: DailySummary[];
  lastUpdated: string;
}

interface UberData {
  uber_shifts: Shift[];
  expenses: any[];
  monthly_summary: Record<string, any>;
  last_updated: string;
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
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [shiftsData, setShiftsData] = useState<UberData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    Promise.all([
      fetch("/data/uber-earnings.json").then((r) => r.json()).catch(() => ({ dailySummaries: [] })),
      fetch("/api/uber-profit").then((r) => r.json()).catch(() => ({ uber_shifts: [], expenses: [] }))
    ]).then(([earnings, shifts]) => {
      setEarningsData(earnings);
      setShiftsData(shifts);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const summaries = earningsData?.dailySummaries ?? [];
  const shifts = shiftsData?.uber_shifts ?? [];

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

  // Shift totals
  const shiftTotals = useMemo(() => {
    const totalGross = shifts.reduce((s, shift) => s + shift.gross_earnings, 0);
    const totalCharging = shifts.reduce((s, shift) => s + (shift.proportional_charging_cost || 0), 0);
    const totalNet = shifts.reduce((s, shift) => s + shift.net_profit, 0);
    const totalMiles = shifts.reduce((s, shift) => s + shift.miles_driven, 0);
    const avgHourly = shifts.length > 0 ? shifts.reduce((s, shift) => s + shift.hourly_rate, 0) / shifts.length : 0;
    return { totalGross, totalCharging, totalNet, totalMiles, avgHourly };
  }, [shifts]);

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

  if (!loaded) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>💰 Uber Earnings</h1>
          <p style={{ color: "var(--muted)", margin: "8px 0 0", fontSize: "0.85rem" }}>Dashboard earnings + logged shifts</p>
        </div>
        {earningsData?.lastUpdated && (
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "right" }}>
            Updated: {new Date(earningsData.lastUpdated).toLocaleDateString()} {new Date(earningsData.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {summaries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "All-Time", value: fmt$(totals.totalEarnings), color: "#00f5d4" },
            { label: "This Month", value: fmt$(monthEarnings), color: "#fee440" },
            { label: "Total Trips", value: totalTrips, color: "#00bbf9" },
            { label: "Total Tips", value: fmt$(totals.totalTips), color: "#f15bb5" },
            { label: "Avg/Trip", value: fmt$(totals.avgPerTrip), color: "#9b5de5" },
            { label: "Avg/Day", value: fmt$(totals.avgPerDay), color: "#00c87c" },
          ].map((s) => (
            <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📈 Earnings Trend — Last {chartData.length} Days</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: "100%",
                    height: `${d.pct}%`,
                    background: dayColor(d.earnings, totals.avgPerDay),
                    borderRadius: "4px 4px 0 0",
                    opacity: 0.8,
                    transition: "opacity 0.2s",
                  }}
                  title={`${d.date}: ${fmt$(d.earnings)}`}
                />
                <div style={{ fontSize: "0.6rem", color: "var(--muted)", marginTop: 4, textAlign: "center" }}>
                  {d.date.slice(-2)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 12, textAlign: "center" }}>
            🟢 Strong (120%+ avg) · 🟡 Normal (80-120%) · 🔴 Slow (&lt;80% avg)
          </div>
        </div>
      )}

      {/* Daily Earnings Table */}
      {summaries.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📋 Daily Earnings</h2>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.1)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, cursor: "pointer", color: "var(--text)" }} onClick={() => toggleSort("date")}>Date{sortIcon("date")}</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, cursor: "pointer", color: "var(--text)" }} onClick={() => toggleSort("earnings")}>Earnings{sortIcon("earnings")}</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, cursor: "pointer", color: "var(--text)" }} onClick={() => toggleSort("trips")}>Trips{sortIcon("trips")}</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, cursor: "pointer", color: "var(--text)" }} onClick={() => toggleSort("tips")}>Tips{sortIcon("tips")}</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((e, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--text)" }}>{e.date}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: dayColor(e.earnings, totals.avgPerDay), fontWeight: 600 }}>{fmt$(e.earnings)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text)" }}>{e.trips}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#fee440", fontWeight: 600 }}>{fmt$(e.tips)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.75rem", color: "var(--muted)" }}>
                        Base: {fmt$(e.basefare)} | Surge: {fmt$(e.surge)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logged Shifts Section */}
      {shifts.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "28px 0 16px", color: "var(--text)" }}>🚗 Logged Shifts (Manual Tracking)</h2>

          {/* Shift Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Gross", value: fmt$(shiftTotals.totalGross), color: "#00f5d4" },
              { label: "Charging Cost", value: fmt$(shiftTotals.totalCharging), color: "#f15bb5" },
              { label: "Net Profit", value: fmt$(shiftTotals.totalNet), color: "#00c87c" },
              { label: "Miles", value: `${shiftTotals.totalMiles.toFixed(0)} mi`, color: "#fee440" },
              { label: "Avg Hourly", value: fmt$(shiftTotals.avgHourly) + "/hr", color: "#00bbf9" },
              { label: "Shifts", value: shifts.length, color: "#9b5de5" },
            ].map((s) => (
              <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Shifts Table */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.1)", borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text)" }}>Date</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text)" }}>Time</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Duration</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Miles</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Gross</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Net</th>
                    <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>/hr</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.slice().reverse().map((shift) => (
                    <tr key={shift.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 600 }}>{shift.date}</td>
                      <td style={{ padding: "12px 16px", color: "var(--muted)" }}>{shift.start_time}–{shift.end_time}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text)" }}>{shift.duration_minutes}m</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text)" }}>{shift.miles_driven}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#00f5d4", fontWeight: 600 }}>{fmt$(shift.gross_earnings)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#00c87c", fontWeight: 600 }}>{fmt$(shift.net_profit)}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#00bbf9" }}>{fmt$(shift.hourly_rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ marginTop: 28, padding: "16px", background: "rgba(0,187,249,0.05)", border: "1px solid rgba(0,187,249,0.2)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
          ℹ️ Top section: daily earnings from Uber dashboard. Bottom section: shifts you've logged manually. Charging deducted at 3.5 mi/kWh.
        </p>
      </div>
    </div>
  );
}
