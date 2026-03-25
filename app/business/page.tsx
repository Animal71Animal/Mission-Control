import Card from "@/components/Card";
import Link from "next/link";

const HOME = process.env.HOME || "/home/ubuntu";
const INTERNAL_LINKS = ["/docs/live-pa", "/docs/plugins", "/wlp"];

const docs = [
  {
    title: "Director of Entertainment Pitch Deck",
    path: "business/animal-talent-manager-pitch.html",
    link: "https://animal-talent-manager.surge.sh",
    linkLabel: "Open Live Site ↗",
    localLink: `file://${HOME}/.openclaw/workspace/business/animal-talent-manager-pitch.html`,
    desc: "Public-facing pitch deck deployed to surge.sh.",
    badge: "live",
    badgeColor: "#22c55e",
  },
  {
    title: "Morning Brief Dashboard",
    path: "business/morning-brief.html",
    link: `http://localhost:3000/morning-brief.html`,
    linkLabel: "Open Dashboard ↗",
    desc: "Daily brief — weather, news, tasks.",
    badge: "local",
    badgeColor: "#c77dff",
  },
  {
    title: "WLP Dashboard",
    path: "business/dashboard.html",
    link: `/wlp`,
    linkLabel: "Open Dashboard ↗",
    desc: "Main WLP artist & business dashboard.",
    badge: "local",
    badgeColor: "#c77dff",
  },
  {
    title: "Live PA Setup",
    path: "business/live-pa-setup.md",
    link: `/docs/live-pa`,
    linkLabel: "Open Doc ↗",
    desc: "Full live PA documentation — gear, signal chain, templates.",
    badge: "local",
    badgeColor: "#6a6a8a",
  },
  {
    title: "Plugin Install Checklist",
    path: "business/plugin-install-checklist.md",
    link: `/docs/plugins`,
    linkLabel: "Open Checklist ↗",
    desc: "Serum, Rob Papen, Splice, Loopcloud install guide.",
    badge: "local",
    badgeColor: "#6a6a8a",
  },
];

export default function BusinessPage() {
  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        💼 Business
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        WLP documents, pitch deck, and production resources
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {docs.map((d) => (
          <div
            key={d.title}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 4 }}>{d.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 6 }}>{d.desc}</div>
              <code style={{ fontSize: "0.72rem", color: "var(--muted)", background: "var(--bg)", padding: "2px 8px", borderRadius: 4 }}>
                {d.path}
              </code>
            </div>
            {INTERNAL_LINKS.includes(d.link) ? (
              <Link
                href={d.link}
                style={{
                  fontSize: "0.8rem",
                  color: d.badgeColor,
                  textDecoration: "none",
                  background: `${d.badgeColor}18`,
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: `1px solid ${d.badgeColor}40`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {d.linkLabel}
              </Link>
            ) : (
              <a
                href={d.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.8rem",
                  color: d.badgeColor,
                  textDecoration: "none",
                  background: `${d.badgeColor}18`,
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: `1px solid ${d.badgeColor}40`,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {d.linkLabel}
              </a>
            )}
          </div>
        ))}
      </div>

      <Card title="Surge Deployment">
        <div style={{ fontSize: "0.875rem", lineHeight: 2 }}>
          <div>🌐 <strong>URL:</strong>{" "}
            <a href="https://animal-talent-manager.surge.sh" target="_blank" style={{ color: "var(--accent)", textDecoration: "none" }}>
              animal-talent-manager.surge.sh ↗
            </a>
          </div>
          <div>📊 <strong>Analytics:</strong>{" "}
            <a href="https://animalpitch.goatcounter.com" target="_blank" style={{ color: "var(--accent)", textDecoration: "none" }}>
              animalpitch.goatcounter.com ↗
            </a>
          </div>
          <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: "0.8rem", color: "var(--muted)", background: "var(--bg)", padding: "8px 12px", borderRadius: 6 }}>
            surge --project ./business --domain animal-talent-manager.surge.sh
          </div>
        </div>
      </Card>
    </div>
  );
}
