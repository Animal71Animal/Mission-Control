"use client";

import { useState, useEffect, useRef } from "react";

interface UnfilteredResult {
  topic: string;
  left: string;
  right: string;
  truth: string;
  generatedAt: string;
  error?: string;
}

const SUGGESTED_TOPICS = [
  "Gaza ceasefire",
  "US economy 2026",
  "Immigration policy",
  "AI regulation",
];

const MAX_RECENT = 5;

export default function UnfilteredPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnfilteredResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dots, setDots] = useState(".");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("unfiltered_recent");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);

  const saveRecent = (t: string) => {
    const updated = [t, ...recentSearches.filter((r) => r !== t)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    try {
      localStorage.setItem("unfiltered_recent", JSON.stringify(updated));
    } catch {}
  };

  const analyze = async (t?: string) => {
    const query = (t ?? topic).trim();
    if (!query) return;
    setTopic(query);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/unfiltered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });
      const data: UnfilteredResult = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        saveRecent(query);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") analyze();
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          margin: 0,
          background: "linear-gradient(135deg, #9b5de5, #c77dff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          ⚖️ Unfiltered
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          The story from the left, the right, and the truth.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          ref={inputRef}
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter any news topic..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <button
          onClick={() => analyze()}
          disabled={loading || !topic.trim()}
          style={{
            padding: "12px 24px",
            background: loading || !topic.trim() ? "#6b3fa8" : "#9b5de5",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
            opacity: loading || !topic.trim() ? 0.7 : 1,
            transition: "all 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? `Analyzing${dots}` : "Analyze"}
        </button>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginRight: 8 }}>Recent:</span>
          {recentSearches.map((r) => (
            <button
              key={r}
              onClick={() => analyze(r)}
              disabled={loading}
              style={{
                display: "inline-block",
                margin: "0 4px 4px 0",
                padding: "4px 10px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 20,
                color: "var(--muted)",
                fontSize: "0.78rem",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Suggested topics (empty state) */}
      {!result && !loading && !error && (
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 10 }}>
            Try a suggested topic:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => analyze(t)}
                style={{
                  padding: "6px 14px",
                  background: "rgba(155,93,229,0.1)",
                  border: "1px solid rgba(155,93,229,0.4)",
                  borderRadius: 20,
                  color: "#c77dff",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--muted)",
        }}>
          <div style={{
            fontSize: "2rem",
            marginBottom: 16,
            animation: "spin 2s linear infinite",
            display: "inline-block",
          }}>⚖️</div>
          <p style={{ fontSize: "1rem", color: "var(--text)" }}>
            Searching across the spectrum{dots}
          </p>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 8 }}>
            Querying left, right, and neutral sources — this takes ~15 seconds
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(-10deg); }
              50% { transform: rotate(10deg); }
              100% { transform: rotate(-10deg); }
            }
          `}</style>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{
          padding: 16,
          background: "rgba(224,92,92,0.1)",
          border: "1px solid rgba(224,92,92,0.3)",
          borderRadius: 8,
          color: "#e05c5c",
          fontSize: "0.9rem",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 16,
          }}>
            {/* Left Card */}
            <div style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderLeft: "4px solid #4a90d9",
              borderRadius: 8,
              padding: "20px",
            }}>
              <h3 style={{
                margin: "0 0 12px",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#4a90d9",
              }}>
                🔵 Left Narrative
              </h3>
              <p style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--text)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {result.left}
              </p>
            </div>

            {/* Right Card */}
            <div style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderLeft: "4px solid #e05c5c",
              borderRadius: 8,
              padding: "20px",
            }}>
              <h3 style={{
                margin: "0 0 12px",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#e05c5c",
              }}>
                🔴 Right Narrative
              </h3>
              <p style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--text)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {result.right}
              </p>
            </div>

            {/* Truth Card */}
            <div style={{
              background: "var(--card)",
              border: "1px solid #00c87c",
              borderLeft: "4px solid #00c87c",
              borderRadius: 8,
              padding: "20px",
              boxShadow: "0 0 16px rgba(0, 200, 124, 0.12)",
            }}>
              <h3 style={{
                margin: "0 0 12px",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#00c87c",
              }}>
                ⚖️ Most Likely Truth
              </h3>
              <p style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--text)",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}>
                {result.truth}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "right" }}>
            Analyzed at {formatTime(result.generatedAt)} · Topic: &ldquo;{result.topic}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
