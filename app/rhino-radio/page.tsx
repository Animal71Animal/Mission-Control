"use client";

import Link from "next/link";

export default function RhinoRadioPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #9b5de5, #c77dff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📻 Rhino Radio
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Rhino Radio broadcast management, promotions, and complimentary entry code tracking.
        </p>
      </div>

      {/* Navigation Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <Link
          href="/comp-codes"
          style={{
            display: "block",
            padding: 24,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--card)",
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎟️</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
            Complimentary Entry Codes
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Track and manage complimentary entry codes issued to guests, partners, and VIPs.
          </p>
        </Link>
      </div>
    </div>
  );
}
