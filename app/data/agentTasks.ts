export interface AgentTask {
  id: string;
  agent: string;
  agentColor: string;
  task: string;
  description: string;
  status: "completed" | "in-progress" | "failed";
  startTime: string;
  endTime?: string;
  runtime?: string;
  tokens?: string;
  deliverables: string[];
  url?: string;
}

export const agentTasks: AgentTask[] = [
  // Backfill from known history
  {
    id: "task-001",
    agent: "Langostino",
    agentColor: "#9b5de5",
    task: "YouTube Summaries Reformatting",
    description: "Reformatted videos 1-45 to match 46-49 format",
    status: "completed",
    startTime: "2026-03-27 07:04 UTC",
    endTime: "2026-03-27 07:19 UTC",
    runtime: "14m 18s",
    tokens: "54.7k",
    deliverables: ["Updated playlist report markdown files"],
  },
  {
    id: "task-002",
    agent: "Barnaby",
    agentColor: "#f15b5b",
    task: "DJ Automation Share Site",
    description: "Created password-protected mini-site for DJ Automation Software card",
    status: "completed",
    startTime: "2026-03-27 08:03 UTC",
    endTime: "2026-03-27 08:34 UTC",
    runtime: "30m 4s",
    tokens: "246.6k",
    deliverables: ["https://my-app-sepia-ten-79.vercel.app"],
    url: "https://my-app-sepia-ten-79.vercel.app"
  },
  {
    id: "task-003",
    agent: "Barnaby",
    agentColor: "#f15b5b",
    task: "DOE Pitch Deck",
    description: "Created password-protected mini-site for Director of Entertainment pitch deck",
    status: "completed",
    startTime: "2026-03-27 09:09 UTC",
    endTime: "2026-03-27 09:21 UTC",
    runtime: "11m 6s",
    tokens: "181.8k",
    deliverables: ["https://doe-pitch-deck.vercel.app"],
    url: "https://doe-pitch-deck.vercel.app"
  },
  {
    id: "task-004",
    agent: "Clawdia",
    agentColor: "#fee440",
    task: "Mission Control Navigation Update",
    description: "Grouped sidebar into collapsible sections (External, Operations, Systems)",
    status: "completed",
    startTime: "2026-03-27 09:37 UTC",
    endTime: "2026-03-27 09:41 UTC",
    runtime: "3m 59s",
    tokens: "7.3k",
    deliverables: ["Updated sidebar with grouped navigation", "Enhanced Overview page with search and Recently Used"],
  },
  {
    id: "task-005",
    agent: "Sebastian",
    agentColor: "#f19b5b",
    task: "Cron Schedule Fix",
    description: "Fixed timezone issues and enabled alerts for all cron jobs",
    status: "completed",
    startTime: "2026-03-27 09:51 UTC",
    endTime: "2026-03-27 09:53 UTC",
    runtime: "2m 16s",
    tokens: "2.5k",
    deliverables: ["Updated night-creative-mode to 2:00 AM MDT", "Updated qmd-index to 2:00 AM MDT", "Enabled failure alerts"],
  },
  {
    id: "task-006",
    agent: "Langostino",
    agentColor: "#9b5de5",
    task: "Night Creative Mode",
    description: "Identified 3 unstated opportunities in WLP workspace",
    status: "completed",
    startTime: "2026-03-27 10:26 UTC",
    endTime: "2026-03-27 10:28 UTC",
    runtime: "1m 0s",
    tokens: "4.2k",
    deliverables: ["/home/ubuntu/wlp/ops/daily-reports/2026-03-27-night.md"],
  },
  {
    id: "task-007",
    agent: "Coral",
    agentColor: "#5bf166",
    task: "Dream Cycle",
    description: "Memory optimization and compression",
    status: "completed",
    startTime: "2026-03-27 09:12 UTC",
    endTime: "2026-03-27 09:41 UTC",
    runtime: "~29m",
    tokens: "unknown",
    deliverables: ["/home/ubuntu/wlp/ops/dream-reports/2026-03-27.md"],
  },
  {
    id: "task-008",
    agent: "Shelly",
    agentColor: "#00f5d4",
    task: "Unified Artist Asset Management",
    description: "Created skill and Mission Control dashboard for tracking artist assets",
    status: "completed",
    startTime: "2026-03-27 10:30 UTC",
    endTime: "2026-03-27 10:35 UTC",
    runtime: "5m 1s",
    tokens: "11.8k",
    deliverables: ["Skill: /home/ubuntu/wlp/skills/unified-artist-assets/SKILL.md", "Dashboard: /artist-assets"],
    url: "https://mission-control-cyan-omega.vercel.app/artist-assets"
  },
  {
    id: "task-009",
    agent: "Langostino",
    agentColor: "#9b5de5",
    task: "TikTok Content Pipeline System",
    description: "Created complete content pipeline with templates, workflows, and Phase 2 content",
    status: "completed",
    startTime: "2026-03-27 10:40 UTC",
    endTime: "2026-03-27 10:53 UTC",
    runtime: "13m 3s",
    tokens: "29.7k",
    deliverables: ["Content pipeline templates", "15 Phase 2 TikTok scripts", "Mission Control dashboard"],
    url: "https://mission-control-cyan-omega.vercel.app/content-pipeline"
  },
  {
    id: "task-010",
    agent: "Homard",
    agentColor: "#00bbf9",
    task: "SRB Tips - Sole Responsibility Assignment",
    description: "Assigned as sole owner of SRB Tips content creation and management",
    status: "completed",
    startTime: "2026-03-28 02:00 UTC",
    endTime: "2026-03-28 02:08 UTC",
    runtime: "8m 30s",
    tokens: "15.2k",
    deliverables: ["SRB Tips ownership transferred to Homard", "Content strategy updated", "Mission Control dashboard updated"],
    url: "https://mission-control-cyan-omega.vercel.app/srb-tips"
  }
];

export const agentStats = {
  "Langostino": { tasks: 3, totalTokens: "88.6k", totalRuntime: "28m 21s" },
  "Barnaby": { tasks: 2, totalTokens: "428.4k", totalRuntime: "41m 10s" },
  "Clawdia": { tasks: 1, totalTokens: "7.3k", totalRuntime: "3m 59s" },
  "Sebastian": { tasks: 1, totalTokens: "2.5k", totalRuntime: "2m 16s" },
  "Coral": { tasks: 1, totalTokens: "unknown", totalRuntime: "~29m" },
  "Shelly": { tasks: 1, totalTokens: "11.8k", totalRuntime: "5m 1s" },
  "Homard": { tasks: 1, totalTokens: "15.2k", totalRuntime: "8m 30s", currentAssignment: "SRB Tips - Sole Responsibility" },
  "Rockwell": { tasks: 0, totalTokens: "0", totalRuntime: "0m" }
};
