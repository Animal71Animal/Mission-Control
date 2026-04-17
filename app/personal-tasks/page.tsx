"use client";

import { useState, useEffect } from "react";

interface PersonalTask {
  id: string;
  title: string;
  notes?: string | null;
  category: string;
  priority: "high" | "medium" | "low";
  due_date?: string | null;
  completed: boolean;
  created_at: string;
  completed_at?: string | null;
}

const CATEGORIES = ["Personal", "Work", "Health", "Finance", "Shopping", "Other"];
const PRIORITY_COLORS = { high: "#e05c5c", medium: "#fee440", low: "#888" };
const CATEGORY_COLORS: Record<string, string> = {
  Personal: "#9b5de5", Work: "#00bbf9", Health: "#00f5d4",
  Finance: "#f15bb5", Shopping: "#f19b5b", Other: "#888",
};

async function apiPatch(id: string, changes: Partial<PersonalTask>) {
  await fetch("/api/personal-tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...changes }),
  });
}

async function apiDelete(id: string) {
  await fetch(`/api/personal-tasks?id=${id}`, { method: "DELETE" });
}

async function apiAdd(task: Omit<PersonalTask, "id" | "created_at">) {
  const res = await fetch("/api/personal-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export default function PersonalTasksPage() {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("open");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form state
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetch("/api/personal-tasks")
      .then((r) => r.json())
      .then((data) => { setTasks(Array.isArray(data) ? data : []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const resetForm = () => { setTitle(""); setNotes(""); setCategory("Personal"); setPriority("medium"); setDueDate(""); };

  const startEdit = (task: PersonalTask) => {
    setEditingId(task.id);
    setTitle(task.title);
    setNotes(task.notes || "");
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.due_date || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelForm = () => { resetForm(); setShowForm(false); setEditingId(null); };

  const handleSubmit = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      if (editingId) {
        const changes = { title: title.trim(), notes: notes.trim() || null, category, priority, due_date: dueDate || null };
        await apiPatch(editingId, changes);
        setTasks((prev) => prev.map((t) => t.id === editingId ? { ...t, ...changes } : t));
      } else {
        const result = await apiAdd({ title: title.trim(), notes: notes.trim() || null, category, priority, due_date: dueDate || null, completed: false, completed_at: null });
        if (result.task) setTasks((prev) => [result.task, ...prev]);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (task: PersonalTask) => {
    const changes = { completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null };
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, ...changes } : t));
    await apiPatch(task.id, changes);
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await apiDelete(id);
  };

  let filtered = [...tasks];
  if (filter === "open") filtered = filtered.filter((t) => !t.completed);
  if (filter === "completed") filtered = filtered.filter((t) => t.completed);
  if (categoryFilter !== "all") filtered = filtered.filter((t) => t.category === categoryFilter);
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const po = { high: 0, medium: 1, low: 2 };
    if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return 0;
  });

  const openCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;

  if (!loaded) return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>📝 Personal Tasks</h1>
      <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
    </div>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 6, padding: "10px 12px", color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box",
  };
  const selectStyle: React.CSSProperties = {
    background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 6, padding: "8px 12px", color: "var(--text)", fontSize: "0.85rem",
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>📝 Personal Tasks</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.85rem" }}>Synced — edits save instantly to GitHub</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[{ label: "Open", value: openCount, color: "var(--text)" }, { label: "Done", value: doneCount, color: "#00c87c" }, { label: "Total", value: tasks.length, color: "var(--muted)" }].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 16px", minWidth: 80 }}>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      {!showForm && (
        <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
          style={{ background: "#9b5de5", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", marginBottom: 20 }}>
          + Add Task
        </button>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: "1rem", color: "var(--text)" }}>{editingId ? "✏️ Edit Task" : "➕ New Task"}</h3>
          <input type="text" placeholder="Task title..." value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, marginBottom: 10 }} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          <textarea placeholder="Notes (optional)..." value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={2} style={{ ...inputStyle, marginBottom: 10, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")} style={selectStyle}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={selectStyle} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleSubmit} disabled={saving || !title.trim()}
              style={{ background: saving ? "#555" : "#00c87c", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontSize: "0.85rem", fontWeight: 600, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Task"}
            </button>
            <button onClick={cancelForm}
              style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 18px", fontSize: "0.85rem", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "open", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f as "all" | "open" | "completed")}
            style={{ background: filter === f ? "#9b5de5" : "transparent", color: filter === f ? "#fff" : "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", textTransform: "capitalize" }}>
            {f}
          </button>
        ))}
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", color: "var(--text)", fontSize: "0.8rem" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Task List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ color: "var(--muted)", textAlign: "center", padding: "40px 20px" }}>
            {filter === "completed" ? "No completed tasks yet" : "No tasks. Hit '+ Add Task' to get started."}
          </div>
        ) : (
          filtered.map((task) => (
            <div key={task.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderLeft: `4px solid ${CATEGORY_COLORS[task.category] || "#888"}`, borderRadius: 8, padding: "14px 16px", opacity: task.completed ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} style={{ marginTop: 4, cursor: "pointer", width: 18, height: 18 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text)", textDecoration: task.completed ? "line-through" : "none" }}>
                    {task.title}
                  </div>
                  {task.notes && <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 4 }}>{task.notes}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, background: (CATEGORY_COLORS[task.category] || "#888") + "22", color: CATEGORY_COLORS[task.category] || "#888" }}>{task.category}</span>
                    <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 4, background: PRIORITY_COLORS[task.priority] + "22", color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                    {task.due_date && <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>📅 {new Date(task.due_date + "T12:00:00").toLocaleDateString()}</span>}
                    {task.completed && task.completed_at && <span style={{ fontSize: "0.7rem", color: "#00c87c" }}>✓ {new Date(task.completed_at + "T12:00:00").toLocaleDateString()}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => startEdit(task)}
                    style={{ background: "rgba(0,187,249,0.1)", border: "1px solid rgba(0,187,249,0.3)", borderRadius: 4, padding: "5px 10px", fontSize: "0.75rem", color: "#00bbf9", cursor: "pointer", fontWeight: 500 }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => deleteTask(task.id)}
                    style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.3)", borderRadius: 4, padding: "5px 10px", fontSize: "0.75rem", color: "#e05c5c", cursor: "pointer", fontWeight: 500 }}>
                    🗑
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
