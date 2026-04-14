"use client";

import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import TodoList from "@/components/TodoList";

const todoItems = [
  { id: "1", text: "Set up studio workflow", completed: false, category: "Setup", priority: "high" as const },
  { id: "2", text: "Calibrate monitoring", completed: false, category: "Setup", priority: "high" as const },
  { id: "3", text: "Test recording chain", completed: false, category: "Testing", priority: "medium" as const },
  { id: "4", text: "Organize sample library", completed: false, category: "Organization", priority: "medium" as const },
  { id: "5", text: "Document session presets", completed: false, category: "Documentation", priority: "low" as const },
];

const categories = ["All", "Setup", "Testing", "Organization", "Documentation", "Maintenance"];

export default function JoulesClaw() {
  return (
    <div className="page-container">
      <PageHeader
        title="Joules Claw"
        subtitle="Production and workflow management"
        icon="⚡"
      />

      <div style={{ maxWidth: 900 }}>
        <TodoList
          title="Production To-Do List"
          items={todoItems}
          categories={categories}
          storageKey="joules-claw-todos"
        />
      </div>

      {/* Info Card */}
      <div style={{ marginTop: 24, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ⚡ About Joules Claw
        </h3>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
          Central hub for production workflows, studio setup, and creative projects. Track tasks, maintain setup documentation, and coordinate creative output.
        </p>
      </div>
    </div>
  );
}
