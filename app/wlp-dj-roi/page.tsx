"use client";

import { useState } from "react";

export default function DJAutomationROI() {
  const [numVenues, setNumVenues] = useState(1);
  const [weeklySavings, setWeeklySavings] = useState(800);

  const annualLaborSavings = numVenues * weeklySavings * 52;
  const annualSoftwareCost = numVenues * 1500 * 12;
  const netAnnualSavings = annualLaborSavings - annualSoftwareCost;
  const roiWeeks = annualLaborSavings > annualSoftwareCost ? (annualSoftwareCost / (weeklySavings * numVenues)).toFixed(1) : "N/A";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
          💰 DJ Automation ROI Calculator
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.95rem" }}>
          Estimate annual savings by automating DJ management
        </p>
      </div>

      {/* Input Section */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 24px", color: "var(--text)" }}>
          Your Venue Setup
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
          {/* Number of Venues */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              Number of Venues
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={numVenues}
              onChange={(e) => setNumVenues(Math.max(1, Number(e.target.value)))}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Weekly Savings */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "var(--text)",
                marginBottom: "8px",
              }}
            >
              Total $ saved per week in labor costs, per venue
            </label>
            <input
              type="number"
              min="1"
              max="5000"
              value={weeklySavings}
              onChange={(e) => setWeeklySavings(Math.max(1, Number(e.target.value)))}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div
        style={{
          background: "var(--card)",
          border: "2px solid var(--accent)",
          borderRadius: "12px",
          padding: "32px",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 32px", color: "var(--accent)" }}>
          Annual Impact
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Labor Savings
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--success)", margin: "8px 0 0" }}>
              ${annualLaborSavings.toLocaleString()}
            </p>
          </div>

          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Software Cost
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              ${annualSoftwareCost.toLocaleString()}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "6px 0 0" }}>
              ({numVenues} × $1,500 × 12)
            </p>
          </div>

          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              NET Annual Savings
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              ${netAnnualSavings.toLocaleString()}
            </p>
          </div>

          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Payback Period
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              {typeof roiWeeks === "string" && roiWeeks === "N/A" ? "N/A" : `${roiWeeks} weeks`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
