"use client";

import { useEffect, useState } from "react";

interface CompoundConfig {
  id: string;
  name: string;
  color: string;
  totalMgInVial: number;
  prescribedDosageMg: number;
  bacWaterRatioMl: number;
  schedule: string;
  frequency: string;
  notes: string;
}

interface DailyDose {
  compoundId: string;
  compoundName: string;
  time: string;
  doseUnits: number;
  doseMg: number;
  taken: boolean;
}

interface ScheduleEntry {
  time: string;
  compoundIds: string[];
}

interface UserSchedule {
  day: string;
  entries: ScheduleEntry[];
}

const PRESET_COLORS = [
  "#0891b2", "#a855f7", "#eab308", "#ec4899", "#84cc16",
  "#f97316", "#06b6d4", "#8b5cf6", "#ef4444", "#10b981"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];

const DISCLAIMER = "⚠️ NOT FOR HUMAN USE. For research purposes only. We are not medical doctors. This is not a medical device. Consult a licensed physician before use.";

function calculateUnits(dosageMg: number, totalMgInVial: number, bacWaterMl: number): number {
  // After reconstitution: total volume = BAC water added (peptide powder has negligible volume)
  const totalVolumeMl = bacWaterMl;
  // Concentration after reconstitution: mg per ml
  const mgPerMlAfterRecon = totalMgInVial / totalVolumeMl;
  // Units (assuming 100 units = 1ml on U-100 insulin syringe)
  const unitsPerMl = 100;
  const mlNeeded = dosageMg / mgPerMlAfterRecon;
  return Math.round(mlNeeded * unitsPerMl);
}

export default function PepTrakPage() {
  const [compounds, setCompounds] = useState<CompoundConfig[]>([]);
  const [schedule, setSchedule] = useState<UserSchedule[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [showSetup, setShowSetup] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [editingCompound, setEditingCompound] = useState<CompoundConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCompounds = localStorage.getItem("peptrak-compounds");
    const savedSchedule = localStorage.getItem("peptrak-schedule");
    const savedChecklist = localStorage.getItem("peptrak-checklist");

    if (savedCompounds) {
      setCompounds(JSON.parse(savedCompounds));
    }
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    }

    // Show setup if no compounds configured, OR if existing data is missing the new fields
    if (!savedCompounds) {
      setShowSetup(true);
    } else {
      try {
        const parsed = JSON.parse(savedCompounds);
        if (parsed.length === 0) {
          setShowSetup(true);
        } else if (parsed.length > 0 && (parsed[0].vialVolumeMl !== undefined || parsed[0].totalMgInVial === undefined)) {
          // Old data format detected — clear it
          localStorage.removeItem("peptrak-compounds");
          localStorage.removeItem("peptrak-schedule");
          localStorage.removeItem("peptrak-checklist");
          setCompounds([]);
          setSchedule([]);
          setChecklist({});
          setShowSetup(true);
        }
      } catch {
        setShowSetup(true);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (compounds.length > 0) {
      localStorage.setItem("peptrak-compounds", JSON.stringify(compounds));
    }
  }, [compounds]);

  useEffect(() => {
    if (schedule.length > 0) {
      localStorage.setItem("peptrak-schedule", JSON.stringify(schedule));
    }
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("peptrak-checklist", JSON.stringify(checklist));
  }, [checklist]);

  const addCompound = (compound: CompoundConfig) => {
    const newCompounds = [...compounds, compound];
    setCompounds(newCompounds);
    setEditingCompound(null);
  };

  const updateCompound = (updated: CompoundConfig) => {
    setCompounds(compounds.map(c => c.id === updated.id ? updated : c));
    setEditingCompound(null);
  };

  const deleteCompound = (id: string) => {
    setCompounds(compounds.filter(c => c.id !== id));
    setSchedule(schedule.map(s => ({
      ...s,
      entries: s.entries.map(e => ({
        ...e,
        compoundIds: e.compoundIds.filter(cid => cid !== id)
      })).filter(e => e.compoundIds.length > 0)
    })));
  };

  const addScheduleEntry = (day: string, time: string, compoundIds: string[]) => {
    const existingDay = schedule.find(s => s.day === day);
    if (existingDay) {
      const newSchedule = schedule.map(s => {
        if (s.day !== day) return s;
        const existingEntry = s.entries.find(e => e.time === time);
        if (existingEntry) {
          return {
            ...s,
            entries: s.entries.map(e =>
              e.time === time ? { ...e, compoundIds: [...new Set([...e.compoundIds, ...compoundIds])] } : e
            )
          };
        }
        return { ...s, entries: [...s.entries, { time, compoundIds }] };
      });
      setSchedule(newSchedule);
    } else {
      setSchedule([...schedule, { day, entries: [{ time, compoundIds }] }]);
    }
  };

  const removeScheduleEntry = (day: string, time: string, compoundId: string) => {
    setSchedule(schedule.map(s => {
      if (s.day !== day) return s;
      return {
        ...s,
        entries: s.entries.map(e => {
          if (e.time !== time) return e;
          return { ...e, compoundIds: e.compoundIds.filter(id => id !== compoundId) };
        }).filter(e => e.compoundIds.length > 0)
      };
    }));
  };

  const getTodayDoses = (): DailyDose[] => {
    const daySchedule = schedule.find(s => s.day === selectedDay);
    if (!daySchedule) return [];

    const doses: DailyDose[] = [];
    daySchedule.entries.forEach(entry => {
      entry.compoundIds.forEach(compoundId => {
        const compound = compounds.find(c => c.id === compoundId);
        if (compound) {
          const units = calculateUnits(
            compound.prescribedDosageMg,
            compound.totalMgInVial,
            compound.bacWaterRatioMl
          );
          doses.push({
            compoundId: compound.id,
            compoundName: compound.name,
            time: entry.time,
            doseUnits: units,
            doseMg: compound.prescribedDosageMg,
            taken: false,
          });
        }
      });
    });
    return doses;
  };

  const toggleDose = (compoundId: string, time: string) => {
    const key = `${compoundId}-${time}-${selectedDay}`;
    const newState = { ...checklist, [key]: !checklist[key] };
    setChecklist(newState);
  };

  const getProgress = () => {
    const doses = getTodayDoses();
    if (doses.length === 0) return 0;
    const taken = doses.filter(d => checklist[`${d.compoundId}-${d.time}-${selectedDay}`]).length;
    return Math.round((taken / doses.length) * 100);
  };

  const getCompoundColor = (id: string) => {
    const compound = compounds.find(c => c.id === id);
    return compound?.color || "#6b7280";
  };

  const progress = getProgress();
  const todayDoses = getTodayDoses();

  return (
    <div>
      {/* Disclaimer - Top */}
      <div style={{
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 8,
        padding: "12px 16px",
        marginBottom: 20,
        fontSize: "0.75rem",
        color: "#fca5a5",
        lineHeight: 1.5,
      }}>
        {DISCLAIMER}
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.75rem" }}>💉</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
            PepTrak
          </h1>
          <button
            onClick={() => setShowSetup(!showSetup)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid var(--accent)",
              background: "transparent",
              color: "var(--accent)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {showSetup ? "Close Setup" : "Configure"}
          </button>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--muted)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {showGuide ? "Close Guide" : "Reconstitution Guide"}
          </button>
        </div>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.875rem" }}>
          Research compound tracking — configure your stack, set dosing, track daily
        </p>
      </div>

      {/* Reconstitution Guide */}
      {showGuide && <ReconstitutionGuide />}

      {/* Setup Panel */}
      {showSetup && (
        <SetupPanel
          compounds={compounds}
          schedule={schedule}
          onAddCompound={addCompound}
          onUpdateCompound={updateCompound}
          onDeleteCompound={deleteCompound}
          onAddScheduleEntry={addScheduleEntry}
          onRemoveScheduleEntry={removeScheduleEntry}
          editingCompound={editingCompound}
          setEditingCompound={setEditingCompound}
        />
      )}

      {/* Progress Bar */}
      {compounds.length > 0 && (
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
        </div>
      )}

      {/* Day Selector */}
      {compounds.length > 0 && (
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
      )}

      {/* Daily Dose Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {compounds.length === 0 ? (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "32px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>💉</div>
            <div style={{ fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>No compounds configured</div>
            <div>Click "Configure" to add your first research compound</div>
          </div>
        ) : todayDoses.length === 0 ? (
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
            const color = getCompoundColor(dose.compoundId);
            const isTaken = checklist[`${dose.compoundId}-${dose.time}-${selectedDay}`];
            return (
              <div
                key={idx}
                onClick={() => toggleDose(dose.compoundId, dose.time)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${color}`,
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
                      border: `2px solid ${isTaken ? color : "var(--border)"}`,
                      background: isTaken ? color : "transparent",
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
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>
                        {dose.compoundName}
                      </span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: `${color}20`,
                          color: color,
                          fontWeight: 500,
                        }}
                      >
                        {dose.time}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {dose.doseUnits} units ({dose.doseMg} mg)
                    </div>
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

      {/* Compound Inventory */}
      {compounds.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
            Compound Inventory
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 32 }}>
            {compounds.map((compound) => (
              <div
                key={compound.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderTop: `3px solid ${compound.color}`,
                  borderRadius: 12,
                  padding: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>{compound.name}</span>
                  <button
                    onClick={() => setEditingCompound(compound)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--muted)",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      padding: "2px 6px",
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.7 }}>
                  <div><strong>Total in Vial:</strong> {compound.totalMgInVial} mg</div>
                  <div><strong>Dose:</strong> {compound.prescribedDosageMg} mg</div>
                  <div><strong>BAC Water:</strong> {compound.bacWaterRatioMl} mL</div>
                  <div><strong>Units on Syringe:</strong> {calculateUnits(compound.prescribedDosageMg, compound.totalMgInVial, compound.bacWaterRatioMl)} units</div>
                  <div><strong>Schedule:</strong> {compound.schedule}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Disclaimer - Bottom */}
      <div style={{
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 8,
        padding: "12px 16px",
        marginTop: 20,
        fontSize: "0.75rem",
        color: "#fca5a5",
        lineHeight: 1.5,
      }}>
        {DISCLAIMER}
      </div>
    </div>
  );
}

// Setup Panel Component
function SetupPanel({
  compounds,
  schedule,
  onAddCompound,
  onUpdateCompound,
  onDeleteCompound,
  onAddScheduleEntry,
  onRemoveScheduleEntry,
  editingCompound,
  setEditingCompound,
}: {
  compounds: CompoundConfig[];
  schedule: UserSchedule[];
  onAddCompound: (c: CompoundConfig) => void;
  onUpdateCompound: (c: CompoundConfig) => void;
  onDeleteCompound: (id: string) => void;
  onAddScheduleEntry: (day: string, time: string, compoundIds: string[]) => void;
  onRemoveScheduleEntry: (day: string, time: string, compoundId: string) => void;
  editingCompound: CompoundConfig | null;
  setEditingCompound: (c: CompoundConfig | null) => void;
}) {
  const [compoundForm, setCompoundForm] = useState<Partial<CompoundConfig>>({
    totalMgInVial: 10,
    prescribedDosageMg: 1,
    bacWaterRatioMl: 2,
  });
  const [scheduleDay, setScheduleDay] = useState("Monday");
  const [scheduleTime, setScheduleTime] = useState("10am");
  const [scheduleCompoundIds, setScheduleCompoundIds] = useState<string[]>([]);

  useEffect(() => {
    if (editingCompound) {
      setCompoundForm(editingCompound);
    }
  }, [editingCompound]);

  const handleSubmitCompound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compoundForm.name) return;

    const compound: CompoundConfig = {
      id: editingCompound?.id || crypto.randomUUID(),
      name: compoundForm.name || "Unnamed",
      color: compoundForm.color || PRESET_COLORS[compounds.length % PRESET_COLORS.length],
      totalMgInVial: Number(compoundForm.totalMgInVial) || 10,
      prescribedDosageMg: Number(compoundForm.prescribedDosageMg) || 1,
      bacWaterRatioMl: Number(compoundForm.bacWaterRatioMl) || 2,
      schedule: compoundForm.schedule || "",
      frequency: compoundForm.frequency || "",
      notes: compoundForm.notes || "",
    };

    if (editingCompound) {
      onUpdateCompound(compound);
    } else {
      onAddCompound(compound);
    }

    setCompoundForm({
      color: PRESET_COLORS[compounds.length % PRESET_COLORS.length],
      totalMgInVial: 10,
      prescribedDosageMg: 1,
      bacWaterRatioMl: 2,
    });
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleCompoundIds.length === 0) return;
    onAddScheduleEntry(scheduleDay, scheduleTime, scheduleCompoundIds);
    setScheduleCompoundIds([]);
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 24,
      }}
    >
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 20px", color: "var(--text)" }}>
        {editingCompound ? "Edit Compound" : "Add Compound"}
      </h2>

      <form onSubmit={handleSubmitCompound} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Compound Name</label>
            <input
              type="text"
              value={compoundForm.name || ""}
              onChange={e => setCompoundForm({ ...compoundForm, name: e.target.value })}
              placeholder="e.g., BPC-157"
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.875rem",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Color</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCompoundForm({ ...compoundForm, color })}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: color,
                    border: compoundForm.color === color ? "2px solid #fff" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
              Total mg in Vial
            </label>
            <input
              type="number"
              step="0.1"
              value={compoundForm.totalMgInVial || ""}
              onChange={e => setCompoundForm({ ...compoundForm, totalMgInVial: parseFloat(e.target.value) })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.875rem",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
              Prescribed Dose (mg)
            </label>
            <input
              type="number"
              step="0.01"
              value={compoundForm.prescribedDosageMg || ""}
              onChange={e => setCompoundForm({ ...compoundForm, prescribedDosageMg: parseFloat(e.target.value) })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.875rem",
              }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
              BAC Water (mL)
            </label>
            <input
              type="number"
              step="0.1"
              value={compoundForm.bacWaterRatioMl || ""}
              onChange={e => setCompoundForm({ ...compoundForm, bacWaterRatioMl: parseFloat(e.target.value) })}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.875rem",
              }}
              required
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Schedule Notes</label>
          <input
            type="text"
            value={compoundForm.schedule || ""}
            onChange={e => setCompoundForm({ ...compoundForm, schedule: e.target.value })}
            placeholder="e.g., Mon-Fri mornings"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: "0.875rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {editingCompound ? "Update" : "Add Compound"}
          </button>
          {editingCompound && (
            <button
              type="button"
              onClick={() => {
                setEditingCompound(null);
                setCompoundForm({
                  color: PRESET_COLORS[compounds.length % PRESET_COLORS.length],
                  totalMgInVial: 10,
                  prescribedDosageMg: 1,
                  bacWaterRatioMl: 2,
                });
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Schedule Builder */}
      {compounds.length > 0 && (
        <>
          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />

          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
            Schedule Builder
          </h3>

          <form onSubmit={handleAddSchedule} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Day</label>
                <select
                  value={scheduleDay}
                  onChange={e => setScheduleDay(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                  }}
                >
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Time</label>
                <select
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                    fontSize: "0.875rem",
                  }}
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Compounds</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {compounds.map((c, compoundIdx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setScheduleCompoundIds(prev =>
                        prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                      );
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: `1px solid ${scheduleCompoundIds.includes(c.id) ? c.color : "var(--border)"}`,
                      background: scheduleCompoundIds.includes(c.id) ? `${c.color}20` : "var(--bg)",
                      color: scheduleCompoundIds.includes(c.id) ? c.color : "var(--text)",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={scheduleCompoundIds.length === 0}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: scheduleCompoundIds.length > 0 ? "var(--accent)" : "var(--border)",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: scheduleCompoundIds.length > 0 ? "pointer" : "not-allowed",
                alignSelf: "flex-start",
              }}
            >
              Add to Schedule
            </button>
          </form>

          {/* Current Schedule */}
          {schedule.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>
                Current Schedule
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {schedule.map(s => (
                  <div key={s.day} style={{ background: "var(--bg)", borderRadius: 8, padding: "12px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                      {s.day}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {s.entries.map(entry => (
                        <div key={entry.time} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--muted)", minWidth: 50 }}>{entry.time}</span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                            {entry.compoundIds.map(cid => {
                              const c = compounds.find(comp => comp.id === cid);
                              return c ? (
                                <span
                                  key={cid}
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "2px 8px",
                                    borderRadius: 10,
                                    background: `${c.color}20`,
                                    color: c.color,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  {c.name}
                                  <button
                                    type="button"
                                    onClick={() => onRemoveScheduleEntry(s.day, entry.time, cid)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "inherit",
                                      cursor: "pointer",
                                      fontSize: "0.7rem",
                                      padding: 0,
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Reconstitution Guide Component
function ReconstitutionGuide() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "What You Need",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>• <strong>Lyophilized peptide vial</strong> — contains powder, labeled with total milligrams (e.g., 10 mg)</div>
          <div>• <strong>Bacteriostatic water (BAC)</strong> — sterile water with 0.9% benzyl alcohol</div>
          <div>• <strong>Insulin syringes</strong> — U-100 (100 units = 1 mL)</div>
          <div>• <strong>Alcohol swabs</strong> — for sterilizing vial tops</div>
          <div>• <strong>Sharps container</strong> — for safe needle disposal</div>
        </div>
      ),
    },
    {
      title: "Calculate Your Mix",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>The math is simple:</div>
          <div style={{
            background: "var(--bg)",
            borderRadius: 8,
            padding: "16px",
            fontFamily: "monospace",
            fontSize: "0.8rem",
            lineHeight: 1.8,
          }}>
            <div><strong>1. Total volume after reconstitution:</strong></div>
            <div>   Vial volume (mL) + BAC water added (mL)</div>
            <div style={{ marginTop: 8 }}><strong>2. Concentration:</strong></div>
            <div>   Total mg in vial ÷ Total volume (mL) = mg/mL</div>
            <div style={{ marginTop: 8 }}><strong>3. Units per dose:</strong></div>
            <div>   (Desired mg ÷ mg/mL) × 100 units/mL = units to draw</div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Example: 10 mg vial, 2 mL vial, add 2 mL BAC water = 4 mL total.
            Concentration = 10 ÷ 4 = 2.5 mg/mL.
            For 1 mg dose: (1 ÷ 2.5) × 100 = <strong>40 units</strong>.
          </div>
        </div>
      ),
    },
    {
      title: "Reconstitute the Vial",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>1. <strong>Swab</strong> the peptide vial top with alcohol. Let it dry completely — wet rubber can push contaminants inside.</div>
          <div>2. <strong>Swab</strong> the BAC water vial top with alcohol. Let it dry.</div>
          <div>3. <strong>Using a new insulin syringe</strong>, draw 100 units (1 mL) of BAC water from the BAC vial.</div>
          <div>4. <strong>Pierce the peptide vial</strong> at 90° through the center of the rubber stopper. <strong>Inject water slowly down the inside wall</strong> of the vial — never spray directly onto the powder. Peptide proteins are fragile.</div>
          <div>5. <strong>With needle still in the peptide vial</strong>, <strong>draw 100 units of air</strong> from inside the vial into the syringe.</div>
          <div>6. <strong>Withdraw the needle</strong> from the vial and <strong>expel the air</strong> into the atmosphere (push plunger down with needle in open air).</div>
          <div>7. <strong>Repeat steps 3-6</strong> as needed until you've added the correct total amount of BAC water (e.g., 2 mL = two 100-unit draws).</div>
          <div>8. <strong>Do not shake.</strong> Gently swirl the vial between your palms until powder fully dissolves. Some take 30-60 seconds. Never agitate or tap forcefully.</div>
          <div>9. <strong>Inspect</strong> — solution should be clear. If cloudy, discolored, or particulate, discard and do not use.</div>
          <div>10. <strong>Swab</strong> the peptide vial stopper again with alcohol after final needle withdrawal.</div>
          <div>11. <strong>Label</strong> the vial with compound name, reconstitution date, total mg, BAC water amount, final concentration, and your initials.</div>
          <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#fca5a5" }}>
            ⚠️ Reconstituted peptides degrade faster. Store refrigerated (2-8°C). Most last 2-4 weeks after mixing. Never freeze after reconstitution.
          </div>
        </div>
      ),
    },
    {
      title: "Draw Your Dose",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>1. <strong>Wash hands</strong> thoroughly with soap and water.</div>
          <div>2. <strong>Swab</strong> the reconstituted vial top with alcohol. Let it dry.</div>
          <div>3. <strong>Draw air</strong> into syringe equal to your dose units — this prevents vacuum.</div>
          <div>4. <strong>Pierce vial center</strong> at 90° and <strong>inject air</strong> first (creates positive pressure, easier withdrawal).</div>
          <div>5. <strong>Turn vial upside down</strong> — keep needle tip submerged in liquid.</div>
          <div>6. <strong>Draw slightly more</strong> than your calculated dose (e.g., 45 units if you need 40).</div>
          <div>7. <strong>Remove needle</strong>, hold syringe needle-up, <strong>tap out bubbles</strong> to the top.</div>
          <div>8. <strong>Push plunger slowly</strong> to exact unit mark, expelling air and excess.</div>
          <div>9. <strong>Recap needle</strong> using the one-handed scoop method — never touch the needle.</div>
          <div>10. <strong>Inspect</strong> — liquid should be clear. If cloudy or particulate, discard and start fresh.</div>
        </div>
      ),
    },
    {
      title: "Storage & Shelf Life",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>• <strong>Before mixing:</strong> Store lyophilized powder in freezer (-20°C). Stable for months to years.</div>
          <div>• <strong>After mixing:</strong> Refrigerate (2-8°C). Use within 2-4 weeks for best potency.</div>
          <div>• <strong>Light sensitive:</strong> Keep vials in original box or dark container.</div>
          <div>• <strong>Never freeze</strong> reconstituted peptides — destroys the molecule.</div>
          <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#fca5a5" }}>
            ⚠️ If solution turns cloudy or discolored, discard it. Do not use.
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 24,
      }}
    >
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 20px", color: "var(--text)" }}>
        📖 Reconstitution Guide
      </h2>

      {/* Step tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            style={{
              padding: "8px 14px",
              borderRadius: 20,
              border: "1px solid var(--border)",
              background: activeStep === idx ? "var(--accent)" : "var(--bg)",
              color: activeStep === idx ? "#fff" : "var(--text)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {idx + 1}. {step.title}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div
        style={{
          background: "var(--bg)",
          borderRadius: 8,
          padding: "20px",
          fontSize: "0.875rem",
          lineHeight: 1.7,
          color: "var(--text)",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 12, color: "var(--accent)" }}>
          Step {activeStep + 1}: {steps[activeStep].title}
        </div>
        {steps[activeStep].content}
      </div>
    </div>
  );
}
