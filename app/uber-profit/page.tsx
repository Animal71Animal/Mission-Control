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

interface UberData {
  uber_shifts: Shift[];
  expenses: Expense[];
  monthly_summary: Record<string, any>;
  last_updated: string;
}

export default function UberProfitPage() {
  const [data, setData] = useState<UberData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/data/uber-profit.json")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <p style={{ color: "var(--muted)" }}>Loading...</p>;
  if (!data || data.uber_shifts.length === 0) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 20 }}>🚗 Uber Profit Tracking</h1>
        <p style={{ color: "var(--muted)" }}>No shifts logged yet. Start with: `Uber start [odometer]`</p>
      </div>
    );
  }

  const shifts = data.uber_shifts;
  const monthly = data.monthly_summary;
  const latestMonth = Object.keys(monthly).sort().reverse()[0];
  const currentMonthData = monthly[latestMonth] || {};

  const totalGross = shifts.reduce((sum, s) => sum + s.gross_earnings, 0);
  const totalCharging = shifts.reduce((sum, s) => sum + (s.proportional_charging_cost || 0), 0);
  const totalNet = shifts.reduce((sum, s) => sum + s.net_profit, 0);
  const totalMiles = shifts.reduce((sum, s) => sum + s.miles_driven, 0);
  const avgHourly = shifts.length > 0 ? shifts.reduce((sum, s) => sum + s.hourly_rate, 0) / shifts.length : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>🚗 Uber Profit Tracking</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>Earnings minus proportional Tesla charging costs</p>
      </div>

      {/* All-Time Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
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
        ))}
      </div>

      {/* Monthly Breakdown */}
      {latestMonth && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📊 {latestMonth}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            {[
              { label: "Gross", value: `$${currentMonthData.total_gross?.toFixed(2) || "0.00"}` },
              { label: "Charging", value: `$${currentMonthData.total_charges?.toFixed(2) || "0.00"}` },
              { label: "Net", value: `$${currentMonthData.total_net?.toFixed(2) || "0.00"}` },
              { label: "Shifts", value: currentMonthData.shifts || 0 },
              { label: "Miles", value: `${currentMonthData.total_miles || 0}` },
              { label: "Avg Rate", value: `$${currentMonthData.avg_hourly_rate?.toFixed(2) || "0.00"}/hr` },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Shifts */}
      <div>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>📋 Recent Shifts</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shifts.slice().reverse().map((shift) => (
            <div key={shift.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{shift.date} • {shift.start_time}-{shift.end_time}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{shift.duration_minutes}m • {shift.miles_driven}mi • Odometer {shift.start_odometer}→{shift.end_odometer}</div>
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
              {shift.notes && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>📝 {shift.notes}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Charging Sessions */}
      {data.expenses && data.expenses.filter(e => e.type === 'charging').length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>⚡ Charging Sessions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.expenses.filter(e => e.type === 'charging').slice().reverse().map((exp, i) => (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{exp.date}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                    {exp.kwh?.toFixed(2)} kWh @ ${exp.rate_per_kwh}/kWh • {exp.duration_minutes}min
                  </div>
                  {exp.location && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>📍 {exp.location}</div>}
                  <div style={{ fontSize: "0.72rem", marginTop: 4, color: exp.shift_id ? '#00c87c' : '#fee440' }}>
                    {exp.shift_id ? `✅ Applied to ${exp.shift_id}` : '⏳ Unattributed — will deduct from next shift'}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f15bb5" }}>-${exp.amount.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 28, padding: "16px", background: "rgba(0,187,249,0.05)", border: "1px solid rgba(0,187,249,0.2)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
          ℹ️ Charging deducted at 3.5 mi/kWh efficiency ratio. Unattributed sessions apply to next Uber shift.
        </p>
      </div>
    </div>
  );
}
