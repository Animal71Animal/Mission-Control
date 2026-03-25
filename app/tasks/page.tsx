"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  notes?: string;
  owner: "priscylla" | "animal";
  status: "pending" | "in-progress" | "blocked" | "done";
  priority: "high" | "medium" | "low";
  completedAt?: string;
}

// Color scheme: ANIMAL = Purple, PriScylla = Yellow
const OWNER_COLOR: Record<string, string> = {
  animal: "#9b5de5",    // Purple for ANIMAL
  priscylla: "#ffd166", // Yellow for PriScylla
};

const OWNER_TEXT_COLOR: Record<string, string> = {
  animal: "#9b5de5",
  priscylla: "#ffd166",
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "#e05c5c",
  medium: "#fee440",
  low: "#888",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setError(null);
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setTasks([]);
      } else {
        // Combine tasks and completed
        const allTasks = [...(data.tasks || []), ...(data.completed || [])];
        setTasks(allTasks);
      }
    } catch (err) {
      setError("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    setUpdating(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTasks();
      } else {
        setError(data.error || "Failed to update task");
      }
    } catch (err) {
      setError("Failed to update task");
    } finally {
      setUpdating(null);
    }
  };

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");
  const priTasks = openTasks.filter((t) => t.owner === "priscylla");
  const aniTasks = openTasks.filter((t) => t.owner === "animal");

  const TaskCard = ({ task }: { task: Task }) => {
    const isPending = task.status === "pending";
    const isInProgress = task.status === "in-progress";
    const isBlocked = task.status === "blocked";
    const isUpdating = updating === task.id;

    return (
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderLeft: `4px solid ${OWNER_COLOR[task.owner]}`,
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 10,
          opacity: isUpdating ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium,
              marginTop: 5,
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.4 }}>
            {task.title}
          </span>
        </div>
        {task.notes && (
          <div style={{ marginTop: 6, marginLeft: 16, fontSize: "0.78rem", color: "var(--muted)" }}>
            {task.notes}
          </div>
        )}
        <div style={{ marginTop: 10, marginLeft: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: "0.7rem",
            color: isBlocked ? "#e05c5c" : isInProgress ? "#00c87c" : "var(--muted)",
            background: isBlocked ? "rgba(224,92,92,0.1)" : isInProgress ? "rgba(0,200,124,0.1)" : "rgba(255,255,255,0.05)",
            padding: "2px 8px",
            borderRadius: 4,
          }}>
            {STATUS_LABEL[task.status]}
          </span>
          
          {isPending && (
            <button
              onClick={() => updateTaskStatus(task.id, "in-progress")}
              disabled={isUpdating}
              style={{
                fontSize: "0.7rem",
                padding: "3px 10px",
                background: "#00c87c",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: isUpdating ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {isUpdating ? "..." : "Start →"}
            </button>
          )}
          
          {isInProgress && (
            <button
              onClick={() => updateTaskStatus(task.id, "done")}
              disabled={isUpdating}
              style={{
                fontSize: "0.7rem",
                padding: "3px 10px",
                background: "#9b5de5",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: isUpdating ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {isUpdating ? "..." : "✓ Finish"}
            </button>
          )}
          
          {(isInProgress || isBlocked) && (
            <button
              onClick={() => updateTaskStatus(task.id, "pending")}
              disabled={isUpdating}
              style={{
                fontSize: "0.7rem",
                padding: "3px 8px",
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                cursor: isUpdating ? "not-allowed" : "pointer",
              }}
            >
              {isUpdating ? "..." : "↺ Reset"}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)" }}>✅ Open Tasks</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
          ✅ Open Tasks
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>
          What needs to happen — color coded by owner
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: "rgba(224,92,92,0.1)",
          border: "1px solid rgba(224,92,92,0.3)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 20,
          color: "#e05c5c",
          fontSize: "0.85rem",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total open", value: openTasks.length, color: "var(--text)" },
          { label: "ANIMAL's", value: aniTasks.length, color: "#9b5de5" },
          { label: "PriScylla's", value: priTasks.length, color: "#ffd166" },
          { label: "Completed", value: doneTasks.length, color: "#00c87c" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 16px",
              minWidth: 90,
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns - ANIMAL on left (purple), PriScylla on right (yellow) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
        {/* ANIMAL column (left) - Purple */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: "2px solid #9b5de5",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🟣</span>
            <span style={{ fontWeight: 700, color: "#9b5de5", fontSize: "0.95rem" }}>ANIMAL</span>
            <span
              style={{
                background: "#9b5de5",
                color: "#fff",
                borderRadius: 12,
                padding: "1px 8px",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              {aniTasks.length}
            </span>
          </div>
          {aniTasks.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "0.82rem", padding: "12px 0" }}>
              No tasks here 🎉
            </div>
          ) : (
            aniTasks.map((t) => <TaskCard key={t.id} task={t} />)
          )}
        </div>

        {/* PriScylla column (right) - Yellow */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              paddingBottom: 10,
              borderBottom: "2px solid #ffd166",
            }}
          >
            <span style={{ fontSize: "1rem" }}>🟡</span>
            <span style={{ fontWeight: 700, color: "#ffd166", fontSize: "0.95rem" }}>PriScylla</span>
            <span
              style={{
                background: "#ffd166",
                color: "#000",
                borderRadius: 12,
                padding: "1px 8px",
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            >
              {priTasks.length}
            </span>
          </div>
          {priTasks.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: "0.82rem", padding: "12px 0" }}>
              No tasks here 🎉
            </div>
          ) : (
            priTasks.map((t) => <TaskCard key={t.id} task={t} />)
          )}
        </div>
      </div>

      {/* Completed section - Collapsible */}
      {doneTasks.length > 0 && <CompletedSection doneTasks={doneTasks} />}
    </div>
  );
}

// Collapsible Completed Section Component
function CompletedSection({ doneTasks }: { doneTasks: Task[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginTop: 32 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          color: "var(--muted)",
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          marginBottom: isOpen ? 14 : 0,
        }}
      >
        <span style={{ 
          transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "inline-block",
        }}>▶</span>
        ✅ Recently Completed ({doneTasks.length})
      </button>
      
      {isOpen && (
        <div style={{ opacity: 0.75, animation: "fadeIn 0.2s ease" }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 0.75; transform: translateY(0); }
            }
          `}</style>
          {doneTasks.slice(-5).reverse().map((t) => (
            <div
              key={t.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 8,
                fontSize: "0.85rem",
              }}
            >
              <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>{t.title}</span>
              {t.notes && (
                <span style={{ color: "var(--muted)", fontSize: "0.75rem", marginLeft: 8 }}>
                  — {t.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
