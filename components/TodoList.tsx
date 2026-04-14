"use client";

import { useEffect, useState } from "react";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
}

interface TodoListProps {
  title: string;
  items: TodoItem[];
  categories: string[];
  storageKey: string;
}

export default function TodoList({ title, items, categories, storageKey }: TodoListProps) {
  const [todos, setTodos] = useState<TodoItem[]>(items);
  const [filter, setFilter] = useState("All");
  const [mounted, setMounted] = useState(false);

  // Add/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formText, setFormText] = useState("");
  const [formCategory, setFormCategory] = useState(categories.filter((c) => c !== "All")[0] || "General");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = items.map((item) => {
          const savedItem = parsed.find((s: TodoItem) => s.id === item.id);
          return savedItem ? { ...item, completed: savedItem.completed } : item;
        });
        // Append any user-added tasks not in original items
        const userAdded = parsed.filter((s: TodoItem) => !items.find((i) => i.id === s.id));
        setTodos([...merged, ...userAdded]);
      } catch {
        setTodos(items);
      }
    }
  }, [items, storageKey]);

  useEffect(() => {
    if (mounted) localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [todos, storageKey, mounted]);

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setFormText(todo.text);
    setFormCategory(todo.category);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormText("");
    setFormCategory(categories.filter((c) => c !== "All")[0] || "General");
  };

  const handleSubmit = () => {
    if (!formText.trim()) return;
    if (editingId) {
      setTodos((prev) => prev.map((t) => t.id === editingId ? { ...t, text: formText.trim(), category: formCategory } : t));
    } else {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}`,
        text: formText.trim(),
        category: formCategory,
        completed: false,
      };
      setTodos((prev) => [...prev, newTodo]);
    }
    cancelForm();
  };

  const deleteTodo = (id: string) => {
    if (confirm("Delete this task?")) setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = filter === "All" ? todos : todos.filter((t) => t.category === filter);
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;
  const allCategories = Array.from(new Set(["All", ...todos.map((t) => t.category)]));

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
    borderRadius: 6, padding: "9px 12px", color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box",
  };

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent)", margin: 0 }}>{title}</h2>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{completedCount} / {todos.length} done</span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: "100%", background: "#374151", borderRadius: 9999, height: 8, marginBottom: 16 }}>
        <div style={{ height: 8, borderRadius: 9999, background: "linear-gradient(90deg, #9b5de5, #c77dff)", width: `${progress}%`, transition: "width 0.3s ease" }} />
      </div>

      {/* Add Task Button */}
      {!showForm && (
        <button
          onClick={() => { cancelForm(); setShowForm(true); }}
          style={{ background: "#9b5de5", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", marginBottom: 14 }}>
          + Add Task
        </button>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <p style={{ margin: "0 0 10px", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{editingId ? "✏️ Edit Task" : "➕ New Task"}</p>
          <input type="text" placeholder="Task description..." value={formText} onChange={(e) => setFormText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} style={{ ...inputStyle, marginBottom: 8 }} autoFocus />
          <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", color: "var(--text)", fontSize: "0.85rem", marginBottom: 10 }}>
            {categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleSubmit} disabled={!formText.trim()}
              style={{ background: "#00c87c", color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
              {editingId ? "Save" : "Add"}
            </button>
            <button onClick={cancelForm}
              style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 14px", fontSize: "0.8rem", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {allCategories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{ padding: "4px 12px", borderRadius: 9999, fontSize: "0.8rem", border: "none", cursor: "pointer", background: filter === cat ? "#7c3aed" : "#374151", color: filter === cat ? "#fff" : "#d1d5db", transition: "all 0.15s" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {filteredTodos.map((todo) => (
          <div key={todo.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: todo.completed ? "rgba(55,65,81,0.4)" : "#1f2937", opacity: todo.completed ? 0.65 : 1, transition: "all 0.15s" }}>
            {/* Checkbox */}
            <div onClick={() => toggleTodo(todo.id)} style={{ cursor: "pointer", width: 20, height: 20, borderRadius: 4, border: todo.completed ? "2px solid #22c55e" : "2px solid #6b7280", background: todo.completed ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {todo.completed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            {/* Text */}
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggleTodo(todo.id)}>
              <span style={{ fontSize: "0.9rem", color: todo.completed ? "#6b7280" : "#e5e7eb", textDecoration: todo.completed ? "line-through" : "none" }}>{todo.text}</span>
              <span style={{ fontSize: "0.7rem", color: "#6b7280", display: "block", marginTop: 2 }}>{todo.category}</span>
            </div>
            {/* Edit/Delete */}
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <button onClick={(e) => { e.stopPropagation(); startEdit(todo); }}
                style={{ background: "rgba(0,187,249,0.1)", border: "1px solid rgba(0,187,249,0.25)", borderRadius: 4, padding: "3px 8px", fontSize: "0.7rem", color: "#00bbf9", cursor: "pointer" }}>
                ✏️
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                style={{ background: "rgba(224,92,92,0.1)", border: "1px solid rgba(224,92,92,0.25)", borderRadius: 4, padding: "3px 8px", fontSize: "0.7rem", color: "#e05c5c", cursor: "pointer" }}>
                🗑
              </button>
            </div>
          </div>
        ))}
        {filteredTodos.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--muted)", padding: "24px 0" }}>No tasks in this category.</p>
        )}
      </div>
    </div>
  );
}
