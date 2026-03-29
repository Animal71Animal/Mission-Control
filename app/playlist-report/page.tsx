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

interface TopicBreakdown {
  timestamp: string;
  title: string;
  synopsis: string;
  keyPoints: string[];
}

interface ExpandedTakeaway {
  title: string;
  detail: string;
}

interface LiveEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  url: string;
  publishedDate: string;
  duration: string;
  summary: string;
  keyTakeaways: string[];
  expandedTakeaways: ExpandedTakeaway[];
  toolsCovered: string[];
  codeSnippets: string[];
  relatedVideos: string[];
  topics: string[];
  topicBreakdown: TopicBreakdown[];
}

function parseReport(text: string): VideoEntry[] {
  const entries: VideoEntry[] = [];
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
  const [liveEpisodes, setLiveEpisodes] = useState<LiveEpisode[]>([]);
  const [pdEpisodes, setPdEpisodes] = useState<LiveEpisode[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [liveExpanded, setLiveExpanded] = useState<string | null>(null);
  const [pdExpanded, setPdExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videosOpen, setVideosOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);
  const [pdOpen, setPdOpen] = useState(false);

  useEffect(() => {
    const fetchPlaylist = fetch("/data/openclaw-playlist-report-full.md")
      .then(r => { if (!r.ok) throw new Error("not found"); return r.text(); })
      .catch(() => "");

    const fetchLive = fetch("/data/live-episodes.json")
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .catch(() => []);

    const fetchPd = fetch("/data/peter-diamandis-episodes.json")
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .catch(() => []);

    Promise.all([fetchPlaylist, fetchLive, fetchPd])
      .then(([reportContent, liveData, pdData]) => {
        setPdEpisodes(pdData);
        if (reportContent) setEntries(parseReport(reportContent));
        setLiveEpisodes(liveData);
        setLoading(false);
      })
      .catch(() => {
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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  const getDaysAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      if (diff < 0) return "Upcoming";
      return `${diff} days ago`;
    } catch { return ""; }
  };

  const isRecentDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return false;
      return date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } catch { return false; }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 6 }}>
          📺 YouTube Playlist Reports
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          49 videos + Live episodes · Full breakdown with summaries, tools, and takeaways
        </p>
      </div>

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
        <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>Loading reports...</div>
      )}
      {error && (
        <div style={{ color: "#f87171", textAlign: "center", padding: 60 }}>{error}</div>
      )}

      {!loading && !error && (
        <div>
          {/* Live Episodes Section */}
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}>
            <button
              onClick={() => setLiveOpen(!liveOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "16px 20px",
                background: "linear-gradient(135deg, rgba(155,93,229,0.1), rgba(6,182,212,0.05))",
                border: "none",
                color: "var(--text)",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span>
                🔴 Tom Bilyeu
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>
                  Mon/Wed/Fri mornings
                </span>
              </span>
              <span style={{ 
                transform: liveOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}>▼</span>
            </button>
            
            {liveOpen && (
              <div style={{ padding: "0 20px 20px" }}>
                {liveEpisodes.length === 0 ? (
                  <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>
                    No live episodes yet. New episodes typically posted Mon/Wed/Fri mornings.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                    {liveEpisodes.map((episode) => {
                      const isOpen = liveExpanded === episode.id;
                      const isRecent = isRecentDate(episode.publishedDate);
                      
                      return (
                        <div
                          key={episode.id}
                          style={{
                            background: "var(--bg)",
                            border: `1px solid ${isOpen ? "var(--accent)" : isRecent ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                            borderRadius: 10,
                            overflow: "hidden",
                            transition: "border-color 0.15s",
                          }}
                        >
                          {/* Row */}
                          <button
                            onClick={() => setLiveExpanded(isOpen ? null : episode.id)}
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
                                minWidth: 44,
                                height: 44,
                                borderRadius: 8,
                                background: isRecent ? "rgba(239,68,68,0.15)" : "rgba(155,93,229,0.15)",
                                color: isRecent ? "#ef4444" : "var(--accent2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              EP{episode.episodeNumber}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                                {episode.title}
                                {isRecent && (
                                  <span style={{ fontSize: "0.6rem", background: "#ef4444", color: "#fff", padding: "2px 6px", borderRadius: 10 }}>
                                    NEW
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3, display: "flex", gap: 12 }}>
                                <span>{formatDate(episode.publishedDate)}</span>
                                <span>•</span>
                                <span>{episode.duration}</span>
                                <span>•</span>
                                <span style={{ color: isRecent ? "#ef4444" : "var(--muted)" }}>
                                  {getDaysAgo(episode.publishedDate)}
                                </span>
                              </div>
                            </div>
                            <span style={{ color: "var(--muted)", fontSize: "1rem", flexShrink: 0 }}>
                              {isOpen ? "▲" : "▼"}
                            </span>
                          </button>

                          {/* Expanded */}
                          {isOpen && (
                            <div style={{ padding: "0 18px 20px", borderTop: "1px solid var(--border)" }}>
                              <a
                                href={episode.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-block",
                                  marginTop: 14,
                                  marginBottom: 16,
                                  fontSize: "0.78rem",
                                  color: "var(--accent2)",
                                  textDecoration: "none",
                                  background: "rgba(239,68,68,0.1)",
                                  padding: "6px 12px",
                                  borderRadius: 5,
                                }}
                              >
                                🔴 Watch Live Episode
                              </a>

                              {/* Summary */}
                              <Section label="Summary">
                                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text)", margin: 0 }}>
                                  {episode.summary}
                                </p>
                              </Section>

                              {/* Topic Breakdown */}
                              {episode.topicBreakdown && episode.topicBreakdown.length > 0 && (
                                <Section label="📋 Topic Breakdown">
                                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {episode.topicBreakdown.map((topic, i) => (
                                      <TopicCard key={i} topic={topic} />
                                    ))}
                                  </div>
                                </Section>
                              )}

                              {/* Key Takeaways */}
                              {episode.keyTakeaways?.length > 0 && (
                                <Section label="🎯 Key Takeaways">
                                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", lineHeight: 1.8, color: "var(--text)" }}>
                                    {episode.keyTakeaways?.map((takeaway, i) => (
                                      <li key={i}>{takeaway}</li>
                                    ))}
                                  </ul>
                                </Section>
                              )}

                              {/* Expanded Takeaways */}
                              {episode.expandedTakeaways && episode.expandedTakeaways.length > 0 && (
                                <Section label="💡 Deep Dive Takeaways">
                                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {episode.expandedTakeaways.map((item, i) => (
                                      <div key={i} style={{ background: "rgba(155,93,229,0.05)", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent2)", marginBottom: 4 }}>
                                          {item.title}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.6 }}>
                                          {item.detail}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </Section>
                              )}

                              {/* Tools Covered */}
                              {episode.toolsCovered?.length > 0 && (
                                <Section label="🛠️ Tools & Frameworks">
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {episode.toolsCovered?.map((tool, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          fontSize: "0.75rem",
                                          background: "rgba(155,93,229,0.15)",
                                          color: "var(--accent2)",
                                          padding: "4px 10px",
                                          borderRadius: 12,
                                        }}
                                      >
                                        {tool}
                                      </span>
                                    ))}
                                  </div>
                                </Section>
                              )}

                              {/* Code Snippets */}
                              {episode.codeSnippets?.length > 0 && (
                                <Section label="💻 Code Snippets">
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {episode.codeSnippets?.map((snippet, i) => (
                                      <code
                                        key={i}
                                        style={{
                                          fontSize: "0.8rem",
                                          background: "rgba(0,0,0,0.3)",
                                          padding: "8px 12px",
                                          borderRadius: 6,
                                          color: "var(--text)",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {snippet}
                                      </code>
                                    ))}
                                  </div>
                                </Section>
                              )}

                              {/* Related Videos */}
                              {episode.relatedVideos?.length > 0 && (
                                <Section label="📚 Related Tutorial Videos">
                                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {episode.relatedVideos?.map((vid, i) => (
                                      <span
                                        key={i}
                                        style={{
                                          fontSize: "0.75rem",
                                          background: "rgba(6,182,212,0.15)",
                                          color: "#06b6d4",
                                          padding: "4px 10px",
                                          borderRadius: 12,
                                        }}
                                      >
                                        Video #{vid}
                                      </span>
                                    ))}
                                  </div>
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
            )}
          </div>

          {/* Peter Diamandis Section */}
          <ChannelSection
            label="🚀 Peter Diamandis"
            subtitle="Exponential technology, abundance, & moonshots"
            episodes={pdEpisodes}
            isOpen={pdOpen}
            onToggle={() => setPdOpen(!pdOpen)}
            expanded={pdExpanded}
            onExpand={setPdExpanded}
            watchLabel="▶ Watch on YouTube"
            watchBg="rgba(6,182,212,0.1)"
            accentColor="#06b6d4"
          />

          {/* Video Summaries Section */}
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}>
            <button
              onClick={() => setVideosOpen(!videosOpen)}
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
              <span>📄 OpenClaw Tutorial Videos (49)</span>
              <span style={{ 
                transform: videosOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}>▼</span>
            </button>
            
            {videosOpen && (
              <div style={{ 
                padding: "0 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {filtered.length === 0 && (
                  <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No results for "{search}"</div>
                )}
                {filtered.map(entry => {
                  const isOpen = expanded === entry.number;
                  return (
                    <div
                      key={entry.number}
                      style={{
                        background: "var(--bg)",
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
        </div>
      )}
    </div>
  );
}

function ChannelSection({ label, subtitle, episodes, isOpen, onToggle, expanded, onExpand, watchLabel, watchBg, accentColor }: {
  label: string;
  subtitle: string;
  episodes: LiveEpisode[];
  isOpen: boolean;
  onToggle: () => void;
  expanded: string | null;
  onExpand: (id: string | null) => void;
  watchLabel: string;
  watchBg: string;
  accentColor: string;
}) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <button onClick={onToggle} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "16px 20px", background: `linear-gradient(135deg, ${accentColor}18, transparent)`, border: "none", color: "var(--text)", fontSize: "1rem", fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
        <span>{label} <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>{subtitle}</span></span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 20px 20px" }}>
          {episodes.length === 0 ? (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>No episodes yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              {episodes.map((episode) => {
                const isEpOpen = expanded === episode.id;
                const isRecent = new Date(episode.publishedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return (
                  <div key={episode.id} style={{ background: "var(--bg)", border: `1px solid ${isEpOpen ? accentColor : isRecent ? `${accentColor}66` : "var(--border)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.15s" }}>
                    <button onClick={() => onExpand(isEpOpen ? null : episode.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ minWidth: 44, height: 44, borderRadius: 8, background: `${accentColor}22`, color: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, textAlign: "center", padding: "0 4px" }}>
                        EP{episode.episodeNumber}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                          {episode.title}
                          {isRecent && <span style={{ fontSize: "0.6rem", background: accentColor, color: "#fff", padding: "2px 6px", borderRadius: 10 }}>NEW</span>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>{episode.publishedDate}</div>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: "1rem" }}>{isEpOpen ? "▲" : "▼"}</span>
                    </button>
                    {isEpOpen && (
                      <div style={{ padding: "0 18px 20px", borderTop: "1px solid var(--border)" }}>
                        <a href={episode.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 14, marginBottom: 16, fontSize: "0.78rem", color: accentColor, textDecoration: "none", background: watchBg, padding: "6px 12px", borderRadius: 5 }}>{watchLabel}</a>
                        <Section label="Summary"><p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text)", margin: 0 }}>{episode.summary}</p></Section>
                        {episode.topicBreakdown && episode.topicBreakdown.length > 0 && (
                          <Section label="📋 Topic Breakdown">
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {episode.topicBreakdown.map((topic, i) => <TopicCard key={i} topic={topic} />)}
                            </div>
                          </Section>
                        )}
                        {(episode.keyTakeaways?.length ?? 0) > 0 && (
                          <Section label="🎯 Key Takeaways">
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", lineHeight: 1.8, color: "var(--text)" }}>
                              {episode.keyTakeaways?.map((t, i) => <li key={i}>{t}</li>)}
                            </ul>
                          </Section>
                        )}
                        {episode.expandedTakeaways && episode.expandedTakeaways.length > 0 && (
                          <Section label="💡 Deep Dive Takeaways">
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                              {episode.expandedTakeaways.map((item, i) => (
                                <div key={i} style={{ background: `${accentColor}0d`, padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
                                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: accentColor, marginBottom: 4 }}>{item.title}</div>
                                  <div style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.6 }}>{item.detail}</div>
                                </div>
                              ))}
                            </div>
                          </Section>
                        )}
                        {(episode.topics?.length ?? 0) > 0 && (
                          <Section label="🏷️ Topics">
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {episode.topics?.map((topic, i) => <span key={i} style={{ fontSize: "0.75rem", background: `${accentColor}22`, color: accentColor, padding: "4px 10px", borderRadius: 12 }}>{topic}</span>)}
                            </div>
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

function TopicCard({ topic }: { topic: TopicBreakdown }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div style={{ 
      background: "var(--card)", 
      border: "1px solid var(--border)", 
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "var(--accent2)",
          background: "rgba(155,93,229,0.15)",
          padding: "4px 8px",
          borderRadius: 6,
          minWidth: 50,
          textAlign: "center",
        }}>
          {topic.timestamp}
        </span>
        <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
          {topic.title}
        </span>
        <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
          {expanded ? "▲" : "▼"}
        </span>
      </button>
      
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text)", margin: "12px 0" }}>
            {topic.synopsis}
          </p>
          {topic.keyPoints?.length > 0 && (
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
                Key Points:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", lineHeight: 1.7, color: "var(--text)" }}>
                {topic.keyPoints?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
