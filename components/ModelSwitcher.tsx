"use client";

import { useEffect, useState } from "react";

const MODELS = [
  { id: "anthropic/claude-haiku-4-5",  label: "Haiku 4.5",  tier: "cheap", emoji: "💚", desc: "$0.25/MTok" },
  { id: "anthropic/claude-sonnet-4-6", label: "Sonnet 4.6", tier: "mid",   emoji: "💛", desc: "$3/MTok" },
  { id: "anthropic/claude-opus-4-6",   label: "Opus 4.6",   tier: "power", emoji: "🔴", desc: "$15/MTok" },
  { id: "ollama/glm-4.7-flash",        label: "GLM-4.7",    tier: "free",  emoji: "🆓", desc: "Free/local" },
  { id: "ollama/kimi-k2.5:cloud",      label: "Kimi K2.5",  tier: "free",  emoji: "🆓", desc: "Free/cloud" },
];

export default function ModelSwitcher() {
  const [current, setCurrent] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [switched, setSwitched] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/model")
      .then((r) => r.json())
      .then((d) => setCurrent(d.model ?? null))
      .catch(() => setCurrent(null));
  }, []);

  async function selectModel(id: string) {
    if (switching || id === current) return;
    setSwitching(id);
    setSwitched(null);
    try {
      const res = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: id }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrent(id);
        setSwitched(id);
        setTimeout(() => setSwitched(null), 5000);
      }
    } catch {
      // silent fail — user can retry
    } finally {
      setSwitching(null);
    }
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: "0.65rem",
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        🧠 AI Model
      </div>

      {/* Model list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {MODELS.map((m) => {
          const isActive = current === m.id;
          const isSwitching = switching === m.id;
          const isSwitched = switched === m.id;

          return (
            <button
              key={m.id}
              onClick={() => selectModel(m.id)}
              disabled={!!switching}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 6,
                border: isActive ? "1px solid #9b5de5" : "1px solid var(--border)",
                background: isActive ? "rgba(155,93,229,0.12)" : "transparent",
                color: isActive ? "var(--accent2, #c77dff)" : "var(--text)",
                cursor: switching ? "default" : "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
                opacity: switching && !isSwitching ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: "0.85rem", flexShrink: 0 }}>{m.emoji}</span>
              <span style={{ flex: 1, fontSize: "0.78rem", fontWeight: isActive ? 600 : 400 }}>
                {m.label}
              </span>
              <span style={{ fontSize: "0.65rem", color: "var(--muted)", flexShrink: 0 }}>
                {isSwitching
                  ? "Switching…"
                  : isSwitched
                  ? "✅ Restarting…"
                  : m.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Warning */}
      <div
        style={{
          marginTop: 8,
          fontSize: "0.63rem",
          color: "var(--muted)",
          lineHeight: 1.4,
        }}
      >
        ⚠️ Takes effect on next message after restart
      </div>
    </div>
  );
}
