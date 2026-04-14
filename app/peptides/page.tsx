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
    reconstitution_ml: number | null;
  };
  startDate: string | null;
  notes: string;
  logs: {
    date: string;
    dose: string;
    notes: string;
  }[];
}

interface WeeklyCheckIn {
  date: string;
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
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPeptide, setExpandedPeptide] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/peptide-stack.json")
      .then((res) => res.json())
      .then((data) => {
        setPeptides(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
                      Started: {new Date(peptide.startDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
                { day: "Monday", time: "8:00 AM", compound: "Retatrutide", dose: "60 units", color: "#00f5d4" },
                { day: "Monday", time: "9:30 PM", compound: "Tesamorelin", dose: "40 units", color: "#00f5d4" },
                { day: "Tuesday", time: "8:00 AM", compound: "HCG (Week 2+)", dose: "250 IU", color: "#9b5de5" },
                { day: "Tuesday", time: "9:30 PM", compound: "Tesamorelin", dose: "40 units", color: "#00f5d4" },
                { day: "Wednesday", time: "8:00 AM", compound: "Selank (Week 1+)", dose: "TBD", color: "#9b5de5" },
                { day: "Wednesday", time: "10:00 AM", compound: "NAD+ Buffer (Week 3+)", dose: "25-50 mg", color: "#00bbf9" },
                { day: "Wednesday", time: "9:30 PM", compound: "Tesamorelin", dose: "40 units", color: "#00f5d4" },
                { day: "Thursday", time: "8:00 AM", compound: "MOTS-c (Week 4+)", dose: "2.5-5 mg", color: "#00bbf9" },
                { day: "Thursday", time: "9:30 PM", compound: "Tesamorelin", dose: "40 units", color: "#00f5d4" },
                { day: "Friday", time: "8:00 AM", compound: "HCG (Week 2+)", dose: "250 IU", color: "#9b5de5" },
                { day: "Friday", time: "9:30 PM", compound: "Tesamorelin", dose: "40 units", color: "#00f5d4" },
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
