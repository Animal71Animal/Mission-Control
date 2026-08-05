"use client";
import { useEffect, useState } from "react";

interface ClubTipsData {
  club?: string;
  started?: string;
  monthlyTotals?: { month: string; amount: number; nights: number }[];
  topTippers?: { name: string; total: number; badge?: string }[];
  allDancers?: { name: string; total: number }[];
  nightlyData?: Record<string, { date: string; total: number }[]>;
  last_updated?: string;
  lastUpdated?: string;
}

function sumAmount(d: ClubTipsData | null): number {
  return d?.monthlyTotals?.reduce((s, m) => s + (m.amount || 0), 0) ?? 0;
}

function sumNights(d: ClubTipsData | null): number {
  return d?.monthlyTotals?.reduce((s, m) => s + (m.nights || 0), 0) ?? 0;
}

function clubLastUpdated(d: ClubTipsData | null): string {
  return d?.last_updated || d?.lastUpdated || "";
}

const cardStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const statRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const statBoxStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 14,
  textAlign: "center",
};

const badgeStyle = (badge?: string): React.CSSProperties => {
  if (badge === "gold") return { background: "#ffd700", color: "#000" };
  if (badge === "silver") return { background: "#c0c0c0", color: "#000" };
  if (badge === "bronze") return { background: "#cd7f32", color: "#fff" };
  return { background: "var(--border)", color: "var(--muted)" };
};

export default function TipsComparisonPage() {
  const [srb, setSrb] = useState<ClubTipsData | null>(null);
  const [torch, setTorch] = useState<ClubTipsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [srbRes, torchRes] = await Promise.all([
          fetch("/api/srb-tips", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
          fetch("/api/torch-tips", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        ]);
        if (cancelled) return;
        setSrb(srbRes);
        setTorch(torchRes);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(String(e));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>📊 Tips Comparison</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>📊 Tips Comparison</h1>
        <p style={{ color: "#ff6b6b", marginTop: 20 }}>Error: {error}</p>
      </div>
    );
  }

  const srbTotal = sumAmount(srb);
  const srbNights = sumNights(srb);
  const torchTotal = sumAmount(torch);
  const torchNights = sumNights(torch);
  const combinedTotal = srbTotal + torchTotal;
  const combinedNights = srbNights + torchNights;
  const combinedAvg = combinedNights > 0 ? combinedTotal / combinedNights : 0;

  function renderCard(
    data: ClubTipsData | null,
    name: string,
    icon: string | null,
    logoSrc: string | null,
    accent: string,
    blurb: string
  ) {
    const total = sumAmount(data);
    const nights = sumNights(data);
    const avg = nights > 0 ? total / nights : 0;
    const topTippers = (data?.topTippers || []).slice(0, 5);
    const started = data?.started;
    const lastUpdate = clubLastUpdated(data);

    return (
      <div
        style={{
          ...cardStyle,
          borderTop: `3px solid ${accent}`,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${name} logo`}
              style={{
                height: 56,
                width: "auto",
                maxWidth: 140,
                objectFit: "contain",
                filter: `drop-shadow(0 0 10px ${accent}55)`,
              }}
            />
          ) : (
            <div
              aria-hidden
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                fontSize: 28,
                background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
                border: `1px solid ${accent}55`,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>{name}</h2>
            <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>{blurb}</p>
            {started && (
              <p style={{ margin: "4px 0 0", color: accent, fontSize: "0.75rem" }}>
                Started {started}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={statRowStyle}>
          <div style={statBoxStyle}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Total Tips</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
              ${total.toLocaleString()}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Nights</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
              {nights}
            </div>
          </div>
          <div style={{ ...statBoxStyle, gridColumn: "1 / span 2" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Avg / Night</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: accent, marginTop: 4 }}>
              ${avg.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Top Tippers */}
        <div>
          <h3 style={{ margin: "4px 0 10px", fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Top Tippers
          </h3>
          {topTippers.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.85rem" }}>No data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topTippers.map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        display: "grid",
                        placeItems: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        ...badgeStyle(t.badge),
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: "var(--text)" }}>{t.name}</span>
                  </div>
                  <span style={{ color: accent, fontWeight: 600 }}>${(t.total || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {lastUpdate && (
          <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--muted)", textAlign: "right" }}>
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(155,93,229,0.10)", border: "1px solid rgba(155,93,229,0.3)", borderRadius: 12 }}>
          <span style={{ fontSize: "1.6rem" }}>🦏</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c77dff" }}>SRB</span>
        </div>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #9b5de5, #ec4899, #ef4444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📊 Tips Comparison
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(236,72,153,0.10)", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 12 }}>
          <img src="/torch-logo-clean.png" alt="The Torch" style={{ height: 28, width: "auto", filter: "drop-shadow(0 0 6px rgba(236,72,153,0.4))" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ec4899" }}>The Torch</span>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem", flexBasis: "100%" }}>
          Spearmint Rhino Boise vs The Torch — YTD totals, averages, and top earners side by side.
        </p>
      </div>

      {/* Two club cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          marginBottom: 28,
        }}
      >
        {renderCard(
          srb,
          "Spearmint Rhino",
          "🦏",
          null,
          "#9b5de5",
          "Jan–Jun 2026 · established"
        )}
        {renderCard(
          torch,
          "The Torch",
          null,
          "/torch-logo-clean.png",
          "#ec4899",
          "New program · tracking from launch"
        )}
      </div>

      {/* Combined summary card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(155,93,229,0.10), rgba(236,72,153,0.10), rgba(239,68,68,0.10))",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <h2 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
          🤝 Combined YTD
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <div style={statBoxStyle}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Total Tips</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
              ${combinedTotal.toLocaleString()}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Total Nights</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", marginTop: 4 }}>
              {combinedNights}
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Avg / Night</div>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "var(--accent)",
                marginTop: 4,
              }}
            >
              ${combinedAvg.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
