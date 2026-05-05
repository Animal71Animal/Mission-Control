"use client";

import { useState } from "react";

export default function DJAutomationROI() {
  const [numVenues, setNumVenues] = useState(1);
  const [totalDJs, setTotalDJs] = useState(2);
  const [hoursReplaced, setHoursReplaced] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(20);

  const annualSavings = totalDJs * hoursReplaced * hourlyRate * 52;
  const monthlySoftwareCost = 2000 * numVenues;
  const annualSoftwareCost = monthlySoftwareCost * 12;
  const netAnnualSavings = annualSavings - annualSoftwareCost;
  const monthlySavings = annualSavings / 12;
  const roiMonths = monthlySavings > monthlySoftwareCost ? (annualSoftwareCost / (annualSavings - annualSoftwareCost)).toFixed(1) : "N/A";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
          💰 DJ Automation ROI Calculator
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.95rem" }}>
          See how much your venue saves with automated DJ management
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
              onChange={(e) => setNumVenues(Number(e.target.value))}
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

          {/* Total DJs */}
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
              Total DJs (All Venues)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={totalDJs}
              onChange={(e) => setTotalDJs(Number(e.target.value))}
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

          {/* Manual Hours Replaced */}
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
              Manual Hours Replaced (Per Year)
            </label>
            <input
              type="number"
              min="1"
              max="2080"
              value={hoursReplaced}
              onChange={(e) => setHoursReplaced(Number(e.target.value))}
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
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: "8px 0 0" }}>
              Per DJ (e.g. 40 hrs/wk × 52 weeks = 2,080 hrs/yr)
            </p>
          </div>

          {/* Hourly Rate */}
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
              Hourly Rate ($)
            </label>
            <input
              type="number"
              min="5"
              max="200"
              step="1"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
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
          {/* Weekly Savings */}
          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Weekly Savings
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)", margin: "8px 0 0" }}>
              ${weeklySavings.toLocaleString()}
            </p>
          </div>

          {/* Monthly Savings */}
          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Monthly Savings
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)", margin: "8px 0 0" }}>
              ${monthlySavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* Annual Savings */}
          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Annual DJ Cost Savings
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--success)", margin: "8px 0 0" }}>
              ${annualSavings.toLocaleString()}
            </p>
          </div>

          {/* Software Cost */}
          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Annual Software Cost
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              ${annualSoftwareCost.toLocaleString()}
            </p>
          </div>

          {/* Net Annual Savings */}
          <div style={{ padding: "20px", background: "var(--success)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", margin: 0 }}>
              NET Annual Savings
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "8px 0 0" }}>
              ${netAnnualSavings.toLocaleString()}
            </p>
          </div>

          {/* ROI Payback */}
          <div style={{ padding: "20px", background: "var(--bg)", borderRadius: "8px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Payback Period
            </p>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text)", margin: "8px 0 0" }}>
              {roiMonths < 1 ? "< 1 month" : `${roiMonths.toFixed(1)} months`}
            </p>
          </div>
        </div>

        {/* Interpretation */}
        <div
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 12px", color: "var(--text)" }}>
            What This Means
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>
            Your venue would save <strong style={{ color: "var(--text)" }}>${netAnnualSavings.toLocaleString()}</strong> per
            year by replacing {djsPerShift} DJs per shift with automated management. The software pays for itself in{" "}
            <strong style={{ color: "var(--text)" }}>
              {roiMonths < 1 ? "less than a month" : `${roiMonths.toFixed(1)} months`}
            </strong>
            . After that, it's pure profit.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--text)" }}>
          Where Does the Savings Come From?
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--accent)" }}>DJ Labor Replacement:</strong> One head DJ replaces multiple shift DJs at full labor cost
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--accent)" }}>Zero Dead Air Reliability:</strong> No missed opportunities or lost revenue from system failures
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--accent)" }}>Compliance & Reduced Risk:</strong> Automated content filtering reduces incidents and disputes
          </li>
          <li style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <strong style={{ color: "var(--accent)" }}>Room Energy Optimization:</strong> AI-adaptive music selection increases customer spend and retention
          </li>
        </ul>
      </div>
    </div>
  );
}
