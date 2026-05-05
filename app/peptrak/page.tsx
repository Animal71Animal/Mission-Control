"use client";

import { useEffect, useState } from "react";

interface Compound {
  name: string;
  type: string;
  concentration: string;
  dosage_units?: number;
  dosage_mg?: number;
  dosage_mcg?: number;
  dosage_iu?: number;
  schedule: string;
  frequency: string;
  current_vials: number;
  notes: string;
  status?: string;
  color?: string;
}

interface PeptideData {
  status: string;
  started: string;
  current_phase: string;
  compounds: Compound[];
  weekly_schedule_loading_phase: Record<string, any>;
  weekly_totals_loading_phase: Record<string, number>;
  maintenance_schedule_week_3_plus: Record<string, any>;
  upcoming_milestones: string[];
}

interface DailyDose {
  compound: string;
  time: string;
  dose: string;
  taken: boolean;
}

const COMPOUND_COLORS: Record<string, { bg: string; text: string; light: string; hex: string }> = {
  "Tesa": { bg: "bg-cyan-950", text: "text-cyan-200", light: "bg-cyan-900/40", hex: "#0891b2" },
  "Semax": { bg: "bg-purple-950", text: "text-purple-200", light: "bg-purple-900/40", hex: "#a855f7" },
  "MT1": { bg: "bg-yellow-950", text: "text-yellow-200", light: "bg-yellow-900/40", hex: "#eab308" },
  "Reta": { bg: "bg-pink-950", text: "text-pink-200", light: "bg-pink-900/40", hex: "#ec4899" },
  "HCG": { bg: "bg-lime-950", text: "text-lime-200", light: "bg-lime-900/40", hex: "#84cc16" },
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PepTrakPage() {
  const [data, setData] = useState<PeptideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [todayDoses, setTodayDoses] = useState<DailyDose[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load peptide data and checklist state
  useEffect(() => {
    Promise.all([
      fetch("/data/peptide-stack.json"),
      fetch("/api/peptide-checklist")
    ])
      .then(async ([res1, res2]) => {
        const peptideData = await res1.json();
        const checklistData = await res2.json();
        setData(peptideData);
        setChecklist(checklistData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Update today's doses when selected day or data changes
  useEffect(() => {
    if (data && selectedDay) {
      const daySchedule = data.weekly_schedule_loading_phase[selectedDay.toLowerCase()];
      if (daySchedule) {
        const doses: DailyDose[] = [];
        Object.entries(daySchedule).forEach(([time, compounds]: [string, any]) => {
          if (Array.isArray(compounds)) {
            compounds.forEach((c: any) => {
              doses.push({
                compound: c.compound,
                time: time,
                dose: c.dose,
                taken: false,
              });
            });
          }
        });
        setTodayDoses(doses);
      }
    }
  }, [data, selectedDay]);

  const toggleDose = async (compound: string, time: string) => {
    const key = `${compound}-${time}`;
    const newState = { ...checklist, [key]: !checklist[key] };
    setChecklist(newState);
    setIsSyncing(true);

    try {
      await fetch("/api/peptide-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      });
    } catch (err) {
      console.error("Failed to sync checklist:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCompoundColor = (name: string) => {
    return COMPOUND_COLORS[name] || { bg: "bg-gray-900", text: "text-gray-200", light: "bg-gray-900/40", hex: "#6b7280" };
  };

  const getProgress = () => {
    if (todayDoses.length === 0) return 0;
    const taken = todayDoses.filter(d => checklist[`${d.compound}-${d.time}`]).length;
    return Math.round((taken / todayDoses.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Loading peptide data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ color: "#ef4444", fontSize: "0.875rem" }}>Error: {error || "Failed to load data"}</div>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: "1.75rem" }}>💉</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
            PepTrak
          </h1>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "4px 10px",
              borderRadius: 20,
              background: data.current_phase === "loading" ? "rgba(34,197,94,0.15)" : "rgba(168,85,247,0.15)",
              color: data.current_phase === "loading" ? "#4ade80" : "#c084fc",
              border: `1px solid ${data.current_phase === "loading" ? "rgba(34,197,94,0.3)" : "rgba(168,85,247,0.3)"}`,
            }}
          >
            {data.current_phase === "loading" ? "Loading Phase" : "Maintenance"}
          </span>
        </div>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.875rem" }}>
          Peptide dosing tracker — daily checklist, vial inventory, and schedule
        </p>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
            {selectedDay} Progress
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: progress === 100 ? "#4ade80" : "var(--accent)" }}>
            {progress}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "var(--bg)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: progress === 100 ? "#4ade80" : "var(--accent)",
              borderRadius: 4,
              transition: "width 0.3s ease",
            }}
          />
        </div>
        {isSyncing && (
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 8, textAlign: "right" }}>
            Syncing...
          </div>
        )}
      </div>

      {/* Day Selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: selectedDay === day ? "var(--accent)" : "var(--card)",
              color: selectedDay === day ? "#fff" : "var(--text)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Daily Dose Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {todayDoses.length === 0 ? (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "24px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.875rem",
            }}
          >
            No doses scheduled for {selectedDay}
          </div>
        ) : (
          todayDoses.map((dose, idx) => {
            const colors = getCompoundColor(dose.compound);
            const isTaken = checklist[`${dose.compound}-${dose.time}`];
            return (
              <div
                key={idx}
                onClick={() => toggleDose(dose.compound, dose.time)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${colors.hex}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  cursor: "pointer",
                  opacity: isTaken ? 0.55 : 1,
                  filter: isTaken ? "saturate(0.4)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                  {/* Checkbox */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: `2px solid ${isTaken ? colors.hex : "var(--border)"}`,
                      background: isTaken ? colors.hex : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {isTaken && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* Dose Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
                        {dose.compound}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: colors.light,
                          color: colors.text,
                          fontWeight: 500,
                        }}
                      >
                        {dose.time}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{dose.dose}</div>
                  </div>
                </div>

                {/* Status */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: isTaken ? "#4ade80" : "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isTaken ? "Done" : "Pending"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vial Inventory */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        Vial Inventory
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
        {data.compounds.map((compound) => {
          const colors = getCompoundColor(compound.name);
          return (
            <div
              key={compound.name}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderTop: `3px solid ${colors.hex}`,
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{compound.name}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: compound.current_vials > 1 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: compound.current_vials > 1 ? "#4ade80" : "#ef4444",
                  }}
                >
                  {compound.current_vials} vial{compound.current_vials !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.6 }}>
                <div>{compound.concentration}</div>
                <div>{compound.schedule}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Schedule Summary */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
        Weekly Schedule
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {DAYS_OF_WEEK.map((day) => {
          const daySchedule = data.weekly_schedule_loading_phase[day.toLowerCase()];
          if (!daySchedule) return null;

          const dayDoses: string[] = [];
          Object.entries(daySchedule).forEach(([time, compounds]: [string, any]) => {
            if (Array.isArray(compounds)) {
              compounds.forEach((c: any) => {
                dayDoses.push(`${c.compound} ${c.dose} @ ${time}`);
              });
            }
          });

          if (dayDoses.length === 0) return null;

          return (
            <div
              key={day}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                {day}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {dayDoses.map((dose, idx) => (
                  <div key={idx} style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {dose}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
