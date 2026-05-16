"use client";

import Link from "next/link";
import Image from "next/image";

export default function RhinoRadioPage() {
  return (
    <div>
      {/* Hero Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 36,
          padding: "32px 0 20px",
        }}
      >
        <Image
          src="/images/rhino-radio-logo.jpg"
          alt="ANIMAL Rhino Radio"
          width={340}
          height={340}
          priority
          style={{
            borderRadius: 20,
            boxShadow: "0 0 60px rgba(180, 30, 30, 0.45), 0 0 20px rgba(201,168,76,0.25)",
            objectFit: "cover",
          }}
        />
        <p style={{ color: "var(--muted)", marginTop: 18, fontSize: "0.9rem", textAlign: "center" }}>
          Broadcast management, promotions, and complimentary entry code tracking.
        </p>
        <Link href="/promotions" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none", marginTop: 8, display: "inline-block" }}>← Back to Promotions</Link>
      </div>

      {/* Navigation Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <Link
          href="/comp-codes"
          style={{
            display: "block",
            padding: 24,
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--card)",
            textDecoration: "none",
            color: "inherit",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>🎟️</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 8px", color: "var(--text)" }}>
            Complimentary Entry Codes
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
            Track and manage complimentary entry codes issued to guests, partners, and VIPs.
          </p>
        </Link>
      </div>

    </div>
  );
}
