"use client";

import { useState, useEffect } from "react";

interface Feature {
  title: string;
  desc: string;
}

interface DocLink {
  name: string;
  desc: string;
  href: string;
}

interface DJAutomationData {
  title: string;
  description: string;
  docs: DocLink[];
  features: Feature[];
  techStack: string[];
}

export default function SharedDJAutomationPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<DJAutomationData | null>(null);
  const [loading, setLoading] = useState(false);
  const correctPassword = "wlp2025";

  useEffect(() => {
    if (unlocked && !data) {
      setLoading(true);
      fetch("/api/dj-automation-card")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load DJ Automation data:", err);
          setLoading(false);
        });
    }
  }, [unlocked, data]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setUnlocked(true);
    } else {
      alert("Incorrect password");
      setPassword("");
    }
  };

  if (!unlocked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ maxWidth: "400px", width: "100%", padding: "20px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)", textAlign: "center" }}>
            🤖 DJ Automation Software
          </h1>
          <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: "32px" }}>
            Enter password to view
          </p>

          <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "var(--muted)" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
          🤖 {data.title}
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          {data.description}
        </p>
      </div>

      {/* Doc Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {data.docs.map((doc, i) => (
          <a
            key={i}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "20px",
              background: "var(--card)",
              border: "2px solid var(--accent)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.color = "var(--bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card)";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px", color: "inherit" }}>
              {doc.name}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              {doc.desc}
            </p>
          </a>
        ))}
      </div>

      {/* Key Features */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
          KEY FEATURES
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {data.features.map((feature, i) => (
            <li key={i} style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
                • {feature.title}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                {feature.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
          TECH STACK
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {data.techStack.map((tech, i) => (
            <span
              key={i}
              style={{
                padding: "8px 16px",
                background: "var(--accent)",
                color: "var(--bg)",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
