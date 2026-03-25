"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { marked } from "marked";

export default function WLPDocPage({ 
  title, 
  subtitle, 
  fileName 
}: { 
  title: string; 
  subtitle: string; 
  fileName: string;
}) {
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

      <div
        className="md-content"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "32px 36px",
          marginTop: 12,
          color: "var(--text)",
          lineHeight: 1.7,
          fontSize: "0.95rem",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
