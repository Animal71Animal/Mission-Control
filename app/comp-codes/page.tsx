"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompCode {
  id: string;
  code: string;
  recipientName: string;
  issuedDate: string;
  expiryDate: string;
  used: boolean;
  notes: string;
}

export default function CompCodesPage() {
  const [codes, setCodes] = useState<CompCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCode, setEditCode] = useState<CompCode | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "used">("all");
  const [form, setForm] = useState({
    code: "",
    recipientName: "",
    issuedDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    used: false,
    notes: "",
  });

  useEffect(() => {
    fetch("/api/comp-codes")
      .then((r) => r.json())
      .then((data) => {
        setCodes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditCode(null);
    setForm({
      code: "",
      recipientName: "",
      issuedDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      used: false,
      notes: "",
    });
    setShowModal(true);
  };

  const openEdit = (c: CompCode) => {
    setEditCode(c);
    setForm({
      code: c.code,
      recipientName: c.recipientName,
      issuedDate: c.issuedDate,
      expiryDate: c.expiryDate,
      used: c.used,
      notes: c.notes,
    });
    setShowModal(true);
  };

  const submitForm = async () => {
    if (!form.code.trim() || !form.recipientName.trim()) return;
    setSaving(true);
    if (editCode) {
      const res = await fetch("/api/comp-codes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editCode.id, ...form }),
      });
      const data = await res.json();
      if (data.ok) setCodes((prev) => prev.map((c) => (c.id === editCode.id ? data.code : c)));
    } else {
      const res = await fetch("/api/comp-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) setCodes((prev) => [data.code, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const deleteCode = async (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/comp-codes?id=${id}`, { method: "DELETE" });
  };

  const toggleUsed = async (id: string) => {
    const c = codes.find((x) => x.id === id);
    if (!c) return;
    const used = !c.used;
    setCodes((prev) => prev.map((x) => (x.id === id ? { ...x, used } : x)));
    await fetch("/api/comp-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, used }),
    });
  };

  const isExpired = (expiry: string) => {
    if (!expiry) return false;
    return new Date(expiry + "T12:00:00") < new Date();
  };

  const filtered =
    filter === "all"
      ? codes
      : filter === "used"
      ? codes.filter((c) => c.used)
      : codes.filter((c) => !c.used);

  const activeCount = codes.filter((c) => !c.used).length;
  const usedCount = codes.filter((c) => c.used).length;
  const expiredCount = codes.filter((c) => !c.used && isExpired(c.expiryDate)).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: 0,
              background: "linear-gradient(135deg, #9b5de5, #c77dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🎟️ Complimentary Entry Codes
          </h1>
          <Link href="/rhino-radio" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
            ← Back to Rhino Radio
          </Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Complimentary entry codes issued to guests, partners, and VIPs.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total", value: codes.length, color: "var(--text)" },
          { label: "Active", value: activeCount, color: "#00c87c" },
          { label: "Used", value: usedCount, color: "var(--accent2)" },
          { label: "Expired", value: expiredCount, color: "#ef4444" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <button
          onClick={openAdd}
          style={{ padding: "8px 18px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
        >
          + Add Code
        </button>
        {(["all", "active", "used"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: "0.8rem", cursor: "pointer",
              background: filter === f ? "var(--accent)" : "var(--card)",
              border: "1px solid var(--border)",
              color: filter === f ? "#000" : "var(--text)",
              fontWeight: filter === f ? 700 : 400,
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
        {saving && <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Saving to GitHub...</span>}
      </div>

      {/* Code List */}
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--muted)" }}>
          {codes.length === 0 ? "No entry codes yet. Click + Add Code to get started." : "No codes match this filter."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((c) => {
            const expired = !c.used && isExpired(c.expiryDate);
            return (
              <div
                key={c.id}
                style={{
                  background: "var(--card)",
                  border: `1px solid ${expired ? "#ef444444" : "var(--border)"}`,
                  borderLeft: `4px solid ${c.used ? "var(--border)" : expired ? "#ef4444" : "#00c87c"}`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: c.used ? 0.55 : 1,
                }}
              >
                {/* Toggle used */}
                <div
                  onClick={() => toggleUsed(c.id)}
                  title="Mark used/unused"
                  style={{
                    width: 20, height: 20, borderRadius: 4, border: "2px solid var(--accent)",
                    background: c.used ? "var(--accent)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, cursor: "pointer",
                  }}
                >
                  {c.used && <span style={{ color: "#000", fontSize: 12 }}>✓</span>}
                </div>

                {/* Code badge */}
                <code style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", fontSize: "0.85rem", fontWeight: 700, color: "var(--accent2)", flexShrink: 0, letterSpacing: 1 }}>
                  {c.code}
                </code>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)", marginBottom: 4, textDecoration: c.used ? "line-through" : "none" }}>
                    {c.recipientName}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: "0.75rem", color: "var(--muted)" }}>
                    <span>📅 Issued: {c.issuedDate}</span>
                    {c.expiryDate && (
                      <span style={{ color: expired ? "#ef4444" : "var(--muted)" }}>
                        ⏱ Expires: {c.expiryDate}
                        {expired && <span style={{ marginLeft: 4, fontWeight: 700 }}>⚠ EXPIRED</span>}
                      </span>
                    )}
                    {c.used && <span style={{ color: "#00c87c", fontWeight: 600 }}>✓ Used</span>}
                    {c.notes && <span>📝 {c.notes}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEdit(c)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--accent2)", fontSize: "0.8rem" }}>✏️</button>
                  <button onClick={() => deleteCode(c.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "#ef4444", fontSize: "0.8rem" }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: "90%", maxWidth: 480 }}>
            <h3 style={{ margin: "0 0 20px", color: "var(--text)" }}>{editCode ? "Edit Code" : "Add Entry Code"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Code *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. RHINO-VIP-01"
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "monospace" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Recipient *</label>
                  <input
                    value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    placeholder="Guest or partner name"
                    style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Issued Date</label>
                  <input type="date" value={form.issuedDate} onChange={(e) => setForm((f) => ({ ...f, issuedDate: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Expiry Date (optional)</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))} style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Notes (optional)</label>
                <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Radio promo, contest winner, partner deal..." style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="usedCheck" checked={form.used} onChange={(e) => setForm((f) => ({ ...f, used: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }} />
                <label htmlFor="usedCheck" style={{ fontSize: "0.85rem", color: "var(--text)", cursor: "pointer" }}>Mark as used</label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
              <button onClick={submitForm} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, cursor: "pointer" }}>
                {editCode ? "Save Changes" : "Add Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
