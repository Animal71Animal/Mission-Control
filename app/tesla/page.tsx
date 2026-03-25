"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface ChargingSession {
  date: string;
  time?: string;
  duration_minutes: number;
  rate_per_kwh: number;
  cost: number;
  kwh: number;
  location?: string;
  notes?: string;
}

interface TeslaData {
  sessions: ChargingSession[];
  summary: {
    total_sessions?: number;
    total_cost_usd?: number;
    total_kwh?: number;
    avg_cost_per_session?: number;
  };
  monthly_summary: Record<string, {
    cost: number;
    kwh: number;
    sessions: number;
    minutes: number;
  }>;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "January", "02": "February", "03": "March", "04": "April",
  "05": "May", "06": "June", "07": "July", "08": "August",
  "09": "September", "10": "October", "11": "November", "12": "December",
};

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[month]} ${year}`;
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
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

export default function TeslaPage() {
  const [data, setData] = useState<TeslaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/tesla-charging.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🚗 Tesla Charging</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const summary = data?.summary || {};
  const monthly = data?.monthly_summary || {};

  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        🚗 Tesla Charging
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        Supercharger log · All sessions in Boise, ID
      </p>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { label: "Total sessions", value: summary.total_sessions ?? sessions.length },
          { label: "Total spent", value: `$${(summary.total_cost_usd ?? 0).toFixed(2)}` },
          { label: "Total kWh", value: `${(summary.total_kwh ?? 0).toFixed(1)}` },
          { label: "Avg per session", value: `$${(summary.avg_cost_per_session ?? 0).toFixed(2)}` },
        ].map((s) => (
          <Card key={s.label}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent2)" }}>{s.value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div style={{ marginBottom: 16 }}>
        <Card title="Monthly Breakdown">
          {Object.keys(monthly).length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>No data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {Object.entries(monthly)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([month, v], i, arr) => (
                  <div
                    key={month}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                      fontSize: "0.875rem",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{formatMonth(month)}</span>
                    <span style={{ color: "var(--accent2)", fontWeight: 600 }}>${v.cost.toFixed(2)}</span>
                    <span style={{ color: "var(--muted)" }}>{v.kwh.toFixed(1)} kWh</span>
                    <span style={{ color: "var(--muted)" }}>{v.sessions} sessions</span>
                    <span style={{ color: "var(--muted)" }}>{formatDuration(v.minutes)}</span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Session history */}
      <Card title="Session History">
        {sortedSessions.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            No sessions logged yet. Tell PriScylla in Telegram to log a charge.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 0.6fr 0.6fr 0.8fr 0.8fr 1fr",
              padding: "0 0 8px",
              borderBottom: "1px solid var(--border)",
              fontSize: "0.7rem",
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              <span>Date</span>
              <span>Duration</span>
              <span>Rate</span>
              <span>kWh</span>
              <span>Cost</span>
              <span>Location</span>
            </div>
            {sortedSessions.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 0.6fr 0.6fr 0.8fr 0.8fr 1fr",
                  padding: "10px 0",
                  borderBottom: i < sortedSessions.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: "0.85rem",
                  alignItems: "center",
                }}
              >
                <span>{s.date}{s.time ? ` · ${formatTime(s.time)}` : ""}</span>
                <span style={{ color: "var(--muted)" }}>{formatDuration(s.duration_minutes)}</span>
                <span style={{ color: "var(--muted)" }}>${s.rate_per_kwh}/kWh</span>
                <span>{s.kwh}</span>
                <span style={{ color: "var(--accent2)", fontWeight: 600 }}>${s.cost.toFixed(2)}</span>
                <span style={{ color: "var(--muted)" }}>{s.location || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
