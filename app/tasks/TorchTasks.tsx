"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: string;
  due_date?: string | null;
}

const CATEGORIES = ["All", "Setup", "Maintenance", "Lighting", "Video", "Audio", "Media", "IT", "Equipment", "Music", "Communication", "Marketing"];
const PRIORITIES = ["high", "medium", "low"];

const priorityColor: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

function isOverdue(due: string | null | undefined) {
  if (!due) return false;
  return new Date(due + "T12:00:00") < new Date();
}

export default function TorchTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ text: "", category: "Setup", priority: "medium", due_date: "" });

  useEffect(() => {
    fetch("/api/srb-todo").then(r => r.json()).then(data => {
      setTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    setSaving(true);
    await fetch("/api/srb-todo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });
    setSaving(false);
  };

  const openAdd = () => {
    setEditTask(null);
    setForm({ text: "", category: "Setup", priority: "medium", due_date: "" });
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setForm({ text: task.text, category: task.category, priority: task.priority, due_date: task.due_date || "" });
    setShowModal(true);
  };

  const submitForm = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    if (editTask) {
      const updated = { ...editTask, ...form };
      setTasks(prev => prev.map(t => t.id === editTask.id ? updated : t));
      await fetch("/api/srb-todo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTask.id, ...form }),
      });
    } else {
      const res = await fetch("/api/srb-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, completed: false }),
      });
      const data = await res.json();
      if (data.task) setTasks(prev => [...prev, data.task]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/srb-todo?id=${id}`, { method: "DELETE" });
  };

  const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aOverdue = isOverdue(a.due_date) ? 0 : 1;
    const bOverdue = isOverdue(b.due_date) ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    if (a.due_date && !b.due_date) return -1;
    if (!a.due_date && b.due_date) return 1;
    if (a.due_date && b.due_date) {
      const diff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (diff !== 0) return diff;
    }
    return (priorityRank[a.priority] ?? 2) - (priorityRank[b.priority] ?? 2);
  });

  const allFiltered = filter === "All" ? sorted : sorted.filter(t => t.category === filter);
  const filtered = allFiltered.filter(t => !t.completed);
  const completedTasks = allFiltered.filter(t => t.completed);
  const done = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  return (
    <div>
      {/* Header with torch logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, padding: "12px 16px", background: "linear-gradient(135deg, rgba(236, 72, 153, 0.06), rgba(239, 68, 68, 0.06))", border: "1px solid rgba(236, 72, 153, 0.25)", borderRadius: 12 }}>
        <img src="/torch-logo-clean.png" alt="The Torch" style={{ height: 56, width: "auto", filter: "drop-shadow(0 0 8px rgba(236, 72, 153, 0.25))" }} />
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: "1.2rem", fontWeight: 700, margin: 0,
            background: "linear-gradient(135deg, var(--torch-pink), var(--torch-red))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Club To-Do List</h2>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>The Torch · Boise, ID</span>
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{done} / {tasks.length} done {saving && "· saving..."}</span>
      </div>

      <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--torch-pink), var(--torch-red))", borderRadius: 3, transition: "width 0.3s" }} />
      </div>

      <button onClick={openAdd} style={{
        padding: "8px 18px", borderRadius: 8, background: "var(--torch-pink)", border: "none",
        color: "#000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", marginBottom: 20,
      }}>+ Add Task</button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: "0.8rem", cursor: "pointer",
            background: filter === c ? "var(--torch-pink)" : "var(--card)",
            border: "1px solid var(--border)",
            color: filter === c ? "#000" : "var(--text)",
            fontWeight: filter === c ? 700 : 400,
          }}>{c}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(task => {
            const overdue = !task.completed && isOverdue(task.due_date);
            return (
              <div key={task.id} style={{
                background: "var(--card)",
                border: `1px solid ${overdue ? "#ef4444" : "var(--border)"}`,
                borderLeft: `4px solid ${overdue ? "#ef4444" : task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#f59e0b" : "var(--border)"}`,
                borderRadius: 10, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 12,
                opacity: task.completed ? 0.5 : 1,
              }}>
                <div onClick={() => toggle(task.id)} style={{
                  width: 20, height: 20, borderRadius: 4, border: "2px solid var(--torch-pink)",
                  background: task.completed ? "var(--torch-pink)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, cursor: "pointer",
                }}>
                  {task.completed && <span style={{ color: "#000", fontSize: 12 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", color: "var(--text)", textDecoration: task.completed ? "line-through" : "none", marginBottom: 4 }}>
                    {task.text}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{task.category}</span>
                    {task.priority && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: `${priorityColor[task.priority]}22`, color: priorityColor[task.priority] }}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    )}
                    {task.due_date && (
                      <span style={{ fontSize: "0.72rem", color: overdue ? "#ef4444" : "var(--muted)" }}>
                        📅 {new Date(task.due_date + "T12:00:00").toLocaleDateString()}
                        {overdue && <span style={{ marginLeft: 4, fontWeight: 700 }}>⚠ OVERDUE</span>}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => openEdit(task)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--torch-pink)", fontSize: "0.8rem" }}>✏️</button>
                  <button onClick={() => deleteTask(task.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "#ef4444", fontSize: "0.8rem" }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: "90%", maxWidth: 480 }}>
            <h3 style={{ margin: "0 0 20px", color: "var(--text)" }}>{editTask ? "Edit Task" : "Add Task"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Task</label>
                <input value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What needs to be done?"
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }}>
                    {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Due Date (optional)</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
              <button onClick={submitForm} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--torch-pink)", border: "none", color: "#000", fontWeight: 700, cursor: "pointer" }}>{editTask ? "Save Changes" : "Add Task"}</button>
            </div>
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => setShowCompleted(s => !s)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.85rem", padding: 0 }}>
            <span style={{ transform: showCompleted ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
            Completed ({completedTasks.length})
          </button>
          {showCompleted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {completedTasks.map(task => (
                <div key={task.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, opacity: 0.45 }}>
                  <div onClick={() => toggle(task.id)} style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid var(--torch-pink)", background: "var(--torch-pink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                    <span style={{ color: "#000", fontSize: 12 }}>✓</span>
                  </div>
                  <div style={{ flex: 1, fontSize: "0.9rem", color: "var(--text)", textDecoration: "line-through" }}>{task.text}</div>
                  <button onClick={() => deleteTask(task.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "#ef4444", fontSize: "0.8rem" }}>🗑</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
