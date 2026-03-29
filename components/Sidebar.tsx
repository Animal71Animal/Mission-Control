"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { modules, groupLabels, groupOrder } from "../app/data/modules";
import type { ModuleGroup } from "../app/data/modules";

// Chevron icon component
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// Group modules by their group field
const groupedModules = groupOrder.reduce((acc, group) => {
  acc[group] = modules.filter((m) => m.group === group);
  return acc;
}, {} as Record<ModuleGroup, typeof modules>);

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<ModuleGroup, boolean>>({
    operations: true,
    systems: true,
    external: true,
  });

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-groups");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setExpandedGroups((prev) => ({ ...prev, ...parsed }));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-groups", JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (group: ModuleGroup) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const isOverviewActive = pathname === "/";

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
        <nav style={{ flex: 1, padding: "16px 0", overflowY: "auto" }}>
          {/* Overview - always visible */}
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 20px",
              fontSize: "0.875rem",
              color: isOverviewActive ? "var(--accent2)" : "var(--text)",
              background: isOverviewActive ? "rgba(155,93,229,0.12)" : "transparent",
              borderLeft: isOverviewActive ? "2px solid var(--accent)" : "2px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: "1rem" }}>⚡</span>
            Overview
          </Link>

          {/* Grouped sections */}
          {groupOrder.map((group) => (
            <div key={group} style={{ marginTop: 16 }}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "6px 20px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{groupLabels[group]}</span>
                <ChevronIcon expanded={expandedGroups[group]} />
              </button>

              {/* Group items */}
              <div
                style={{
                  maxHeight: expandedGroups[group] ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.25s ease, opacity 0.2s ease",
                  opacity: expandedGroups[group] ? 1 : 0,
                }}
              >
                {groupedModules[group].map((item) => {
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
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
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
