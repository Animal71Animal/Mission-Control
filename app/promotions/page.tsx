"use client";

import Link from "next/link";

export default function PromotionsPage() {
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
          📢 Promotions & Marketing
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Weekly party concepts, event planning, and promotional assets for Spearmint Rhino Boise.
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
          href="/party-concepts"
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
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
            Party Concepts
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Weekly, monthly, and yearly event ideas — industry night, teddy tuesdays, chicks in kicks, and more.
          </p>
        </Link>
        <Link
          href="/promotional-ideas"
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
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>💡</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
            Promotional Ideas
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Podcast, influencer marketing, street team, content creation strategies.
          </p>
        </Link>
        <Link
          href="/influencer-list"
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
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⭐</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
            Influencer List
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Local and regional influencers with social media stats for partnership targeting.
          </p>
        </Link>
        <Link
          href="/rhino-radio"
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
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📻</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
            Rhino Radio
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Broadcast management, promotions, and complimentary entry code tracking.
          </p>
        </Link>
      </div>
    </div>
  );
}
