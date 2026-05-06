"use client";

import { useEffect, useState, useCallback } from "react";

interface HitStats {
  path: string;
  title?: string;
  stats: { day: string; hourly: number[]; daily: number }[];
}

interface AnalyticsData {
  total?: {
    total: number;
    total_events: number;
    total_utc?: number;
  };
  hits?: {
    hits: HitStats[];
    more: boolean;
  };
  fetchedAt?: string;
  error?: string;
}

function sumViews(hit: HitStats): number {
  return hit.stats.reduce((acc, s) => acc + s.daily, 0);
}

function maxViews(hit: HitStats): number {
  return hit.stats.reduce((acc, s) => Math.max(acc, s.daily), 0);
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      const json = await res.json();
      if (json && json.hits) {
        setData(json);
      } else {
        setData({ error: "Invalid analytics data" });
      }
    } catch (err) {
      setData({ error: String(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const hits = data?.hits?.hits ?? [];
  const sortedHits = [...hits]
    .map((h) => ({ ...h, views: sumViews(h), max: maxViews(h) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  const pagesTracked = hits.length;

  const lastUpdated = data?.fetchedAt
    ? new Date(data.fetchedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";

  const statCardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "18px 22px",
    minWidth: 140,
    flex: "1 1 140px",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>
            📊 Analytics
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.875rem" }}>
            Web analytics and performance metrics for all your properties.
            {" · via "}
            <a
              href="https://animalpitch.goatcounter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--muted)", textDecoration: "none" }}
            >
              GoatCounter
            </a>
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            background: "rgba(155,93,229,0.15)",
            border: "1px solid rgba(155,93,229,0.35)",
            borderRadius: 8,
            color: "#c77dff",
            fontSize: "0.8rem",
            padding: "7px 14px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.15s",
          }}
        >
          🔄 {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Error state */}
      {data?.error && (
        <div
          style={{
            background: "rgba(255,80,80,0.1)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: 8,
            padding: "14px 18px",
            color: "#ff8080",
            marginBottom: 24,
            fontSize: "0.875rem",
          }}
        >
          ⚠️ {data.error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "#9b5de5" }}>
            {loading ? "…" : (data?.total?.total ?? "—").toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Total Pageviews</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "#9b5de5" }}>
            {loading ? "…" : (data?.total?.total_utc ?? "—").toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Unique Visitors</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "1.7rem", fontWeight: 700, color: "#9b5de5" }}>
            {loading ? "…" : pagesTracked}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Pages Tracked</div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)" }}>
            {loading ? "…" : lastUpdated}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Last Updated</div>
        </div>
      </div>

      {/* Top Pages table */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          Top Pages
        </div>

        {loading && (
          <div style={{ padding: "32px 20px", color: "var(--muted)", textAlign: "center", fontSize: "0.875rem" }}>
            Fetching analytics…
          </div>
        )}

        {!loading && sortedHits.length === 0 && (
          <div style={{ padding: "32px 20px", color: "var(--muted)", textAlign: "center", fontSize: "0.875rem" }}>
            No page data available yet.
          </div>
        )}

        {!loading && sortedHits.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={{ padding: "10px 20px", textAlign: "left", color: "var(--muted)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>
                  Page Path
                </th>
                <th style={{ padding: "10px 20px", textAlign: "right", color: "var(--muted)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>
                  Views
                </th>
                <th style={{ padding: "10px 20px", textAlign: "right", color: "var(--muted)", fontWeight: 500, borderBottom: "1px solid var(--border)" }}>
                  Peak
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHits.map((hit, i) => (
                <tr
                  key={hit.path}
                  style={{
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                    borderBottom: i < sortedHits.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <td style={{ padding: "10px 20px", color: "var(--text)", fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {hit.path}
                  </td>
                  <td style={{ padding: "10px 20px", textAlign: "right", fontWeight: 600, color: "#9b5de5" }}>
                    {hit.views.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 20px", textAlign: "right", color: "var(--muted)" }}>
                    {hit.max.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
