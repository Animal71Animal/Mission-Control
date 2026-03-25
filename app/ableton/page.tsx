"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

const ANIMAL_COLOR = "#06b6d4";
const PRISCYLLA_COLOR = "#c77dff";

// Collapsible Section Component
function CollapsibleSection({ 
  children, 
  title,
  defaultOpen = false 
}: { 
  children: React.ReactNode; 
  title: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        marginTop: 24,
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: isOpen ? 24 : "16px 24px",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "transparent",
          border: "none",
          color: "var(--muted)",
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          padding: 0,
          width: "100%",
          textAlign: "left",
        }}
      >
        <span style={{ 
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "inline-block",
          fontSize: "0.7rem",
        }}>▶</span>
        {title}
      </button>
      
      {isOpen && (
        <div style={{ marginTop: 16, animation: "fadeIn 0.2s ease" }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          {children}
        </div>
      )}
    </div>
  );
}

export default function AbletonPage() {
  const [livePaContent, setLivePaContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/live-pa-setup.md")
      .then((res) => res.text())
      .then((md) => {
        // Simple markdown to HTML conversion for basic display
        const html = md
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');
        setLivePaContent('<div class="md-content"><p>' + html + '</p></div>');
        setLoading(false);
      })
      .catch(() => {
        setLivePaContent("<p>Unable to load Live PA setup guide.</p>");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        🎛️ Ableton
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        Ableton Live 11 Standard · AbletonOSC · Live PA setup
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card title="AbletonOSC">
          <div style={{ fontSize: "0.875rem", lineHeight: 2 }}>
            <div>✅ <strong>Status:</strong> Installed &amp; active</div>
            <div>📡 <strong>Listen port:</strong> 11000</div>
            <div>📡 <strong>Response port:</strong> 11001</div>
            <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)", fontFamily: "monospace" }}>
              ~/Music/Ableton/User Library/Remote Scripts/AbletonOSC/
            </div>
          </div>
        </Card>

        <Card title="MIDI Controllers">
          <div style={{ fontSize: "0.875rem", lineHeight: 2 }}>
            <div>🎹 <strong>Push 2:</strong> Control Surface slot 2, Live Port</div>
            <div>🎹 <strong>MPK49:</strong> Track input ON</div>
            <div>🎚️ <strong>MIDImix:</strong> Remote ON (in + out)</div>
            <div>🎧 <strong>MCX8000:</strong> DJ controller (standalone)</div>
          </div>
        </Card>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 12, fontSize: "0.78rem" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: ANIMAL_COLOR, display: "inline-block" }} />
          Your task
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: PRISCYLLA_COLOR, display: "inline-block" }} />
          PriScylla handles it
        </span>
      </div>

      <Card title="Setup Checklist">
        <div style={{ fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { done: true, owner: "priscylla", task: "AbletonOSC installed (full GitHub structure)" },
            { done: false, owner: "animal", task: "Push 2 set as Control Surface in Ableton Preferences → Link/MIDI" },
            { done: false, owner: "animal", task: "MPK49 Track input enabled" },
            { done: false, owner: "animal", task: "MIDImix Remote enabled (in + out)" },
            { done: false, owner: "animal", task: "Install Serum, Rob Papen, Splice, Loopcloud" },
            { done: false, owner: "animal", task: "Rescan plugins in Ableton after install" },
            { done: false, owner: "priscylla", task: "Build live PA template via AbletonOSC (pending MIDI setup)" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                background: item.done ? "#22c55e" : item.owner === "animal" ? ANIMAL_COLOR : PRISCYLLA_COLOR,
                opacity: item.done ? 0.5 : 1,
              }} />
              <span style={{ color: item.done ? "var(--muted)" : "var(--text)", textDecoration: item.done ? "line-through" : "none" }}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Live PA Setup — Collapsible */}
      <CollapsibleSection title="📄 Live PA Setup Guide" defaultOpen={false}>
        {loading ? (
          <p style={{ color: "var(--muted)" }}>Loading...</p>
        ) : (
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: livePaContent }}
            style={{ color: "var(--text)", lineHeight: 1.7, fontSize: "0.9rem" }}
          />
        )}
      </CollapsibleSection>
    </div>
  );
}
