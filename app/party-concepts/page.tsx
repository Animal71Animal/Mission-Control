"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PartyConcept {
  id: string;
  name: string;
  icon: string;
  who: string;
  format: string;
  drinks: string;
  games: string;
  costuming: string;
  approved: boolean;
  flyerDone: boolean;
  frequency: string;
  dayAssigned: string | null;
}

interface PartyConceptsData {
  weeklyMonthlyParties?: PartyConcept[];
  oneOffParties?: PartyConcept[];
  lastUpdated: string;
}

export default function PartyConceptsPage() {
  const [data, setData] = useState<PartyConceptsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/party-concepts")
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.weeklyMonthlyParties || data.oneOffParties)) {
          setData(data);
        } else {
          fetch("/data/party-concepts-data.json")
            .then((r) => r.json())
            .then((localData) => setData(localData))
            .catch(() => setData(null));
        }
        setLoading(false);
      })
      .catch(() => {
        fetch("/data/party-concepts-data.json")
          .then((r) => r.json())
          .then((localData) => {
            setData(localData);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🎉 Party Concepts</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const weeklyMonthly = data.weeklyMonthlyParties || [];
  const oneOff = data.oneOffParties || [];
  const approvedCount = [...weeklyMonthly, ...oneOff].filter((c) => c.approved).length;
  const flyerCount = [...weeklyMonthly, ...oneOff].filter((c) => c.flyerDone).length;

  const renderConceptCard = (concept: PartyConcept) => (
    <div
      key={concept.id}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "2rem" }}>{concept.icon}</span>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              {concept.name}
            </h2>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{concept.frequency}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: "0.75rem",
              fontWeight: 600,
              background: concept.approved
                ? "rgba(0,200,124,0.2)"
                : "rgba(255,193,7,0.2)",
              color: concept.approved ? "#00c87c" : "#ffc107",
            }}
          >
            {concept.approved ? "✓ Approved" : "Pending"}
          </span>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              fontSize: "0.75rem",
              fontWeight: 600,
              background: concept.flyerDone
                ? "rgba(0,200,124,0.2)"
                : "rgba(128,128,128,0.2)",
              color: concept.flyerDone ? "#00c87c" : "var(--muted)",
            }}
          >
            {concept.flyerDone ? "✓ Flyer Done" : "No Flyer"}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          fontSize: "0.9rem",
        }}
      >
        <div>
          <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
            Who
          </span>
          <span style={{ color: "var(--text)" }}>{concept.who}</span>
        </div>
        <div>
          <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
            Format
          </span>
          <span style={{ color: "var(--text)" }}>{concept.format}</span>
        </div>
        <div>
          <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
            Drink Specials
          </span>
          <span style={{ color: "var(--text)" }}>{concept.drinks}</span>
        </div>
        <div>
          <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
            Games/Activities
          </span>
          <span style={{ color: "var(--text)" }}>{concept.games}</span>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
            Costuming
          </span>
          <span style={{ color: "var(--text)" }}>{concept.costuming}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            🎉 Party Concepts
          </h1>
          <Link
            href="/promotions"
            style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Back to Promotions
          </Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Weekly, monthly, and one-off event ideas for Spearmint Rhino Boise
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Weekly/Monthly</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>{weeklyMonthly.length}</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>One-Off</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>{oneOff.length}</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Approved</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00c87c" }}>{approvedCount}</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Flyers Done</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent2)" }}>{flyerCount}</div>
        </div>
      </div>

      {/* Weekly/Monthly Section */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
          📅 Weekly & Monthly Parties
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {weeklyMonthly.map(renderConceptCard)}
        </div>
      </div>

      {/* One-Off Section */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
          🎯 One-Off Parties
        </h2>
        {oneOff.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {oneOff.map(renderConceptCard)}
          </div>
        ) : (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            No one-off parties added yet. Ideas: Halloween Bash, New Year's Eve, Valentine's Special, St. Patrick's Day, etc.
          </div>
        )}
      </div>

      {/* Last Updated */}
      <p style={{ marginTop: 24, fontSize: "0.75rem", color: "var(--muted)", textAlign: "right" }}>
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
