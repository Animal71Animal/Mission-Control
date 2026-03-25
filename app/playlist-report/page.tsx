"use client";

import { useEffect, useState } from "react";

interface VideoEntry {
  number: string;
  title: string;
  url: string;
  summary: string;
  tools: string;
  take: string;
  raw: string;
}

function parseReport(text: string): VideoEntry[] {
  const entries: VideoEntry[] = [];
  // Split on video headers like ## [01/44] or ## [45/49]
  const sections = text.split(/(?=^## \[\d+\/\d+\])/m).filter(s => s.trim().startsWith("## ["));

  for (const section of sections) {
    const lines = section.split("\n");
    const header = lines[0] || "";
    const numberMatch = header.match(/\[(\d+)\/\d+\]/);
    const number = numberMatch ? numberMatch[1] : "?";
    const title = header.replace(/^## \[\d+\/\d+\]\s*/, "").trim();

    const urlMatch = section.match(/\*\*URL:\*\*\s*(https?:\/\/\S+)/);
    const url = urlMatch ? urlMatch[1] : "";

    const summaryMatch = section.match(/###?\s*Summary\n([\s\S]*?)(?=###?|$)/i);
    const summary = summaryMatch ? summaryMatch[1].trim() : "";

    const toolsMatch = section.match(/###?\s*Tools[\s\/]*Skills[\s\/]*Tips[^\n]*\n([\s\S]*?)(?=###?|$)/i);
    const tools = toolsMatch ? toolsMatch[1].trim() : "";

    const takeMatch = section.match(/###?\s*PriScylla'?s?\s*Take\n([\s\S]*?)(?=---|\n## |$)/i);
    const take = takeMatch ? takeMatch[1].trim() : "";

    entries.push({ number, title, url, summary, tools, take, raw: section });
  }

  return entries;
}

function BulletList({ text }: { text: string }) {
  const lines = text.split("\n").filter(l => l.trim());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((line, i) => {
        // Bold **text**
        const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        const isBullet = line.trim().startsWith("-") || line.trim().startsWith("*");
        return (
          <div
            key={i}
            style={{
              paddingLeft: isBullet ? 16 : 0,
              color: "var(--text)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              position: "relative",
            }}
            dangerouslySetInnerHTML={{ __html: isBullet ? "• " + formatted.replace(/^[-*]\s*/, "") : formatted }}
          />
        );
      })}
    </div>
  );
}

export default function PlaylistReportPage() {
  const [entries, setEntries] = useState<VideoEntry[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/data/openclaw-playlist-report-full.md")
      .then(r => r.text())
      .then(content => {
        setEntries(parseReport(content));
        setLoading(false);
      })
      .catch(() => {
        setError("Could not fetch report");
        setLoading(false);
      });
  }, []);

  const filtered = entries.filter(e => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tools.toLowerCase().includes(q) ||
      e.take.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 6 }}>
          📺 OpenClaw Playlist Report
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          49 videos · Full breakdown with summaries, tools, and PriScylla's take
        </p>
      </div>

      {/* Full Document - Collapsible */}
      <CollapsibleDocument />

      {/* Search */}
      <input
        type="text"
        placeholder="Search videos, tools, topics..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--text)",
          fontSize: "0.9rem",
          marginBottom: 24,
          boxSizing: "border-box",
          outline: "none",
        }}
      />

      {loading && (
        <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>Loading report...</div>
      )}
      {error && (
        <div style={{ color: "#f87171", textAlign: "center", padding: 60 }}>{error}</div>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No results for "{search}"</div>
          )}
          {filtered.map(entry => {
            const isOpen = expanded === entry.number;
            return (
              <div
                key={entry.number}
                style={{
                  background: "var(--card)",
                  border: `1px solid ${isOpen ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  transition: "border-color 0.15s",
                }}
              >
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : entry.number)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      minWidth: 38,
                      height: 38,
                      borderRadius: 8,
                      background: "rgba(155,93,229,0.15)",
                      color: "var(--accent2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {entry.number}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
                      {entry.title}
                    </div>
                    {!isOpen && entry.summary && (
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>
                        {entry.summary.slice(0, 140)}{entry.summary.length > 140 ? "…" : ""}
                      </div>
                    )}
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: "1rem", flexShrink: 0 }}>
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ padding: "0 18px 20px", borderTop: "1px solid var(--border)" }}>
                    {entry.url && (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 14,
                          marginBottom: 16,
                          fontSize: "0.78rem",
                          color: "var(--accent2)",
                          textDecoration: "none",
                          background: "rgba(155,93,229,0.1)",
                          padding: "4px 10px",
                          borderRadius: 5,
                        }}
                      >
                        ▶ Watch on YouTube
                      </a>
                    )}

                    {entry.summary && (
                      <Section label="Summary">
                        <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text)", margin: 0 }}>
                          {entry.summary}
                        </p>
                      </Section>
                    )}

                    {entry.tools && (
                      <Section label="Tools / Skills / Tips">
                        <BulletList text={entry.tools} />
                      </Section>
                    )}

                    {entry.take && (
                      <Section label="🦞 PriScylla's Take">
                        <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text)", margin: 0, fontStyle: "italic" }}>
                          {entry.take}
                        </p>
                      </Section>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// Collapsible Full Document Component
function CollapsibleDocument() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const loadContent = async () => {
    if (!content && !loading) {
      setLoading(true);
      try {
        const res = await fetch("/data/openclaw-playlist-report-full.md");
        const text = await res.text();
        setContent(text);
      } catch {
        setContent("Failed to load document.");
      }
      setLoading(false);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      marginBottom: 24,
      overflow: "hidden",
    }}>
      <button
        onClick={loadContent}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          color: "var(--text)",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>📄 Complete OpenClaw Playlist Summary Report (All 49 Videos)</span>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>▼</span>
      </button>
      
      {isOpen && (
        <div style={{ 
          padding: "0 20px 20px", 
          animation: "fadeIn 0.2s ease",
          maxHeight: "60vh",
          overflowY: "auto",
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {loading ? (
            <div style={{ color: "var(--muted)", padding: "20px", textAlign: "center" }}>Loading document...</div>
          ) : (
            <pre style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              fontSize: "0.8rem",
              lineHeight: 1.6,
              color: "var(--text)",
              fontFamily: "monospace",
              background: "var(--bg)",
              padding: 16,
              borderRadius: 8,
              border: "1px solid var(--border)",
            }}>
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
