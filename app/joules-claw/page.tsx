"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

interface Video {
  id: string;
  title: string;
  url: string;
  channel: string;
  addedAt: string;
  addedBy: string;
  episodeNumber?: number;
  publishedDate?: string;
}

interface Pairing {
  code: string;
  telegramId: string;
  telegramUsername?: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
}

export default function JoulesClaw() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPairing, setShowPairing] = useState(false);
  const [newPairingCode, setNewPairingCode] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load Joules Claw data
  useEffect(() => {
    fetch("/api/joules-claw")
      .then(r => r.json())
      .then(data => {
        setVideos(data.videos || []);
        setPairings(data.pairings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Add video from OpenClaw Videos tab
  const addVideo = (video: Video) => {
    fetch("/api/joules-claw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(video),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setVideos(prev => [...prev, data.video]);
          setCopiedId(video.id);
          setTimeout(() => setCopiedId(null), 2000);
        }
      });
  };

  // Remove video
  const removeVideo = (id: string) => {
    fetch("/api/joules-claw", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setVideos(prev => prev.filter(v => v.id !== id));
        }
      });
  };

  // Generate pairing code
  const generatePairingCode = () => {
    fetch("/api/joules-claw?action=create-pairing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegramId: "guest", telegramUsername: "guest" }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setNewPairingCode(data.code);
          // Refresh pairings
          fetch("/api/joules-claw")
            .then(r => r.json())
            .then(d => setPairings(d.pairings || []));
        }
      });
  };

  // Revoke pairing code
  const revokePairing = (code: string) => {
    fetch("/api/joules-claw?action=revoke-pairing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPairings(prev => prev.map(p => p.code === code ? { ...p, active: false } : p));
        }
      });
  };

  const activePairings = pairings.filter(p => p.active && new Date(p.expiresAt) > new Date());

  return (
    <div className="page-container">
      <PageHeader title="Joules Claw" subtitle="Your curated OpenClaw videos" icon="⚡" />

      {/* Videos Section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>📹 Videos ({videos.length})</h2>
          <button
            onClick={() => setShowPairing(!showPairing)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: showPairing ? "var(--accent)" : "var(--card)",
              color: showPairing ? "#000" : "var(--text)",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            {showPairing ? "Hide Sharing" : "Share Tab"}
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : videos.length === 0 ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center" }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>No videos yet. Copy from the OpenClaw Videos tab!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {videos.map(video => (
              <div
                key={video.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.9rem",
                      color: "#4fc3f7",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    {video.title}
                  </a>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
                    {video.channel} · Added {new Date(video.addedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => removeVideo(video.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 4,
                    border: "1px solid #f15bb5",
                    background: "transparent",
                    color: "#f15bb5",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sharing Section */}
      {showPairing && (
        <div style={{ marginBottom: 32, background: "var(--card)", border: "1px solid #4fc3f7", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 600, margin: "0 0 12px 0", color: "#4fc3f7" }}>📱 Share with Pairing Codes</h3>

          <button
            onClick={generatePairingCode}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #4fc3f7",
              background: "transparent",
              color: "#4fc3f7",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            + Generate New Pairing Code
          </button>

          {newPairingCode && (
            <div style={{ background: "#0a2010", border: "1px solid #2cb67d", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 8px 0" }}>Share this code:</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <code
                  style={{
                    flex: 1,
                    background: "var(--bg)",
                    padding: "8px 12px",
                    borderRadius: 4,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#2cb67d",
                    fontFamily: "monospace",
                  }}
                >
                  {newPairingCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newPairingCode);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    border: "1px solid #2cb67d",
                    background: "transparent",
                    color: "#2cb67d",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <h4 style={{ fontSize: "0.8rem", fontWeight: 600, margin: "16px 0 8px 0", color: "var(--muted)" }}>Active Pairings</h4>
          {activePairings.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>No active pairings yet</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activePairings.map(p => (
                <div
                  key={p.code}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--bg)",
                    padding: "8px 12px",
                    borderRadius: 4,
                    fontSize: "0.8rem",
                  }}
                >
                  <span style={{ color: "var(--text)" }}>{p.telegramUsername}</span>
                  <button
                    onClick={() => revokePairing(p.code)}
                    style={{
                      padding: "2px 8px",
                      borderRadius: 3,
                      border: "1px solid #f15bb5",
                      background: "transparent",
                      color: "#f15bb5",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
          ⚡ Create a curated collection from OpenClaw Videos. Share via pairing codes with other OpenClaw users on Telegram. When they enter your code, they see only this Joules Claw tab.
        </p>
      </div>
    </div>
  );
}
