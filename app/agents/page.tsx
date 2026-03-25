"use client";

import { useEffect, useState } from "react";

interface Robot {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  name: string;
  task: string;
}

const ROBOT_COLORS = [
  "#9b5de5", // Purple
  "#00bbf9", // Blue
  "#fee440", // Yellow
  "#00f5d4", // Teal
  "#f15bb5", // Pink
  "#f15b5b", // Red
  "#f19b5b", // Orange
  "#5bf166", // Green
];
const AGENT_NAMES = [
  "Langostino",
  "Homard",
  "Clawdia",
  "Shelly",
  "Rockwell",
  "Barnaby",
  "Sebastian",
  "Coral",
];
const TASKS = [
  "Analyzing data",
  "Writing code",
  "Researching",
  "Processing",
  "Optimizing",
  "Learning",
  "Monitoring",
  "Syncing",
];

export default function AIOfficePage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Initialize robots
    const initialRobots: Robot[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      targetX: Math.random() * 80 + 10,
      targetY: Math.random() * 60 + 20,
      color: ROBOT_COLORS[i % ROBOT_COLORS.length],
      name: AGENT_NAMES[i % AGENT_NAMES.length],
      task: TASKS[i % TASKS.length],
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
            // Reached target, pick new target
            return {
              ...robot,
              targetX: Math.random() * 80 + 10,
              targetY: Math.random() * 60 + 20,
              task: TASKS[Math.floor(Math.random() * TASKS.length)],
            };
          }

          // Move towards target
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

      {/* Office Floor */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
          position: "relative",
          height: 500,
          overflow: "hidden",
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

        {/* Robots */}
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
            {/* Robot body */}
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
            {/* Name tag */}
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
            {/* Task */}
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
              {robot.task}
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
            Tasks completed today: <span style={{ color: "var(--accent2)", fontWeight: 600 }}>47</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Uptime: <span style={{ color: "var(--accent2)" }}>99.9%</span>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16, color: "var(--text)" }}>
          Active Agents
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {robots.map((robot) => (
            <div
              key={robot.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: robot.color,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem",
                }}
              >
                🤖
              </div>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>
                  {robot.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{robot.task}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
