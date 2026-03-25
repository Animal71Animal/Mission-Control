export interface Module {
  href: string;
  icon: string;
  title: string;
  desc: string;
  status: "active" | "pending" | "beta";
}

// Order matches Sidebar navigation (excluding Overview which is home page)
export const modules: Module[] = [
  { href: "/brief", icon: "☀️", title: "Morning Brief", desc: "Daily weather, news, and task rundown. Delivered at 10 AM.", status: "active" },
  { href: "/wlp", icon: "💼", title: "WLP Business", desc: "Business docs, AI artists, streaming, social, analytics, and industry links.", status: "active" },
  { href: "/artists", icon: "🎤", title: "Artists", desc: "ANIMAL, Kade Rivers, Madison Blair, Aria Vale — WLP roster.", status: "active" },
  { href: "/tasks", icon: "✅", title: "Open Tasks", desc: "Color-coded task list — PriScylla (purple) vs ANIMAL (orange).", status: "active" },
  { href: "/calendar", icon: "📅", title: "Calendar", desc: "Gigs, studio sessions, meetings, and deadlines.", status: "active" },
  { href: "/drive", icon: "📁", title: "Google Drive", desc: "12-folder organized Drive. Snapshot + restore available.", status: "active" },
  { href: "/ableton", icon: "🎛️", title: "Ableton", desc: "AbletonOSC, live PA template, MIDI controller config.", status: "pending" },
  { href: "/analytics", icon: "📊", title: "Analytics", desc: "GoatCounter metrics — views, visitors, top pages.", status: "active" },
  { href: "/agents", icon: "🤖", title: "AI Office", desc: "Live view of AI agents working in the virtual office.", status: "active" },
  { href: "/srb-tips", icon: "💰", title: "SRB Tips", desc: "Spearmint Rhino tip tracking — monthly totals, top tippers, dancer stats.", status: "active" },
  { href: "/tesla", icon: "🚗", title: "Tesla", desc: "Charging session log and cost tracker.", status: "active" },
  { href: "/playlist-report", icon: "🎬", title: "YT Summaries", desc: "OpenClaw video playlist summaries with tools and insights.", status: "active" },
];

export interface Shortcut {
  href: string;
  label: string;
  desc: string;
}

// Quick access shortcuts - none currently
export const shortcuts: Shortcut[] = [];
