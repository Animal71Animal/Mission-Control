"use client";

import { useState, useEffect, useCallback } from "react";

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

const CATEGORIES = ["Personal", "Work", "Health", "Finance", "Shopping", "Other"];

const PRIORITY_COLORS = {
  high: "#e05c5c",
  medium: "#fee440",
  low: "#888",
};

const CATEGORY_COLORS: Record<string, string> = {
  Personal: "#9b5de5",
  Work: "#00bbf9",
  Health: "#00f5d4",
  Finance: "#f15bb5",
  Shopping: "#f19b5b",
  Other: "#888",
};

async function saveTasks(tasks: PersonalTask[]) {
  await fetch("/api/personal-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tasks),
  });
}

export default function PersonalTasksPage() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("open");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Form state
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("");

  // Load from API on mount
  useEffect(() => {
    fetch("/api/personal-tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Persist to API whenever tasks change (after initial load)
  const persistTasks = useCallback((updated: PersonalTask[]) => {
    setTasks(updated);
    saveTasks(updated);
  }, []);

  const addTask = () => {
    if (!title.trim()) return;

    const newTask: PersonalTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      priority,
      dueDate: dueDate || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    persistTasks([newTask, ...tasks]);
    resetForm();
    setShowAdd(false);
  };

  const updateTask = () => {
    if (!editingId || !title.trim()) return;

    persistTasks(
      tasks.map((t) =>
        t.id === editingId
          ? {
              ...t,
              title: title.trim(),
              notes: notes.trim() || undefined,
              category,
              priority,
              dueDate: dueDate || undefined,
            }
          : t
      )
    );
    resetForm();
    setEditingId(null);
  };

  const toggleComplete = (id: string) => {
    persistTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
    );
  };

  const deleteTask = (id: string) => {
    if (confirm("Delete this task?")) {
      persistTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const startEdit = (task: PersonalTask) => {
    setEditingId(task.id);
    setTitle(task.title);
    setNotes(task.notes || "");
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.dueDate || "");
    setShowAdd(true);
  };

  const resetForm = () => {
    setTitle("");
    setNotes("");
    setCategory("Personal");
    setPriority("medium");
    setDueDate("");
  };

  const cancelEdit = () => {
    resetForm();
    setShowAdd(false);
    setEditingId(null);
  };

  // Filter tasks
  let filteredTasks = tasks;
  if (filter === "open") filteredTasks = tasks.filter((t) => !t.completed);
  if (filter === "completed") filteredTasks = tasks.filter((t) => t.completed);
  if (categoryFilter !== "all") filteredTasks = filteredTasks.filter((t) => t.category === categoryFilter);

  // Sort: open first, then by priority, then by due date
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  const openCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  if (!loaded) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>📝 Personal Tasks</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
          📝 Personal Tasks
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>
          Your to-do list — synced across all devices
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Open", value: openCount, color: "var(--text)" },
          { label: "Completed", value: completedCount, color: "#00c87c" },
          { label: "Total", value: tasks.length, color: "var(--muted)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 16px",
              minWidth: 80,
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      {!showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "#9b5de5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          + Add Task
        </button>
      )}

      {/* Add/Edit Form */}
      {showAdd && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 12px", fontSize: "1rem", color: "var(--text)" }}>
            {editingId ? "Edit Task" : "New Task"}
          </h3>

          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "10px 12px",
              color: "var(--text)",
              fontSize: "0.9rem",
              marginBottom: 10,
            }}
          />

          <textarea
            placeholder="Notes (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "10px 12px",
              color: "var(--text)",
              fontSize: "0.85rem",
              marginBottom: 10,
              resize: "vertical",
            }}
          />

          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "var(--text)",
                fontSize: "0.85rem",
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "var(--text)",
                fontSize: "0.85rem",
              }}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "var(--text)",
                fontSize: "0.85rem",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={editingId ? updateTask : addTask}
              style={{
                background: "#00c87c",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {editingId ? "Save Changes" : "Add Task"}
            </button>
            <button
              onClick={cancelEdit}
              style={{
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "open", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as "all" | "open" | "completed")}
            style={{
              background: filter === f ? "#9b5de5" : "transparent",
              color: filter === f ? "#fff" : "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: "0.8rem",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "6px 12px",
            color: "var(--text)",
            fontSize: "0.8rem",
          }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filteredTasks.length === 0 ? (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: "40px 20px" }}>
            {filter === "completed" ? "No completed tasks yet" : "No tasks. Click 'Add Task' to get started."}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderLeft: `4px solid ${CATEGORY_COLORS[task.category]}`,
                borderRadius: 8,
                padding: "14px 16px",
                opacity: task.completed ? 0.6 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  style={{ marginTop: 4, cursor: "pointer" }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: "var(--text)",
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </div>
                  {task.notes && (
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>
                      {task.notes}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: CATEGORY_COLORS[task.category] + "20",
                        color: CATEGORY_COLORS[task.category],
                      }}
                    >
                      {task.category}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: PRIORITY_COLORS[task.priority] + "20",
                        color: PRIORITY_COLORS[task.priority],
                      }}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.completed && task.completedAt && (
                      <span style={{ fontSize: "0.7rem", color: "#00c87c" }}>
                        ✓ Done {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => startEdit(task)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(224,92,92,0.3)",
                      borderRadius: 4,
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      color: "#e05c5c",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
