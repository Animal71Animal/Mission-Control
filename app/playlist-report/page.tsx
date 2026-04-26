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

interface OcEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  url: string;
  channel: string;
  publishedDate: string;
  summary: string;
  keyTakeaways: string[];
  skillsMentioned: string[];
  toolsCovered: string[];
  priscyllaTake: string;
  completed?: boolean;
}

interface UnifiedVideo {
  uid: string;
  title: string;
  url: string;
  summary: string;
  channel?: string;
  date?: string;
  tools?: string;
  take?: string;
  keyTakeaways?: string[];
  skills?: string[];
  source: 'playlist' | 'openclaw';
  ocEp?: OcEpisode;
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

export default function PlaylistReportPage() {
  const [allVideos, setAllVideos] = useState<UnifiedVideo[]>([]);
  const [ocEpisodes, setOcEpisodes] = useState<OcEpisode[]>([]);
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());
  const [importantSet, setImportantSet] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sectionOpen, setSectionOpen] = useState(true);
  const [doneOpen, setDoneOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ocSaving, setOcSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/openclaw-playlist-report-full.md").then(r => r.ok ? r.text() : "").catch(() => ""),
      fetch("/api/openclaw-episodes").then(r => r.json()).catch(() => ({ episodes: [] })),
    ]).then(([mdContent, ocData]) => {
      const entries = mdContent ? parseReport(mdContent) : [];
      const oc: OcEpisode[] = ocData.episodes || [];
      setOcEpisodes(oc);

      const unified: UnifiedVideo[] = [
        ...oc.map(ep => ({
          uid: `oc-${ep.id}`,
          title: ep.title,
          url: ep.url,
          summary: ep.summary,
          channel: ep.channel,
          date: ep.publishedDate,
          keyTakeaways: ep.keyTakeaways,
          skills: ep.skillsMentioned,
          take: ep.priscyllaTake,
          source: 'openclaw' as const,
          ocEp: ep,
        })),
        ...entries.map(e => ({
          uid: `pl-${e.number}`,
          title: e.title,
          url: e.url,
          summary: e.summary,
          tools: e.tools,
          take: e.take,
          source: 'playlist' as const,
        })),
      ];
      setAllVideos(unified);

      try {
        const savedDone = localStorage.getItem('yt-done-v2');
        const savedImportant = localStorage.getItem('yt-important-v2');
        if (savedDone) setDoneSet(new Set(JSON.parse(savedDone)));
        if (savedImportant) setImportantSet(new Set(JSON.parse(savedImportant)));
      } catch {}

      setLoading(false);
    });
  }, []);

  const toggleDone = async (uid: string, ocId?: string) => {
    const isDone = doneSet.has(uid);
    setDoneSet(prev => {
      const next = new Set(prev);
      isDone ? next.delete(uid) : next.add(uid);
      localStorage.setItem('yt-done-v2', JSON.stringify([...next]));
      return next;
    });
    if (ocId) {
      setOcSaving(uid);
      await fetch('/api/openclaw-episodes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ocId, completed: !isDone }),
      });
      setOcSaving(null);
    }
  };

  const toggleImportant = (uid: string) => {
    setImportantSet(prev => {
      const next = new Set(prev);
      prev.has(uid) ? next.delete(uid) : next.add(uid);
      localStorage.setItem('yt-important-v2', JSON.stringify([...next]));
      return next;
    });
  };

  const filtered = allVideos.filter(v => {
    if (!search) return true;
    const q = search.toLowerCase();
    return v.title.toLowerCase().includes(q) || (v.summary || "").toLowerCase().includes(q) || (v.tools || "").toLowerCase().includes(q);
  });

  const active = filtered
    .filter(v => !doneSet.has(v.uid))
    .sort((a, b) => {
      const ai = importantSet.has(a.uid) ? 0 : 1;
      const bi = importantSet.has(b.uid) ? 0 : 1;
      return ai - bi;
    });

  const done = filtered.filter(v => doneSet.has(v.uid));
  const importantCount = [...importantSet].filter(uid => !doneSet.has(uid)).length;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 6 }}>📺 YouTube Video Library</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          {allVideos.length} videos total · {importantCount > 0 ? `⭐ ${importantCount} flagged · ` : ""}{done.size} done
        </p>
      </div>

      <input
        type="text"
        placeholder="Search all videos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "10px 16px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--card)",
          color: "var(--text)", fontSize: "0.9rem", marginBottom: 24,
          boxSizing: "border-box", outline: "none",
        }}
      />

      {loading && <div style={{ color: "var(--muted)", textAlign: "center", padding: 60 }}>Loading...</div>}

      {!loading && (
        <div>
          {/* Main collapsible */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            <button onClick={() => setSectionOpen(!sectionOpen)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(155,93,229,0.1), rgba(0,245,212,0.05))",
              border: "none", color: "var(--text)", fontSize: "1rem", fontWeight: 600, cursor: "pointer", textAlign: "left",
            }}>
              <span>
                🦞 All Videos
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>
                  {active.length} unwatched{importantCount > 0 ? ` · ⭐ ${importantCount} flagged` : ""}
                </span>
              </span>
              <span style={{ transform: sectionOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
            </button>

            {sectionOpen && (
              <div style={{ padding: "0 16px 20px" }}>
                {active.length === 0 && <div style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>All caught up! 🎉</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  {active.map(video => {
                    const isOpen = expanded === video.uid;
                    const isImportant = importantSet.has(video.uid);
                    return (
                      <div key={video.uid} style={{
                        background: "var(--bg)",
                        border: `1px solid ${isImportant ? "#f59e0b" : isOpen ? "var(--accent)" : "var(--border)"}`,
                        borderLeft: isImportant ? "4px solid #f59e0b" : `4px solid ${video.source === 'openclaw' ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 10, overflow: "hidden",
                      }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {/* Done checkbox */}
                          <button
                            onClick={() => toggleDone(video.uid, video.ocEp?.id)}
                            title="Mark as done"
                            style={{
                              width: 28, height: 28, marginLeft: 14, borderRadius: 6, flexShrink: 0,
                              background: "transparent", border: "2px solid #00c87c", cursor: "pointer",
                            }}
                          />

                          {/* Expand button */}
                          <button onClick={() => setExpanded(isOpen ? null : video.uid)} style={{
                            flex: 1, display: "flex", alignItems: "center", gap: 12,
                            padding: "12px 12px", background: "transparent", border: "none",
                            cursor: "pointer", textAlign: "left",
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                                {isImportant && <span style={{ fontSize: "0.85rem" }}>⭐</span>}
                                {video.source === 'openclaw' && <span style={{ fontSize: "0.65rem", background: "rgba(155,93,229,0.2)", color: "var(--accent)", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>NEW</span>}
                                {video.title}
                              </div>
                              {video.channel && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{video.channel}</div>}
                              {!isOpen && video.summary && (
                                <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>
                                  {video.summary.slice(0, 120)}{video.summary.length > 120 ? "…" : ""}
                                </div>
                              )}
                            </div>
                            <span style={{ color: "var(--muted)", fontSize: "0.9rem", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                          </button>

                          {/* Flag as important */}
                          <button
                            onClick={() => toggleImportant(video.uid)}
                            title={isImportant ? "Remove flag" : "Flag as important"}
                            style={{
                              width: 32, height: 32, marginRight: 12, borderRadius: 6, flexShrink: 0,
                              background: isImportant ? "rgba(245,158,11,0.2)" : "transparent",
                              border: `1px solid ${isImportant ? "#f59e0b" : "var(--border)"}`,
                              cursor: "pointer", fontSize: "0.9rem",
                            }}
                                                    >⭐</button>
                          <button
                            onClick={() => {
                              const payload = video.ocEp ? {
                                id: video.ocEp.id,
                                title: video.ocEp.title,
                                url: video.ocEp.url,
                                channel: video.ocEp.channel,
                                episodeNumber: video.ocEp.episodeNumber,
                                publishedDate: video.ocEp.publishedDate,
                              } : {
                                id: video.uid,
                                title: video.title,
                                url: video.url,
                                channel: video.channel || "Unknown",
                              };
                              fetch("/api/joules-claw", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                              })
                                .then(r => r.json())
                                .then(data => {
                                  if (data.success) alert("✅ Added to Joules Claw!");
                                  else if (data.error?.includes("already")) alert("ℹ️ Already in Joules Claw");
                                });
                            }}
                            title="Copy to Joules Claw"
                            style={{
                              width: 32, height: 32, marginLeft: 12, borderRadius: 6, flexShrink: 0,
                              background: "rgba(79,195,247,0.15)",
                              border: "1px solid #4fc3f7",
                              cursor: "pointer", fontSize: "0.85rem",
                            }}
                          >⚡</button>
                        </div>

                        {isOpen && (
                          <div style={{ padding: "0 18px 20px", borderTop: "1px solid var(--border)" }}>
                            <a href={video.url} target="_blank" rel="noopener noreferrer" style={{
                              display: "inline-block", marginTop: 14, marginBottom: 16,
                              fontSize: "0.78rem", color: "var(--accent2)", textDecoration: "none",
                              background: "rgba(0,245,212,0.1)", padding: "6px 12px", borderRadius: 5,
                            }}>▶ Watch on YouTube</a>

                            {video.summary && (
                              <Section label="Summary">
                                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--text)", margin: 0 }}>{video.summary}</p>
                              </Section>
                            )}
                            {video.keyTakeaways && video.keyTakeaways.length > 0 && (
                              <Section label="🎯 Key Takeaways">
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", lineHeight: 1.8, color: "var(--text)" }}>
                                  {video.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                              </Section>
                            )}
                            {video.tools && (
                              <Section label="🛠️ Tools / Skills / Tips">
                                <div style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap" }}>{video.tools}</div>
                              </Section>
                            )}
                            {video.skills && video.skills.length > 0 && (
                              <Section label="🛠️ Skills">
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  {video.skills.map((s, i) => <span key={i} style={{ fontSize: "0.75rem", background: "rgba(155,93,229,0.15)", color: "var(--accent)", padding: "4px 10px", borderRadius: 12 }}>{s}</span>)}
                                </div>
                              </Section>
                            )}
                            {video.take && (
                              <Section label="🦞 PriScylla's Take">
                                <p style={{ fontSize: "0.85rem", lineHeight: 1.65, color: "var(--accent2)", margin: 0, fontStyle: "italic" }}>{video.take}</p>
                              </Section>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Done collapsible */}
                {done.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <button onClick={() => setDoneOpen(s => !s)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, padding: 0,
                    }}>
                      <span style={{ transform: doneOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
                      Done ({done.length})
                    </button>
                    {doneOpen && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                        {done.map(video => (
                          <div key={video.uid} style={{
                            background: "var(--bg)", border: "1px solid var(--border)",
                            borderRadius: 10, padding: "10px 18px", opacity: 0.45,
                            display: "flex", alignItems: "center", gap: 12,
                          }}>
                            <span style={{ fontSize: "1rem" }}>✅</span>
                            <div style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", textDecoration: "line-through" }}>
                              {video.title}
                            </div>
                            <button onClick={() => toggleDone(video.uid, video.ocEp?.id)} style={{
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
