"use client";

import { useEffect, useState } from "react";

interface ChargingSession {
  date: string;
  time?: string;
  location?: string;
  address?: string;
  type?: string;
  kwh: number;
  rate_per_kwh: number;
  cost: number;
  duration_min?: number;
  notes?: string;
}

interface MonthlySummary {
  cost: number;
  kwh: number;
  sessions: number;
  minutes: number;
}

interface TeslaData {
  sessions: ChargingSession[];
  totals?: Record<string, any>;
  monthlyTotals?: Record<string, MonthlySummary>;
  last_updated?: string;
}

const MONTH_LABELS: Record<string, string> = {
  "2026-01": "January",
  "2026-02": "February",
  "2026-03": "March",
  "2026-04": "April",
  "2026-05": "May",
  "2026-06": "June",
  "2026-07": "July",
  "2026-08": "August",
  "2026-09": "September",
  "2026-10": "October",
  "2026-11": "November",
  "2026-12": "December",
};

const MONTH_ORDER = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"];
const MILES_PER_KWH = 3.5;
const COST_PER_KWH = 0.19; // Boise Supercharger rate

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatMonth(key: string): string {
  return MONTH_LABELS[key] ?? key;
}

export default function TeslaPage() {
  const [data, setData] = useState<TeslaData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/tesla")
      .then(r => r.json())
      .then(d => {
        if (d && d.sessions) setData(d);
        else fetch("/data/tesla-charging.json").then(r => r.json()).then(setData).catch(() => {});
        setLoaded(true);
      })
      .catch(() => {
        fetch("/data/tesla-charging.json").then(r => r.json()).then(setData).catch(() => {}).finally(() => setLoaded(true));
      });
  }, []);

  const toggleMonth = (key: string) => {
    setExpandedMonths(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!loaded) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>⚡ Tesla Charging</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>⚡ Tesla Charging</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>No data available.</p>
      </div>
    );
  }

  const { sessions, monthlyTotals } = data;
  
  // Use monthlyTotals as authoritative source
  const totalsData = monthlyTotals || {};

  // Build session lookup by month
  const sessionsByMonth: Record<string, ChargingSession[]> = {};
  for (const s of sessions) {
    const mk = s.date.slice(0, 7);
    if (!sessionsByMonth[mk]) sessionsByMonth[mk] = [];
    sessionsByMonth[mk].push(s);
  }

  // YTD totals (from authoritative monthlyTotals)
  const ytdCost = MONTH_ORDER.reduce((sum, k) => sum + (totalsData[k]?.cost ?? 0), 0);
  const ytdKwh = MONTH_ORDER.reduce((sum, k) => sum + (totalsData[k]?.kwh ?? 0), 0);
  const ytdSessions = MONTH_ORDER.reduce((sum, k) => sum + (totalsData[k]?.sessions ?? 0), 0);
  const ytdMinutes = MONTH_ORDER.reduce((sum, k) => sum + (totalsData[k]?.minutes ?? 0), 0);
  const ytdMiles = ytdKwh * MILES_PER_KWH;

  // Best month (most kWh)
  const bestMonthKey = MONTH_ORDER.reduce((best, k) => {
    return (totalsData[k]?.kwh ?? 0) > (totalsData[best]?.kwh ?? 0) ? k : best;
  }, MONTH_ORDER[0]);

  const selectedMonthData = selectedMonth ? totalsData[selectedMonth] : null;
  const selectedSessions = selectedMonth ? (sessionsByMonth[selectedMonth] ?? []) : [];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #ff6b6b, #f15bb5)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          ⚡ Tesla Charging
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Supercharger log · 2026 · Boise, ID
        </p>
      </div>

      {/* Monthly Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 14,
        marginBottom: 28,
      }}>
        {MONTH_ORDER.map((key) => {
          const m = totalsData[key];
          if (!m) return null;
          const isSelected = selectedMonth === key;
          const isBest = key === bestMonthKey;
          return (
            <button
              key={key}
              onClick={() => setSelectedMonth(isSelected ? null : key)}
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, rgba(255,107,107,0.3), rgba(241,91,181,0.3))"
                  : "var(--card)",
                border: isSelected
                  ? "1px solid #ff6b6b"
                  : isBest
                  ? "1px solid rgba(241,91,181,0.5)"
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
                  fontSize: "0.6rem", color: "#f15bb5",
                  fontWeight: 700, letterSpacing: "0.05em",
                }}>MOST</div>
              )}
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 4 }}>
                {formatMonth(key)} 2026
              </div>
              <div style={{ fontSize: "1.45rem", fontWeight: 700, color: "var(--text)" }}>
                ${m.cost.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                {m.sessions} sessions · {m.kwh.toFixed(1)} kWh
              </div>
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
            ${ytdCost.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
            {ytdSessions} sessions · {ytdKwh.toFixed(0)} kWh
          </div>
        </button>
      </div>

      {/* Selected Month Detail */}
      {selectedMonth && selectedMonth !== "ytd" && selectedMonthData && (
        <div style={{
          background: "var(--card)",
          border: "1px solid #ff6b6b",
          borderRadius: 14,
          padding: 24,
          marginBottom: 24,
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              {formatMonth(selectedMonth)} 2026 — Detail
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.9rem" }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Total Cost", value: `$${selectedMonthData.cost.toFixed(2)}`, color: "#ff6b6b" },
              { label: "Total kWh", value: `${selectedMonthData.kwh.toFixed(1)} kWh`, color: "#f15bb5" },
              { label: "Est. Miles", value: `${(selectedMonthData.kwh * MILES_PER_KWH).toFixed(0)} mi`, color: "#00f5d4" },
              { label: "Sessions", value: selectedMonthData.sessions, color: "#00bbf9" },
              { label: "Duration", value: formatDuration(selectedMonthData.minutes), color: "#9b5de5" },
              { label: "Avg/Session", value: `$${(selectedMonthData.cost / selectedMonthData.sessions).toFixed(2)}`, color: "#fee440" },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 14,
              }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Sessions for this month */}
          {selectedSessions.length > 0 && (
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                📋 Sessions ({selectedSessions.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Date", "Time", "Duration", "kWh", "Miles", "Rate", "Cost", "Location"].map(h => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: h === "Date" || h === "Time" || h === "Location" ? "left" : "right", color: "var(--muted)", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedSessions].sort((a, b) => a.date.localeCompare(b.date)).map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 12px", color: "var(--text)", fontWeight: 500 }}>{s.date}</td>
                        <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: "0.8rem" }}>{s.time ? formatTime(s.time) : "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>{formatDuration(s.duration_min ?? 0)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#f15bb5", fontWeight: 600 }}>{s.kwh.toFixed(1)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>{(s.kwh * MILES_PER_KWH).toFixed(0)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>${s.rate_per_kwh}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "#ff6b6b", fontWeight: 600 }}>${s.cost.toFixed(2)}</td>
                        <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: "0.8rem" }}>{s.location ? s.location.replace("Boise, ID - ", "") : "—"}</td>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Cost", value: `$${ytdCost.toFixed(2)}`, color: "#ff6b6b" },
              { label: "Total kWh", value: `${ytdKwh.toFixed(0)} kWh`, color: "#f15bb5" },
              { label: "Est. Miles", value: `${ytdMiles.toFixed(0)} mi`, color: "#00f5d4" },
              { label: "Sessions", value: ytdSessions, color: "#00bbf9" },
              { label: "Avg/Session", value: `$${(ytdCost / ytdSessions).toFixed(2)}`, color: "#fee440" },
              { label: "Total Time", value: formatDuration(ytdMinutes), color: "#9b5de5" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Month by Month
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {MONTH_ORDER.map(key => {
              const m = totalsData[key];
              if (!m) return null;
              const pct = ytdCost > 0 ? (m.cost / ytdCost) * 100 : 0;
              return (
                <div key={key} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{formatMonth(key)}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontWeight: 700, color: "#ff6b6b" }}>${m.cost.toFixed(2)}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: 8 }}>{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: "linear-gradient(90deg, #ff6b6b, #f15bb5)",
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

      {/* Collapsible Session Log by Month */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
            📅 Session Log
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "4px 0 0" }}>
            All {sessions.length} sessions · click a month to expand
          </p>
        </div>

        {MONTH_ORDER.map(key => {
          const entries = sessionsByMonth[key] ?? [];
          if (entries.length === 0) return null;
          const isOpen = expandedMonths[key];
          const monthCost = entries.reduce((s, e) => s + e.cost, 0);
          const monthKwh = entries.reduce((s, e) => s + e.kwh, 0);

          return (
            <div key={key} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => toggleMonth(key)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "14px 20px",
                  background: isOpen ? "rgba(255,107,107,0.08)" : "transparent",
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
                  <span>{formatMonth(key)} 2026</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 400 }}>
                    {entries.length} sessions · {monthKwh.toFixed(0)} kWh
                  </span>
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ff6b6b" }}>
                  ${monthCost.toFixed(2)}
                </span>
              </button>

              {isOpen && (
                <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                          {["Date", "Time", "Duration", "kWh", "Miles", "Rate", "Cost", "Location"].map(h => (
                            <th key={h} style={{
                              padding: "8px 14px", textAlign: h === "Date" || h === "Time" || h === "Location" ? "left" : "right",
                              color: "var(--muted)", fontWeight: 600,
                              fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...entries].sort((a, b) => a.date.localeCompare(b.date)).map((s, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "10px 14px", color: "var(--text)", fontWeight: 500 }}>{s.date}</td>
                            <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: "0.8rem" }}>{s.time ? formatTime(s.time) : "—"}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>{formatDuration(s.duration_min ?? 0)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#f15bb5", fontWeight: 600 }}>{s.kwh.toFixed(1)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>{(s.kwh * MILES_PER_KWH).toFixed(0)}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--muted)" }}>${s.rate_per_kwh}</td>
                            <td style={{ padding: "10px 14px", textAlign: "right", color: "#ff6b6b", fontWeight: 600 }}>${s.cost.toFixed(2)}</td>
                            <td style={{ padding: "10px 14px", color: "var(--muted)", fontSize: "0.8rem" }}>{s.location ? s.location.replace("Boise, ID - ", "") : "—"}</td>
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

      {/* Footer */}
      <div style={{ padding: 14, background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.15)", borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>
          ℹ️ Mileage estimated at {MILES_PER_KWH} mi/kWh (Tesla Model 3/Y average). Cost reflects Supercharger session charges only. Income Uber trips using Tesla energy cost $0.081/mi.
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