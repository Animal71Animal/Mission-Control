"use client";

import { useState } from "react";
import { 
  artistAssets, 
  getCompletionPercentage,
  type AssetStatus,
  type ArtistAssets 
} from "@/app/data/artistAssets";

const statusConfig: Record<AssetStatus, { color: string; bg: string; label: string }> = {
  complete: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", label: "✓" },
  pending: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", label: "◐" },
  missing: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", label: "✗" },
  "needs-update": { color: "#9b5de5", bg: "rgba(155, 93, 229, 0.15)", label: "↻" },
};

const assetTypes = [
  { key: "logo", label: "Logo" },
  { key: "photos", label: "Photos" },
  { key: "bio", label: "Bio" },
  { key: "social", label: "Social" },
  { key: "music", label: "Music" },
  { key: "pressKit", label: "Press Kit" },
  { key: "brandGuidelines", label: "Brand" },
] as const;

function StatusDot({ status }: { status: AssetStatus }) {
  const config = statusConfig[status];
  return (
    <span
      title={status}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: config.bg,
        color: config.color,
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "help",
      }}
    >
      {config.label}
    </span>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  let color = "#ef4444";
  if (percentage >= 80) color = "#22c55e";
  else if (percentage >= 50) color = "#f59e0b";
  else if (percentage >= 25) color = "#9b5de5";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 8,
          background: "var(--border)",
          borderRadius: 4,
          overflow: "hidden",
          minWidth: 80,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
            borderRadius: 4,
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <span style={{ fontSize: "0.85rem", fontWeight: 600, color, minWidth: 36 }}>
        {percentage}%
      </span>
    </div>
  );
}

function ArtistRow({ 
  artist, 
  isExpanded, 
  onToggle 
}: { 
  artist: ArtistAssets; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const completion = getCompletionPercentage(artist);
  const missingCount = assetTypes.filter(t => (artist as any)[t.key].status === "missing").length;
  const pendingCount = assetTypes.filter(t => (artist as any)[t.key].status === "pending").length;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Main Row */}
      <div
        onClick={onToggle}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 20px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* Artist Info */}
          <div style={{ flex: "0 0 200px", minWidth: 150 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.5rem" }}>
                {artist.badge === "wlp" ? "🎧" : "🤖"}
              </span>
              <div>
                <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "1rem" }}>
                  {artist.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {artist.genre}
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ flex: "1 1 200px", minWidth: 150 }}>
            <ProgressBar percentage={completion} />
          </div>

          {/* Quick Stats */}
          <div style={{ display: "flex", gap: 16, flex: "0 0 auto" }}>
            {missingCount > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#ef4444" }}>
                  {missingCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>
                  Missing
                </div>
              </div>
            )}
            {pendingCount > 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f59e0b" }}>
                  {pendingCount}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>
                  Pending
                </div>
              </div>
            )}
            {missingCount === 0 && pendingCount === 0 && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#22c55e" }}>
                  ✓
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>
                  Complete
                </div>
              </div>
            )}
          </div>

          {/* Expand Icon */}
          <div style={{ 
            fontSize: "1.2rem", 
            color: "var(--muted)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>
            ▼
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          style={{
            background: "rgba(0,0,0,0.2)",
            border: "1px solid var(--border)",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            padding: "20px",
            marginTop: -4,
          }}
        >
          <AssetGrid artist={artist} />
        </div>
      )}
    </div>
  );
}

function AssetGrid({ artist }: { artist: ArtistAssets }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
      {assetTypes.map((type) => {
        const asset = (artist as any)[type.key];
        return (
          <AssetCard 
            key={type.key} 
            type={type.label} 
            status={asset.status}
            details={getAssetDetails(type.key, asset)}
          />
        );
      })}
    </div>
  );
}

function getAssetDetails(key: string, asset: any): string | null {
  switch (key) {
    case "logo":
      return asset.path ? asset.path.split("/").pop() : null;
    case "photos":
      return asset.count > 0 ? `${asset.count} images` : null;
    case "bio":
      return asset.wordCount > 0 ? `${asset.wordCount} words` : null;
    case "social":
      const count = Object.keys(asset.links || {}).length;
      return count > 0 ? `${count} platforms` : null;
    case "music":
      return asset.trackCount > 0 ? `${asset.trackCount} tracks` : null;
    case "pressKit":
      return asset.path ? "Available" : null;
    case "brandGuidelines":
      return asset.path ? "Available" : null;
    default:
      return null;
  }
}

function AssetCard({ 
  type, 
  status, 
  details 
}: { 
  type: string; 
  status: AssetStatus;
  details: string | null;
}) {
  const config = statusConfig[status];
  
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <StatusDot status={status} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text)" }}>
          {type}
        </div>
        {details && (
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
            {details}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 600,
          textTransform: "uppercase",
          color: config.color,
          background: config.bg,
          padding: "2px 8px",
          borderRadius: 12,
        }}
      >
        {status.replace("-", " ")}
      </span>
    </div>
  );
}

function SummaryStats() {
  const allAssets = artistAssets.flatMap(a => 
    assetTypes.map(t => ({ artist: a.name, type: t.label, status: (a as any)[t.key].status }))
  );
  
  const byStatus = {
    complete: allAssets.filter(a => a.status === "complete").length,
    pending: allAssets.filter(a => a.status === "pending").length,
    missing: allAssets.filter(a => a.status === "missing").length,
    needsUpdate: allAssets.filter(a => a.status === "needs-update").length,
  };

  const total = allAssets.length;
  const completionRate = Math.round((byStatus.complete / total) * 100);

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
      gap: 12,
      marginBottom: 24 
    }}>
      <StatBox 
        label="Overall Completion" 
        value={`${completionRate}%`} 
        color={completionRate >= 70 ? "#22c55e" : completionRate >= 40 ? "#f59e0b" : "#ef4444"}
      />
      <StatBox label="Complete" value={byStatus.complete} color="#22c55e" />
      <StatBox label="Pending" value={byStatus.pending} color="#f59e0b" />
      <StatBox label="Missing" value={byStatus.missing} color="#ef4444" />
      <StatBox label="Needs Update" value={byStatus.needsUpdate} color="#9b5de5" />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function PriorityList() {
  // Find missing/pending items grouped by artist
  const priorities = artistAssets
    .map(artist => {
      const missing = assetTypes.filter(t => (artist as any)[t.key].status === "missing");
      const pending = assetTypes.filter(t => (artist as any)[t.key].status === "pending");
      return { artist, missing, pending };
    })
    .filter(p => p.missing.length > 0 || p.pending.length > 0)
    .sort((a, b) => (b.missing.length + b.pending.length) - (a.missing.length + a.pending.length));

  if (priorities.length === 0) return null;

  return (
    <div style={{ 
      background: "var(--card)", 
      border: "1px solid var(--border)", 
      borderRadius: 10, 
      padding: 20,
      marginBottom: 24,
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "1rem", color: "var(--text)" }}>
        🎯 Priority Actions
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {priorities.map(({ artist, missing, pending }) => (
          <div key={artist.id} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, color: "var(--text)", minWidth: 120 }}>
              {artist.name}
            </span>
            {missing.length > 0 && (
              <span style={{ fontSize: "0.8rem", color: "#ef4444", background: "rgba(239,68,68,0.15)", padding: "4px 10px", borderRadius: 12 }}>
                {missing.length} missing
              </span>
            )}
            {pending.length > 0 && (
              <span style={{ fontSize: "0.8rem", color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "4px 10px", borderRadius: 12 }}>
                {pending.length} pending
              </span>
            )}
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
              {missing.map(m => m.label).concat(pending.map(p => p.label)).join(", ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ArtistAssetsPage() {
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  const toggleArtist = (id: string) => {
    setExpandedArtist(expandedArtist === id ? null : id);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
          🎨 Artist Assets
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.875rem" }}>
          Track completion status for all WLP artist assets
        </p>
      </div>

      {/* Legend */}
      <div style={{ 
        display: "flex", 
        gap: 20, 
        marginBottom: 24,
        fontSize: "0.8rem",
        flexWrap: "wrap",
      }}>
        <LegendItem symbol="✓" color="#22c55e" label="Complete" />
        <LegendItem symbol="◐" color="#f59e0b" label="Pending" />
        <LegendItem symbol="✗" color="#ef4444" label="Missing" />
        <LegendItem symbol="↻" color="#9b5de5" label="Needs Update" />
      </div>

      {/* Summary Stats */}
      <SummaryStats />

      {/* Priority Actions */}
      <PriorityList />

      {/* Artist List */}
      <div>
        <h3 style={{ margin: "0 0 16px", fontSize: "1rem", color: "var(--text)" }}>
          Artists
        </h3>
        {artistAssets.map((artist) => (
          <ArtistRow
            key={artist.id}
            artist={artist}
            isExpanded={expandedArtist === artist.id}
            onToggle={() => toggleArtist(artist.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LegendItem({ symbol, color, label }: { symbol: string; color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: `${color}20`,
          color,
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {symbol}
      </span>
      <span style={{ color: "var(--muted)" }}>{label}</span>
    </div>
  );
}
