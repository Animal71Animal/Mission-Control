"use client";

import Card from "@/components/Card";

export default function SharedLinksPage() {
  const sharedLinks = [
    {
      id: "dj-automation-full",
      name: "DJ Automation — Full Card",
      url: "/shared/dj-automation",
      password: "wlp2025",
      created: "2026-05-05",
      description: "Complete DJ Automation product overview with ROI calculator, docs, features, and tech stack. Interactive savings estimator.",
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
          🔗 Shared Links
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0 }}>
          Password-protected resources shared with partners, developers, and investors.
        </p>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        {sharedLinks.map((link) => (
          <Card key={link.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", color: "var(--accent2)" }}>
                  {link.name}
                </h3>
                <p style={{ margin: "0 0 12px", color: "var(--muted)", fontSize: "0.875rem" }}>
                  {link.description}
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--muted)" }}>
                    Created: <strong style={{ color: "var(--text)" }}>{link.created}</strong>
                  </span>
                  <span style={{ color: "var(--muted)" }}>
                    Password: <code style={{ background: "rgba(155,93,229,0.15)", padding: "2px 6px", borderRadius: 4, color: "var(--accent2)" }}>{link.password}</code>
                  </span>
                </div>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Open Site →
              </a>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <code
                style={{
                  display: "block",
                  background: "rgba(0,0,0,0.3)",
                  padding: "12px 16px",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  wordBreak: "break-all",
                }}
              >
                {link.url}
              </code>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ marginTop: 24 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "var(--text)" }}>How to Access</h4>
        <ol style={{ margin: 0, paddingLeft: 20, color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7 }}>
          <li>Click the link above</li>
          <li>Enter the password when prompted</li>
          <li>View and interact with the complete product overview</li>
          <li>Use the ROI calculator to estimate annual savings for your venue</li>
        </ol>
      </Card>
    </div>
  );
}
