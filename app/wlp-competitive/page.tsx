import fs from "fs";
import { marked } from "marked";
import Link from "next/link";

export default function Page() {
  const md = fs.readFileSync("/home/ubuntu/business/dj-software/COMPETITIVE-POSITIONING.md", "utf8");
  const html = marked(md) as string;
  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/wlp" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>← Back to WLP Business</Link>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: 12, color: "var(--text)" }}>⚔️ Competitive Positioning</h1>
      </div>
      <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} style={{ color: "var(--text)", lineHeight: 1.7, fontSize: "0.95rem" }} />
    </div>
  );
}
