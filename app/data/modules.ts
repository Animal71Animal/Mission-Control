export type ModuleGroup = "operations" | "systems" | "external";

export interface Module {
  href: string;
  icon: string;
  title: string;
  desc: string;
  status: "active" | "pending" | "beta";
  group: ModuleGroup;
}

// Order matches Sidebar navigation (excluding Overview which is home page)
export const modules: Module[] = [
  { href: "/wlp", icon: "💼", title: "WLP Business", desc: "Business docs, AI artists, streaming, social, analytics, and industry links.", status: "active", group: "operations" },
  { href: "/artists", icon: "🎤", title: "Artists", desc: "ANIMAL, Kade Rivers, Madison Blair, Aria Vale, JusNiiga — WLP roster.", status: "active", group: "operations" },
  { href: "/artist-assets", icon: "🎨", title: "Artist Assets", desc: "Unified asset tracking for WLP artist roster.", status: "active", group: "operations" },
  { href: "/content-pipeline", icon: "📱", title: "Content Pipeline", desc: "TikTok, Reels & Shorts management for WLP AI Artists.", status: "active", group: "operations" },
  { href: "/calendar", icon: "📅", title: "Calendar", desc: "Gigs, studio sessions, meetings, and deadlines.", status: "active", group: "operations" },
  
  { href: "/srb-tips", icon: "💰", title: "SRB Tips", desc: "Spearmint Rhino tip tracking — monthly totals, top tippers, dancer stats.", status: "active", group: "operations" },
  { href: "/peptides", icon: "💉", title: "Peptide Stack", desc: "Mission Control — peptide dosing, schedule, and tracking.", status: "active", group: "operations" },
  { href: "/spearmint-rhino", icon: "🦏", title: "Spearmint Rhino", desc: "Club operations, to-do lists, equipment status, and venue management.", status: "active", group: "operations" },
  { href: "/agents", icon: "🤖", title: "AI Office", desc: "Live view of AI agents working in the virtual office.", status: "active", group: "systems" },
  { href: "/ableton", icon: "🎛️", title: "Ableton", desc: "AbletonOSC, live PA template, MIDI controller config.", status: "pending", group: "systems" },
  { href: "/tesla", icon: "🚗", title: "Tesla", desc: "Charging session log and cost tracker.", status: "active", group: "systems" },
  { href: "/uber-profit", icon: "🚘", title: "Uber Profit", desc: "Earnings tracking with proportional charging deduction.", status: "active", group: "systems" },
  { href: "/personal-tasks", icon: "✅", title: "Tasks", desc: "All tasks — personal, WLP, and work items with priority, due dates, and categories.", status: "active", group: "systems" },
  { href: "/joules-claw", icon: "⚡", title: "Joules Claw", desc: "Production and creative workflow management.", status: "active", group: "systems" },
  { href: "/playlist-report", icon: "🎬", title: "OpenClaw Videos", desc: "OpenClaw video playlist summaries with tools and insights.", status: "active", group: "systems" },
  { href: "/brief", icon: "☀️", title: "Morning Brief", desc: "Daily weather, news, and task rundown. Delivered at 10 AM.", status: "active", group: "external" },
  { href: "/drive", icon: "📁", title: "Google Drive", desc: "12-folder organized Drive. Snapshot + restore available.", status: "active", group: "external" },
  // { href: "/analytics", icon: "📊", title: "Analytics", desc: "GoatCounter metrics — views, visitors, top pages.", status: "active", group: "external" },
  { href: "/shared-links", icon: "🔗", title: "Shared Links", desc: "Password-protected links shared with partners, developers, and investors.", status: "active", group: "external" },
];

export interface Shortcut {
  href: string;
  label: string;
  desc: string;
}

// Quick access shortcuts - none currently
export const shortcuts: Shortcut[] = [];

// Shared access links for external parties
export interface SharedLink {
  id: string;
  name: string;
  url: string;
  password: string;
  created: string;
  description: string;
}

export const sharedLinks: SharedLink[] = [
  {
    id: "dj-auto-001",
    name: "DJ Automation Software",
    url: "https://dj-automation-srb.vercel.app",
    password: "wlp2025",
    created: "2026-03-28",
    description: "Product brief, competitive analysis, and investor pitch for DJ automation app"
  },
  {
    id: "doe-pitch-001",
    name: "DOE Pitch Deck",
    url: "https://my-9qag5ejfh-ericmills71-8100s-projects.vercel.app",
    password: "wlp2025",
    created: "2026-03-28",
    description: "Director of Entertainment pitch deck for prospective employers"
  }
];

// Group labels for display
export const groupLabels: Record<ModuleGroup, string> = {
  operations: "Operations",
  systems: "Systems",
  external: "External",
};

// Group order for sidebar and overview (External first)
export const groupOrder: ModuleGroup[] = ["external", "operations", "systems"];
