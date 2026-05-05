"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

export default function SharedDocView({ fileName, title, subtitle }: { fileName: string; title: string; subtitle: string }) {
  const [content, setContent] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`/data/business/${fileName}`)
      .then((res) => res.text())
      .then(async (text) => {
        const html = await marked(text);
        setContent(html);
      })
      .catch(() => setContent("<p>Content not available.</p>"));
  }, [fileName]);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
          {title}
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.95rem" }}>
          {subtitle}
        </p>
      </div>

      <div
        className="md-content"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "40px 48px",
          color: "var(--text)",
          lineHeight: 1.8,
          fontSize: "0.95rem",
          maxWidth: "100%",
          overflowX: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
