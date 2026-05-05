"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

export default function SharedDocView({ fileName, title, subtitle }: { fileName: string; title: string; subtitle?: string }) {
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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.9rem" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        className="md-content mobile-doc"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "24px 20px",
          color: "var(--text)",
          lineHeight: 1.7,
          fontSize: "1rem",
          maxWidth: "100%",
          overflowX: "auto",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <style jsx global>{`
        @media (max-width: 640px) {
          .mobile-doc h1 { font-size: 1.4rem !important; margin: 1.5rem 0 0.75rem !important; }
          .mobile-doc h2 { font-size: 1.2rem !important; margin: 1.25rem 0 0.5rem !important; }
          .mobile-doc h3 { font-size: 1.05rem !important; margin: 1rem 0 0.5rem !important; }
          .mobile-doc h4 { font-size: 0.95rem !important; margin: 0.75rem 0 0.5rem !important; }
          .mobile-doc p { font-size: 0.95rem !important; line-height: 1.6 !important; margin: 0.5rem 0 !important; }
          .mobile-doc li { font-size: 0.9rem !important; line-height: 1.5 !important; margin: 0.25rem 0 !important; }
          .mobile-doc table { font-size: 0.8rem !important; }
          .mobile-doc th, .mobile-doc td { padding: 6px 8px !important; }
          .mobile-doc pre { font-size: 0.8rem !important; padding: 12px !important; overflow-x: auto !important; }
          .mobile-doc code { font-size: 0.85rem !important; }
          .mobile-doc blockquote { padding-left: 12px !important; margin: 0.5rem 0 !important; }
        }
      `}</style>
    </div>
  );
}
