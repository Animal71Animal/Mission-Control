"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  muscle: string;
  notes: string;
}

interface WorkoutLog {
  date: string;
  completed: boolean;
  exercises: Record<string, { weight: number; repsDone: number[]; completed: boolean[] }>;
}

interface WorkoutData {
  logs: Record<string, WorkoutLog>;
  weights: Record<string, number>;
}

const EXERCISES: Exercise[] = [
  { id: "leg-ext", name: "Leg Extension", sets: 3, reps: "12", muscle: "Quads", notes: "Squeeze at top, control down" },
  { id: "leg-curl", name: "Leg Curl", sets: 3, reps: "12", muscle: "Hamstrings", notes: "No swinging — slow and controlled" },
  { id: "chest-press", name: "Chest Press", sets: 3, reps: "10–12", muscle: "Chest", notes: "Full range, don't lock elbows" },
  { id: "lat-pull", name: "Lat Pulldown", sets: 3, reps: "10–12", muscle: "Back", notes: "Pull to upper chest, squeeze shoulder blades" },
  { id: "low-row", name: "Low Row", sets: 3, reps: "12", muscle: "Back", notes: "Elbows close to body, squeeze back" },
  { id: "pec-fly", name: "Pec Fly", sets: 2, reps: "12", muscle: "Chest", notes: "Gentle stretch, squeeze chest" },
  { id: "preacher-curl", name: "Preacher Curl", sets: 2, reps: "12", muscle: "Biceps", notes: "No swinging, full extension at bottom" },
  { id: "ab-crunch", name: "Ab Crunch", sets: 3, reps: "15", muscle: "Core", notes: "Exhale on crunch, hold 1 sec" },
];

const WEEKLY_STRUCTURE = [
  { day: "Mon", focus: "Full Body", type: "workout" },
  { day: "Tue", focus: "Full Body", type: "workout" },
  { day: "Wed", focus: "Rest / Walk", type: "rest" },
  { day: "Thu", focus: "Full Body", type: "workout" },
  { day: "Fri", focus: "Full Body", type: "workout" },
  { day: "Sat", focus: "Active Recovery", type: "rest" },
  { day: "Sun", focus: "Rest", type: "rest" },
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getDayName() {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
}

export default function WorkoutPage() {
  const [logs, setLogs] = useState<Record<string, WorkoutLog>>({});
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [repsDone, setRepsDone] = useState<Record<string, number[]>>({});
  const [checked, setChecked] = useState<Record<string, boolean[]>>({});
  const [todayComplete, setTodayComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  const todayKey = getTodayKey();
  const todayDay = getDayName();
  const todayPlan = WEEKLY_STRUCTURE.find((d) => d.day === todayDay);

  // Load from GitHub API on mount
  useEffect(() => {
    fetch("/api/workout")
      .then((res) => res.json())
      .then((data: WorkoutData) => {
        setLogs(data.logs || {});
        setWeights(data.weights || {});

        // Restore today's session if it exists
        if (data.logs && data.logs[todayKey]) {
          const todayLog = data.logs[todayKey];
          const r: Record<string, number[]> = {};
          const c: Record<string, boolean[]> = {};
          Object.entries(todayLog.exercises).forEach(([id, exData]: [string, any]) => {
            r[id] = exData.repsDone || new Array(EXERCISES.find((e) => e.id === id)?.sets || 3).fill(0);
            c[id] = exData.completed || new Array(EXERCISES.find((e) => e.id === id)?.sets || 3).fill(false);
          });
          setRepsDone(r);
          setChecked(c);
          setTodayComplete(todayLog.completed);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-save to GitHub when state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(checked).length > 0 || Object.keys(repsDone).length > 0) {
        syncToGitHub();
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [checked, repsDone, weights]);

  const syncToGitHub = async () => {
    const exerciseData: Record<string, any> = {};
    EXERCISES.forEach((ex) => {
      exerciseData[ex.id] = {
        weight: weights[ex.id] || 0,
        repsDone: repsDone[ex.id] || new Array(ex.sets).fill(0),
        completed: checked[ex.id] || new Array(ex.sets).fill(false),
      };
    });

    try {
      await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayKey, completed: todayComplete, exercises: exerciseData }),
      });
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch {
      setSaveStatus("Save failed");
    }
  };

  const saveLog = async (complete: boolean) => {
    const exerciseData: Record<string, any> = {};
    EXERCISES.forEach((ex) => {
      exerciseData[ex.id] = {
        weight: weights[ex.id] || 0,
        repsDone: repsDone[ex.id] || new Array(ex.sets).fill(0),
        completed: checked[ex.id] || new Array(ex.sets).fill(false),
      };
    });

    const newLog: WorkoutLog = { date: todayKey, completed: complete, exercises: exerciseData };
    const updated = { ...logs, [todayKey]: newLog };
    setLogs(updated);
    setTodayComplete(complete);

    try {
      await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayKey, completed: complete, exercises: exerciseData }),
      });
      setSaveStatus(complete ? "Workout saved!" : "Updated");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch {
      setSaveStatus("Save failed");
    }
  };

  const toggleSet = (exId: string, setIndex: number) => {
    setChecked((prev) => {
      const curr = prev[exId] || new Array(EXERCISES.find((e) => e.id === exId)!.sets).fill(false);
      const next = [...curr];
      next[setIndex] = !next[setIndex];
      return { ...prev, [exId]: next };
    });
  };

  const setReps = (exId: string, setIndex: number, val: number) => {
    setRepsDone((prev) => {
      const curr = prev[exId] || new Array(EXERCISES.find((e) => e.id === exId)!.sets).fill(0);
      const next = [...curr];
      next[setIndex] = val;
      return { ...prev, [exId]: next };
    });
  };

  const setWeight = (exId: string, val: number) => {
    setWeights((prev) => ({ ...prev, [exId]: val }));
  };

  const completedSets = Object.values(checked).flat().filter(Boolean).length;
  const totalSets = EXERCISES.reduce((sum, e) => sum + e.sets, 0);
  const progressPct = Math.round((completedSets / totalSets) * 100);

  const streak = (() => {
    let s = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (logs[key]?.completed) { s++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return s;
  })();

  const thisWeekWorkouts = (() => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);
    let count = 0;
    for (let i = 0; i <= dayOfWeek; i++) {
      const check = new Date(startOfWeek);
      check.setDate(startOfWeek.getDate() + i);
      const key = check.toISOString().split("T")[0];
      if (logs[key]?.completed) count++;
    }
    return count;
  })();

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🏋️ Workout Tracker</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            🏋️ Workout Tracker
          </h1>
          {saveStatus && (
            <span style={{ fontSize: "0.75rem", color: saveStatus.includes("failed") ? "#f15b5b" : "#00f5d4", fontWeight: 600 }}>
              {saveStatus}
            </span>
          )}
        </div>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Marcy MP-2500 — Full-body beginner routine
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#00f5d4" }}>{streak}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Day Streak</div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#9b5de5" }}>{thisWeekWorkouts}/4</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>This Week</div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fee440" }}>{progressPct}%</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>Today's Progress</div>
          </div>
        </Card>
      </div>

      {/* Today's Plan */}
      <Card style={{ marginBottom: 24, borderLeft: "3px solid #00f5d4" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              Today: {todayDay} — {todayPlan?.focus}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
              {todayPlan?.type === "workout" ? "8 exercises · ~35 min · Warm up first" : "Rest day — light walk or stretch"}
            </p>
          </div>
          {todayPlan?.type === "workout" && (
            <button
              onClick={() => saveLog(!todayComplete)}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: todayComplete ? "#f15b5b" : "#00f5d4",
                color: todayComplete ? "#fff" : "#000",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              {todayComplete ? "Undo Complete" : "✓ Mark Complete"}
            </button>
          )}
        </div>
      </Card>

      {/* Progress Bar */}
      {todayPlan?.type === "workout" && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)", marginBottom: 6 }}>
            <span>Progress</span>
            <span>{completedSets}/{totalSets} sets</span>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "#00f5d4", borderRadius: 4, transition: "width 0.3s ease" }} />
          </div>
        </div>
      )}

      {/* Exercise List */}
      {todayPlan?.type === "workout" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {EXERCISES.map((ex, idx) => {
            const exChecked = checked[ex.id] || new Array(ex.sets).fill(false);
            const exReps = repsDone[ex.id] || new Array(ex.sets).fill(0);
            const exWeight = weights[ex.id] || 0;
            const exComplete = exChecked.every(Boolean);

            return (
              <Card
                key={ex.id}
                style={{
                  borderLeft: exComplete ? "3px solid #00f5d4" : "3px solid var(--border)",
                  opacity: exComplete ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: exComplete ? "#00f5d4" : "var(--border)",
                    color: exComplete ? "#000" : "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>
                        {ex.name}
                      </h4>
                      <span style={{ fontSize: "0.7rem", color: "#9b5de5", background: "rgba(155,93,229,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                        {ex.muscle}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "0 0 10px" }}>{ex.notes}</p>

                    {/* Weight Input */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Weight (plates):</span>
                      <input
                        type="number"
                        value={exWeight || ""}
                        onChange={(e) => setWeight(ex.id, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        style={{
                          width: 60,
                          padding: "4px 8px",
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          background: "var(--bg)",
                          color: "var(--text)",
                          fontSize: "0.85rem",
                        }}
                      />
                    </div>

                    {/* Sets */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.from({ length: ex.sets }).map((_, setIdx) => (
                        <div
                          key={setIdx}
                          onClick={() => toggleSet(ex.id, setIdx)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 10px",
                            borderRadius: 8,
                            border: `1px solid ${exChecked[setIdx] ? "#00f5d4" : "var(--border)"}`,
                            background: exChecked[setIdx] ? "rgba(0,245,212,0.1)" : "var(--bg)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `2px solid ${exChecked[setIdx] ? "#00f5d4" : "var(--muted)"}`,
                            background: exChecked[setIdx] ? "#00f5d4" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            {exChecked[setIdx] && <span style={{ fontSize: "0.7rem", color: "#000" }}>✓</span>}
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500 }}>
                            Set {setIdx + 1}
                          </span>
                          <input
                            type="number"
                            value={exReps[setIdx] || ""}
                            onChange={(e) => {
                              e.stopPropagation();
                              setReps(ex.id, setIdx, parseInt(e.target.value) || 0);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={ex.reps}
                            style={{
                              width: 40,
                              padding: "2px 6px",
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              background: "var(--bg)",
                              color: "var(--text)",
                              fontSize: "0.75rem",
                              textAlign: "center",
                            }}
                          />
                          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>reps</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rest Day Message */}
      {todayPlan?.type === "rest" && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🛌</div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Rest Day
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Recovery is when muscle grows. Take a light walk, stretch, or foam roll.<br />
            Back at it tomorrow.
          </p>
        </Card>
      )}

      {/* Weekly Schedule */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          Weekly Schedule
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {WEEKLY_STRUCTURE.map((d) => {
            const isToday = d.day === todayDay;
            const dateKey = (() => {
              const today = new Date();
              const dayIdx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(d.day);
              const diff = dayIdx - today.getDay();
              const target = new Date(today);
              target.setDate(today.getDate() + diff);
              return target.toISOString().split("T")[0];
            })();
            const done = logs[dateKey]?.completed;

            return (
              <div
                key={d.day}
                style={{
                  textAlign: "center",
                  padding: "10px 4px",
                  borderRadius: 8,
                  border: isToday ? "1px solid #00f5d4" : "1px solid var(--border)",
                  background: done ? "rgba(0,245,212,0.1)" : isToday ? "rgba(0,245,212,0.05)" : "var(--card)",
                }}
              >
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: isToday ? "#00f5d4" : "var(--muted)" }}>
                  {d.day}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text)", marginTop: 4 }}>
                  {d.type === "workout" ? "🏋️" : "🛌"}
                </div>
                {done && <div style={{ fontSize: "0.6rem", color: "#00f5d4", marginTop: 2 }}>✓ Done</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules */}
      <div style={{ marginTop: 32, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          ⚡ Rules
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.8 }}>
          <li>Start at the lightest weight you can control with perfect form</li>
          <li>If you can't finish all reps, drop weight next set</li>
          <li>Add 1 plate when you hit all reps with good form for 2 workouts straight</li>
          <li>Rest 60–90 seconds between sets</li>
          <li>Exhale on the hard part, inhale on the return</li>
          <li>Log every session — progress is the best motivation</li>
        </ul>
      </div>
    </div>
  );
}
