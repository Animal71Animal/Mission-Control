"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PartyConcept {
  id: string;
  name: string;
  icon: string;
  who: string;
  format: string;
  drinks: string;
  games: string;
  costuming: string;
  approved: boolean;
  flyerDone: boolean;
  frequency: string;
  dayAssigned: string | null;
}

interface PartyConceptsData {
  concepts: PartyConcept[];
  lastUpdated: string;
}

export default function PartyConceptsPage() {
  const [data, setData] = useState<PartyConceptsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PartyConcept>>({});

  useEffect(() => {
    fetch("/api/party-concepts")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.concepts) {
          setData(data);
        } else {
          // Fallback to local JSON
          fetch("/data/party-concepts-data.json")
            .then((r) => r.json())
            .then((localData) => setData(localData))
            .catch(() => setData(null));
        }
        setLoading(false);
      })
      .catch(() => {
        fetch("/data/party-concepts-data.json")
          .then((r) => r.json())
          .then((localData) => {
            setData(localData);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  const handleEdit = (concept: PartyConcept) => {
    setEditingId(concept.id);
    setEditForm({ ...concept });
  };

  const handleSave = async () => {
    if (!data || !editingId) return;

    const updatedConcepts = data.concepts.map((c) =>
      c.id === editingId ? { ...c, ...editForm } : c
    );

    const updatedData = { ...data, concepts: updatedConcepts, lastUpdated: new Date().toISOString() };

    try {
      const res = await fetch("/api/party-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: updatedConcepts }),
      });

      if (res.ok) {
        setData(updatedData);
        setEditingId(null);
        setEditForm({});
      } else {
        alert("Failed to save changes");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save changes");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const toggleApproved = async (concept: PartyConcept) => {
    if (!data) return;

    const updatedConcepts = data.concepts.map((c) =>
      c.id === concept.id ? { ...c, approved: !c.approved } : c
    );

    const updatedData = { ...data, concepts: updatedConcepts, lastUpdated: new Date().toISOString() };

    try {
      const res = await fetch("/api/party-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: updatedConcepts }),
      });

      if (res.ok) {
        setData(updatedData);
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const toggleFlyer = async (concept: PartyConcept) => {
    if (!data) return;

    const updatedConcepts = data.concepts.map((c) =>
      c.id === concept.id ? { ...c, flyerDone: !c.flyerDone } : c
    );

    const updatedData = { ...data, concepts: updatedConcepts, lastUpdated: new Date().toISOString() };

    try {
      const res = await fetch("/api/party-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concepts: updatedConcepts }),
      });

      if (res.ok) {
        setData(updatedData);
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  if (loading || !data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🎉 Party Concepts</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const { concepts } = data;
  const approvedCount = concepts.filter((c) => c.approved).length;
  const flyerCount = concepts.filter((c) => c.flyerDone).length;

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
            🎉 Party Concepts
          </h1>
          <Link
            href="/promotions"
            style={{
              fontSize: "0.85rem",
              color: "var(--muted)",
              textDecoration: "none",
            }}
          >
            ← Back to Promotions
          </Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Weekly and monthly event ideas for Spearmint Rhino Boise
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Total Concepts</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>{concepts.length}</div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Approved</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00c87c" }}>{approvedCount}</div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Flyers Done</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent2)" }}>{flyerCount}</div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Monthly Events</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>
            {concepts.filter((c) => c.frequency.includes("Monthly")).length}
          </div>
        </div>
      </div>

      {/* Concepts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {concepts.map((concept) => (
          <div
            key={concept.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            {/* Header Row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2rem" }}>{concept.icon}</span>
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
                    {concept.name}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{concept.frequency}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => toggleApproved(concept)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: concept.approved
                      ? "rgba(0,200,124,0.2)"
                      : "rgba(255,193,7,0.2)",
                    color: concept.approved ? "#00c87c" : "#ffc107",
                  }}
                >
                  {concept.approved ? "✓ Approved" : "Pending"}
                </button>
                <button
                  onClick={() => toggleFlyer(concept)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: concept.flyerDone
                      ? "rgba(0,200,124,0.2)"
                      : "rgba(128,128,128,0.2)",
                    color: concept.flyerDone ? "#00c87c" : "var(--muted)",
                  }}
                >
                  {concept.flyerDone ? "✓ Flyer Done" : "No Flyer"}
                </button>
                <button
                  onClick={() => handleEdit(concept)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: "1px solid var(--border)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    background: "var(--bg)",
                    color: "var(--text)",
                  }}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Edit Form */}
            {editingId === concept.id ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Who
                  </label>
                  <textarea
                    value={editForm.who || ""}
                    onChange={(e) => setEditForm({ ...editForm, who: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      minHeight: 60,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Format
                  </label>
                  <textarea
                    value={editForm.format || ""}
                    onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      minHeight: 60,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Drink Specials
                  </label>
                  <textarea
                    value={editForm.drinks || ""}
                    onChange={(e) => setEditForm({ ...editForm, drinks: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      minHeight: 60,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Games/Activities
                  </label>
                  <textarea
                    value={editForm.games || ""}
                    onChange={(e) => setEditForm({ ...editForm, games: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      minHeight: 60,
                    }}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                    Costuming
                  </label>
                  <textarea
                    value={editForm.costuming || ""}
                    onChange={(e) => setEditForm({ ...editForm, costuming: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      fontSize: "0.85rem",
                      minHeight: 60,
                    }}
                  />
                </div>
                <div style={{ gridColumn: "span 2", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: "var(--accent)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  fontSize: "0.9rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Who
                  </span>
                  <span style={{ color: "var(--text)" }}>{concept.who}</span>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Format
                  </span>
                  <span style={{ color: "var(--text)" }}>{concept.format}</span>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Drink Specials
                  </span>
                  <span style={{ color: "var(--text)" }}>{concept.drinks}</span>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Games/Activities
                  </span>
                  <span style={{ color: "var(--text)" }}>{concept.games}</span>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "var(--muted)", display: "block", marginBottom: 4, fontSize: "0.8rem" }}>
                    Costuming
                  </span>
                  <span style={{ color: "var(--text)" }}>{concept.costuming}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <p
        style={{
          marginTop: 24,
          fontSize: "0.75rem",
          color: "var(--muted)",
          textAlign: "right",
        }}
      >
        Last updated: {new Date(data.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}
