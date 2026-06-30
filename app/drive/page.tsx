"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string | null;
  webViewLink: string | null;
  shared: boolean;
  owner: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DrivePage() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchFolders = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch("/api/drive", { cache: "no-store" });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setFolders([]);
      } else {
        const folderList: DriveFolder[] = (data.files || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          modifiedTime: f.modifiedTime || null,
          webViewLink: f.webViewLink || `https://drive.google.com/drive/folders/${f.id}`,
          shared: !!f.shared,
          owner: f.owner || "Unknown",
        }));
        setFolders(folderList);
        setLastFetched(new Date());
      }
    } catch (err) {
      setError("Failed to fetch Drive folders");
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
          📁 Google Drive
        </h1>
        <button
          onClick={fetchFolders}
          disabled={loading}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: "0.8rem",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        Live folder list from your Google Drive root
        {lastFetched && !loading && (
          <span style={{ marginLeft: 12, opacity: 0.7 }}>
            · {folders.length} folder{folders.length === 1 ? "" : "s"}
            {" · updated "}{lastFetched.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
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
            Requires Google API service account. Check GOOGLE_SERVICE_ACCOUNT_JSON env var on Vercel.
          </div>
        </div>
      )}

      <Card title={`Root Folders (${folders.length})`}>
        {loading && folders.length === 0 ? (
          <div style={{ color: "var(--muted)", padding: "20px" }}>Loading folders...</div>
        ) : folders.length === 0 ? (
          <div style={{ color: "var(--muted)", padding: "20px" }}>
            No folders found in Drive root. The service account may need access — share your Drive root with the service account email.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {folders.map((f) => (
              <a
                key={f.id}
                href={f.webViewLink || "#"}
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {f.name}
                    </div>
                    <div style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      marginTop: 4,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}>
                      <span>🕒 {formatDate(f.modifiedTime)}</span>
                      <span>👤 {f.owner}</span>
                      {f.shared && <span style={{ color: "#9b5de5" }}>🔗 shared</span>}
                    </div>
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