"use client";

import { useEffect, useState } from "react";

interface Compound {
  name: string;
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
  phase?: string;
  phase_duration?: string;
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

export default function PeptidesPage() {
  const [data, setData] = useState<PeptideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          💉 Peptide Stack
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
          Started: {data.started} • Phase: <strong>{data.current_phase}</strong>
        </p>
      </div>

      {/* Compounds Overview */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          Compounds
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {data.compounds.map((compound, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {compound.name}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{compound.concentration}</p>
              </div>

              <div style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--text)" }}>
                <div>
                  <strong>Dosage:</strong>{" "}
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
                {compound.status && (
                  <div style={{ marginTop: 8, padding: "8px", background: "var(--bg)", borderRadius: "4px" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{compound.status}</span>
                  </div>
                )}
              </div>

              <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 12, fontStyle: "italic" }}>
                {compound.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          📅 Weekly Schedule — {data.current_phase}
        </h2>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "16px",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--text)" }}>Day</th>
                <th style={{ textAlign: "left", padding: "8px", color: "var(--text)" }}>Schedule</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.weekly_schedule_loading_phase).map(([day, schedule]: any) => (
                <tr key={day} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px", color: "var(--text)", fontWeight: 500, textTransform: "capitalize" }}>
                    {day}
                  </td>
                  <td style={{ padding: "8px", color: "var(--muted)" }}>
                    {typeof schedule === "object" ? (
                      <div>
                        {Object.entries(schedule).map(([time, dose]: any) => (
                          <div key={time}>
                            <strong>{time}:</strong> {dose}
                          </div>
                        ))}
                      </div>
                    ) : (
                      schedule
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
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
