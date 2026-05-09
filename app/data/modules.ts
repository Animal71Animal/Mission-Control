export type ModuleGroup = "business" | "personal" | "creative" | "external";

export interface Module {
  href: string;
  icon: string;
  title: string;
  desc: string;
  status: "active" | "pending" | "beta";
  group: ModuleGroup;
  children?: Module[];
}

// Order matches Sidebar navigation (excluding Overview which is home page)
export const modules: Module[] = [
  { href: "/wlp", icon: "💼", title: "WLP Business", desc: "Business docs, AI artists, streaming, social, and industry links.", status: "active", group: "business" },
  { href: "/artists", icon: "🎤", title: "Artists", desc: "ANIMAL, Kade Rivers, Madison Blair, Aria Vale — WLP roster.", status: "active", group: "business", children: [
    { href: "/artist-assets", icon: "🎨", title: "Artist Assets", desc: "Unified asset tracking for WLP artist roster.", status: "active", group: "business" },
    { href: "/content-pipeline", icon: "📱", title: "Content Pipeline", desc: "TikTok, Reels & Shorts management for WLP AI Artists.", status: "active", group: "business" },
  ] },
  { href: "/calendar", icon: "📅", title: "Calendar", desc: "Gigs, studio sessions, meetings, and deadlines.", status: "active", group: "business" },
  { href: "/srb-tips", icon: "💰", title: "SRB Tips", desc: "Spearmint Rhino tip tracking — monthly totals, top tippers, dancer stats.", status: "active", group: "business" },
  { href: "/tasks", icon: "📋", title: "Action Items", desc: "All action items — SRB club operations and personal tasks in one hub.", status: "active", group: "business" },
  { href: "/agents", icon: "🤖", title: "AI Office", desc: "Live view of AI agents working in the virtual office.", status: "active", group: "business" },

  { href: "/peptrak", icon: "💉", title: "PepTrak", desc: "Peptide dosing tracker — daily checklist, vial inventory, and schedule.", status: "active", group: "business" },

  { href: "/ableton", icon: "🎛️", title: "Ableton", desc: "Ableton Live setup, plugin inventory, and session notes.", status: "active", group: "creative" },

  { href: "/tesla", icon: "🚗", title: "Tesla", desc: "Charging session log and cost tracker.", status: "active", group: "personal" },
  { href: "/uber-profit", icon: "💰", title: "Uber Earnings", desc: "Dashboard earnings + shift tracking with charging deduction.", status: "active", group: "personal" },
  { href: "/workout", icon: "🏋️", title: "Workout", desc: "Daily full-body routine with exercise tracking and progressive overload.", status: "active", group: "personal" },

  { href: "/brief", icon: "☀️", title: "Morning Brief", desc: "Daily weather, news, and task rundown. Delivered at 10 AM.", status: "active", group: "external" },
  { href: "/drive", icon: "📁", title: "Google Drive", desc: "12-folder organized Drive. Snapshot + restore available.", status: "active", group: "external" },
  { href: "/shared-links", icon: "🔗", title: "Shared Links", desc: "Password-protected links shared with partners, developers, and investors.", status: "active", group: "external" },
];

export interface Shortcut {
  href: string;
  label: string;
  desc: string;
}

// Quick access shortcuts - none currently
export const shortcuts: Shortcut[] = [];

// Shared access links for external parties — isolated public pages
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
    id: "dj-automation-full",
    name: "DJ Automation — Full Section (Password Protected)",
    url: "https://mission-control-cyan-omega.vercel.app/shared/dj-automation",
    password: "wlp2025",
    created: "2026-05-05",
    description: "Complete DJ Automation section from WLP Business. Password required. Updates live as changes are made"
  }
];

// Group labels for display
export const groupLabels: Record<ModuleGroup, string> = {
  business: "Business Operations",
  personal: "Personal",
  creative: "Creative",
  external: "External Links",
};

// Group order for sidebar and overview
export const groupOrder: ModuleGroup[] = ["external", "business", "personal", "creative"];
