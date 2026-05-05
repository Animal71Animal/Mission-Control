"use client";

import { useEffect, useState } from "react";

interface CompoundConfig {
  id: string;
  name: string;
  color: string;
  legalName: string;
  classification: string;
  intendedEffects: string;
  overdoseSymptoms: string;
  totalMgInVial: number;
  vialUnit: "mg" | "IU";
  prescribedDosageMg: number;
  doseUnit: "mg" | "mcg";
  bacWaterRatioMl: number;
  timesPerWeek: number;
  scheduleDays: string[];
  scheduleTime: string;
  notes: string;
}

const PRESET_COLORS = [
  "#0891b2", "#a855f7", "#eab308", "#ec4899", "#84cc16",
  "#f97316", "#06b6d4", "#8b5cf6", "#ef4444", "#10b981"
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = [
  "5am", "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm",
  "7pm", "8pm", "9pm", "10pm", "11pm"
];

const DISCLAIMER = "⚠️ NOT FOR HUMAN USE. For research purposes only. We are not medical doctors. This is not a medical device. Consult a licensed physician before use.";

function calculateUnits(dosageMg: number, totalMgInVial: number, bacWaterMl: number): number {
  if (!totalMgInVial || !bacWaterMl || !dosageMg) return 0;
  const totalVolumeMl = bacWaterMl;
  const mgPerMlAfterRecon = totalMgInVial / totalVolumeMl;
  const unitsPerMl = 100;
  const mlNeeded = dosageMg / mgPerMlAfterRecon;
  return Math.round(mlNeeded * unitsPerMl);
}

function getTodayDayName(): string {
  const dayIndex = new Date().getDay();
  return dayIndex === 0 ? "Sunday" : DAYS_OF_WEEK[dayIndex - 1];
}

export default function PepTrakPage() {
  const [compounds, setCompounds] = useState<CompoundConfig[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<string>(getTodayDayName());
  const [showAddForm, setShowAddForm] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [editingCompound, setEditingCompound] = useState<CompoundConfig | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("peptrak-v2-compounds");
    const savedChecklist = localStorage.getItem("peptrak-v2-checklist");
    if (saved) {
      try { setCompounds(JSON.parse(saved)); } catch {}
    }
    if (savedChecklist) {
      try { setChecklist(JSON.parse(savedChecklist)); } catch {}
    }
  }, []);

  // Save compounds
  useEffect(() => {
    localStorage.setItem("peptrak-v2-compounds", JSON.stringify(compounds));
  }, [compounds]);

  // Save checklist
  useEffect(() => {
    localStorage.setItem("peptrak-v2-checklist", JSON.stringify(checklist));
  }, [checklist]);

  const addCompound = (compound: CompoundConfig) => {
    setCompounds(prev => [...prev, compound]);
    setEditingCompound(null);
  };

  const updateCompound = (updated: CompoundConfig) => {
    setCompounds(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingCompound(null);
  };

  const deleteCompound = (id: string) => {
    setCompounds(prev => prev.filter(c => c.id !== id));
  };

  // Get doses for a specific day
  const getDosesForDay = (day: string) => {
    return compounds.filter(c => c.scheduleDays.includes(day)).map(c => ({
      ...c,
      units: calculateUnits(c.prescribedDosageMg, c.totalMgInVial, c.bacWaterRatioMl),
    }));
  };

  const toggleDose = (compoundId: string, day: string) => {
    const dateKey = new Date().toISOString().split("T")[0];
    const key = `${compoundId}-${day}-${dateKey}`;
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDoseDone = (compoundId: string, day: string) => {
    const dateKey = new Date().toISOString().split("T")[0];
    const key = `${compoundId}-${day}-${dateKey}`;
    return checklist[key] || false;
  };

  const todayDoses = getDosesForDay(selectedDay);
  const todayDone = todayDoses.filter(d => isDoseDone(d.id, selectedDay)).length;
  const todayTotal = todayDoses.length;
  const progress = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  return (
    <div>
      {/* Disclaimer */}
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>PepTrak</h1>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingCompound(null); }}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid var(--accent)",
              background: showAddForm ? "var(--accent)" : "transparent",
              color: showAddForm ? "#fff" : "var(--accent)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {showAddForm ? "▲ Add Compound" : "▼ Add Compound"}
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

      {/* Add/Edit Compound Form */}
      <div style={{
        maxHeight: showAddForm ? "2000px" : "0",
        overflow: "hidden",
        transition: "max-height 0.3s ease",
        opacity: showAddForm ? 1 : 0,
      }}>
        <CompoundForm
          compounds={compounds}
          editingCompound={editingCompound}
          onAdd={addCompound}
          onUpdate={updateCompound}
          onCancelEdit={() => setEditingCompound(null)}
        />
      </div>

      {/* Day Selector + Progress */}
      {compounds.length > 0 && (
        <>
          {/* Progress */}
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "20px",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                {selectedDay} {selectedDay === getTodayDayName() ? "(Today)" : ""}
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: progress === 100 ? "#4ade80" : "var(--accent)" }}>
                {progress}%
              </span>
            </div>
            <div style={{ width: "100%", height: 8, background: "var(--bg)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: progress === 100 ? "#4ade80" : "var(--accent)",
                borderRadius: 4,
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>

          {/* Day Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {DAYS_OF_WEEK.map((day, i) => {
              const dayDoses = getDosesForDay(day);
              const hasDoses = dayDoses.length > 0;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: `1px solid ${selectedDay === day ? "var(--accent)" : "var(--border)"}`,
                    background: selectedDay === day ? "var(--accent)" : "var(--card)",
                    color: selectedDay === day ? "#fff" : hasDoses ? "var(--text)" : "var(--muted)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                >
                  {DAYS_SHORT[i]}
                  {hasDoses && selectedDay !== day && (
                    <span style={{
                      position: "absolute",
                      top: -2,
                      right: -2,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily Dose Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {todayDoses.length === 0 ? (
              <div style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "24px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "0.875rem",
              }}>
                No doses scheduled for {selectedDay}
              </div>
            ) : (
              todayDoses.map((dose) => {
                const done = isDoseDone(dose.id, selectedDay);
                return (
                  <div
                    key={dose.id}
                    onClick={() => toggleDose(dose.id, selectedDay)}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${dose.color}`,
                      borderRadius: 12,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      cursor: "pointer",
                      opacity: done ? 0.55 : 1,
                      filter: done ? "saturate(0.4)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: `2px solid ${done ? dose.color : "var(--border)"}`,
                        background: done ? dose.color : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s",
                      }}>
                        {done && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Dose Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)" }}>{dose.name}</span>
                          <span style={{
                            fontSize: "0.7rem",
                            padding: "2px 8px",
                            borderRadius: 10,
                            background: `${dose.color}20`,
                            color: dose.color,
                            fontWeight: 500,
                          }}>
                            {dose.scheduleTime}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                          <strong>{dose.units} units</strong> on syringe ({dose.doseUnit === "mcg" ? (dose.prescribedDosageMg * 1000) + " mcg" : dose.prescribedDosageMg + " mg"})
                        </div>
                      </div>
                    </div>

                    <div style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: done ? "#4ade80" : "var(--muted)",
                      whiteSpace: "nowrap",
                    }}>
                      {done ? "✓ Done" : "Pending"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Weekly Overview */}
      {compounds.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
            Weekly Schedule
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 32 }}>
            {DAYS_OF_WEEK.map((day, i) => {
              const dayDoses = getDosesForDay(day);
              return (
                <div key={day} style={{
                  background: day === getTodayDayName() ? "rgba(155,93,229,0.08)" : "var(--card)",
                  border: `1px solid ${day === getTodayDayName() ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: "12px",
                }}>
                  <div style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: day === getTodayDayName() ? "var(--accent)" : "var(--text)",
                    marginBottom: 8,
                  }}>
                    {DAYS_SHORT[i]}
                    {day === getTodayDayName() && <span style={{ fontSize: "0.65rem", color: "var(--accent)", marginLeft: 6 }}>TODAY</span>}
                  </div>
                  {dayDoses.length === 0 ? (
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Rest day</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {dayDoses.map(d => (
                        <div key={d.id} style={{
                          fontSize: "0.7rem",
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: `${d.color}15`,
                          borderLeft: `2px solid ${d.color}`,
                          color: "var(--text)",
                        }}>
                          <div style={{ fontWeight: 600 }}>{d.name}</div>
                          <div style={{ color: "var(--muted)" }}>{d.units} units @ {d.scheduleTime}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Compound Inventory */}
      {compounds.length > 0 && (
        <>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)" }}>
            Compound Inventory
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, marginBottom: 32 }}>
            {compounds.map((compound) => {
              const units = calculateUnits(compound.prescribedDosageMg, compound.totalMgInVial, compound.bacWaterRatioMl);
              const doseDisplay = compound.doseUnit === "mcg"
                ? `${units}u (${(compound.prescribedDosageMg * 1000).toFixed(0)}mcg)`
                : `${units}u (${compound.prescribedDosageMg}mg)`;
              const concentrationDisplay = compound.vialUnit === "IU"
                ? `${compound.totalMgInVial} IU`
                : `${compound.totalMgInVial} mg`;
              const freqDisplay = compound.timesPerWeek === 7 ? "daily" : compound.timesPerWeek === 1 ? "weekly" : `${compound.timesPerWeek}x weekly`;

              return (
                <div key={compound.id} style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${compound.color}`,
                  borderRadius: 12,
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{compound.name}</div>
                      {compound.legalName && <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontStyle: "italic", marginBottom: 2 }}>{compound.legalName}</div>}
                      {compound.classification && <div style={{ fontSize: "0.7rem", color: compound.color, fontWeight: 500, marginBottom: 2 }}>{compound.classification}</div>}
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {concentrationDisplay} / {compound.bacWaterRatioMl} mL BAC
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setEditingCompound(compound); setShowAddForm(true); }}
                        style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem", padding: "2px 6px" }}
                      >Edit</button>
                      <button
                        onClick={() => deleteCompound(compound.id)}
                        style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", padding: "2px 6px" }}
                      >Delete</button>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.8 }}>
                    <div><strong>Dose:</strong> {doseDisplay}</div>
                    <div><strong>Schedule:</strong> {compound.scheduleDays.map(d => d.slice(0, 3)).join(", ")} @ {compound.scheduleTime}</div>
                    <div><strong>Frequency:</strong> {freqDisplay}</div>
                  </div>

                  {/* Intended Effects */}
                  {compound.intendedEffects && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text)", lineHeight: 1.5 }}>
                      <strong style={{ color: "#4ade80" }}>Effects:</strong> {compound.intendedEffects}
                    </div>
                  )}

                  {/* Overdose Symptoms */}
                  {compound.overdoseSymptoms && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text)", lineHeight: 1.5 }}>
                      <strong style={{ color: "#ef4444" }}>⚠️ Watch for:</strong> {compound.overdoseSymptoms}
                    </div>
                  )}

                  {/* Notes */}
                  {compound.notes && (
                    <div style={{
                      fontSize: "0.75rem",
                      color: "var(--muted)",
                      fontStyle: "italic",
                      lineHeight: 1.5,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 10,
                    }}>
                      {compound.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Disclaimer Bottom */}
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

// Compound Form Component
function CompoundForm({
  compounds,
  editingCompound,
  onAdd,
  onUpdate,
  onCancelEdit,
}: {
  compounds: CompoundConfig[];
  editingCompound: CompoundConfig | null;
  onAdd: (c: CompoundConfig) => void;
  onUpdate: (c: CompoundConfig) => void;
  onCancelEdit: () => void;
}) {
  const defaultForm = {
    name: "",
    color: PRESET_COLORS[compounds.length % PRESET_COLORS.length],
    legalName: "",
    classification: "",
    intendedEffects: "",
    overdoseSymptoms: "",
    totalMgInVial: 10,
    prescribedDosageMg: 1,
    bacWaterRatioMl: 2,
    timesPerWeek: 7,
    scheduleDays: [...DAYS_OF_WEEK],
    scheduleTime: "10am",
    notes: "",
  };

  const [form, setForm] = useState<Partial<CompoundConfig>>(defaultForm);
  const [vialUnit, setVialUnit] = useState<"mg" | "IU">("mg");
  const [doseUnit, setDoseUnit] = useState<"mg" | "mcg">("mg");

  // Display values (converted from internal mg)
  const vialDisplayValue = vialUnit === "IU" ? (form.totalMgInVial || 0) : (form.totalMgInVial || 0);
  const doseDisplayValue = doseUnit === "mcg" ? ((form.prescribedDosageMg || 0) * 1000) : (form.prescribedDosageMg || 0);

  const handleVialChange = (val: number) => {
    // IU stored as-is (user handles their own IU-to-mg if needed)
    setForm({ ...form, totalMgInVial: val });
  };

  const handleDoseChange = (val: number) => {
    // Convert mcg to mg for internal storage
    const mgValue = doseUnit === "mcg" ? val / 1000 : val;
    setForm({ ...form, prescribedDosageMg: mgValue });
  };

  useEffect(() => {
    if (editingCompound) {
      setForm(editingCompound);
      setVialUnit(editingCompound.vialUnit || "mg");
      setDoseUnit(editingCompound.doseUnit || "mg");
    }
  }, [editingCompound]);

  // Auto-select days when timesPerWeek changes
  const handleTimesChange = (times: number) => {
    setForm(prev => {
      const newForm = { ...prev, timesPerWeek: times };
      if (times === 7) {
        newForm.scheduleDays = [...DAYS_OF_WEEK];
      } else if (times >= (prev.scheduleDays?.length || 0)) {
        // Keep current selection if it matches
      }
      return newForm;
    });
  };

  const toggleDay = (day: string) => {
    setForm(prev => {
      const current = prev.scheduleDays || [];
      const newDays = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day];
      return { ...prev, scheduleDays: newDays, timesPerWeek: newDays.length };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const compound: CompoundConfig = {
      id: editingCompound?.id || crypto.randomUUID(),
      name: form.name || "Unnamed",
      color: form.color || PRESET_COLORS[0],
      legalName: form.legalName || "",
      classification: form.classification || "",
      intendedEffects: form.intendedEffects || "",
      overdoseSymptoms: form.overdoseSymptoms || "",
      totalMgInVial: Number(form.totalMgInVial) || 10,
      vialUnit: vialUnit,
      prescribedDosageMg: Number(form.prescribedDosageMg) || 1,
      doseUnit: doseUnit,
      bacWaterRatioMl: Number(form.bacWaterRatioMl) || 2,
      timesPerWeek: Number(form.timesPerWeek) || 7,
      scheduleDays: form.scheduleDays || [],
      scheduleTime: form.scheduleTime || "10am",
      notes: form.notes || "",
    };

    if (editingCompound) {
      onUpdate(compound);
    } else {
      onAdd(compound);
    }

    setForm({
      ...defaultForm,
      color: PRESET_COLORS[(compounds.length + 1) % PRESET_COLORS.length],
    });
  };

  const calculatedUnits = (form.totalMgInVial && form.prescribedDosageMg && form.bacWaterRatioMl)
    ? calculateUnits(Number(form.prescribedDosageMg), Number(form.totalMgInVial), Number(form.bacWaterRatioMl))
    : 0;

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "24px",
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 20px", color: "var(--text)" }}>
        {editingCompound ? "Edit Compound" : "Add Compound"}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1: Name + Color */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Compound Name</label>
            <input
              type="text"
              value={form.name || ""}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., BPC-157"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Color</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESET_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                  style={{ width: 28, height: 28, borderRadius: 6, background: color, border: form.color === color ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Classification info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Legal / Scientific Name</label>
            <input type="text" value={form.legalName || ""} onChange={e => setForm({ ...form, legalName: e.target.value })}
              placeholder="e.g., Retratrutide (LY3437943)"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Classification</label>
            <input type="text" value={form.classification || ""} onChange={e => setForm({ ...form, classification: e.target.value })}
              placeholder="e.g., GLP-1/GIP/Glucagon Triple Agonist"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Intended Effects</label>
            <input type="text" value={form.intendedEffects || ""} onChange={e => setForm({ ...form, intendedEffects: e.target.value })}
              placeholder="e.g., Weight loss, appetite suppression, metabolic support"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Overdose Symptoms to Watch For</label>
            <input type="text" value={form.overdoseSymptoms || ""} onChange={e => setForm({ ...form, overdoseSymptoms: e.target.value })}
              placeholder="e.g., Severe nausea, vomiting, dizziness, hypoglycemia"
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} />
          </div>
        </div>

        {/* Row 3: Dosing inputs + calculated output */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
              Total in Vial ({vialUnit})
            </label>
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {(["mg", "IU"] as const).map(u => (
                <button key={u} type="button" onClick={() => setVialUnit(u)}
                  style={{
                    padding: "4px 12px", borderRadius: 8,
                    border: `1px solid ${vialUnit === u ? "var(--accent)" : "var(--border)"}`,
                    background: vialUnit === u ? "var(--accent)" : "transparent",
                    color: vialUnit === u ? "#fff" : "var(--muted)",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                  }}>{u}</button>
              ))}
            </div>
            <input type="number" step="0.1" value={vialDisplayValue || ""} onChange={e => handleVialChange(parseFloat(e.target.value))}
              placeholder={vialUnit === "IU" ? "e.g., 5000" : "e.g., 10"}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} required />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
              Prescribed Dose ({doseUnit})
            </label>
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {(["mg", "mcg"] as const).map(u => (
                <button key={u} type="button" onClick={() => setDoseUnit(u)}
                  style={{
                    padding: "4px 12px", borderRadius: 8,
                    border: `1px solid ${doseUnit === u ? "var(--accent)" : "var(--border)"}`,
                    background: doseUnit === u ? "var(--accent)" : "transparent",
                    color: doseUnit === u ? "#fff" : "var(--muted)",
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                  }}>{u}</button>
              ))}
            </div>
            <input type="number" step={doseUnit === "mcg" ? "1" : "0.01"} value={doseDisplayValue || ""} onChange={e => handleDoseChange(parseFloat(e.target.value))}
              placeholder={doseUnit === "mcg" ? "e.g., 250" : "e.g., 1"}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} required />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>BAC Water (mL)</label>
            <input type="number" step="0.1" value={form.bacWaterRatioMl || ""} onChange={e => setForm({ ...form, bacWaterRatioMl: parseFloat(e.target.value) })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }} required />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Dosage (Units on Syringe)</label>
            <div style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--accent)", fontSize: "0.875rem", fontWeight: 600, fontFamily: "monospace" }}>
              {calculatedUnits > 0 ? `${calculatedUnits} units` : "—"}
            </div>
          </div>
        </div>

        {/* Row 3: Schedule */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Times per Week</label>
            <select value={form.timesPerWeek || 7} onChange={e => handleTimesChange(parseInt(e.target.value))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }}>
              {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}x per week</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>What Time?</label>
            <select value={form.scheduleTime || "10am"} onChange={e => setForm({ ...form, scheduleTime: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.875rem" }}>
              {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Day Selector */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Which Days?</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAYS_OF_WEEK.map((day, i) => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  border: `1px solid ${form.scheduleDays?.includes(day) ? (form.color || "var(--accent)") : "var(--border)"}`,
                  background: form.scheduleDays?.includes(day) ? `${form.color || "var(--accent)"}20` : "var(--bg)",
                  color: form.scheduleDays?.includes(day) ? (form.color || "var(--accent)") : "var(--muted)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                {DAYS_SHORT[i]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>Notes (optional)</label>
          <textarea
            value={form.notes || ""}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g., Take with food, avoid sun exposure, start low to avoid nausea..."
            rows={2}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "0.8rem", resize: "vertical", fontFamily: "inherit" }}
          />
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: "var(--accent)", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
          }}>
            {editingCompound ? "Update Compound" : "Add Compound"}
          </button>
          {editingCompound && (
            <button type="button" onClick={() => { onCancelEdit(); setForm({ ...defaultForm, color: PRESET_COLORS[compounds.length % PRESET_COLORS.length] }); }}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontSize: "0.875rem", cursor: "pointer" }}>
              Cancel
            </button>
          )}
        </div>
      </form>
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
          <div style={{ background: "var(--bg)", borderRadius: 8, padding: "16px", fontFamily: "monospace", fontSize: "0.8rem", lineHeight: 1.8 }}>
            <div><strong>1. Concentration after reconstitution:</strong></div>
            <div>   Total mg in vial ÷ BAC water added (mL) = mg/mL</div>
            <div style={{ marginTop: 8 }}><strong>2. Units per dose:</strong></div>
            <div>   (Desired mg ÷ mg/mL) × 100 units/mL = units to draw</div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            Example: 10 mg vial + 2 mL BAC water = 5 mg/mL.
            For 1 mg dose: (1 ÷ 5) × 100 = <strong>20 units</strong>.
          </div>
        </div>
      ),
    },
    {
      title: "Reconstitute the Vial",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div>1. <strong>Swab</strong> the peptide vial top with alcohol. Let it dry completely.</div>
          <div>2. <strong>Swab</strong> the BAC water vial top with alcohol. Let it dry.</div>
          <div>3. <strong>Using a new insulin syringe</strong>, draw 100 units (1 mL) of BAC water from the BAC vial.</div>
          <div>4. <strong>Pierce the peptide vial</strong> at 90° through the center of the rubber stopper. <strong>Inject water slowly down the inside wall</strong> of the vial — never spray directly onto the powder. Peptide proteins are fragile.</div>
          <div>5. <strong>With needle still in the peptide vial</strong>, <strong>draw 100 units of air</strong> from inside the vial into the syringe.</div>
          <div>6. <strong>Withdraw the needle</strong> from the vial and <strong>expel the air</strong> into the atmosphere (push plunger down with needle in open air).</div>
          <div>7. <strong>Repeat steps 3-6</strong> as needed until you've added the correct total amount of BAC water (e.g., 2 mL = two 100-unit draws).</div>
          <div>8. <strong>Do not shake.</strong> Gently swirl the vial between your palms until powder fully dissolves.</div>
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
          <div>6. <strong>Draw slightly more</strong> than your calculated dose (e.g., 25 units if you need 20).</div>
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
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px", marginBottom: 24 }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 20px", color: "var(--text)" }}>📖 Reconstitution Guide</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {steps.map((step, idx) => (
          <button key={idx} onClick={() => setActiveStep(idx)}
            style={{
              padding: "8px 14px", borderRadius: 20,
              border: "1px solid var(--border)",
              background: activeStep === idx ? "var(--accent)" : "var(--bg)",
              color: activeStep === idx ? "#fff" : "var(--text)",
              fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            }}>
            {idx + 1}. {step.title}
          </button>
        ))}
      </div>
      <div style={{ background: "var(--bg)", borderRadius: 8, padding: "20px", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text)" }}>
        <div style={{ fontWeight: 600, marginBottom: 12, color: "var(--accent)" }}>
          Step {activeStep + 1}: {steps[activeStep].title}
        </div>
        {steps[activeStep].content}
      </div>
    </div>
  );
}
