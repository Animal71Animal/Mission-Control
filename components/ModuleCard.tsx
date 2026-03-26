"use client";

import Link from "next/link";

const statusColor: Record<string, string> = {
  active: "#22c55e",
  syncing: "#f59e0b",
  pending: "#6a6a8a",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  syncing: "Running",
  pending: "Pending setup",
};

export default function ModuleCard({ href, icon, title, desc, status }: {
  href: string; icon: string; title: string; desc: string; status: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
          cursor: "pointer",
          transition: "border-color 0.15s",
          height: "100%",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#9b5de5";
          (e.currentTarget as HTMLDivElement).style.color = "#9b5de5";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLDivElement).style.color = "var(--text)";
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span style={{ fontSize: "1.5rem" }}>{icon}</span>
          <span style={{
            fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
            color: statusColor[status], background: `${statusColor[status]}20`, padding: "2px 8px", borderRadius: 20,
          }}>
            {statusLabel[status]}
          </span>
        </div>
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </Link>
  );
}
