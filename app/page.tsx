"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import ModuleCard from "@/components/ModuleCard";
import { PersonalTasksCard } from "@/components/PersonalTasksCard";
import { modules, shortcuts, groupLabels, groupOrder } from "./data/modules";
import type { ModuleGroup } from "./data/modules";

// Search icon component
function SearchIcon() {
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
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

// Clock icon for recently used
function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

interface RecentItem {
  href: string;
  title: string;
  icon: string;
  timestamp: number;
}

export default function Home() {
  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  // Load recently used from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recently-used");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentItems(parsed);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.desc.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group filtered modules
  const groupedModules = useMemo(() => {
    return groupOrder.reduce((acc, group) => {
      acc[group] = filteredModules.filter((m) => m.group === group);
      return acc;
    }, {} as Record<ModuleGroup, typeof modules>);
  }, [filteredModules]);

  // Track page visits for recently used
  const trackVisit = (href: string, title: string, icon: string) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((item) => item.href !== href);
      const newItem: RecentItem = {
        href,
        title,
        icon,
        timestamp: Date.now(),
      };
      const updated = [newItem, ...filtered].slice(0, 5);
      localStorage.setItem("recently-used", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #9b5de5, #c77dff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Mission Control
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          {now} · All systems up
        </p>
      </div>

      {/* Search Box */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            position: "relative",
            maxWidth: 480,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              pointerEvents: "none",
            }}
          >
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Jump to..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              fontSize: "0.95rem",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--text)",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#9b5de5";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(155,93,229,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Recently Used Section */}
      {recentItems.length > 0 && !searchQuery && (
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--muted)",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ClockIcon />
            Recently Used
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {recentItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => trackVisit(item.href, item.title, item.icon)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--text)",
                  fontSize: "0.85rem",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#9b5de5";
                  e.currentTarget.style.background = "rgba(155,93,229,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--card)";
                }}
              >
                <span>{item.icon}</span>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Shortcuts + Personal Tasks */}
      {!searchQuery && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
          {shortcuts.map((shortcut) => (
            <Link key={shortcut.href + shortcut.label} href={shortcut.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#9b5de5";
                  (e.currentTarget as HTMLDivElement).style.color = "#9b5de5";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.color = "var(--text)";
                }}
              >
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                  {shortcut.label}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
                  {shortcut.desc}
                </p>
              </div>
            </Link>
          ))}
          <PersonalTasksCard />
        </div>
      )}

      {/* Grouped Module Cards */}
      {searchQuery ? (
        // Search results - flat grid
        <div>
          <h2
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--muted)",
              marginBottom: 12,
            }}
          >
            Search Results ({filteredModules.length})
          </h2>
          {filteredModules.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {filteredModules.map((m) => (
                <div key={m.href} onClick={() => trackVisit(m.href, m.title, m.icon)}>
                  <ModuleCard {...m} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              No modules found matching &quot;{searchQuery}&quot;
            </p>
          )}
        </div>
      ) : (
        // Grouped view
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {groupOrder.map((group) => {
            const groupModules = groupedModules[group];
            if (groupModules.length === 0) return null;

            return (
              <div key={group}>
                <h2
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--muted)",
                    marginBottom: 12,
                  }}
                >
                  {groupLabels[group]}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                  {groupModules.map((m) => (
                    <div key={m.href} onClick={() => trackVisit(m.href, m.title, m.icon)}>
                      <ModuleCard {...m} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
