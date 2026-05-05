"use client";

import { useState } from "react";
import SharedDocView from "@/components/SharedDocView";

export default function SharedInvestorMaterials() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "wlp2026") {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  if (!authenticated) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center", padding: 40 }}>
        <h2 style={{ marginBottom: 20, color: "var(--text)" }}>🔒 Investor Materials</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>Enter password to access</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Access Materials
        </button>
        {error && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <SharedDocView fileName="investor-targets.md" title="🎯 Investor Target List" />
    </div>
  );
}
