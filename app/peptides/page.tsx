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

const COLORS: Record<string, string> = {
  "Reta": "bg-red-900 border-red-700",
  "Tesa": "bg-blue-900 border-blue-700",
  "HCG": "bg-purple-900 border-purple-700",
  "Semax": "bg-green-900 border-green-700",
  "MT1": "bg-yellow-800 border-yellow-700",
};

const COMPOUND_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  "Reta": { bg: "bg-red-950", text: "text-red-200", light: "bg-red-900/30" },
  "Tesa": { bg: "bg-blue-950", text: "text-blue-200", light: "bg-blue-900/30" },
  "HCG": { bg: "bg-purple-950", text: "text-purple-200", light: "bg-purple-900/30" },
  "Semax": { bg: "bg-green-950", text: "text-green-200", light: "bg-green-900/30" },
  "MT1": { bg: "bg-yellow-950", text: "text-yellow-200", light: "bg-yellow-900/30" },
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function PeptidesPage() {
  const [data, setData] = useState<PeptideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [todayDoses, setTodayDoses] = useState<DailyDose[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  useEffect(() => {
    fetch("/data/peptide-stack.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (data && selectedDay) {
      const daySchedule = data.weekly_schedule_loading_phase[selectedDay.toLowerCase()];
      if (daySchedule) {
        const doses: DailyDose[] = [];
        Object.entries(daySchedule).forEach(([time, dose]: any) => {
          if (typeof dose === "string") {
            doses.push({ compound: "", time, dose, taken: false });
          } else {
            Object.entries(dose).forEach(([t, d]: any) => {
              doses.push({ compound: "", time: t, dose: d, taken: false });
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

  const toggleDose = (index: number) => {
    const key = `${selectedDay}-${index}`;
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
              border: `2px solid var(--border)`,
              fontSize: "0.9rem",
              color: colors.text,
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
              const colors = COMPOUND_COLORS[compound] || { bg: "bg-gray-950", text: "text-gray-200", light: "bg-gray-900/30" };
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
                    border: `2px solid ${isChecked ? "var(--success)" : "var(--border)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    opacity: isChecked ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      border: `2px solid ${isChecked ? "var(--success)" : colors.text}`,
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
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text)" }}>
                      {dose.time}: {dose.dose}
                    </div>
                    {compound && (
                      <div style={{ fontSize: "0.8rem", color: colors.text, marginTop: 4 }}>
                        {compound}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "1.2rem",
                      opacity: isChecked ? 1 : 0.3,
                      transition: "opacity 0.2s",
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
            const colors = COMPOUND_COLORS[compound_name] || { bg: "bg-gray-950", text: "text-gray-200", light: "bg-gray-900/30" };
            return (
              <div
                key={idx}
                style={{
                  background: colors.light,
                  border: `2px solid var(--border)`,
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
