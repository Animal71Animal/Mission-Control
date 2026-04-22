"use client";

import { useEffect, useState } from "react";

interface TaskHistoryItem {
  name: string;
  completedAt?: string;
}

interface TaskHistory {
  completed: (string | TaskHistoryItem)[];
  inProgress: (string | TaskHistoryItem)[];
  upcoming: (string | TaskHistoryItem)[];
}

interface AgentData {
  name: string;
  discipline: string;
  model: string;
  status: string;
  totalTasksCompleted: number;
  totalTasksAssigned: number;
  tasksInProgress: number;
  currentTask: string | null;
  currentTaskStatus: string | null;
  currentTaskProgress: number;
  blockers: string[];
  lastUpdated: string;
  nextDeadline: string | null;
  availabilityStatus: "available" | "blocked" | "busy";
  taskHistory?: TaskHistory;
}

interface TeamStats {
  totalTasksCompleted: number;
  totalTasksAssigned: number;
  tasksInProgress: number;
  blockedTasks: number;
  teamAvailability: string;
  lastTeamUpdate: string;
}

interface AgentStatusData {
  agents: Record<string, AgentData>;
  teamStats: TeamStats;
}

interface Robot {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  name: string;
  discipline: string;
}

const AGENT_COLORS: Record<string, string> = {
  langostino: "#9b5de5",
  homard: "#00bbf9",
  clawdia: "#fee440",
  shelly: "#00f5d4",
  rockwell: "#f15bb5",
  barnaby: "#f15b5b",
  sebastian: "#f19b5b",
  coral: "#5bf166",
};

export default function AIOfficePage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [time, setTime] = useState(new Date());
  const [agentData, setAgentData] = useState<AgentStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<{ key: string; agent: AgentData } | null>(null);

  // Fetch agent status data
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await fetch("/api/agent-status");
        if (response.ok) {
          const data = await response.json();
          setAgentData(data);
        } else {
          // Fallback: try to fetch directly from file
          const fileResponse = await fetch("/data/agent-status.json");
          if (fileResponse.ok) {
            const data = await fileResponse.json();
            setAgentData(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch agent status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAgentData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize robots from agent data or fallback
    const agents = agentData?.agents || {};
    const agentKeys = Object.keys(agents).length > 0 ? Object.keys(agents) : Object.keys(AGENT_COLORS);
    
    const initialRobots: Robot[] = agentKeys.map((key, i) => {
      const agent = agents[key];
      return {
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        targetX: Math.random() * 80 + 10,
        targetY: Math.random() * 60 + 20,
        color: AGENT_COLORS[key] || "#9b5de5",
        name: agent?.name || key.charAt(0).toUpperCase() + key.slice(1),
        discipline: agent?.discipline || "Agent",
      };
    });
    setRobots(initialRobots);

    // Animation loop
    const interval = setInterval(() => {
      setTime(new Date());
      setRobots((prev) =>
        prev.map((robot) => {
          const dx = robot.targetX - robot.x;
          const dy = robot.targetY - robot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 1) {
            return {
              ...robot,
              targetX: Math.random() * 80 + 10,
              targetY: Math.random() * 60 + 20,
            };
          }

          const speed = 0.5;
          return {
            ...robot,
            x: robot.x + (dx / dist) * speed,
            y: robot.y + (dy / dist) * speed,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [agentData]);

  const getStatusLight = (availabilityStatus: string, blockers: string[]) => {
    if (blockers.length > 0) return { emoji: "🔴", label: "Critical Blocker", color: "#ff4444" };
    if (availabilityStatus === "available") return { emoji: "🟢", label: "Available", color: "#00c87c" };
    if (availabilityStatus === "busy" || availabilityStatus === "in-progress") return { emoji: "🟡", label: "In Progress", color: "#ffc107" };
    if (availabilityStatus === "blocked") return { emoji: "🟡", label: "Blocked", color: "#ffc107" };
    return { emoji: "⚪", label: "Unknown", color: "#888" };
  };

  const getTeamAvailabilityEmoji = (availability: string) => {
    switch (availability) {
      case "high": return "🟢";
      case "medium": return "🟡";
      case "low": return "🔴";
      default: return "⚪";
    }
  };

  const agents = agentData?.agents || {};
  const teamStats = agentData?.teamStats;
  const agentEntries = Object.entries(agents);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #9b5de5, #c77dff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🤖 AI Office
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Live view of agents at work · {time.toLocaleTimeString()}
        </p>
      </div>

      {/* Team Summary */}
      {teamStats && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(155,93,229,0.15), rgba(0,200,124,0.1))",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 28,
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
            📊 Team Summary
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent2)" }}>
                {teamStats.totalTasksCompleted}/{teamStats.totalTasksAssigned}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Tasks Completed</div>
            </div>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: teamStats.blockedTasks > 0 ? "#ff4444" : "var(--accent2)" }}>
                {teamStats.blockedTasks}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Blockers</div>
            </div>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>
                {getTeamAvailabilityEmoji(teamStats.teamAvailability)} {teamStats.teamAvailability}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Team Availability</div>
            </div>
            <div style={{ textAlign: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>
                {agentEntries.length}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase" }}>Active Agents</div>
            </div>
          </div>
        </div>
      )}

      {/* Office Floor - Just Animation */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
          position: "relative",
          height: 400,
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(155,93,229,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(155,93,229,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            opacity: 0.5,
          }}
        />

        {/* Workstations */}
        {[
          { x: 15, y: 20, label: "Research" },
          { x: 45, y: 20, label: "Code" },
          { x: 75, y: 20, label: "Design" },
          { x: 15, y: 60, label: "Analysis" },
          { x: 45, y: 60, label: "Writing" },
          { x: 75, y: 60, label: "Review" },
        ].map((station, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${station.x}%`,
              top: `${station.y}%`,
              transform: "translate(-50%, -50%)",
              width: 80,
              height: 50,
              background: "rgba(155,93,229,0.1)",
              border: "1px solid rgba(155,93,229,0.3)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              color: "var(--muted)",
            }}
          >
            {station.label}
          </div>
        ))}

        {/* Robots - Just Animation, No Stats */}
        {robots.map((robot) => (
          <div
            key={robot.id}
            style={{
              position: "absolute",
              left: `${robot.x}%`,
              top: `${robot.y}%`,
              transform: "translate(-50%, -50%)",
              transition: "all 0.05s linear",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                background: robot.color,
                borderRadius: "50%",
                boxShadow: `0 0 10px ${robot.color}80`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
              }}
            >
              🤖
            </div>
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "0.6rem",
                color: "var(--text)",
                whiteSpace: "nowrap",
                background: "rgba(0,0,0,0.5)",
                padding: "1px 4px",
                borderRadius: 4,
              }}
            >
              {robot.name}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -16,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "0.55rem",
                color: "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              {robot.discipline}
            </div>
          </div>
        ))}

        {/* Status overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            background: "rgba(13,13,18,0.9)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            <span style={{ color: "#00c87c" }}>●</span> {robots.length} Agents Active
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Tasks completed: <span style={{ color: "var(--accent2)", fontWeight: 600 }}>{teamStats?.totalTasksCompleted || 0}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Uptime: <span style={{ color: "var(--accent2)" }}>99.9%</span>
          </div>
        </div>
      </div>

      {/* Agent Cards with Live Status */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
          👥 Agent Roster & Live Status
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            Loading agent status...
          </div>
        ) : agentEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            No agent data available.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {agentEntries.map(([key, agent]) => {
              const statusLight = getStatusLight(agent.availabilityStatus, agent.blockers);
              const color = AGENT_COLORS[key] || "#9b5de5";
              const progress = agent.currentTaskProgress || 0;
              
              return (
                <div
                  key={key}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: 16,
                    borderLeft: `4px solid ${agent.blockers.length > 0 ? "#ff4444" : color}`,
                  }}
                >
                  {/* Header with Status Light */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: color,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                        boxShadow: `0 0 12px ${color}60`,
                        position: "relative",
                      }}
                    >
                      🤖
                      {/* Status indicator badge */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: -2,
                          right: -2,
                          fontSize: "1rem",
                          background: "var(--card)",
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid var(--card)",
                        }}
                        title={statusLight.label}
                      >
                        {statusLight.emoji}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                          {agent.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            background: statusLight.color + "20",
                            color: statusLight.color,
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontWeight: 500,
                          }}
                        >
                          {statusLight.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: color, fontWeight: 500 }}>
                        {agent.discipline}
                      </div>
                    </div>
                  </div>

                  {/* Task Count */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                    <div
                      onClick={() => setSelectedAgent({ key, agent })}
                      style={{ textAlign: "center", padding: "8px 4px", background: "rgba(155,93,229,0.08)", borderRadius: 6, cursor: "pointer" }}
                      title="Click to view task history"
                    >
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#60a5fa", textDecoration: "underline" }}>
                        {agent.totalTasksCompleted}/{agent.totalTasksAssigned}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Tasks</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "8px 4px", background: "rgba(155,93,229,0.08)", borderRadius: 6 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: agent.tasksInProgress > 0 ? "#ffc107" : "var(--text)" }}>
                        {agent.tasksInProgress}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>In Progress</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "8px 4px", background: "rgba(155,93,229,0.08)", borderRadius: 6 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: agent.blockers.length > 0 ? "#ff4444" : "#00c87c" }}>
                        {agent.blockers.length}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Blockers</div>
                    </div>
                  </div>

                  {/* Current Task with Progress Bar */}
                  {agent.currentTask && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text)", marginBottom: 6 }}>
                        <strong>🎯 Current Task:</strong> {agent.currentTask}
                      </div>
                      {progress > 0 && (
                        <div>
                          <div
                            style={{
                              height: 6,
                              background: "rgba(155,93,229,0.2)",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${progress}%`,
                                background: progress === 100 ? "#00c87c" : "linear-gradient(90deg, #9b5de5, #c77dff)",
                                borderRadius: 3,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "var(--muted)", textAlign: "right", marginTop: 2 }}>
                            {progress}%
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Blockers - Red if any */}
                  {agent.blockers.length > 0 && (
                    <div
                      style={{
                        background: "rgba(255,68,68,0.1)",
                        border: "1px solid rgba(255,68,68,0.3)",
                        borderRadius: 6,
                        padding: 10,
                        marginTop: 10,
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: "#ff4444", fontWeight: 600, marginBottom: 4 }}>
                        🔴 Blockers:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {agent.blockers.map((blocker, i) => (
                          <li key={i} style={{ fontSize: "0.75rem", color: "#ff6666" }}>
                            {blocker}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Deadline */}
                  {agent.nextDeadline && (
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                      <strong>⏰ Next Deadline:</strong>{" "}
                      <span style={{ color: "var(--accent2)" }}>
                        {new Date(agent.nextDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>
                    Updated: {new Date(agent.lastUpdated).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task History Modal */}
      {selectedAgent && (
        <div
          onClick={() => setSelectedAgent(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderLeft: `4px solid ${AGENT_COLORS[selectedAgent.key] || "#9b5de5"}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 520,
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--text)" }}>
                  {selectedAgent.agent.name} — Task History
                </h2>
                <div style={{ fontSize: "0.8rem", color: AGENT_COLORS[selectedAgent.key] || "#9b5de5", marginTop: 2 }}>
                  {selectedAgent.agent.discipline}
                </div>
              </div>
              <button
                onClick={() => setSelectedAgent(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted)",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Summary */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, textAlign: "center", padding: 12, background: "rgba(0,200,124,0.1)", borderRadius: 8 }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#00c87c" }}>{selectedAgent.agent.totalTasksCompleted}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Completed</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: 12, background: "rgba(255,193,7,0.1)", borderRadius: 8 }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffc107" }}>{selectedAgent.agent.tasksInProgress}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>In Progress</div>
              </div>
              <div style={{ flex: 1, textAlign: "center", padding: 12, background: "rgba(155,93,229,0.1)", borderRadius: 8 }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent2)" }}>{selectedAgent.agent.totalTasksAssigned}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Total Assigned</div>
              </div>
            </div>

            {/* Task Lists */}
            {["inProgress", "completed", "upcoming"].map((section) => {
              const labels: Record<string, { label: string; emoji: string; color: string }> = {
                inProgress: { label: "In Progress", emoji: "🔄", color: "#ffc107" },
                completed: { label: "Completed", emoji: "✅", color: "#00c87c" },
                upcoming: { label: "Upcoming / Assigned", emoji: "📋", color: "#60a5fa" },
              };
              const tasks = selectedAgent.agent.taskHistory?.[section as keyof TaskHistory] || [];
              const { label, emoji, color } = labels[section];
              return (
                <div key={section} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color, marginBottom: 8 }}>
                    {emoji} {label} ({tasks.length})
                  </div>
                  {tasks.length === 0 ? (
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic", paddingLeft: 8 }}>None</div>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {tasks.map((task: string | { name: string; completedAt?: string }, i: number) => (
                        <li key={i} style={{ fontSize: "0.8rem", color: "var(--text)", marginBottom: 4 }}>
                          {typeof task === "string" ? task : task.name}
                          {typeof task !== "string" && task.completedAt && (
                            <span style={{ fontSize: "0.7rem", color: "var(--muted)", marginLeft: 6 }}>
                              {new Date(task.completedAt).toLocaleDateString()}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", fontStyle: "italic" }}>
              Last updated: {new Date(selectedAgent.agent.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
