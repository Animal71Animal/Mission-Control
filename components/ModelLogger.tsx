"use client";

import { useEffect, useState } from "react";

interface ModelLog {
  timestamp: string;
  model: string;
  tier: string;
  prompt_preview: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  legacy_cost_usd: number;
  savings_usd: number;
  savings_pct: number;
}

const TIER_COLORS: Record<string, string> = {
  simple: "#00f5d4",
  standard: "#9b5de5",
  creative: "#f15bb5",
  complex: "#fee440",
};

export default function ModelLogger() {
  const [logs, setLogs] = useState<ModelLog[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Fetch initial logs
    fetchLogs();

    // Poll for new logs every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/cost-data");
      const data = await res.json();
      if (data.entries) {
        setLogs(data.entries.slice(-5).reverse()); // Last 5 entries, newest first
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  if (logs.length === 0) {
    return (
      <div style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 16,
        zIndex: 100,
        maxWidth: 320,
        fontSize: "0.875rem",
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>🤖 Model Activity</div>
        <div style={{ color: "var(--muted)" }}>No recent activity</div>
      </div>
    );
  }

  const latestLog = logs[0];
  const totalSavings = logs.reduce((sum, log) => sum + (log.savings_usd || 0), 0);
  const isSaving = totalSavings >= 0;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 16,
      zIndex: 100,
      maxWidth: 360,
      fontSize: "0.875rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: TIER_COLORS[latestLog.tier] || "#9b5de5",
            animation: "pulse 2s infinite",
          }} />
          🤖 Live Model Activity
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
          {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Current Model */}
      <div style={{
        background: "rgba(155,93,229,0.1)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
      }}>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>
          LAST CALL
        </div>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          {latestLog.model}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {latestLog.prompt_preview || "No preview"}
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          marginTop: 8,
          fontSize: "0.75rem" 
        }}>
          <span>${latestLog.cost_usd?.toFixed(8)}</span>
          <span style={{ color: (latestLog.savings_usd || 0) >= 0 ? "#00f5d4" : "#f15bb5" }}>
            {(latestLog.savings_usd || 0) >= 0 ? "💵" : "💸"} 
            ${Math.abs(latestLog.savings_usd || 0).toFixed(8)}
          </span>
        </div>
      </div>

      {/* Recent History */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8 }}>
          RECENT CALLS
        </div>
        {logs.slice(1).map((log, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            fontSize: "0.75rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: TIER_COLORS[log.tier] || "#666",
              }} />
              <span style={{ opacity: 0.8 }}>{log.model}</span>
            </div>
            <span style={{ 
              color: (log.savings_usd || 0) >= 0 ? "#00f5d4" : "#f15bb5",
              fontWeight: 600 
            }}>
              {(log.savings_usd || 0) >= 0 ? "+" : ""}${(log.savings_usd || 0).toFixed(6)}
            </span>
          </div>
        ))}
      </div>

      {/* Total Savings */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          Session Savings
        </span>
        <span style={{ 
          fontWeight: 700, 
          color: isSaving ? "#00f5d4" : "#f15bb5",
          fontSize: "1rem"
        }}>
          {isSaving ? "💵" : "💸"} ${Math.abs(totalSavings).toFixed(8)}
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
