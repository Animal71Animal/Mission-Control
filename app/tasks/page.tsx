"use client";

import { useState } from "react";
import TorchTasks from "./TorchTasks";
import PersonalTasks from "./PersonalTasks";

const TABS = [
  { key: "torch", label: "🕯️ The Torch", desc: "Club operations & venue tasks" },
  { key: "personal", label: "✅ Personal", desc: "Personal & WLP tasks" },
];

export default function TasksPage() {
  const [active, setActive] = useState<"torch" | "personal">("torch");

  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>📋 Action Items</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>All action items in one place</p>
      </div>

      {/* Tab Bar */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid var(--border)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
              onClick={() => setActive(tab.key as "torch" | "personal")}
            style={{
              padding: "10px 22px",
              background: "transparent",
              border: "none",
              borderBottom: active === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              color: active === tab.key ? "var(--accent2)" : "var(--muted)",
              fontWeight: active === tab.key ? 700 : 400,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {active === "torch" && <TorchTasks />}
      {active === "personal" && <PersonalTasks />}
    </div>
  );
}
