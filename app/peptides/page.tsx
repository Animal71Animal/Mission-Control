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

export default function PeptidesPage() {
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
        let checklistData = {};
        if (res2.ok) {
          try { checklistData = await res2.json(); } catch { /* ignore */ }
        }
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
        Object.entries(daySchedule).forEach(([time, dose]: any) => {
          if (typeof dose === "string") {
            // Split combined doses like "Tesa 20u + Semax 5u + MT1 5u" into separate items
            const parts = dose.split(" + ");
            parts.forEach((part: string) => {
              doses.push({ compound: "", time, dose: part.trim(), taken: false });
            });
          } else {
            Object.entries(dose).forEach(([t, d]: any) => {
              const parts = (d as string).split(" + ");
              parts.forEach((part: string) => {
                doses.push({ compound: "", time: t, dose: part.trim(), taken: false });
              });
            });
          }
        });
        setTodayDoses(doses);
      }
    }
  }, [data, selectedDay]);

  const getCompoundFromDose = (doseStr: string): string => {
    if (doseStr.includes("Reta")) return "Reta";
    if (doseStr.includes("Tesa")) return "Tesa";
    if (doseStr.includes("Semax")) return "Semax";
    if (doseStr.includes("MT1")) return "MT1";
    if (doseStr.includes("HCG")) return "HCG";
    return "";
  };

  const toggleDose = async (index: number) => {
    const key = `${selectedDay}-${index}`;
    const newState = !checklist[key];
    
    // Update local state immediately
    const updatedChecklist = { ...checklist, [key]: newState };
    setChecklist(updatedChecklist);
    
    // Sync to server
    setIsSyncing(true);
    try {
      await fetch("/api/peptide-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newState })
      });
    } catch (err) {
      console.error("Failed to sync checklist:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "2rem" }}>⏳ Loading peptide data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "2rem", color: "var(--error)" }}>❌ Error loading data</div>
        <p style={{ color: "var(--muted)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          💉 Peptide Stack — {data.current_phase}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
          Started: {data.started} • Track your daily dosages below
          {isSyncing && <span style={{ marginLeft: "12px", color: "var(--accent)" }}>↻ Syncing...</span>}
        </p>
      </div>

      {/* Compound Color Legend */}
      <div style={{ marginBottom: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {Object.entries(COMPOUND_COLORS).map(([name, colors]) => (
          <div
            key={name}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              background: colors.light,
              border: `2px solid ${colors.hex}`,
              fontSize: "0.9rem",
              color: colors.text,
              fontWeight: 600,
            }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day Selector */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          📅 Select Day
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: `2px solid ${selectedDay === day ? "var(--accent)" : "var(--border)"}`,
                background: selectedDay === day ? "var(--accent)" : "var(--card)",
                color: selectedDay === day ? "var(--bg)" : "var(--text)",
                fontWeight: selectedDay === day ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Dosage Checklist */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          ✓ Today's Dosages — {selectedDay}
        </h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {todayDoses.length > 0 ? (
            todayDoses.map((dose, idx) => {
              const compound = getCompoundFromDose(dose.dose);
              const colors = COMPOUND_COLORS[compound] || { bg: "bg-gray-950", text: "text-gray-200", light: "bg-gray-900/30", hex: "#6b7280" };
              const isChecked = checklist[`${selectedDay}-${idx}`] || false;

              return (
                <div
                  key={idx}
                  onClick={() => toggleDose(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: isChecked ? "var(--bg)" : colors.light,
                    borderLeft: `4px solid ${colors.hex}`,
                    border: `2px solid ${isChecked ? "var(--border)" : "var(--border)"}`,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    opacity: isChecked ? 0.55 : 1,
                    filter: isChecked ? "saturate(0.3)" : "saturate(1)",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      border: `2px solid ${isChecked ? "var(--success)" : colors.hex}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isChecked ? "var(--success)" : "transparent",
                      transition: "all 0.2s",
                    }}
                  >
                    {isChecked && <span style={{ color: "var(--bg)", fontWeight: 700 }}>✓</span>}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.text }}>
                      {dose.dose}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
                      {dose.time}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "1.2rem",
                      opacity: isChecked ? 1 : 0.3,
                      transition: "opacity 0.2s",
                      color: colors.hex,
                    }}
                  >
                    ✓
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
              Rest day — no scheduled doses
            </div>
          )}
        </div>
      </div>

      {/* Compound Overview */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          💊 Compounds
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {data.compounds.map((compound, idx) => {
            const compound_name = compound.name.split(" ")[0];
            const colors = COMPOUND_COLORS[compound_name] || { bg: "bg-gray-950", text: "text-gray-200", light: "bg-gray-900/30", hex: "#6b7280" };
            return (
              <div
                key={idx}
                style={{
                  background: colors.light,
                  border: `2px solid ${colors.hex}`,
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                    {compound.name}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{compound.concentration}</p>
                </div>

                <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)" }}>
                  <div>
                    <strong>Dose:</strong>{" "}
                    {compound.dosage_units && `${compound.dosage_units}u`}
                    {compound.dosage_mg && ` (${compound.dosage_mg}mg)`}
                    {compound.dosage_mcg && ` (${compound.dosage_mcg}mcg)`}
                    {compound.dosage_iu && ` (${compound.dosage_iu}IU)`}
                  </div>
                  <div>
                    <strong>Schedule:</strong> {compound.schedule}
                  </div>
                  <div>
                    <strong>Frequency:</strong> {compound.frequency}
                  </div>
                  <div>
                    <strong>Vials:</strong> {compound.current_vials}
                  </div>
                </div>

                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 12, fontStyle: "italic" }}>
                  {compound.notes}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Totals */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          📊 Weekly Totals
        </h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
          }}
        >
          {Object.entries(data.weekly_totals_loading_phase).map(([key, value]) => (
            <div key={key} style={{ padding: "12px", background: "var(--bg)", borderRadius: "6px" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase" }}>
                {key.replace(/_/g, " ")}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          🎯 Upcoming Milestones
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.upcoming_milestones.map((milestone, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "0.95rem",
                color: "var(--text)",
              }}
            >
              {milestone}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
