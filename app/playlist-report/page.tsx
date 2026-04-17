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

interface OcEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  url: string;
  channel: string;
  publishedDate: string;
  discoveredDate: string;
  summary: string;
  keyTakeaways: string[];
  skillsMentioned: string[];
  toolsCovered: string[];
  priscyllaTake: string;
  expandedTakeaways: { title: string; detail: string }[];
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
  const [ocEpisodes, setOcEpisodes] = useState<OcEpisode[]>([]);
  const [ocLastChecked, setOcLastChecked] = useState<string | null>(null);
  const [ocOpen, setOcOpen] = useState(true);
  const [ocExpanded, setOcExpanded] = useState<string | null>(null);
  const [ocDoneOpen, setOcDoneOpen] = useState(false);
  const [ocSaving, setOcSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videosOpen, setVideosOpen] = useState(true);
  const [doneVideos, setDoneVideos] = useState<Set<string>>(new Set());
  const [videoDoneOpen, setVideoDoneOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/openclaw-playlist-report-full.md")
        .then(r => { if (!r.ok) throw new Error("not found"); return r.text(); })
        .catch(() => ""),
      fetch("/api/openclaw-episodes")
        .then(r => r.json())
        .catch(() => ({ episodes: [], last_checked: null })),
    ]).then(([reportContent, ocData]) => {
      if (reportContent) setEntries(parseReport(reportContent));
      setOcEpisodes(ocData.episodes || []);
      setOcLastChecked(ocData.last_checked);
      // Load done state from localStorage for old videos
      try {
        const saved = localStorage.getItem('playlist-done-videos');
        if (saved) setDoneVideos(new Set(JSON.parse(saved)));
      } catch {}
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markVideoDone = (number: string) => {
    setDoneVideos(prev => {
      const next = new Set(prev);
      next.has(number) ? next.delete(number) : next.add(number);
      localStorage.setItem('playlist-done-videos', JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => { // dummy to prevent double-close
    return;
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
          OpenClaw video summaries · Full breakdown with tools and takeaways
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
          {/* OpenClaw Discovered Videos */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            <button onClick={() => setOcOpen(!ocOpen)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(155,93,229,0.1), rgba(0,245,212,0.05))",
              border: "none", color: "var(--text)", fontSize: "1rem", fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}>
              <span>
                🦞 OpenClaw Videos
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>
                  {ocEpisodes.length} found · {ocLastChecked ? `Last checked ${new Date(ocLastChecked).toLocaleDateString()}` : "Not yet checked"}
                </span>
              </span>
              <span style={{ transform: ocOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
            </button>
            {ocOpen && (
              <div style={{ padding: "0 20px 20px" }}>
                {ocEpisodes.length === 0 ? (
                  <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>
                    No videos found yet. Monitor runs daily at 3 PM MDT.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                    {ocEpisodes.filter(ep => !ep.completed).map(ep => {
                      const isOpen = ocExpanded === ep.id;
                      return (
                        <div key={ep.id} style={{ background: "var(--bg)", border: `1px solid ${isOpen ? "var(--accent)" : "var(--border)"}`, borderRadius: 10, overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <button onClick={() => setOcExpanded(isOpen ? null : ep.id)} style={{
                              flex: 1, display: "flex", alignItems: "center", gap: 14,
                              padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                            }}>
                              <span style={{
                                minWidth: 44, height: 44, borderRadius: 8,
                                background: "rgba(155,93,229,0.15)", color: "var(--accent)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
                              }}>🦞</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{ep.title}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>
                                  {ep.channel} · {new Date(ep.publishedDate + "T12:00:00").toLocaleDateString()}
                                </div>
                              </div>
                              <span style={{ color: "var(--muted)", fontSize: "1rem" }}>{isOpen ? "▲" : "▼"}</span>
                            </button>
                            <button
                              onClick={async () => {
                                setOcSaving(ep.id);
                                setOcEpisodes(prev => prev.map(e => e.id === ep.id ? { ...e, completed: true } : e));
                                await fetch('/api/openclaw-episodes', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: ep.id, completed: true }),
                                });
                                setOcSaving(null);
                              }}
                              style={{
                                padding: "8px 14px", marginRight: 12, borderRadius: 8,
                                background: "rgba(0,200,124,0.12)", border: "1px solid #00c87c",
                                color: "#00c87c", fontWeight: 700, fontSize: "0.8rem",
                                cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                              }}
                            >{ocSaving === ep.id ? "..." : "✅ Done"}</button>
                          </div>
                          {isOpen && (
                            <div style={{ padding: "0 18px 20px", borderTop: "1px solid var(--border)" }}>
                              <a href={ep.url} target="_blank" rel="noopener noreferrer" style={{
                                display: "inline-block", marginTop: 14, marginBottom: 16,
                                fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none",
                                background: "rgba(155,93,229,0.1)", padding: "6px 12px", borderRadius: 5,
                              }}>▶ Watch on YouTube</a>
                              {ep.summary && <Section label="Summary"><p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text)", margin: 0 }}>{ep.summary}</p></Section>}
                              {ep.keyTakeaways?.length > 0 && (
                                <Section label="🎯 Key Takeaways">
                                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", lineHeight: 1.8, color: "var(--text)" }}>
                                    {ep.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
                                  </ul>
                                </Section>
                              )}
                              {ep.skillsMentioned?.length > 0 && (
                                <Section label="🛠️ Skills Mentioned">
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {ep.skillsMentioned.map((s, i) => (
                                      <span key={i} style={{ fontSize: "0.75rem", background: "rgba(155,93,229,0.15)", color: "var(--accent)", padding: "4px 10px", borderRadius: 12 }}>{s}</span>
                                    ))}
                                  </div>
                                </Section>
                              )}
                              {ep.toolsCovered?.length > 0 && (
                                <Section label="⚙️ Tools Covered">
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {ep.toolsCovered.map((t, i) => (
                                      <span key={i} style={{ fontSize: "0.75rem", background: "rgba(0,245,212,0.1)", color: "var(--accent2)", padding: "4px 10px", borderRadius: 12 }}>{t}</span>
                                    ))}
                                  </div>
                                </Section>
                              )}
                              {ep.priscyllaTake && (
                                <Section label="🦞 PriScylla's Take">
                                  <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--accent2)", margin: 0, fontStyle: "italic" }}>{ep.priscyllaTake}</p>
                                </Section>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Done list */}
                    {ocEpisodes.filter(ep => ep.completed).length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => setOcDoneOpen(s => !s)} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, padding: 0,
                        }}>
                          <span style={{ transform: ocDoneOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
                          Done ({ocEpisodes.filter(ep => ep.completed).length})
                        </button>
                        {ocDoneOpen && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                            {ocEpisodes.filter(ep => ep.completed).map(ep => (
                              <div key={ep.id} style={{
                                background: "var(--bg)", border: "1px solid var(--border)",
                                borderRadius: 10, padding: "12px 18px", opacity: 0.45,
                                display: "flex", alignItems: "center", gap: 12,
                              }}>
                                <span style={{ fontSize: "1.2rem" }}>✅</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)", textDecoration: "line-through" }}>{ep.title}</div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{ep.channel}</div>
                                </div>
                                <button onClick={async () => {
                                  setOcEpisodes(prev => prev.map(e => e.id === ep.id ? { ...e, completed: false } : e));
                                  await fetch('/api/openclaw-episodes', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: ep.id, completed: false }),
                                  });
                                }} style={{
                                  fontSize: "0.72rem", color: "var(--muted)", background: "none",
                                  border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                                }}>Undo</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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
                {filtered.filter(e => !doneVideos.has(e.number)).map(entry => {
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
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button
                          onClick={() => setExpanded(isOpen ? null : entry.number)}
                          style={{
                            flex: 1,
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
                        <button
                          onClick={() => markVideoDone(entry.number)}
                          title="Mark as done"
                          style={{
                            padding: "8px 14px", marginRight: 12, borderRadius: 8,
                            background: "rgba(0,200,124,0.12)", border: "1px solid #00c87c",
                            color: "#00c87c", fontWeight: 700, fontSize: "0.8rem",
                            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                          }}
                        >✅ Done</button>
                      </div>

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

                {/* Done list for old videos */}
                {doneVideos.size > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => setVideoDoneOpen(s => !s)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, padding: 0,
                    }}>
                      <span style={{ transform: videoDoneOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
                      Done ({doneVideos.size})
                    </button>
                    {videoDoneOpen && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                        {filtered.filter(e => doneVideos.has(e.number)).map(entry => (
                          <div key={entry.number} style={{
                            background: "var(--bg)", border: "1px solid var(--border)",
                            borderRadius: 10, padding: "10px 18px", opacity: 0.45,
                            display: "flex", alignItems: "center", gap: 12,
                          }}>
                            <span style={{ fontSize: "1.1rem" }}>✅</span>
                            <div style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600, color: "var(--text)", textDecoration: "line-through" }}>
                              #{entry.number} — {entry.title}
                            </div>
                            <button onClick={() => markVideoDone(entry.number)} style={{
                              fontSize: "0.72rem", color: "var(--muted)", background: "none",
                              border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer",
                            }}>Undo</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
