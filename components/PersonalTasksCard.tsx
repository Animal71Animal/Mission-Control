"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PersonalTask {
  id: string;
  title: string;
  notes?: string;
  category: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

const PRIORITY_COLORS = {
  high: "#e05c5c",
  medium: "#fee440",
  low: "#888",
};

export function PersonalTasksCard() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Fetch both personal tasks and SRB todo tasks
    Promise.all([
      fetch("/api/personal-tasks").then((r) => r.json()).catch(() => []),
      fetch("/api/srb-todo").then((r) => r.json()).catch(() => [])
    ]).then(([personalTasks, srbTasks]) => {
      // Combine personal tasks with SRB tasks
      const allTasks = Array.isArray(personalTasks) ? [...personalTasks] : [];
      
      // Add SRB todos
      if (Array.isArray(srbTasks)) {
        const formattedSrbTasks = srbTasks.map((todo: any) => ({
          id: todo.id || Math.random().toString(),
          title: todo.text || todo.title || todo.task,
          category: "SRB",
          priority: (todo.priority as "high" | "medium" | "low") || "medium",
          dueDate: todo.due_date || todo.dueDate || todo.due || undefined,
          completed: todo.completed || false,
          createdAt: todo.created_at || todo.createdAt || new Date().toISOString(),
        }));
        allTasks.push(...formattedSrbTasks);
      }
      
      setTasks(allTasks);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const openTasks = tasks.filter((t) => !t.completed);
  const highPriority = openTasks.filter((t) => t.priority === "high");
  const dueSoon = openTasks.filter((t) => {
    if (!t.dueDate || t.dueDate === "") return false;
    try {
      // Parse date properly (handle YYYY-MM-DD format)
      const due = new Date(t.dueDate + "T00:00:00Z");
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const diffMs = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && diffDays >= 0;
    } catch {
      return false;
    }
  });

  if (!loaded) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <Link
      href="/tasks"
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          background: "var(--card)",
          border: hovered ? "1px solid #9b5de5" : "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 20px",
          cursor: "pointer",
          transition: "all 0.2s",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
            📋 Action Items
          </h3>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)" }}>{openTasks.length}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Open</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#e05c5c" }}>{highPriority.length}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>High Priority</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fee440" }}>{dueSoon.length}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase" }}>Due Soon</div>
          </div>
        </div>

        {openTasks.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: 0 }}>No tasks yet. Click to add some.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {openTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.8rem",
                  color: "var(--text)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: PRIORITY_COLORS[task.priority],
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {new Date(task.dueDate + "T00:00:00Z").toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
            {openTasks.length > 3 && (
              <p style={{ color: "var(--muted)", fontSize: "0.75rem", margin: "4px 0 0" }}>
                +{openTasks.length - 3} more...
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
