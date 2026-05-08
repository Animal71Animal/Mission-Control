"use client";

import { useState } from "react";

export default function SharedDJAutomationPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const correctPassword = "wlp2026";

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

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
          🤖 DJ Automation Software
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          AI-powered DJ management system for gentlemen's clubs. One head DJ programs the system, replacing the need for multiple DJs throughout the week.
        </p>
      </div>

      {/* Document Links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        <a
          href="/wlp-product"
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
            📋 Product Brief v2
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Full product spec, features, roadmap — May 2026
          </p>
        </a>

        <a
          href="/wlp-competitive"
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
            ⚔️ Competitive Positioning
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            vs. CoverJock, BoothPoint & others
          </p>
        </a>

        <a
          href="/wlp-investor"
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
            💼 Investor Pitch
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Seed round deck — $1,500/mo pricing, no ED Expo
          </p>
        </a>

        <a
          href="/wlp-dj-roadmap"
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
            🗺️ DJ Automation Roadmap
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            May–Aug 2026 · MVP May 31 · Testing June–July · Production Launch August · $1,500/mo
          </p>
        </a>

        <a
          href="/wlp-pain-points"
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
            🔍 Manager Pain Points
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            9 pain points from 25+ club managers + how we beat them
          </p>
        </a>

        <a
          href="/wlp-interface-spec"
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
            🖥️ Interface Spec
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Manager console, dancer app, backend architecture
          </p>
        </a>

        <a
          href="/wlp-dancer-auth"
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
            🔐 Dancer Auth System
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Dancer login, My Music, manager approval workflow
          </p>
        </a>

        <a
          href="/wlp-dev-checkin"
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
            🛠️ Dev Check-In Protocol
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Daily, twice-weekly, weekly check-in structure for Eric + Micah
          </p>
        </a>

        <a
          href="/wlp-task-board"
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
            📋 Task Board Template
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            15 starter tasks with card templates for Trello/Notion
          </p>
        </a>

        <a
          href="/wlp-trello-setup"
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
            🎯 Trello Setup Guide
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Step-by-step: create board, invite Micah, add starter cards
          </p>
        </a>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--accent)", textTransform: "uppercase" }}>
          Key Features
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
              • Smart Playlist Generation
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              AI-powered track selection based on venue energy
            </p>
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
              • Tempo Matching
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              Automatic beat matching and transitions
            </p>
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
              • Energy Level Management
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              Dynamic adjustments based on crowd response
            </p>
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
              • Request Queue System
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              Dancer portal for song requests
            </p>
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
              • Tip Tracking Integration
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              Connect with venue tip data
            </p>
          </li>
        </ul>
      </div>

      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--accent)", textTransform: "uppercase" }}>
          Tech Stack
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {["VirtualDJ SDK", "Python", "React", "Node.js", "PostgreSQL"].map((tech, i) => (
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
