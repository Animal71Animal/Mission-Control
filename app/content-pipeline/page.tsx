"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Types
type Artist = "kade" | "madison" | "aria" | "jusniiga" | "all";
type ContentStatus = "planned" | "filmed" | "edited" | "posted";

interface ContentItem {
  id: string;
  artist: Artist;
  title: string;
  type: string;
  platforms: string[];
  scheduledDate: string;
  status: ContentStatus;
}

interface BatchSession {
  id: string;
  artist: Artist;
  date: string;
  targetVideos: number;
  completedVideos: number;
  contentTypes: string[];
  notes: string;
}

// Sample data
const contentItems: ContentItem[] = [
  { id: "1", artist: "kade", title: "Behind-the-Song: Granddad's Farm", type: "Storytelling", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-04-06", status: "planned" },
  { id: "2", artist: "kade", title: "Truck Session Acoustic", type: "Performance", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-04-08", status: "planned" },
  { id: "3", artist: "kade", title: "Fan Duet Response", type: "Interactive", platforms: ["TikTok", "Reels"], scheduledDate: "2026-04-10", status: "planned" },
  { id: "4", artist: "madison", title: "Dance Tutorial: New Choreo", type: "Dance", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-04-07", status: "planned" },
  { id: "5", artist: "madison", title: "Studio Life: Vocal Warm-ups", type: "Behind-the-Scenes", platforms: ["TikTok", "Reels"], scheduledDate: "2026-04-09", status: "planned" },
  { id: "6", artist: "madison", title: "Outfit Transition Rehearsal", type: "Fashion", platforms: ["TikTok", "Reels"], scheduledDate: "2026-04-11", status: "planned" },
  { id: "7", artist: "aria", title: "Lyric Breakdown: Autumn Leaves", type: "Storytelling", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-04-06", status: "planned" },
  { id: "8", artist: "aria", title: "Vinyl Collection Tour", type: "Aesthetic", platforms: ["TikTok", "Reels"], scheduledDate: "2026-04-09", status: "planned" },
  { id: "9", artist: "aria", title: "3 AM Bedroom Session", type: "Performance", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-04-11", status: "planned" },
  { id: "10", artist: "jusniiga", title: "Love is Rare — Release Announcement", type: "Announcement", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-05-06", status: "planned" },
  { id: "11", artist: "jusniiga", title: "Love is Rare — Snippet Drop", type: "Performance", platforms: ["TikTok", "Reels"], scheduledDate: "2026-04-27", status: "planned" },
  { id: "12", artist: "jusniiga", title: "Behind the Track: Love is Rare", type: "Behind-the-Scenes", platforms: ["TikTok", "Reels", "Shorts"], scheduledDate: "2026-05-02", status: "planned" },
];

const batchSessions: BatchSession[] = [
  { id: "1", artist: "kade", date: "2026-04-04", targetVideos: 5, completedVideos: 0, contentTypes: ["Storytelling", "Performance", "Interactive"], notes: "Truck location, golden hour" },
  { id: "2", artist: "madison", date: "2026-04-05", targetVideos: 5, completedVideos: 0, contentTypes: ["Dance", "Behind-the-Scenes", "Fashion"], notes: "Studio booked 10am-2pm" },
  { id: "3", artist: "aria", date: "2026-04-05", targetVideos: 5, completedVideos: 0, contentTypes: ["Storytelling", "Aesthetic", "Performance"], notes: "Bedroom setup, vinyl props" },
];

// Artist config
const artistConfig: Record<Artist, { name: string; emoji: string; color: string }> = {
  kade: { name: "Kade Rivers", emoji: "🎸", color: "#e67e22" },
  madison: { name: "Madison Blair", emoji: "💃", color: "#e91e63" },
  aria: { name: "Aria Vale", emoji: "🌙", color: "#9b59b6" },
  jusniiga: { name: "JusNiiga", emoji: "🌍", color: "#10b981" },
  all: { name: "All Artists", emoji: "🎵", color: "#9b5de5" },
};

// Status config
const statusConfig: Record<ContentStatus, { label: string; color: string; bg: string }> = {
  planned: { label: "Planned", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" },
  filmed: { label: "Filmed", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.15)" },
  edited: { label: "Edited", color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)" },
  posted: { label: "Posted", color: "#4ade80", bg: "rgba(74, 222, 128, 0.15)" },
};

// Icons
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

// Repurposing checklist component
function RepurposingChecklist({ platforms }: { platforms: string[] }) {
  const checklist = [
    { platform: "TikTok", tasks: ["9:16 vertical format", "Trending audio", "3-5 hashtags", "Hook in first 3s"] },
    { platform: "Instagram Reels", tasks: ["Custom cover image", "30 hashtags", "Story share", "Longer caption"] },
    { platform: "YouTube Shorts", tasks: ["SEO-optimized title", "#Shorts hashtag", "Detailed description", "End screen link"] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {checklist.filter(c => platforms.includes(c.platform) || platforms.includes(c.platform.split(" ")[0])).map((item) => (
        <div key={item.platform} style={{ 
          padding: 12, 
          background: "var(--card)", 
          borderRadius: 8,
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 8, color: "var(--text)" }}>
            {item.platform}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {item.tasks.map((task, idx) => (
              <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--muted)", cursor: "pointer" }}>
                <input type="checkbox" style={{ cursor: "pointer" }} />
                {task}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main component
export default function ContentPipelinePage() {
  const [selectedArtist, setSelectedArtist] = useState<Artist>("all");
  const [activeTab, setActiveTab] = useState<"calendar" | "batch" | "repurposing">("calendar");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // Filter content by artist
  const filteredContent = useMemo(() => {
    if (selectedArtist === "all") return contentItems;
    return contentItems.filter(item => item.artist === selectedArtist);
  }, [selectedArtist]);

  // Group by week
  const contentByWeek = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {};
    filteredContent.forEach(item => {
      const week = getWeekStart(item.scheduledDate);
      if (!grouped[week]) grouped[week] = [];
      grouped[week].push(item);
    });
    return grouped;
  }, [filteredContent]);

  // Countdown to next post
  const nextPost = useMemo(() => {
    const upcoming = filteredContent
      .filter(item => item.status !== "posted")
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0];
    return upcoming;
  }, [filteredContent]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredContent.length;
    const filmed = filteredContent.filter(i => i.status === "filmed" || i.status === "edited" || i.status === "posted").length;
    const edited = filteredContent.filter(i => i.status === "edited" || i.status === "posted").length;
    const posted = filteredContent.filter(i => i.status === "posted").length;
    return { total, filmed, edited, posted };
  }, [filteredContent]);

  function getWeekStart(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split("T")[0];
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function getDaysUntil(dateStr: string): number {
    const target = new Date(dateStr);
    const today = new Date();
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #9b5de5, #c77dff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Content Pipeline
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          TikTok, Reels & Shorts management for WLP AI Artists
        </p>
      </div>

      {/* Artist Selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {(Object.keys(artistConfig) as Artist[]).map((artist) => (
          <button
            key={artist}
            onClick={() => setSelectedArtist(artist)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 16px",
              background: selectedArtist === artist ? artistConfig[artist].color : "var(--card)",
              color: selectedArtist === artist ? "white" : "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <span>{artistConfig[artist].emoji}</span>
            {artistConfig[artist].name}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
        gap: 12, 
        marginBottom: 24 
      }}>
        <div style={{ 
          padding: 16, 
          background: "var(--card)", 
          borderRadius: 10,
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Total Planned</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{stats.total}</div>
        </div>
        <div style={{ 
          padding: 16, 
          background: "var(--card)", 
          borderRadius: 10,
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Filmed</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#60a5fa" }}>{stats.filmed}</div>
        </div>
        <div style={{ 
          padding: 16, 
          background: "var(--card)", 
          borderRadius: 10,
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Edited</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fbbf24" }}>{stats.edited}</div>
        </div>
        <div style={{ 
          padding: 16, 
          background: "var(--card)", 
          borderRadius: 10,
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>Posted</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#4ade80" }}>{stats.posted}</div>
        </div>
      </div>

      {/* Next Post Countdown */}
      {nextPost && (
        <div style={{ 
          padding: 16, 
          background: "rgba(155, 93, 229, 0.1)", 
          borderRadius: 10,
          border: "1px solid rgba(155, 93, 229, 0.3)",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: "50%",
              background: artistConfig[nextPost.artist].color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem"
            }}>
              {artistConfig[nextPost.artist].emoji}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Next Post</div>
              <div style={{ fontWeight: 600 }}>{nextPost.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{formatDate(nextPost.scheduledDate)} · {nextPost.platforms.join(", ")}</div>
            </div>
          </div>
          <div style={{ 
            padding: "8px 16px", 
            background: "var(--card)", 
            borderRadius: 20,
            fontSize: "0.9rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
            <ClockIcon />
            {getDaysUntil(nextPost.scheduledDate) <= 0 ? "Today!" : `${getDaysUntil(nextPost.scheduledDate)} days`}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {[
          { id: "calendar", label: "📅 Content Calendar", icon: <CalendarIcon /> },
          { id: "batch", label: "🎬 Batch Sessions", icon: <VideoIcon /> },
          { id: "repurposing", label: "♻️ Repurposing", icon: <CheckIcon /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: "12px 20px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #9b5de5" : "2px solid transparent",
              color: activeTab === tab.id ? "#9b5de5" : "var(--muted)",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 20 }}>
        {activeTab === "calendar" && (
          <div>
            {/* Weekly Calendar View */}
            {Object.entries(contentByWeek).map(([weekStart, items]) => (
              <div key={weekStart} style={{ marginBottom: 24 }}>
                <h3 style={{ 
                  fontSize: "0.85rem", 
                  fontWeight: 600, 
                  color: "var(--muted)",
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Week of {formatDate(weekStart)}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: 14,
                        background: "var(--card)",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#9b5de5";
                        e.currentTarget.style.background = "rgba(155,93,229,0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = "var(--card)";
                      }}
                    >
                      <div style={{ 
                        width: 36, height: 36, borderRadius: "50%",
                        background: artistConfig[item.artist].color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem",
                        flexShrink: 0
                      }}>
                        {artistConfig[item.artist].emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                          {item.type} · {formatDate(item.scheduledDate)}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        {item.platforms.map(p => (
                          <span key={p} style={{ 
                            fontSize: "0.7rem", 
                            padding: "3px 8px",
                            background: "rgba(155,93,229,0.1)",
                            borderRadius: 4,
                            color: "#9b5de5"
                          }}>
                            {p === "TikTok" ? "TT" : p === "Instagram Reels" ? "IG" : "YT"}
                          </span>
                        ))}
                      </div>
                      <div style={{
                        padding: "4px 10px",
                        borderRadius: 12,
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        background: statusConfig[item.status].bg,
                        color: statusConfig[item.status].color,
                        flexShrink: 0
                      }}>
                        {statusConfig[item.status].label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "batch" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Upcoming Batch Sessions</h3>
              <button style={{
                padding: "8px 16px",
                background: "#9b5de5",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: "pointer"
              }}>
                + Schedule Session
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {batchSessions
                .filter(s => selectedArtist === "all" || s.artist === selectedArtist)
                .map((session) => (
                <div key={session.id} style={{
                  padding: 16,
                  background: "var(--card)",
                  borderRadius: 10,
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ 
                        width: 32, height: 32, borderRadius: "50%",
                        background: artistConfig[session.artist].color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.9rem"
                      }}>
                        {artistConfig[session.artist].emoji}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{artistConfig[session.artist].name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{formatDate(session.date)}</div>
                      </div>
                    </div>
                    <div style={{
                      padding: "4px 12px",
                      background: "rgba(155,93,229,0.1)",
                      borderRadius: 12,
                      fontSize: "0.8rem",
                      color: "#9b5de5"
                    }}>
                      {session.completedVideos}/{session.targetVideos} videos
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 6 }}>Content Types</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {session.contentTypes.map(type => (
                        <span key={type} style={{
                          fontSize: "0.75rem",
                          padding: "4px 10px",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 4,
                          border: "1px solid var(--border)"
                        }}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    📝 {session.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "repurposing" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>Repurposing Checklist</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Select a video from the calendar to view its repurposing checklist
              </p>
            </div>
            {selectedContent ? (
              <div>
                <div style={{ 
                  padding: 16, 
                  background: "var(--card)", 
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  marginBottom: 16
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: "50%",
                      background: artistConfig[selectedContent.artist].color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.9rem"
                    }}>
                      {artistConfig[selectedContent.artist].emoji}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedContent.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{selectedContent.type}</div>
                    </div>
                  </div>
                </div>
                <RepurposingChecklist platforms={selectedContent.platforms} />
              </div>
            ) : (
              <div style={{ 
                padding: 40, 
                textAlign: "center",
                background: "var(--card)",
                borderRadius: 10,
                border: "1px solid var(--border)",
                color: "var(--muted)"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>♻️</div>
                <div>Select a video from the Content Calendar to view its repurposing checklist</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)", marginBottom: 12 }}>
          Resources
        </h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/wlp/projects/ai-artists/content-pipeline/content-calendar-template.md" style={{
            padding: "10px 16px",
            background: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "0.85rem"
          }}>
            📅 Calendar Template
          </Link>
          <Link href="/wlp/projects/ai-artists/content-pipeline/batch-production-workflow.md" style={{
            padding: "10px 16px",
            background: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "0.85rem"
          }}>
            🎬 Batch Workflow
          </Link>
          <Link href="/wlp/projects/ai-artists/content-pipeline/repurposing-matrix.md" style={{
            padding: "10px 16px",
            background: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "0.85rem"
          }}>
            ♻️ Repurposing Matrix
          </Link>
          <Link href="/wlp/projects/ai-artists/content-pipeline/hashtag-research.md" style={{
            padding: "10px 16px",
            background: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "0.85rem"
          }}>
            #️⃣ Hashtag Research
          </Link>
          <Link href="/wlp/projects/ai-artists/phase2-content" style={{
            padding: "10px 16px",
            background: "var(--card)",
            borderRadius: 8,
            border: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "0.85rem"
          }}>
            📝 Ready-to-Post Scripts
          </Link>
        </div>
      </div>
    </div>
  );
}
