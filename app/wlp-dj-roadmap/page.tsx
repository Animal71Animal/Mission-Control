"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface Milestone {
  emoji: string;
  date: string;
  title: string;
  desc: string;
}

interface RevenueProjection {
  phase: string;
  clubs: number;
  mrr: string;
}

interface RoadmapData {
  status: string;
  subtitle: string;
  revenueTarget: string;
  milestones: Milestone[];
  revenueProjection: RevenueProjection[];
  currentStatus: string[];
  lastUpdated: string;
}

export default function DJAutomationRoadmap() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dj-automation-roadmap")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🗺️ DJ Automation Roadmap</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 4, color: "var(--text)" }}>
        🗺️ DJ Automation Roadmap
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 24 }}>
        {data.subtitle}
      </p>

      <Card>
        <div style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent2)", marginBottom: 8 }}>
              Status
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>{data.status}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent2)", marginBottom: 8 }}>
              Revenue Target
            </div>
            <div style={{ fontSize: "1rem", color: "var(--text)" }}>{data.revenueTarget}</div>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>📍 Milestones</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.milestones.map((m, i) => (
            <Card key={i}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ fontSize: "2rem", flexShrink: 0 }}>{m.emoji}</div>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent2)", marginBottom: 4 }}>
                    {m.date}
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--muted)" }}>
                    {m.desc}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>📊 Revenue Projection</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {data.revenueProjection.map((proj, i) => (
            <Card key={i}>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent2)", marginBottom: 8 }}>
                {proj.phase}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {proj.clubs} clubs
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--accent2)" }}>
                {proj.mrr} MRR
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>✅ Current Status</h2>
        <Card>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {data.currentStatus.map((status, i) => (
              <li key={i} style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
                {status}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: "0.75rem", color: "var(--muted)" }}>
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
