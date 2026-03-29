"use client";

import { useEffect, useState } from "react";
import { agentTasks, agentStats, AgentTask } from "../data/agentTasks";

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

const AGENT_DATA = [
  { name: "Langostino", color: "#9b5de5", discipline: "Marketing" },
  { name: "Homard", color: "#00bbf9", discipline: "Finance / SRB Tips" },
  { name: "Clawdia", color: "#fee440", discipline: "Operations" },
  { name: "Shelly", color: "#00f5d4", discipline: "A&R / Artists" },
  { name: "Rockwell", color: "#f15bb5", discipline: "Production" },
  { name: "Barnaby", color: "#f15b5b", discipline: "Business Dev" },
  { name: "Sebastian", color: "#f19b5b", discipline: "Legal / Admin" },
  { name: "Coral", color: "#5bf166", discipline: "R&D / Innovation" },
];

export default function AIOfficePage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [time, setTime] = useState(new Date());
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Sort tasks by startTime (newest first)
  const sortedTasks = [...agentTasks].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  // Filter tasks by agent
  const filteredTasks = selectedAgent === "all" 
    ? sortedTasks 
    : sortedTasks.filter(t => t.agent === selectedAgent);

  useEffect(() => {
    // Initialize robots
    const initialRobots: Robot[] = AGENT_DATA.map((agent, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      targetX: Math.random() * 80 + 10,
      targetY: Math.random() * 60 + 20,
      color: agent.color,
      name: agent.name,
      discipline: agent.discipline,
    }));
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
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✅";
      case "in-progress": return "⏳";
      case "failed": return "❌";
      default: return "⏳";
    }
  };

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
            Tasks completed: <span style={{ color: "var(--accent2)", fontWeight: 600 }}>{sortedTasks.length}</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Uptime: <span style={{ color: "var(--accent2)" }}>99.9%</span>
          </div>
        </div>
      </div>

      {/* Static Agent List with Stats */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
          📊 Agent Roster & Statistics
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {AGENT_DATA.map((agent) => {
            const stats = agentStats[agent.name as keyof typeof agentStats];
            const agentTasksList = sortedTasks.filter(t => t.agent === agent.name);
            const lastTask = agentTasksList[0];
            
            return (
              <div
                key={agent.name}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 16,
                  borderLeft: `4px solid ${agent.color}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: agent.color,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      boxShadow: `0 0 12px ${agent.color}60`,
                    }}
                  >
                    🤖
                  </div>
                  <div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: agent.color, fontWeight: 500 }}>
                      {agent.discipline}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                  <div style={{ textAlign: "center", padding: "8px 4px", background: "rgba(155,93,229,0.08)", borderRadius: 6 }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent2)" }}>
                      {stats?.tasks || 0}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Tasks</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "8px 4px", background: "rgba(155,93,229,0.08)", borderRadius: 6 }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                      {stats?.totalRuntime || "0m"}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Runtime</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "8px 4px", background: "rgba(155,93,229,0.08)", borderRadius: 6 }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                      {stats?.totalTokens || "0"}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Tokens</div>
                  </div>
                </div>
                
                {stats?.currentAssignment && (
                  <div style={{ fontSize: "0.75rem", color: "#00c87c", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <strong>🎯 Current Assignment:</strong> {stats.currentAssignment}
                  </div>
                )}
                
                {lastTask && (
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <strong style={{ color: "var(--text)" }}>Last task:</strong> {lastTask.task}
                    <div style={{ marginTop: 2 }}>{lastTask.startTime}</div>
                  </div>
                )}
                
                {!lastTask && !stats?.currentAssignment && (
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", paddingTop: 12, borderTop: "1px solid var(--border)", fontStyle: "italic" }}>
                    Awaiting first assignment
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Task History */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            📋 Agent Task History
          </h2>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 12px",
              color: "var(--text)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <option value="all">All Agents</option>
            {AGENT_DATA.map(agent => (
              <option key={agent.name} value={agent.name}>{agent.name}</option>
            ))}
          </select>
        </div>

        {/* Task List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {/* Task Header - Clickable */}
              <div
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                style={{
                  padding: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderLeft: `3px solid ${task.agentColor}`,
                }}
              >
                <span style={{ fontSize: "1rem" }}>{getStatusIcon(task.status)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                      {task.task}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        background: task.agentColor + "20",
                        color: task.agentColor,
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {task.agent}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
                    {task.startTime} {task.runtime && `· ${task.runtime}`} {task.tokens && `· ${task.tokens} tokens`}
                  </div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {expandedTask === task.id ? "▼" : "▶"}
                </span>
              </div>

              {/* Task Details - Expandable */}
              {expandedTask === task.id && (
                <div style={{ padding: "0 12px 12px 12px", borderLeft: `3px solid ${task.agentColor}` }}>
                  <div style={{ paddingLeft: 32 }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text)", marginBottom: 8 }}>
                      <strong>Description:</strong> {task.description}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text)", marginBottom: 8 }}>
                      <strong>Deliverables:</strong>
                      <ul style={{ margin: "4px 0", paddingLeft: 20 }}>
                        {task.deliverables.map((deliverable, i) => (
                          <li key={i} style={{ color: "var(--muted)" }}>
                            {deliverable.startsWith("http") ? (
                              <a
                                href={deliverable}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "var(--accent2)", textDecoration: "none" }}
                              >
                                {deliverable}
                              </a>
                            ) : deliverable.startsWith("/") ? (
                              <code style={{ background: "rgba(155,93,229,0.1)", padding: "1px 4px", borderRadius: 4 }}>
                                {deliverable}
                              </code>
                            ) : (
                              deliverable
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {task.url && (
                      <div style={{ fontSize: "0.8rem" }}>
                        <strong>URL:</strong>{" "}
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--accent2)", textDecoration: "none" }}
                        >
                          {task.url}
                        </a>
                      </div>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 8 }}>
                      Task ID: {task.id} · Status: {task.status}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            No tasks found for the selected agent.
          </div>
        )}
      </div>
    </div>
  );
}
