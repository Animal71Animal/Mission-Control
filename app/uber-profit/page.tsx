"use client";

import { useEffect, useState } from "react";

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
  charging_session_id?: string;
  charging_cost_total?: number;
  charging_kwh_total?: number;
  charging_kwh_used_in_shift?: number;
  proportional_charging_cost?: number;
  net_profit: number;
  hourly_rate: number;
  notes?: string;
}

interface Expense {
  date: string;
  type: string;
  session_id?: string;
  amount: number;
  kwh?: number;
  rate_per_kwh?: number;
  duration_minutes?: number;
  location?: string;
  shift_id: string | null;
  notes?: string;
}

interface DailyEarning {
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

interface UberData {
  uber_shifts: Shift[];
  expenses: Expense[];
  monthly_summary: Record<string, any>;
  last_updated: string;
}

export default function UberEarningsPage() {
  const [data, setData] = useState<UberData | null>(null);
  const [earnings, setEarnings] = useState<DailyEarning[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/uber-profit").then((r) => r.json()).catch(() => ({ uber_shifts: [], expenses: [] })),
      fetch("/data/uber-earnings.json").then((r) => r.json()).catch(() => ({ dailySummaries: [] }))
    ]).then(([profitData, earningsData]) => {
      setData(profitData);
      setEarnings(earningsData.dailySummaries || []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <p style={{ color: "var(--muted)" }}>Loading...</p>;

  // Calculate earnings stats
  const totalEarnings = earnings.reduce((sum, e) => sum + e.earnings, 0);
  const totalTrips = earnings.reduce((sum, e) => sum + e.trips, 0);
  const totalTips = earnings.reduce((sum, e) => sum + e.tips, 0);
  const avgPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
  const earningsLastUpdated = earnings.length > 0 ? earnings[0].date : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>💰 Uber Earnings</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>Dashboard earnings + shift tracking</p>
      </div>

      {/* Daily Earnings Summary (from scraper) */}
      {earnings.length > 0 && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📊 Today's Earnings</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Total Earnings", value: `$${totalEarnings.toFixed(2)}`, color: "#00f5d4" },
                { label: "Total Trips", value: totalTrips, color: "#00bbf9" },
                { label: "Total Tips", value: `$${totalTips.toFixed(2)}`, color: "#fee440" },
                { label: "Avg per Trip", value: `$${avgPerTrip.toFixed(2)}`, color: "#9b5de5" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Daily Earnings Table */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.1)", borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text)" }}>Date</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Earnings</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Trips</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Tips</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Miles</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Charging</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings.map((e, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", color: "var(--text)" }}>{e.date}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#00f5d4", fontWeight: 600 }}>${e.earnings.toFixed(2)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text)" }}>{e.trips}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#fee440", fontWeight: 600 }}>${e.tips.toFixed(2)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "var(--text)" }}>{e.miles.toFixed(1)} mi</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#ff6b6b", fontWeight: 600 }}>${e.expenses.toFixed(2)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#51cf66", fontWeight: 600 }}>${e.netPayout.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {earnings.length > 0 && (
                <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.05)", borderTop: "1px solid var(--border)", fontSize: "0.8rem", color: "var(--muted)" }}>
                  ✅ Last updated: {earningsLastUpdated}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Shift Tracking Section */}
      {data?.uber_shifts && data.uber_shifts.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "24px 0 16px", color: "var(--text)" }}>📊 Shift Tracking (Manual)</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {(() => {
              const shifts = data.uber_shifts;
              const totalGross = shifts.reduce((sum, s) => sum + s.gross_earnings, 0);
              const totalCharging = shifts.reduce((sum, s) => sum + (s.proportional_charging_cost || 0), 0);
              const totalNet = shifts.reduce((sum, s) => sum + s.net_profit, 0);
              const totalMiles = shifts.reduce((sum, s) => sum + s.miles_driven, 0);
              const avgHourly = shifts.length > 0 ? shifts.reduce((sum, s) => sum + s.hourly_rate, 0) / shifts.length : 0;

              return [
                { label: "Total Gross", value: `$${totalGross.toFixed(2)}`, color: "#00f5d4" },
                { label: "Charging Cost", value: `$${totalCharging.toFixed(2)}`, color: "#f15bb5" },
                { label: "Total Net", value: `$${totalNet.toFixed(2)}`, color: "#00c87c" },
                { label: "Miles Driven", value: `${totalMiles.toFixed(0)} mi`, color: "#fee440" },
                { label: "Avg Hourly", value: `$${avgHourly.toFixed(2)}/hr`, color: "#00bbf9" },
                { label: "Shifts", value: shifts.length, color: "#9b5de5" },
              ].map((s) => (
                <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                </div>
              ));
            })()}
          </div>

          {/* Recent Shifts */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📋 Recent Shifts</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.uber_shifts.slice().reverse().slice(0, 5).map((shift) => (
                <div key={shift.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{shift.date} • {shift.start_time}-{shift.end_time}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{shift.duration_minutes}m • {shift.miles_driven}mi • Odo: {shift.start_odometer}→{shift.end_odometer}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#00c87c" }}>${shift.net_profit.toFixed(2)}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>${shift.hourly_rate.toFixed(2)}/hr</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: "0.8rem", color: "var(--muted)" }}>
                    <span>Gross: <strong style={{ color: "var(--text)" }}>${shift.gross_earnings.toFixed(2)}</strong></span>
                    {shift.proportional_charging_cost && (
                      <span>Charging: <strong style={{ color: "#f15bb5" }}>-${shift.proportional_charging_cost.toFixed(2)}</strong></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Info Footer */}
      <div style={{ marginTop: 28, padding: "16px", background: "rgba(0,187,249,0.05)", border: "1px solid rgba(0,187,249,0.2)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
          ℹ️ Earnings pulled from Uber dashboard (top section). Shift tracking for detailed profitability with Tesla charging deductions.
        </p>
      </div>
    </div>
  );
}
