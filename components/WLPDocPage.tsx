"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { marked } from "marked";

export default function WLPDocPage({ 
  title, 
  subtitle, 
  fileName,
  secondaryFile,
  secondaryTitle
}: { 
  title: string; 
  subtitle: string; 
  fileName: string;
  secondaryFile?: string;
  secondaryTitle?: string;
}) {
  const [content, setContent] = useState<string>("Loading...");
  const [secondaryContent, setSecondaryContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"primary" | "secondary">("primary");

  useEffect(() => {
    fetch(`/data/business/${fileName}`)
      .then((res) => res.text())
      .then(async (text) => {
        const html = await marked(text);
        setContent(html);
      })
      .catch(() => setContent("<p>Content not available.</p>"));
  }, [fileName]);

  useEffect(() => {
    if (secondaryFile) {
      fetch(`/data/business/${secondaryFile}`)
        .then((res) => res.text())
        .then(async (text) => {
          const html = await marked(text);
          setSecondaryContent(html);
        })
        .catch(() => setSecondaryContent("<p>Content not available.</p>"));
    }
  }, [secondaryFile]);

  return (
    <div>
      <Link href="/wlp" style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        ← Back to WLP Business
      </Link>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
          {title}
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.875rem" }}>
          {subtitle}
        </p>
      </div>

      {secondaryFile && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("primary")}
            style={{
              padding: "10px 20px",
              background: activeTab === "primary" ? "var(--accent)" : "transparent",
              color: activeTab === "primary" ? "#fff" : "var(--text)",
              border: "none",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            📄 Pitch Deck
          </button>
          <button
            onClick={() => setActiveTab("secondary")}
            style={{
              padding: "10px 20px",
              background: activeTab === "secondary" ? "var(--accent)" : "transparent",
              color: activeTab === "secondary" ? "#fff" : "var(--text)",
              border: "none",
              borderRadius: "8px 8px 0 0",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🎯 Target List
          </button>
        </div>
      )}

      <div
        className="md-content"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "40px 48px",
          marginTop: 12,
          color: "var(--text)",
          lineHeight: 1.8,
          fontSize: "0.95rem",
          maxWidth: "100%",
          overflowX: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: activeTab === "primary" ? content : secondaryContent }}
      />
    </div>
  );
}
