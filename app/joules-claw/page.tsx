"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: string;
}

const CATEGORIES = ["All", "Setup", "Testing", "Organization", "Documentation", "Maintenance"];

export default function JoulesClaw() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/joules-todo").then(r => r.json()).then(data => {
      setTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = !task.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: updated } : t));
    setSaving(true);
    await fetch("/api/joules-todo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: updated }),
    });
    setSaving(false);
  };

  const filtered = filter === "All" ? tasks : tasks.filter(t => t.category === filter);
  const done = tasks.filter(t => t.completed).length;

  return (
    <div className="page-container">
      <PageHeader title="Joules Claw" subtitle="Production and workflow management" icon="⚡" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          {done}/{tasks.length} complete {saving && "· saving..."}
        </span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: "0.75rem",
              background: filter === c ? "var(--accent)" : "var(--card)",
              border: "1px solid var(--border)", color: filter === c ? "#000" : "var(--muted)",
              cursor: "pointer"
            }}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(task => (
            <div key={task.id} onClick={() => toggle(task.id)} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
              padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
              opacity: task.completed ? 0.5 : 1, transition: "opacity 0.2s",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, border: "2px solid var(--accent)",
                background: task.completed ? "var(--accent)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {task.completed && <span style={{ color: "#000", fontSize: 12 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text)", textDecoration: task.completed ? "line-through" : "none" }}>
                  {task.text}
                </span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "var(--bg)", padding: "2px 6px", borderRadius: 4 }}>
                  {task.category}
                </span>
                {task.priority === "high" && (
                  <span style={{ fontSize: "0.7rem", color: "#f15bb5", background: "rgba(241,91,181,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                    HIGH
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
          ⚡ Central hub for production workflows, studio setup, and creative projects. Changes save directly to GitHub — persistent across all devices.
        </p>
      </div>
    </div>
  );
}
