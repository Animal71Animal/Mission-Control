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

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved completion state with current items
        const merged = items.map(item => {
          const savedItem = parsed.find((s: TodoItem) => s.id === item.id);
          return savedItem ? { ...item, completed: savedItem.completed } : item;
        });
        setTodos(merged);
      } catch {
        setTodos(items);
      }
    }
  }, [items, storageKey]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(storageKey, JSON.stringify(todos));
    }
  }, [todos, storageKey, mounted]);

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const filteredTodos = filter === "All" 
    ? todos 
    : todos.filter(todo => todo.category === filter);

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  if (!mounted) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ color: "var(--accent)" }}>
          {title}
        </h2>
        <span className="text-sm text-gray-400">
          {completedCount} / {todos.length} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${progress}%`,
            background: "linear-gradient(90deg, #9b5de5, #c77dff)"
          }}
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === cat 
                ? "bg-purple-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="space-y-2">
        {filteredTodos.map(todo => (
          <div
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
              todo.completed 
                ? "bg-gray-800/50 opacity-60" 
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              todo.completed 
                ? "bg-green-500 border-green-500" 
                : "border-gray-500 hover:border-purple-400"
            }`}>
              {todo.completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <span className={`block ${todo.completed ? "line-through text-gray-500" : "text-gray-200"}`}>
                {todo.text}
              </span>
              <span className="text-xs text-gray-500 mt-1 block">
                {todo.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No tasks in this category.
        </p>
      )}
    </div>
  );
}
