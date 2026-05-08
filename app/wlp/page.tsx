"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const dotColors: Record<string, string> = {
  purple: "#7f5af0",
  green: "#2cb67d",
  red: "#ff6b6b",
  yellow: "#ffd166",
  blue: "#4fc3f7",
  orange: "#ff9800",
  pink: "#f06292",
  teal: "#26c6da",
  white: "#e0e0e0",
};

function Dot({ color }: { color: keyof typeof dotColors }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: dotColors[color] ?? "#888",
        flexShrink: 0,
      }}
    />
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{icon}</span>
      <h2
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "var(--muted)",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

interface LinkItem {
  label: string;
  href: string;
  dot: keyof typeof dotColors;
}

function LinkList({ items }: { items: (LinkItem | { separator: string })[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => {
        if ("separator" in item) {
          return (
            <li
              key={i}
              style={{
                fontSize: "0.7rem",
                color: "#888",
                padding: "6px 0 2px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {item.separator}
            </li>
          );
        }
        return (
          <li key={i}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "var(--text)",
                fontSize: "0.9rem",
                padding: "8px 10px",
                borderRadius: 8,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #9b5de5";
                (e.currentTarget as HTMLAnchorElement).style.color = "#9b5de5";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.border = "none";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
              }}
            >
              <Dot color={item.dot} />
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

interface DocItem {
  emoji: string;
  name: string;
  desc: string;
  href?: string;
  localOnly?: boolean;
}

function DocGrid({ items }: { items: DocItem[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 8,
      }}
    >
      {items.map((d, i) => {
        const inner = (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "var(--text)",
              fontSize: "0.88rem",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface, #12121a)",
              transition: "background 0.15s, border-color 0.15s",
              cursor: d.localOnly ? "default" : "pointer",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{d.emoji}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontWeight: 600, color: "#fff" }}>{d.name}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{d.desc}</span>
              {d.localOnly && (
                <span style={{ fontSize: "0.68rem", color: "#555", marginTop: 2 }}>(local file)</span>
              )}
            </div>
          </div>
        );

        if (d.href && !d.localOnly) {
          const isExternal = d.href.startsWith("http");
          if (isExternal) {
            return (
              <a
                key={i}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
                onMouseOver={(e) => {
                  const el = e.currentTarget.firstChild as HTMLElement;
                  el.style.borderColor = "#9b5de5";
                  el.style.color = "#9b5de5";
                }}
                onMouseOut={(e) => {
                  const el = e.currentTarget.firstChild as HTMLElement;
                  el.style.borderColor = "var(--border)";
                  el.style.color = "var(--text)";
                }}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link
              key={i}
              href={d.href}
              style={{ textDecoration: "none" }}
              onMouseOver={(e) => {
                const el = e.currentTarget.firstChild as HTMLElement;
                el.style.borderColor = "#9b5de5";
                el.style.color = "#9b5de5";
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget.firstChild as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--text)";
              }}
            >
              {inner}
            </Link>
          );
        }

        return <div key={i}>{inner}</div>;
      })}
    </div>
  );
}

// All tools from the 6 cards - for the popup
const allTools: LinkItem[] = [
  { label: "Adobe Firefly", href: "https://firefly.adobe.com", dot: "red" },
  { label: "Apple Music Connect", href: "https://music.apple.com", dot: "red" },
  { label: "Artlist", href: "https://artlist.io", dot: "green" },
  { label: "ASCAP", href: "https://www.ascap.com", dot: "red" },
  { label: "Beatport", href: "https://www.beatport.com", dot: "blue" },
  { label: "BMI", href: "https://www.bmi.com", dot: "orange" },
  { label: "BPM Supreme", href: "https://www.bpmsupreme.com", dot: "green" },
  { label: "CapCut AI", href: "https://www.capcut.com", dot: "blue" },
  { label: "Chartmetric", href: "https://app.chartmetric.com", dot: "purple" },
  { label: "Dancing Astronaut", href: "https://www.dancincastronaut.com", dot: "purple" },
  { label: "Descript", href: "https://www.descript.com", dot: "orange" },
  { label: "DistroKid", href: "https://www.distrokid.com", dot: "purple" },
  { label: "DJ Mag", href: "https://www.djmag.com", dot: "red" },
  { label: "ElevenLabs", href: "https://elevenlabs.io", dot: "yellow" },
  { label: "Facebook", href: "https://facebook.com", dot: "blue" },
  { label: "Fal.ai Flux Pro", href: "https://fal.ai/models/fal-ai/flux-pro", dot: "orange" },
  { label: "Google Analytics", href: "https://analytics.google.com", dot: "yellow" },
  { label: "Ideogram", href: "https://ideogram.ai", dot: "blue" },
  { label: "Instagram", href: "https://instagram.com", dot: "pink" },
  { label: "Kling AI", href: "https://klingai.com", dot: "teal" },
  { label: "Lalal.ai", href: "https://www.lalal.ai", dot: "teal" },
  { label: "LANDR", href: "https://www.landr.com", dot: "purple" },
  { label: "LinkedIn", href: "https://www.linkedin.com", dot: "blue" },
  { label: "Luma Dream Machine", href: "https://lumalabs.ai/dream-machine", dot: "purple" },
  { label: "Luminate / SoundScan", href: "https://www.soundscan.com", dot: "orange" },
  { label: "Magnetic Magazine", href: "https://www.magneticmag.com", dot: "blue" },
  { label: "Midjourney", href: "https://www.midjourney.com", dot: "purple" },
  { label: "Mixcloud", href: "https://mixcloud.com", dot: "purple" },
  { label: "Musicbed", href: "https://www.musicbed.com", dot: "purple" },
  { label: "Pika 2.0", href: "https://pika.art", dot: "yellow" },
  { label: "Pond5", href: "https://www.pond5.com", dot: "blue" },
  { label: "Resident Advisor", href: "https://www.residentadvisor.net", dot: "white" },
  { label: "Runway ML", href: "https://runwayml.com", dot: "red" },
  { label: "Sora", href: "https://sora.com", dot: "green" },
  { label: "Soundcharts", href: "https://soundcharts.com", dot: "green" },
  { label: "SoundCloud", href: "https://soundcloud.com", dot: "orange" },
  { label: "Spotify Artist Page", href: "https://open.spotify.com/artist/", dot: "green" },
  { label: "Spotify for Artists", href: "https://artists.spotify.com", dot: "green" },
  { label: "Splice", href: "https://splice.com", dot: "green" },
  { label: "Suno", href: "https://suno.com", dot: "green" },
  { label: "TAXI", href: "https://www.taxi.com", dot: "yellow" },
  { label: "TikTok", href: "https://tiktok.com", dot: "white" },
  { label: "Tune Registry", href: "https://www.tuneregistry.com", dot: "blue" },
  { label: "Twitter / X", href: "https://twitter.com", dot: "blue" },
  { label: "Udio", href: "https://www.udio.com", dot: "blue" },
  { label: "YouTube Studio", href: "https://studio.youtube.com", dot: "red" },
  { label: "Your EDM", href: "https://youredm.com", dot: "orange" },
];

const streamingLinks: LinkItem[] = [
  { label: "Spotify for Artists", href: "https://artists.spotify.com", dot: "green" },
  { label: "Apple Music Connect", href: "https://music.apple.com", dot: "red" },
  { label: "Beatport", href: "https://www.beatport.com", dot: "blue" },
  { label: "SoundCloud", href: "https://soundcloud.com", dot: "orange" },
  { label: "DistroKid", href: "https://www.distrokid.com", dot: "purple" },
  { label: "YouTube Studio", href: "https://studio.youtube.com", dot: "red" },
];

const socialLinks: LinkItem[] = [
  { label: "Instagram", href: "https://instagram.com", dot: "pink" },
  { label: "TikTok", href: "https://tiktok.com", dot: "white" },
  { label: "X / Twitter", href: "https://twitter.com", dot: "blue" },
  { label: "Facebook", href: "https://facebook.com", dot: "blue" },
  { label: "Mixcloud", href: "https://mixcloud.com", dot: "purple" },
  { label: "LinkedIn", href: "https://www.linkedin.com", dot: "blue" },
];

const analyticsLinks: LinkItem[] = [
  { label: "Chartmetric", href: "https://app.chartmetric.com", dot: "purple" },
  { label: "Soundcharts", href: "https://soundcharts.com", dot: "green" },
  { label: "Spotify Artist Page", href: "https://open.spotify.com/artist/", dot: "green" },
  { label: "Google Analytics", href: "https://analytics.google.com", dot: "yellow" },
  { label: "Tune Registry", href: "https://www.tuneregistry.com", dot: "blue" },
  { label: "Luminate / SoundScan", href: "https://www.soundscan.com", dot: "orange" },
];

const aiToolLinks: (LinkItem | { separator: string })[] = [
  { separator: "🎵 Music Generation" },
  { label: "Suno (Full Song AI)", href: "https://suno.com", dot: "green" },
  { label: "Udio (EDM / Electronic)", href: "https://www.udio.com", dot: "blue" },
  { separator: "✂️ Stems & Audio" },
  { label: "Lalal.ai (Stem Separation)", href: "https://www.lalal.ai", dot: "teal" },
  { label: "Splice (Samples / Layer)", href: "https://splice.com", dot: "green" },
  { label: "LANDR (Mastering)", href: "https://www.landr.com", dot: "purple" },
  { label: "ElevenLabs (TTS / Voice)", href: "https://elevenlabs.io", dot: "yellow" },
  { separator: "🖼️ Image Generation" },
  { label: "Midjourney (Artwork)", href: "https://www.midjourney.com", dot: "purple" },
  { label: "Flux Pro (Photorealistic)", href: "https://fal.ai/models/fal-ai/flux-pro", dot: "orange" },
  { label: "Ideogram (Posters / Text)", href: "https://ideogram.ai", dot: "blue" },
  { label: "Adobe Firefly (Brand-Safe)", href: "https://firefly.adobe.com", dot: "red" },
  { separator: "🎬 Video Generation" },
  { label: "Sora (Cinematic Video)", href: "https://sora.com", dot: "green" },
  { label: "Kling AI (Realistic Motion)", href: "https://klingai.com", dot: "teal" },
  { label: "Runway ML (Creative Clips)", href: "https://runwayml.com", dot: "red" },
  { label: "Pika 2.0 (Quick Clips)", href: "https://pika.art", dot: "yellow" },
  { label: "Luma Dream Machine (Img→Vid)", href: "https://lumalabs.ai/dream-machine", dot: "purple" },
  { separator: "✂️ Video Editing" },
  { label: "CapCut AI (Reels / TikTok)", href: "https://www.capcut.com", dot: "blue" },
  { label: "Descript (Edit by Script)", href: "https://www.descript.com", dot: "orange" },
];

const industryLinks: LinkItem[] = [
  { label: "Dancing Astronaut", href: "https://www.dancincastronaut.com", dot: "purple" },
  { label: "Magnetic Magazine", href: "https://www.magneticmag.com", dot: "blue" },
  { label: "Your EDM", href: "https://youredm.com", dot: "orange" },
  { label: "DJ Mag", href: "https://www.djmag.com", dot: "red" },
  { label: "Resident Advisor", href: "https://www.residentadvisor.net", dot: "white" },
  { label: "BPM Supreme (Promo)", href: "https://www.bpmsupreme.com", dot: "green" },
];

const syncLinks: LinkItem[] = [
  { label: "Musicbed", href: "https://www.musicbed.com", dot: "purple" },
  { label: "TAXI", href: "https://www.taxi.com", dot: "yellow" },
  { label: "Pond5", href: "https://www.pond5.com", dot: "blue" },
  { label: "Artlist", href: "https://artlist.io", dot: "green" },
  { label: "ASCAP", href: "https://www.ascap.com", dot: "red" },
  { label: "BMI", href: "https://www.bmi.com", dot: "orange" },
];

const businessDocs: DocItem[] = [
  { emoji: "🎭", name: "DOE Pitch Deck", desc: "Director of Entertainment — live pitch site", href: "https://my-nvj2gsssh-ericmills71-8100s-projects.vercel.app" },
  { emoji: "🏗️", name: "Org Structure", desc: "Entity, divisions, AI roster, decision flow", href: "/wlp-org" },
  { emoji: "💰", name: "Revenue Tracker", desc: "12-month tracker, P&L, KPIs, per-gig log", href: "/wlp-revenue" },
  { emoji: "🗺️", name: "DJ Automation Roadmap", desc: "May–Aug 2026 · MVP May 31 · Testing June–July · ED Expo August · $100K MRR (6-month)", href: "/wlp-dj-roadmap" },
  { emoji: "🎵", name: "Release Pipeline", desc: "12-week checklist, distro, sync, calendar", href: "/wlp-release" },
  { emoji: "🤖", name: "AI Workflow", desc: "Agent stack, tools, 25-prompt library", href: "/wlp-ai" },
  { emoji: "📣", name: "Marketing Plan", desc: "Brand USP, social, PR, ads, quick wins", href: "/wlp-marketing" },
  { emoji: "📊", name: "WLP Full Business Deck", desc: "Full WLP business deck — all divisions", href: "/wlp-deck.html" },
];

const djSoftwareDocs: DocItem[] = [
  { emoji: "📋", name: "Product Brief v2", desc: "Full product spec, features, roadmap — May 2026", href: "/wlp-product" },
  { emoji: "⚔️", name: "Competitive Positioning", desc: "vs. CoverJock, BoothPoint & others", href: "/wlp-competitive" },
  { emoji: "💼", name: "Investor Pitch", desc: "Seed round deck — formatted markdown", href: "/wlp-investor" },
  { emoji: "🎯", name: "Investor Target List", desc: "Tiered investor targets with contact paths", href: "/wlp-investor" },
  { emoji: "🗺️", name: "DJ Automation Roadmap", desc: "May–Aug 2026 · MVP May 31 · Testing June–July · ED Expo August · $100K MRR (6-month)", href: "/wlp-dj-roadmap" },
  { emoji: "🔍", name: "Manager Pain Points", desc: "9 pain points from 25+ club managers + how we beat them", href: "/wlp-pain-points" },
  { emoji: "🖥️", name: "Interface Spec", desc: "Manager console, dancer app, backend architecture", href: "/wlp-interface-spec" },
];

const djAutomationFeatures = [
  { title: "Smart Playlist Generation", desc: "AI-powered track selection based on venue energy" },
  { title: "Tempo Matching", desc: "Automatic beat matching and transitions" },
  { title: "Energy Level Management", desc: "Dynamic adjustments based on crowd response" },
  { title: "Request Queue System", desc: "Dancer portal for song requests" },
  { title: "Tip Tracking Integration", desc: "Connect with SRB tip data" },
];

const djAutomationTechStack = [
  "VirtualDJ SDK", "Python", "React", "Node.js", "PostgreSQL"
];

const artists = [
  {
    name: "Kade Rivers",
    genre: "Rock · Alt-Rock",
    status: "ACTIVE",
    statusBg: "#2d1f5e",
    statusColor: "#7f5af0",
    borderHover: "#7f5af0",
    img: "/kade-rivers-v2.jpg",
  },
  {
    name: "Madison Blair",
    genre: "Pop · Dance-Pop",
    status: "RELEASING",
    statusBg: "#0d2e22",
    statusColor: "#2cb67d",
    borderHover: "#2cb67d",
    img: "/madison-blair.jpg",
  },
  {
    name: "Aria Vale",
    genre: "EDM · Melodic Techno",
    status: "ACTIVE",
    statusBg: "#0a1f2e",
    statusColor: "#4fc3f7",
    borderHover: "#4fc3f7",
    img: "/aria-vale.png",
  },
];

function Card({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div
      id={id}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
      }}
    >
      {children}
    </div>
  );
}

// Collapsible Card Component
function CollapsibleCard({ 
  children, 
  title, 
  icon,
  defaultOpen = false 
}: { 
  children: React.ReactNode; 
  title: string; 
  icon: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: isOpen ? 20 : "12px 20px",
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
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "1.5px",
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
        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
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

// Tools Popup Component
function ToolsPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 24,
          width: "100%",
          maxWidth: 600,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
            🛠️ Tools & Apps
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {allTools.map((tool, i) => (
            <a
              key={i}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 6,
                textDecoration: "none",
                color: "var(--text)",
                fontSize: "0.85rem",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.border = "1px solid #9b5de5";
                (e.currentTarget as HTMLAnchorElement).style.color = "#9b5de5";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.border = "none";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
              }}
            >
              <Dot color={tool.dot} />
              {tool.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WLPDashboardPage() {
  const [clock, setClock] = useState("--:-- --");
  const [toolsPopupOpen, setToolsPopupOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/Boise",
      };
      setClock(now.toLocaleTimeString("en-US", opts) + " MDT");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "2rem" }}>🦞</span>
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#fff",
                margin: 0,
              }}
            >
              ANIMAL
            </h1>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", letterSpacing: 1, marginTop: 2 }}>
              Command Center — Managed by PriScylla
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: "1.1rem", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
            {clock}
          </div>
        </div>
      </div>

      {/* Shortcut Buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <button
          onClick={() => scrollToSection("business-docs")}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#9b5de5";
            (e.currentTarget as HTMLButtonElement).style.color = "#9b5de5";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
          }}
        >
          📁 Documents
        </button>
        <button
          onClick={() => scrollToSection("artist-roster")}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#9b5de5";
            (e.currentTarget as HTMLButtonElement).style.color = "#9b5de5";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
          }}
        >
          🎤 Artist Roster
        </button>
        <button
          onClick={() => scrollToSection("dj-software")}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#9b5de5";
            (e.currentTarget as HTMLButtonElement).style.color = "#9b5de5";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
          }}
        >
          🎛️ DJ Software
        </button>
        <button
          onClick={() => setToolsPopupOpen(true)}
          className="shortcut-btn"
          style={{
            background: "var(--card) !important",
            border: "1px solid var(--border) !important",
            color: "var(--text) !important",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.setProperty("border-color", "#9b5de5", "important");
            e.currentTarget.style.setProperty("color", "#9b5de5", "important");
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.setProperty("border-color", "var(--border)", "important");
            e.currentTarget.style.setProperty("color", "var(--text)", "important");
          }}
        >
          🛠️ Tools & Apps
        </button>
      </div>

      {/* Tools Popup */}
      <ToolsPopup isOpen={toolsPopupOpen} onClose={() => setToolsPopupOpen(false)} />

      {/* DJ Automation Roadmap Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0d1f1a, #0a2010)",
          border: "1px solid #2cb67d",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#2cb67d",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            🎛️ Active Roadmap
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
            DJ Automation Software{" "}
            <span
              style={{
                display: "inline-block",
                fontSize: "0.7rem",
                padding: "2px 7px",
                borderRadius: 999,
                fontWeight: 600,
                letterSpacing: "0.5px",
                background: "#0d2e22",
                color: "#2cb67d",
                marginLeft: 6,
              }}
            >
              May – August 2026
            </span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
            Software in Dev · MVP May 31 · Testing June–July · ED Expo August premiere
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2cb67d", lineHeight: 1 }}>
            $100K MRR
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            50 clubs × $2,000/mo (6-month target)
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {/* Business Docs — wide */}
        <div id="business-docs" style={{ gridColumn: "span 2" }}>
          <Card>
            <SectionHeader icon="📁" title="Business Documents" />
            <DocGrid items={businessDocs} />
          </Card>
        </div>

        {/* AI Artists — wide */}
        <div id="artist-roster" style={{ gridColumn: "span 2" }}>
          <Card>
            <SectionHeader icon="🎤" title="AI Artists — WLP Roster" />
            <div style={{ marginBottom: 12 }}>
              <Link
                href="/artists"
                style={{
                  display: "inline-block",
                  fontSize: "0.78rem",
                  color: "#9b5de5",
                  textDecoration: "none",
                  border: "1px solid #9b5de5",
                  padding: "4px 12px",
                  borderRadius: 100,
                  marginBottom: 16,
                  opacity: 0.9,
                  transition: "opacity 0.2s",
                }}
              >
                View Full Roster →
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {artists.map((artist) => (
                <Link key={artist.name} href="/artists" style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    style={{
                      borderRadius: 10,
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      background: "var(--surface, #12121a)",
                      transition: "border-color 0.2s",
                    }}
                    onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.borderColor = artist.borderHover)}
                    onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
                  >
                    <img
                      src={artist.img}
                      alt={artist.name}
                      style={{
                        width: "100%",
                        aspectRatio: "3/4",
                        objectFit: "cover",
                        objectPosition: "top",
                        display: "block",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>{artist.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>{artist.genre}</div>
                      <div style={{ marginTop: 6 }}>
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: artist.statusBg,
                            color: artist.statusColor,
                            padding: "2px 8px",
                            borderRadius: 999,
                            letterSpacing: "0.5px",
                          }}
                        >
                          {artist.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* DJ Automation Software — wide */}
        <div id="dj-software" style={{ gridColumn: "span 2" }}>
          <Card>
            <SectionHeader icon="🎛️" title="DJ Automation Software" />
            <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "-8px", marginBottom: "16px", lineHeight: 1.6 }}>
              AI-powered DJ management system for gentlemen&apos;s clubs. One head DJ programs the system, 
              replacing the need for multiple DJs throughout the week.
            </p>
            <DocGrid items={djSoftwareDocs} />
            
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent2)", marginBottom: 12 }}>
                  Key Features
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {djAutomationFeatures.map((f) => (
                    <li key={f.title} style={{ fontSize: "0.82rem", color: "var(--text)", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: "var(--accent2)" }}>•</span>
                      <span>{f.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent2)", marginBottom: 12 }}>
                  Tech Stack
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {djAutomationTechStack.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: "0.7rem",
                        background: "rgba(155,93,229,0.15)",
                        color: "var(--accent2)",
                        padding: "3px 10px",
                        borderRadius: 100,
                        border: "1px solid rgba(155,93,229,0.3)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            {/* ROI Calculator Card */}
            <Link href="/wlp-dj-roi" style={{
              display: "block",
              padding: "16px",
              background: "linear-gradient(135deg, rgba(100,255,200,0.1), rgba(100,255,200,0.05))",
              border: "2px solid rgba(100,255,200,0.4)",
              borderRadius: "6px",
              textDecoration: "none",
              marginTop: "24px",
            }}>
              <h4 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(100,255,200,1)", margin: "0 0 8px" }}>
                💰 Annual Savings Calculator
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>
                See how much your venue saves per year. Enter your setup, get instant ROI.
              </p>
            </Link>
            </div>


          </Card>
        </div>

        {/* Collapsible Cards - Last 6 */}
        <CollapsibleCard title="Streaming & Distribution" icon="🎧">
          <LinkList items={streamingLinks} />
        </CollapsibleCard>

        <CollapsibleCard title="Social Media" icon="📱">
          <LinkList items={socialLinks} />
        </CollapsibleCard>

        <CollapsibleCard title="Analytics & Tracking" icon="📊">
          <LinkList items={analyticsLinks} />
        </CollapsibleCard>

        <CollapsibleCard title="AI Tools" icon="🤖">
          <LinkList items={aiToolLinks} />
        </CollapsibleCard>

        <CollapsibleCard title="Industry & Press" icon="🎯">
          <LinkList items={industryLinks} />
        </CollapsibleCard>

        <CollapsibleCard title="Sync & Licensing" icon="⚖️">
          <LinkList items={syncLinks} />
        </CollapsibleCard>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--muted)",
        }}
      >
        🦞 PriScylla — ANIMAL&apos;s AI Manager &nbsp;·&nbsp; Built March 12, 2026 &nbsp;·&nbsp; Updated automatically
      </div>
    </div>
  );
}
