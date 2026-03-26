"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface DriveFolder {
  id: string;
  name: string;
  desc: string;
}

export default function DrivePage() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      setError(null);
      const res = await fetch("/api/drive");
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setFolders([]);
      } else {
        setFolders(data.folders || []);
      }
    } catch (err) {
      setError("Failed to fetch Drive folders");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        📁 Google Drive
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        Live folder list from your Google Drive
      </p>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: "rgba(224,92,92,0.1)",
          border: "1px solid rgba(224,92,92,0.3)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 20,
          color: "#e05c5c",
          fontSize: "0.85rem",
        }}>
          ⚠️ {error}
          <div style={{ marginTop: 8, fontSize: "0.8rem" }}>
            Requires Google API key. Add GOOGLE_API_KEY to your environment variables.
          </div>
        </div>
      )}

      <Card title="Root Folders">
        {loading ? (
          <div style={{ color: "var(--muted)", padding: "20px" }}>Loading folders...</div>
        ) : folders.length === 0 ? (
          <div style={{ color: "var(--muted)", padding: "20px" }}>No folders found</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {folders.map((f) => (
              <a
                key={f.id}
                href={`https://drive.google.com/drive/folders/${f.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#9b5de5";
                    e.currentTarget.style.color = "#9b5de5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                >
                  <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>📁</span>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text)" }}>{f.name}</div>
                    {f.desc && <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>{f.desc}</div>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
