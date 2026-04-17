"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface Peptide {
  id: string;
  name: string;
  category: "core" | "core-addon" | "secondary-addon" | "cyclical";
  status: "active" | "planned" | "on-hold" | "completed";
  dose: {
    amount: number | null;
    unit: string | null;
    frequency: string;
    day?: string;
    days?: string[];
    time?: string;
  };
  vial: {
    strength_mg: number | null;
    strength_iu?: number | null;
    price?: number | null;
    reconstitution_ml: number | null;
    concentration?: string | null;
    dose_mg?: number | null;
    dose_iu?: number | null;
    syringe_units?: number | null;
    weekly_cost?: number | null;
    vial_lasts_weeks?: number | null;
  };
  startDate: string | null;
  notes: string;
  logs: {
    date: string;
    dose: string;
    notes: string;
  }[];
}

interface DoseCheckIn {
  peptideId: string;
  peptideName: string;
  time: string;
  taken: boolean;
  dose: string;
}

interface DayCheckIn {
  day: string;
  doses: DoseCheckIn[];
  notes?: string;
}

interface WeeklyMetrics {
  weight: number | null;
  waist: number | null;
  fastingGlucose: number | null;
  bloodPressure: string | null;
  restingHR: number | null;
  appetite: string | null;
  sleep: string | null;
  giSymptoms: string | null;
  mood: string | null;
  libido: string | null;
  waterRetention: string | null;
  trainingQuality: string | null;
}

interface WeekCheckIn {
  id: string;
  weekStarting: string;
  weekNumber: number;
  checkIns: Record<string, DayCheckIn>;
  weeklyMetrics: WeeklyMetrics;
  sideEffects: string[];
  notes: string;
}

const categoryColors: Record<string, string> = {
  core: "#00f5d4",
  "core-addon": "#9b5de5",
  "secondary-addon": "#00bbf9",
  cyclical: "#fee440",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  planned: "Planned",
  "on-hold": "On Hold",
  completed: "Completed",
};

export default function PeptidesPage() {
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [checkIns, setCheckIns] = useState<WeekCheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPeptide, setExpandedPeptide] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"stack" | "checkin">("checkin");

  useEffect(() => {
    Promise.all([
      fetch("/data/peptide-stack.json").then((res) => res.json()),
      fetch("/data/peptide-checkins.json").then((res) => res.json()),
    ])
      .then(([peptideData, checkInData]) => {
        setPeptides(peptideData);
        setCheckIns(checkInData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleDose = (weekId: string, date: string, doseIndex: number) => {
    setCheckIns((prev) =>
      prev.map((week) => {
        if (week.id !== weekId) return week;
        const day = week.checkIns[date];
        if (!day) return week;
        const newDoses = [...day.doses];
        newDoses[doseIndex] = { ...newDoses[doseIndex], taken: !newDoses[doseIndex].taken };
        return {
          ...week,
          checkIns: {
            ...week.checkIns,
            [date]: { ...day, doses: newDoses },
          },
        };
      })
    );
  };

  const getWeekProgress = (week: WeekCheckIn) => {
    let total = 0;
    let taken = 0;
    Object.values(week.checkIns).forEach((day) => {
      day.doses.forEach((dose) => {
        total++;
        if (dose.taken) taken++;
      });
    });
    return { total, taken, percent: total > 0 ? Math.round((taken / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>💉 Peptide Stack</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const filteredPeptides = selectedCategory
    ? peptides.filter((p) => p.category === selectedCategory)
    : peptides;

  const corePeptides = peptides.filter((p) => p.category === "core");
  const activeCount = peptides.filter((p) => p.status === "active").length;
  const plannedCount = peptides.filter((p) => p.status === "planned").length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          💉 Peptide Stack
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Mission Control for peptide dosing, schedule, and tracking.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#00f5d4" }}>{activeCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active</div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#9b5de5" }}>{plannedCount}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Planned</div>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)" }}>{peptides.length}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</div>
          </div>
        </Card>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab("checkin")}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: activeTab === "checkin" ? "#9b5de5" : "var(--card)",
            color: activeTab === "checkin" ? "#fff" : "var(--text)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          ✅ Daily Check-In
        </button>
        <button
          onClick={() => setActiveTab("stack")}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: activeTab === "stack" ? "#00f5d4" : "var(--card)",
            color: activeTab === "stack" ? "#000" : "var(--text)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          📋 Full Stack
        </button>
      </div>

      {/* Core Stack Banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.1), rgba(0,245,212,0.05))", border: "1px solid rgba(0,245,212,0.3)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#00f5d4", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Current Core Stack
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {corePeptides.map((p) => (
            <span key={p.id} style={{ background: "rgba(0,245,212,0.15)", color: "#00f5d4", padding: "6px 12px", borderRadius: 6, fontSize: "0.85rem", fontWeight: 500 }}>
              {p.name} — {p.dose.amount}{p.dose.unit} {p.dose.frequency}
            </span>
          ))}
        </div>
      </div>

      {/* DAILY CHECK-IN TAB */}
      {activeTab === "checkin" && (
        <>
          {/* Weekly Check-In Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {checkIns.map((week) => {
              const progress = getWeekProgress(week);
              const isExpanded = expandedWeek === week.id;
              
              return (
                <div
                  key={week.id}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {/* Week Header */}
                  <div
                    onClick={() => setExpandedWeek(isExpanded ? null : week.id)}
                    style={{
                      padding: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: `4px solid ${progress.percent === 100 ? "#00f5d4" : progress.percent > 50 ? "#fee440" : "#9b5de5"}`,
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        Week {week.weekNumber} — {new Date(week.weekStarting + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0 }}>{week.notes}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: progress.percent === 100 ? "#00f5d4" : "var(--text)" }}>
                        {progress.taken}/{progress.total}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{progress.percent}% complete</div>
                    </div>
                  </div>

                  {/* Daily Doses */}
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                      <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                        {Object.entries(week.checkIns).map(([date, day]) => (
                          <div key={date} style={{ background: "var(--bg)", borderRadius: 8, padding: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem" }}>
                                {day.day} — {new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                              {day.notes && (
                                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>{day.notes}</span>
                              )}
                            </div>
                            
                            {day.doses.length === 0 ? (
                              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>No doses scheduled</span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {day.doses.map((dose, idx) => (
                                  <label
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      padding: "8px 12px",
                                      background: dose.taken ? "rgba(0,245,212,0.1)" : "var(--card)",
                                      borderRadius: 6,
                                      cursor: "pointer",
                                      transition: "all 0.15s ease",
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={dose.taken}
                                      onChange={() => toggleDose(week.id, date, idx)}
                                      style={{ width: 20, height: 20, cursor: "pointer" }}
                                    />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 500, color: dose.taken ? "#00f5d4" : "var(--text)", textDecoration: dose.taken ? "line-through" : "none" }}>
                                        {dose.peptideName}
                                      </div>
                                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                                        {dose.dose} @ {dose.time}
                                      </div>
                                    </div>
                                    {dose.taken && <span style={{ fontSize: "1.2rem" }}>✅</span>}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* FULL STACK TAB */}
      {activeTab === "stack" && (
        <>
          {/* Category Filter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: selectedCategory === null ? "var(--text)" : "var(--card)",
                  color: selectedCategory === null ? "var(--bg)" : "var(--text)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                All
              </button>
              {["core", "core-addon", "secondary-addon", "cyclical"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: selectedCategory === cat ? categoryColors[cat] : "var(--card)",
                    color: selectedCategory === cat ? "#000" : "var(--text)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {cat.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </div>
          </div>

          {/* Peptide Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredPeptides.map((peptide) => (
              <div
                key={peptide.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  onClick={() => setExpandedPeptide(expandedPeptide === peptide.id ? null : peptide.id)}
                  style={{
                    padding: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderLeft: `4px solid ${categoryColors[peptide.category]}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                        {peptide.name}
                      </h3>
                      <div style={{ display: "flex", gap: 8, fontSize: "0.75rem" }}>
                        <span style={{ color: categoryColors[peptide.category], fontWeight: 500 }}>
                          {peptide.category.replace("-", " ")}
                        </span>
                        <span style={{ color: "var(--muted)" }}>•</span>
                        <span style={{ color: "var(--muted)" }}>{statusLabels[peptide.status]}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
                      {peptide.dose.amount ? `${peptide.dose.amount}${peptide.dose.unit}` : "TBD"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                      {peptide.dose.frequency}
                    </div>
                  </div>
                </div>

                {expandedPeptide === peptide.id && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                    <div style={{ paddingTop: 16, display: "grid", gap: 12 }}>
                      {/* Schedule */}
                      <div>
                        <h4 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                          Schedule
                        </h4>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {peptide.dose.days ? (
                            peptide.dose.days.map((day) => (
                              <span key={day} style={{ background: "var(--bg)", padding: "6px 12px", borderRadius: 6, fontSize: "0.85rem", color: "var(--text)" }}>
                                {day} {peptide.dose.time && `@ ${peptide.dose.time}`}
                              </span>
                            ))
                          ) : (
                            <span style={{ background: "var(--bg)", padding: "6px 12px", borderRadius: 6, fontSize: "0.85rem", color: "var(--text)" }}>
                              {peptide.dose.day} {peptide.dose.time && `@ ${peptide.dose.time}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Vial Info */}
                      {(peptide.vial.strength_mg || peptide.vial.reconstitution_ml) && (
                        <div>
                          <h4 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                            Vial Info
                          </h4>
                          <div style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                            {peptide.vial.strength_mg && `${peptide.vial.strength_mg}mg`}
                            {peptide.vial.strength_mg && peptide.vial.reconstitution_ml && " + "}
                            {peptide.vial.reconstitution_ml && `${peptide.vial.reconstitution_ml}mL bac water`}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <h4 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                          Notes
                        </h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                          {peptide.notes}
                        </p>
                      </div>

                      {/* Start Date */}
                      {peptide.startDate && (
                        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                          Started: {new Date(peptide.startDate + "T12:00:00").toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Weekly Schedule Reference */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          Weekly Anchor Schedule
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "var(--muted)", fontWeight: 500 }}>Day</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "var(--muted)", fontWeight: 500 }}>Time</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "var(--muted)", fontWeight: 500 }}>Compound</th>
                <th style={{ textAlign: "left", padding: "12px 8px", color: "var(--muted)", fontWeight: 500 }}>Dose</th>
              </tr>
            </thead>
            <tbody>
              {[
                { day: "Monday", time: "8:00 AM", compound: "Retatrutide", dose: "60 units (3mg)", color: "#00f5d4" },
                { day: "Monday", time: "9:30 PM", compound: "Tesamorelin", dose: "30 units (1mg)", color: "#00f5d4" },
                { day: "Tuesday", time: "8:00 AM", compound: "HCG (Week 1+)", dose: "250 IU / 10 units", color: "#9b5de5" },
                { day: "Tuesday", time: "9:30 PM", compound: "Tesamorelin", dose: "30 units (1mg)", color: "#00f5d4" },
                { day: "Wednesday", time: "8:00 AM", compound: "Selank (Week 2+)", dose: "300mcg / 9 units", color: "#9b5de5" },
                { day: "Wednesday", time: "10:00 AM", compound: "NAD+ (Week 3+)", dose: "50mg / 50 units", color: "#00bbf9" },
                { day: "Wednesday", time: "9:30 PM", compound: "Tesamorelin", dose: "30 units (1mg)", color: "#00f5d4" },
                { day: "Thursday", time: "8:00 AM", compound: "MOTS-c (Week 4+)", dose: "2.5mg / 50 units", color: "#00bbf9" },
                { day: "Thursday", time: "9:30 PM", compound: "Tesamorelin", dose: "30 units (1mg)", color: "#00f5d4" },
                { day: "Friday", time: "8:00 AM", compound: "HCG (Week 1+)", dose: "250 IU / 10 units", color: "#9b5de5" },
                { day: "Friday", time: "9:30 PM", compound: "Tesamorelin", dose: "30 units (1mg)", color: "#00f5d4" },
                { day: "Saturday", time: "8:00 AM", compound: "Selank / GLOW70", dose: "Optional", color: "#fee440" },
                { day: "Sunday", time: "—", compound: "Off / Recovery", dose: "No Tesamorelin", color: "var(--muted)" },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 8px", color: "var(--text)" }}>{row.day}</td>
                  <td style={{ padding: "10px 8px", color: "var(--text)" }}>{row.time}</td>
                  <td style={{ padding: "10px 8px", color: row.color, fontWeight: 500 }}>{row.compound}</td>
                  <td style={{ padding: "10px 8px", color: "var(--muted)" }}>{row.dose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reconstitution Guide */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          🧪 Reconstitution & Dosing Guide
        </h2>

        {/* Cost Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#00f5d4" }}>$62.94</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Weekly Cost</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#9b5de5" }}>~$273</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Cost</div>
            </div>
          </Card>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fee440" }}>7</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Compounds</div>
            </div>
          </Card>
        </div>

        {/* Reconstitution Table */}
        <div style={{ overflowX: "auto", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                {["Peptide", "Vial", "Price", "Bac Water", "Concentration", "Dose", "Syringe Units", "Frequency", "Weekly Cost", "Vial Lasts"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 8px", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Retatrutide", vial: "10mg", price: "$40", bac: "2mL", conc: "5mg/mL", dose: "3mg", units: "60 units", freq: "1x/week Mon", cost: "$12", lasts: "~3.3 wks", color: "#00f5d4" },
                { name: "Tesamorelin", vial: "10mg", price: "$45", bac: "3mL", conc: "3.33mg/mL", dose: "1mg", units: "30 units", freq: "5x/week M-F", cost: "$22.50", lasts: "~2 wks", color: "#00f5d4" },
                { name: "Selank", vial: "10mg", price: "$20", bac: "3mL", conc: "3333mcg/mL", dose: "300mcg", units: "9 units", freq: "6x/week M-Sa", cost: "$3.60", lasts: "~5.5 wks", color: "#9b5de5" },
                { name: "HCG", vial: "5000 IU", price: "$50", bac: "2mL", conc: "2500 IU/mL", dose: "250 IU", units: "10 units", freq: "2x/week Tu/Fr", cost: "$5.00", lasts: "~10 wks", color: "#9b5de5" },
                { name: "NAD+", vial: "500mg", price: "$42", bac: "5mL", conc: "100mg/mL", dose: "50mg", units: "50 units", freq: "1x/week Wed", cost: "$4.20", lasts: "~10 wks", color: "#00bbf9" },
                { name: "MOTS-c", vial: "10mg", price: "$30", bac: "2mL", conc: "5mg/mL", dose: "2.5mg", units: "50 units", freq: "1x/week Thu", cost: "$7.50", lasts: "~4 wks", color: "#00bbf9" },
                { name: "GHK-Cu ♻️", vial: "50mg", price: "$35", bac: "2mL", conc: "25mg/mL", dose: "1mg→2mg", units: "4→8 units", freq: "Daily (30 on/30 off)", cost: "$8.14", lasts: "1 cycle", color: "#fee440" },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 8px", color: row.color, fontWeight: 600 }}>{row.name}</td>
                  <td style={{ padding: "10px 8px", color: "var(--text)" }}>{row.vial}</td>
                  <td style={{ padding: "10px 8px", color: "var(--text)" }}>{row.price}</td>
                  <td style={{ padding: "10px 8px", color: "#fee440", fontWeight: 600 }}>{row.bac}</td>
                  <td style={{ padding: "10px 8px", color: "var(--muted)" }}>{row.conc}</td>
                  <td style={{ padding: "10px 8px", color: "var(--text)", fontWeight: 500 }}>{row.dose}</td>
                  <td style={{ padding: "10px 8px", color: "#00f5d4", fontWeight: 700 }}>{row.units}</td>
                  <td style={{ padding: "10px 8px", color: "var(--muted)" }}>{row.freq}</td>
                  <td style={{ padding: "10px 8px", color: "var(--text)", fontWeight: 500 }}>{row.cost}</td>
                  <td style={{ padding: "10px 8px", color: "var(--muted)" }}>{row.lasts}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid var(--border)", background: "rgba(0,245,212,0.05)" }}>
                <td colSpan={8} style={{ padding: "10px 8px", color: "var(--text)", fontWeight: 700 }}>TOTAL (full stack incl. GHK-Cu on-cycle)</td>
                <td style={{ padding: "10px 8px", color: "#00f5d4", fontWeight: 700 }}>$62.94</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Reconstitution Steps */}
        <div style={{ background: "var(--card)", border: "1px solid rgba(254,228,64,0.3)", borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fee440", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            📋 How to Reconstitute (All Peptides)
          </h3>
          <ol style={{ margin: 0, paddingLeft: 20, color: "var(--text)", fontSize: "0.85rem", lineHeight: 2 }}>
            <li>Wipe vial top with alcohol swab — let dry</li>
            <li>Draw bac water amount (see table above) into syringe</li>
            <li>Inject slowly into vial — aim needle at glass wall, not powder</li>
            <li>Swirl gently to dissolve — <strong>never shake</strong></li>
            <li>Refrigerate immediately — label with date</li>
            <li>Use within <strong>30–60 days</strong> (HCG up to 60 days; NAD+ use within 30)</li>
          </ol>
          <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(241,91,91,0.1)", borderRadius: 8, border: "1px solid rgba(241,91,91,0.3)" }}>
            <span style={{ color: "#f15b5b", fontWeight: 600, fontSize: "0.85rem" }}>⚠️ Syringe units = U-100 insulin syringe (100 units = 1mL)</span>
          </div>
        </div>
      </div>

      {/* Ground Rules */}
      <div style={{ marginTop: 32, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
          ⚠️ Ground Rules
        </h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: "var(--text)", fontSize: "0.85rem", lineHeight: 1.8 }}>
          <li>Keep Retatrutide and Tesamorelin steady</li>
          <li>Add only <strong>1 new compound every 7 days</strong></li>
          <li>Do not increase dose and add a new peptide in the same week</li>
          <li>Do not mix compounds in the same syringe unless pharmacy confirms compatibility</li>
          <li>Rotate injection sites</li>
          <li>If side effects appear, <strong>freeze the stack</strong> and identify the newest addition first</li>
        </ul>
      </div>
    </div>
  );
}
