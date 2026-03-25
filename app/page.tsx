"use client";

import Link from "next/link";
import ModuleCard from "@/components/ModuleCard";
import { modules, shortcuts } from "./data/modules";

export default function Home() {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #9b5de5, #c77dff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Mission Control
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          {now} · All systems up
        </p>
      </div>

      {/* Quick Access Shortcuts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.href + shortcut.label} href={shortcut.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                {shortcut.label}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                {shortcut.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Module grid - matches sidebar order */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {modules.map((m) => (
          <ModuleCard key={m.href} {...m} />
        ))}
      </div>
    </div>
  );
}
