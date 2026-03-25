"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { label: "Overview", href: "/", icon: "⚡" },
  { label: "Morning Brief", href: "/brief", icon: "☀️" },
  { label: "WLP Business", href: "/wlp", icon: "💼" },
  { label: "Artists", href: "/artists", icon: "🎤" },
  { label: "Open Tasks", href: "/tasks", icon: "✅" },
  { label: "Calendar", href: "/calendar", icon: "📅" },
  { label: "Google Drive", href: "/drive", icon: "📁" },
  { label: "Ableton", href: "/ableton", icon: "🎛️" },
  { label: "Analytics", href: "/analytics", icon: "📊" },
  { label: "AI Office", href: "/agents", icon: "🤖" },
  { label: "SRB Tips", href: "/srb-tips", icon: "💰" },
  { label: "Tesla", href: "/tesla", icon: "🚗" },
  { label: "YT Summaries", href: "/playlist-report", icon: "🎬" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 100,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          color: "var(--text)",
          fontSize: "1.2rem",
          cursor: "pointer",
          display: "none",
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: "220px",
          minHeight: "100vh",
          background: "var(--card)",
          borderRight: "1px solid var(--border)",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 50,
          transition: "transform 0.3s ease",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #9b5de5, #c77dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Mission Control
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 3 }}>
            WLP · ANIMAL
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 20px",
                  fontSize: "0.875rem",
                  color: active ? "var(--accent2)" : "var(--text)",
                  background: active ? "rgba(155,93,229,0.12)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", fontSize: "0.7rem", color: "var(--muted)" }}>
          PriScylla 🦞 online
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
            display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          .mobile-overlay {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .sidebar {
            position: relative !important;
          }
        }
      `}</style>
    </>
  );
}
