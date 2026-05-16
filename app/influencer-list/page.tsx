"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SocialProfile {
  handle: string;
  followers: string;
}

interface Influencer {
  id: string;
  name: string;
  instagram?: SocialProfile;
  tiktok?: SocialProfile;
  twitter?: SocialProfile;
  youtube?: SocialProfile;
  facebook?: SocialProfile;
  status: "active" | "contacted" | "pending" | "passed";
  notes: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#00c87c",
  contacted: "#f59e0b",
  pending: "#6b7280",
  passed: "#ef4444",
};

const STATUS_BG: Record<string, string> = {
  active: "rgba(0,200,124,0.15)",
  contacted: "rgba(245,158,11,0.15)",
  pending: "rgba(107,114,128,0.15)",
  passed: "rgba(239,68,68,0.15)",
};

const PLATFORMS = ["instagram", "tiktok", "twitter", "youtube", "facebook"] as const;
const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📸",
  tiktok: "🎵",
  twitter: "🐦",
  youtube: "▶️",
  facebook: "👤",
};

type Platform = typeof PLATFORMS[number];

const blankForm = () => ({
  name: "",
  instagram: { handle: "", followers: "" },
  tiktok: { handle: "", followers: "" },
  twitter: { handle: "", followers: "" },
  youtube: { handle: "", followers: "" },
  facebook: { handle: "", followers: "" },
  status: "pending" as Influencer["status"],
  notes: "",
});

export default function InfluencerListPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editInfluencer, setEditInfluencer] = useState<Influencer | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(blankForm());

  useEffect(() => {
    fetch("/api/influencer-list")
      .then((r) => r.json())
      .then((data) => {
        setInfluencers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditInfluencer(null);
    setForm(blankForm());
    setShowModal(true);
  };

  const openEdit = (inf: Influencer) => {
    setEditInfluencer(inf);
    setForm({
      name: inf.name,
      instagram: inf.instagram ?? { handle: "", followers: "" },
      tiktok: inf.tiktok ?? { handle: "", followers: "" },
      twitter: inf.twitter ?? { handle: "", followers: "" },
      youtube: inf.youtube ?? { handle: "", followers: "" },
      facebook: inf.facebook ?? { handle: "", followers: "" },
      status: inf.status,
      notes: inf.notes,
    });
    setShowModal(true);
  };

  const submitForm = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    // Strip empty social profiles before sending
    const payload: Record<string, unknown> = { name: form.name, status: form.status, notes: form.notes };
    for (const p of PLATFORMS) {
      const profile = form[p] as SocialProfile;
      if (profile?.handle) payload[p] = profile;
    }

    if (editInfluencer) {
      const res = await fetch("/api/influencer-list", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editInfluencer.id, ...payload }),
      });
      const data = await res.json();
      if (data.ok) setInfluencers((prev) => prev.map((i) => (i.id === editInfluencer.id ? data.influencer : i)));
    } else {
      const res = await fetch("/api/influencer-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) setInfluencers((prev) => [...prev, data.influencer]);
    }
    setSaving(false);
    setShowModal(false);
  };

  const deleteInfluencer = async (id: string) => {
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/influencer-list?id=${id}`, { method: "DELETE" });
  };

  const updatePlatform = (platform: string, field: "handle" | "followers", value: string) => {
    setForm((f) => ({
      ...f,
      [platform]: { ...(f[platform as Platform] ?? {}), [field]: value },
    }));
  };

  const totalFollowers = (inf: Influencer): string => {
    let total = 0;
    for (const p of PLATFORMS) {
      const profile = inf[p];
      if (profile?.followers) {
        const raw = parseFloat(profile.followers.replace(/[^0-9.]/g, ""));
        const unit = profile.followers.toLowerCase();
        if (unit.includes("m")) total += raw * 1_000_000;
        else if (unit.includes("k")) total += raw * 1_000;
        else total += raw;
      }
    }
    if (total === 0) return "—";
    if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
    if (total >= 1_000) return `${(total / 1_000).toFixed(1)}K`;
    return total.toString();
  };

  const filtered = influencers
    .filter((i) => filterStatus === "all" || i.status === filterStatus)
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      if (i.name.toLowerCase().includes(q)) return true;
      return PLATFORMS.some((p) => i[p]?.handle?.toLowerCase().includes(q));
    });

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
            ⭐ Influencer List
          </h1>
          <Link href="/promotions" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
            ← Back to Promotions
          </Link>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Local and regional influencers for Spearmint Rhino partnership targeting.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total", value: influencers.length, color: "var(--text)" },
          { label: "Active", value: influencers.filter((i) => i.status === "active").length, color: "#00c87c" },
          { label: "Contacted", value: influencers.filter((i) => i.status === "contacted").length, color: "#f59e0b" },
          { label: "Pending", value: influencers.filter((i) => i.status === "pending").length, color: "var(--muted)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={openAdd}
          style={{ padding: "8px 18px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
        >
          + Add Influencer
        </button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or @handle..."
          style={{ padding: "8px 14px", borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.85rem", minWidth: 200 }}
        />
        {(["all", "active", "contacted", "pending", "passed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem", cursor: "pointer",
              background: filterStatus === s ? "var(--accent)" : "var(--card)",
              border: "1px solid var(--border)",
              color: filterStatus === s ? "#000" : "var(--text)",
              fontWeight: filterStatus === s ? 700 : 400,
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
        {saving && <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Saving to GitHub...</span>}
      </div>

      {/* Influencer Cards */}
      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center", color: "var(--muted)" }}>
          {influencers.length === 0 ? "No influencers yet. Click + Add Influencer to get started." : "No influencers match this filter."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((inf) => (
            <div key={inf.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px", color: "var(--text)" }}>{inf.name}</h2>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_BG[inf.status], color: STATUS_COLORS[inf.status], textTransform: "capitalize" }}>
                    {inf.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Total reach</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--accent2)" }}>{totalFollowers(inf)}</div>
                  </div>
                  <button onClick={() => openEdit(inf)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--accent2)", fontSize: "0.8rem" }}>✏️</button>
                  <button onClick={() => deleteInfluencer(inf.id)} style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg)", border: "1px solid var(--border)", cursor: "pointer", color: "#ef4444", fontSize: "0.8rem" }}>🗑</button>
                </div>
              </div>

              {/* Social Platforms */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: inf.notes ? 14 : 0 }}>
                {PLATFORMS.map((p) => {
                  const profile = inf[p];
                  if (!profile?.handle && !profile?.followers) return null;
                  return (
                    <div key={p} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1rem" }}>{PLATFORM_ICONS[p]}</span>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "capitalize" }}>{p}</div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text)", fontWeight: 600 }}>
                          {profile?.handle && <span>{profile.handle}</span>}
                          {profile?.handle && profile?.followers && <span style={{ color: "var(--muted)" }}> · </span>}
                          {profile?.followers && <span style={{ color: "var(--accent2)" }}>{profile.followers}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notes */}
              {inf.notes && (
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
                  📝 {inf.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px 0" }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 28, width: "90%", maxWidth: 520, margin: "auto" }}>
            <h3 style={{ margin: "0 0 20px", color: "var(--text)" }}>{editInfluencer ? "Edit Influencer" : "Add Influencer"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name + Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Influencer["status"] }))} style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem" }}>
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="active">Active</option>
                    <option value="passed">Passed</option>
                  </select>
                </div>
              </div>

              {/* Social Platforms */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 12, fontWeight: 600 }}>Social Platforms</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PLATFORMS.map((p) => (
                    <div key={p} style={{ display: "grid", gridTemplateColumns: "110px 1fr 100px", gap: 8, alignItems: "center" }}>
                      <div style={{ fontSize: "0.82rem", color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{PLATFORM_ICONS[p]}</span>
                        <span style={{ textTransform: "capitalize" }}>{p}</span>
                      </div>
                      <input
                        value={(form[p] as SocialProfile)?.handle ?? ""}
                        onChange={(e) => updatePlatform(p, "handle", e.target.value)}
                        placeholder="@handle"
                        style={{ padding: "8px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontSize: "0.82rem" }}
                      />
                      <input
                        value={(form[p] as SocialProfile)?.followers ?? ""}
                        onChange={(e) => updatePlatform(p, "followers", e.target.value)}
                        placeholder="e.g. 12.4K"
                        style={{ padding: "8px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--accent2)", fontSize: "0.82rem", fontWeight: 600 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>Notes (optional)</label>
                <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Niche, collab ideas, contact info..." style={{ width: "100%", padding: "10px 12px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: "0.9rem", boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
              <button onClick={submitForm} style={{ padding: "9px 20px", borderRadius: 8, background: "var(--accent)", border: "none", color: "#000", fontWeight: 700, cursor: "pointer" }}>
                {editInfluencer ? "Save Changes" : "Add Influencer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
