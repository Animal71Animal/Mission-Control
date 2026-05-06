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
  technique: {
    setup: string;
    movement: string;
    tips: string[];
    mistakes: string[];
    videoUrl: string;
  };
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
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    sets: 3, reps: "10–12", muscle: "Back",
    notes: "Pull to upper chest, squeeze shoulder blades",
    technique: {
      setup: "Sit facing the machine. Adjust thigh pad to lock you in place. Grip the lat pulldown bar slightly wider than shoulder-width.",
      movement: "Pull the bar down to your upper chest. Drive elbows down and back. Squeeze shoulder blades together. Return slowly with control.",
      tips: ["Lean back slightly (10–15°)", "Pull with elbows, not hands", "Squeeze lats at the bottom", "Full stretch at the top"],
      mistakes: ["Pulling behind the neck", "Using body momentum", "Shrugging shoulders", "Half reps — not full stretch"],
      videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    },
  },
  {
    id: "chest-press",
    name: "Chest Press",
    sets: 3, reps: "10–12", muscle: "Chest",
    notes: "Full range, don't lock elbows",
    technique: {
      setup: "Sit with back flat against the pad. Grip the chest press handles at chest height. Feet flat on the floor.",
      movement: "Press the handles forward until arms are nearly straight (don't lock elbows). Control the return — feel the stretch in your chest.",
      tips: ["Keep shoulder blades back and down", "Elbows at about 45° from body", "Feel the chest stretch at the bottom"],
      mistakes: ["Locking elbows at top", "Shrugging shoulders", "Bouncing off the chest", "Only doing partial reps"],
      videoUrl: "https://www.youtube.com/watch?v=2y6ntGVg4dw",
    },
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    sets: 3, reps: "12", muscle: "Quads",
    notes: "Squeeze at top, control down",
    technique: {
      setup: "Sit on the machine with back flat against the pad. Adjust the leg pad so it rests on top of your ankles/shins. Grip the side handles for stability.",
      movement: "Extend your legs forward until fully straight. Pause and squeeze your quads for 1 second at the top. Lower slowly — count to 3 on the way down.",
      tips: ["Keep your back glued to the pad — don't arch", "Point toes slightly upward", "Control the negative — don't let the weight slam down"],
      mistakes: ["Using momentum / swinging", "Arching lower back", "Only doing half reps", "Letting weight drop uncontrolled"],
      videoUrl: "https://www.youtube.com/watch?v=8Jqof7zP9Tk",
    },
  },
  {
    id: "standing-tricep-pushdown",
    name: "Standing Tricep Pushdown",
    sets: 3, reps: "12", muscle: "Triceps",
    notes: "Keep elbows locked at sides, push straight down",
    technique: {
      setup: "Stand facing the high pulley. Grip the lat pulldown bar with palms down, hands shoulder-width apart. Elbows tucked tight at your sides.",
      movement: "Push the bar straight down until arms are fully extended. Squeeze triceps hard at the bottom. Return slowly — control the bar on the way up.",
      tips: ["Elbows stay glued to your sides — don't let them flare", "Push down, not out", "Squeeze triceps at full extension", "Control the negative — 2 seconds up"],
      mistakes: ["Flaring elbows out wide", "Using body momentum / leaning", "Partial reps — not full extension", "Letting bar snap back up"],
      videoUrl: "https://www.youtube.com/watch?v=2-LAMcpMYDQ",
    },
  },
  {
    id: "butterfly-chest",
    name: "Butterfly (Chest Fly)",
    sets: 3, reps: "10–12", muscle: "Chest",
    notes: "Slow and controlled, squeeze chest at peak",
    technique: {
      setup: "Sit on the MP-2500 with back flat against the pad. Grip the butterfly handles with palms facing forward. Adjust seat so handles are at chest height. Feet flat on the floor.",
      movement: "Bring the handles together in front of your chest by squeezing your pecs. Pause for 1 second at peak contraction. Return slowly — feel the stretch across your chest. Don't let the weight stack slam.",
      tips: ["Keep a slight bend in elbows — don't lock them straight", "Squeeze chest, not arms", "Control the negative — 2–3 seconds on return", "Full stretch at the bottom, full contraction at top"],
      mistakes: ["Using momentum to swing handles together", "Locking elbows completely straight", "Only doing partial reps", "Letting weight drop uncontrolled on return"],
      videoUrl: "https://www.youtube.com/watch?v=eG-3Wq9D2yY",
    },
  },
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

  // Load from GitHub API on mount, fallback to local JSON
  useEffect(() => {
    fetch("/api/workout")
      .then((res) => res.json())
      .then((data: WorkoutData) => {
        if (data && data.logs) {
          setLogs(data.logs || {});
          setWeights(data.weights || {});

          // Restore today's session if it exists
          if (data.logs && data.logs[todayKey]) {
            const todayLog = data.logs[todayKey];
            const r: Record<string, number[]> = {};
            const c: Record<string, boolean[]> = {};
            const w: Record<string, number> = {};
            Object.entries(todayLog.exercises).forEach(([id, exData]: [string, any]) => {
              r[id] = exData.repsDone || new Array(EXERCISES.find((e) => e.id === id)?.sets || 3).fill(0);
              c[id] = exData.completed || new Array(EXERCISES.find((e) => e.id === id)?.sets || 3).fill(false);
              w[id] = exData.weight || 0;
            });
            setRepsDone(r);
            setChecked(c);
            setWeights((prev) => ({ ...prev, ...w }));
            setTodayComplete(todayLog.completed);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local JSON
        fetch("/data/workout-logs.json")
          .then((res) => res.json())
          .then((data: WorkoutData) => {
            if (data && data.logs) {
              setLogs(data.logs || {});
              setWeights(data.weights || {});
            }
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  // Auto-save to GitHub when state changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(checked).length > 0 || Object.keys(repsDone).length > 0 || Object.keys(weights).length > 0) {
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
  const totalExercises = EXERCISES.length;
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

      {/* Weekly Schedule */}
      <div style={{ marginBottom: 24 }}>
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

      {/* Today's Plan */}
      <Card style={{ marginBottom: 24, borderLeft: "3px solid #00f5d4" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
              Today: {todayDay} — {todayPlan?.focus}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>
              {todayPlan?.type === "workout" ? `${totalExercises} exercises · ~35 min · Warm up first` : "Rest day — light walk or stretch"}
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
              <ExerciseCard
                key={ex.id}
                ex={ex}
                idx={idx}
                exChecked={exChecked}
                exReps={exReps}
                exWeight={exWeight}
                exComplete={exComplete}
                onToggleSet={(setIdx) => toggleSet(ex.id, setIdx)}
                onSetReps={(setIdx, val) => setReps(ex.id, setIdx, val)}
                onSetWeight={(val) => setWeight(ex.id, val)}
              />
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

// ─── Exercise Card Component ───
function ExerciseCard({
  ex,
  idx,
  exChecked,
  exReps,
  exWeight,
  exComplete,
  onToggleSet,
  onSetReps,
  onSetWeight,
}: {
  ex: Exercise;
  idx: number;
  exChecked: boolean[];
  exReps: number[];
  exWeight: number;
  exComplete: boolean;
  onToggleSet: (setIdx: number) => void;
  onSetReps: (setIdx: number, val: number) => void;
  onSetWeight: (val: number) => void;
}) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <Card
      style={{
        borderLeft: exComplete ? "3px solid #00f5d4" : "3px solid var(--border)",
        opacity: exComplete ? 0.7 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          minWidth: 28, height: 28, borderRadius: "50%",
          background: exComplete ? "#00f5d4" : "var(--border)",
          color: exComplete ? "#000" : "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700,
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
              onChange={(e) => onSetWeight(parseInt(e.target.value) || 0)}
              placeholder="0"
              style={{
                width: 60, padding: "4px 8px", borderRadius: 6,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text)", fontSize: "0.85rem",
              }}
            />
          </div>

          {/* Sets */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: ex.sets }).map((_, setIdx) => (
              <div
                key={setIdx}
                onClick={() => onToggleSet(setIdx)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 10px", borderRadius: 8,
                  border: `1px solid ${exChecked[setIdx] ? "#00f5d4" : "var(--border)"}`,
                  background: exChecked[setIdx] ? "rgba(0,245,212,0.1)" : "var(--bg)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `2px solid ${exChecked[setIdx] ? "#00f5d4" : "var(--muted)"}`,
                  background: exChecked[setIdx] ? "#00f5d4" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {exChecked[setIdx] && <span style={{ fontSize: "0.7rem", color: "#000" }}>✓</span>}
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 500 }}>
                  Set {setIdx + 1}
                </span>
                <input
                  type="number"
                  value={exReps[setIdx] || ""}
                  onChange={(e) => { e.stopPropagation(); onSetReps(setIdx, parseInt(e.target.value) || 0); }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={ex.reps}
                  style={{
                    width: 40, padding: "2px 6px", borderRadius: 4,
                    border: "1px solid var(--border)", background: "var(--bg)",
                    color: "var(--text)", fontSize: "0.75rem", textAlign: "center",
                  }}
                />
                <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>reps</span>
              </div>
            ))}
          </div>

          {/* Toggle technique + video */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => setShowDetail((s) => !s)}
              style={{
                padding: "6px 14px", borderRadius: 6,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--muted)", fontSize: "0.75rem", cursor: "pointer",
              }}
            >
              {showDetail ? "▲ Hide Technique" : "▼ Show Technique"}
            </button>
            <a
              href={ex.technique.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 14px", borderRadius: 6,
                border: "1px solid #f15b5b", background: "rgba(241,91,91,0.1)",
                color: "#f15b5b", fontSize: "0.75rem", cursor: "pointer",
                textDecoration: "none", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              ▶ Watch Demo
            </a>
          </div>
        </div>
      </div>

      {/* Technique Detail Panel */}
      {showDetail && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gap: 14 }}>
            {/* Setup */}
            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#00f5d4", margin: "0 0 6px", textTransform: "uppercase" }}>
                🎯 Setup
              </h5>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                {ex.technique.setup}
              </p>
            </div>

            {/* Movement */}
            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#00f5d4", margin: "0 0 6px", textTransform: "uppercase" }}>
                🔄 Movement
              </h5>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                {ex.technique.movement}
              </p>
            </div>

            {/* Tips */}
            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9b5de5", margin: "0 0 6px", textTransform: "uppercase" }}>
                ✅ Pro Tips
              </h5>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                {ex.technique.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Mistakes */}
            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f15b5b", margin: "0 0 6px", textTransform: "uppercase" }}>
                ❌ Common Mistakes
              </h5>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                {ex.technique.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Exercise Reference Card (read-only, always visible) ───
function ExerciseReferenceCard({ ex, idx }: { ex: Exercise; idx: number }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <Card style={{ borderLeft: "3px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          minWidth: 28, height: 28, borderRadius: "50%",
          background: "var(--border)", color: "var(--muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.8rem", fontWeight: 700,
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

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowDetail((s) => !s)}
              style={{
                padding: "6px 14px", borderRadius: 6,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--muted)", fontSize: "0.75rem", cursor: "pointer",
              }}
            >
              {showDetail ? "▲ Hide Technique" : "▼ Show Technique"}
            </button>
            <a
              href={ex.technique.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "6px 14px", borderRadius: 6,
                border: "1px solid #f15b5b", background: "rgba(241,91,91,0.1)",
                color: "#f15b5b", fontSize: "0.75rem", cursor: "pointer",
                textDecoration: "none", fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              ▶ Watch Demo
            </a>
          </div>
        </div>
      </div>

      {showDetail && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#00f5d4", margin: "0 0 6px", textTransform: "uppercase" }}>
                🎯 Setup
              </h5>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                {ex.technique.setup}
              </p>
            </div>

            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#00f5d4", margin: "0 0 6px", textTransform: "uppercase" }}>
                🔄 Movement
              </h5>
              <p style={{ fontSize: "0.85rem", color: "var(--text)", margin: 0, lineHeight: 1.6 }}>
                {ex.technique.movement}
              </p>
            </div>

            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#9b5de5", margin: "0 0 6px", textTransform: "uppercase" }}>
                ✅ Pro Tips
              </h5>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                {ex.technique.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f15b5b", margin: "0 0 6px", textTransform: "uppercase" }}>
                ❌ Common Mistakes
              </h5>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.7 }}>
                {ex.technique.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
