"use client";

import { useEffect, useState } from "react";
import MarkdownPage from "@/components/MarkdownPage";

export default function LivePAPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/live-pa-setup.md")
      .then((res) => res.text())
      .then((md) => {
        setContent(md);
        setLoading(false);
      })
      .catch(() => {
        setContent("Unable to load Live PA setup guide.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
          🎹 Live PA Setup
        </h1>
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  // Write content to a temporary file path for MarkdownPage to read
  // Since this is client-side fetched, we need a different approach
  return (
    <ClientMarkdownPage
      content={content}
      backHref="/ableton"
      backLabel="Back to Ableton"
      title="🎹 Live PA Setup"
      subtitle="Professional live performance rig documentation"
    />
  );
}

// Client-side markdown renderer for fetched content
function ClientMarkdownPage({ content, backHref, backLabel, title, subtitle }: {
  content: string;
  backHref: string;
  backLabel: string;
  title: string;
  subtitle: string;
}) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    // Simple markdown to HTML conversion
    const converted = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    setHtml('<div class="md-content"><p>' + converted + '</p></div>');
  }, [content]);

  return (
    <div>
      <a href={backHref} style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>
        ← {backLabel}
      </a>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
          {title}
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.875rem" }}>{subtitle}</p>
      </div>

      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "32px 36px",
          marginTop: 12,
        }}
      >
        <style>{`
          .md-content h1 { font-size: 1.6rem; font-weight: 700; color: #e8e8e8; margin: 0 0 16px; }
          .md-content h2 { font-size: 1.1rem; font-weight: 600; color: #c77dff; margin: 28px 0 10px; border-bottom: 1px solid #1e1e2e; padding-bottom: 6px; }
          .md-content h3 { font-size: 0.95rem; font-weight: 600; color: #e8e8e8; margin: 20px 0 8px; }
          .md-content p { font-size: 0.875rem; color: #b0b0c8; line-height: 1.7; margin: 0 0 12px; }
          .md-content ul, .md-content ol { font-size: 0.875rem; color: #b0b0c8; line-height: 1.8; margin: 0 0 12px; padding-left: 20px; }
          .md-content li { margin-bottom: 3px; }
          .md-content strong { color: #e8e8e8; }
          .md-content code { font-family: monospace; font-size: 0.8rem; background: #0d0d1a; color: #c77dff; padding: 2px 6px; border-radius: 4px; }
          .md-content pre { background: #0d0d1a; border: 1px solid #1e1e2e; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0; }
          .md-content pre code { background: none; padding: 0; }
          .md-content table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 12px 0; }
          .md-content th { background: #0d0d1a; color: #c77dff; padding: 8px 12px; text-align: left; border: 1px solid #1e1e2e; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
          .md-content td { padding: 8px 12px; border: 1px solid #1e1e2e; color: #b0b0c8; }
          .md-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
          .md-content hr { border: none; border-top: 1px solid #1e1e2e; margin: 24px 0; }
          .md-content blockquote { border-left: 3px solid #9b5de5; padding-left: 12px; margin: 12px 0; color: #6a6a8a; }
        `}</style>
        <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
