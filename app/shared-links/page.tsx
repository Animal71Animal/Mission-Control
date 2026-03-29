"use client";

import PageHeader from "@/components/PageHeader";
import Card from "@/components/Card";
import { sharedLinks } from "@/app/data/modules";

export default function SharedLinksPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <PageHeader
        icon="🔗"
        title="Shared Links"
        subtitle="Password-protected resources shared with partners, developers, and investors."
      />

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

        {sharedLinks.length === 0 && (
          <Card>
            <p style={{ color: "var(--muted)", textAlign: "center", padding: "40px 20px" }}>
              No shared links yet. Create password-protected mini-sites to share with partners and they'll appear here.
            </p>
          </Card>
        )}
      </div>

      <Card style={{ marginTop: 24 }}>
        <h4 style={{ margin: "0 0 12px", fontSize: "0.9rem", color: "var(--text)" }}>How to Add New Shared Links</h4>
        <ol style={{ margin: 0, paddingLeft: 20, color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7 }}>
          <li>Ask PriScylla to create a password-protected mini-site for the content you want to share</li>
          <li>Provide the target audience (partner, developer, investor, etc.)</li>
          <li>Specify if you want view-only or interactive access</li>
          <li>The link will be added here automatically with its password</li>
        </ol>
      </Card>
    </div>
  );
}
