"use client";

import { useState, useEffect } from "react";

interface Feature {
  title: string;
  desc: string;
}

interface DocLink {
  name: string;
  desc: string;
  href: string;
}

interface DJAutomationData {
  title: string;
  description: string;
  docs: DocLink[];
  features: Feature[];
  techStack: string[];
}

export default function SharedDJAutomationPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<DJAutomationData | null>(null);
  const [loading, setLoading] = useState(false);
  const correctPassword = "wlp2025";

  // ROI Calculator state
  const [numVenues, setNumVenues] = useState(1);
  const [totalDJs, setTotalDJs] = useState(2);
  const [hoursReplaced, setHoursReplaced] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(20);

  const annualSavings = totalDJs * hoursReplaced * hourlyRate * 52;
  const monthlySoftwareCost = 2000 * numVenues;
  const annualSoftwareCost = monthlySoftwareCost * 12;
  const netAnnualSavings = annualSavings - annualSoftwareCost;
  const monthlySavings = annualSavings / 12;
  const roiMonths = monthlySavings > monthlySoftwareCost ? (annualSoftwareCost / (annualSavings - annualSoftwareCost)).toFixed(1) : 'N/A';

  useEffect(() => {
    if (unlocked && !data) {
      setLoading(true);
      fetch("/api/dj-automation-card")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load DJ Automation data:", err);
          setLoading(false);
        });
    }
  }, [unlocked, data]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setUnlocked(true);
    } else {
      alert("Incorrect password");
      setPassword("");
    }
  };

  if (!unlocked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ maxWidth: "400px", width: "100%", padding: "20px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 16px", color: "var(--text)", textAlign: "center" }}>
            🤖 DJ Automation Software
          </h1>
          <p style={{ color: "var(--muted)", textAlign: "center", marginBottom: "32px" }}>
            Enter password to view
          </p>

          <form onSubmit={handleUnlock} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", color: "var(--muted)" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: "0 0 12px", color: "var(--text)" }}>
          🤖 {data.title}
        </h1>
        <p style={{ fontSize: "0.95rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          {data.description}
        </p>
      </div>

      {/* ROI Calculator Card */}
      <div
        style={{
          background: "var(--card)",
          border: "2px solid var(--accent)",
          borderRadius: "12px",
          padding: "32px",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 24px", color: "var(--accent)" }}>
          💰 Annual Savings Calculator
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
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
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
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
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
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
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
              }}
            />
            <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: "4px 0 0" }}>
              Per DJ (e.g. 40 hrs/wk × 52 weeks = 2,080 hrs/yr)
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
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
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
              }}
            />
          </div>
        </div>

        {/* Results Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
          <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "6px" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Weekly Savings
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", margin: "6px 0 0" }}>
              ${weeklySavings.toLocaleString()}
            </p>
          </div>

          <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "6px" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Monthly Savings
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--accent)", margin: "6px 0 0" }}>
              ${monthlySavings.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </div>

          <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "6px" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Monthly Software Cost
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: "6px 0 0" }}>
              ${monthlySoftwareCost.toLocaleString()}
            </p>
            <p style={{ fontSize: "0.65rem", color: "var(--muted)", margin: "4px 0 0" }}>
              ($2,000 × {numVenues} {numVenues === 1 ? "venue" : "venues"})
            </p>
          </div>

          <div style={{ padding: "16px", background: "var(--success)", borderRadius: "6px" }}>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", margin: 0 }}>
              NET Annual Savings
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", margin: "6px 0 0" }}>
              ${netAnnualSavings.toLocaleString()}
            </p>
          </div>

          <div style={{ padding: "16px", background: "var(--bg)", borderRadius: "6px" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", margin: 0 }}>
              Payback Period
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", margin: "6px 0 0" }}>
              {roiMonths === 'N/A' ? roiMonths : `${roiMonths}mo`}
            </p>
          </div>
        </div>
      </div>


      {/* Doc Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
        {data.docs.map((doc, i) => (
          <a
            key={i}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "20px",
              background: "var(--card)",
              border: "2px solid var(--accent)",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.color = "var(--bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card)";
              e.currentTarget.style.color = "var(--text)";
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 8px", color: "inherit" }}>
              {doc.name}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
              {doc.desc}
            </p>
          </a>
        ))}
      </div>

      {/* Key Features */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
          KEY FEATURES
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
          {data.features.map((feature, i) => (
            <li key={i} style={{ padding: "16px", background: "var(--card)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, margin: "0 0 6px", color: "var(--text)" }}>
                • {feature.title}
              </h4>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                {feature.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 16px", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "1px" }}>
          TECH STACK
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {data.techStack.map((tech, i) => (
            <span
              key={i}
              style={{
                padding: "8px 16px",
                background: "var(--accent)",
                color: "var(--bg)",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
