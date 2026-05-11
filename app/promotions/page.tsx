"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface PartyConcept {
  id: string;
  name: string;
  icon: string;
  approved: boolean;
  flyerDone: boolean;
  frequency: string;
}

interface PartyConceptsData {
  concepts: PartyConcept[];
  lastUpdated: string;
}

export default function PromotionsPage() {
  const [data, setData] = useState<PartyConceptsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/party-concepts")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.concepts) {
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>📢 Promotions & Marketing</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const { concepts } = data;
  const approvedCount = concepts.filter((c) => c.approved).length;
  const flyerCount = concepts.filter((c) => c.flyerDone).length;

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

      {/* Quick Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Party Concepts</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>{concepts.length}</div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Approved</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00c87c" }}>{approvedCount}</div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Flyers Done</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent2)" }}>{flyerCount}</div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Monthly Events</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>
            {concepts.filter((c) => c.frequency.includes("Monthly")).length}
          </div>
        </div>
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
            Weekly and monthly event ideas — industry night, teddy tuesdays, chicks in kicks, and more.
          </p>
        </Link>
      </div>

      {/* Last Updated */}
      <p
        style={{
          marginTop: 24,
          fontSize: "0.75rem",
          color: "var(--muted)",
          textAlign: "right",
        }}
      >
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
