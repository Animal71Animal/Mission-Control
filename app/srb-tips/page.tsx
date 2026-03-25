"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface SrbTipsData {
  monthlyTotals: { month: string; amount: number; nights: number }[];
  topTippers: { rank: number; name: string; jan: number; feb: number; mar: number; total: number; badge: string | null }[];
  allDancers: { name: string; jan: number; feb: number; mar: number }[];
  customerTips: { month: string; amount: number; topNight: string }[];
}

interface MonthDetail {
  month: string;
  amount: number;
  nights: number;
  weeklyBreakdown: { week: string; amount: number }[];
  entertainers: { name: string; amount: number }[];
  top10: { rank: number; name: string; amount: number; badge: string | null }[];
}

export default function SrbTipsPage() {
  const [data, setData] = useState<SrbTipsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [entertainerTotalsOpen, setEntertainerTotalsOpen] = useState(false);

  useEffect(() => {
    fetch("/data/srb-tips-data.json")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>💰 SRB Tips</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const { monthlyTotals, topTippers, allDancers } = data;
  const quarterTotal = monthlyTotals.reduce((sum, m) => sum + m.amount, 0);

  // Generate month details from data
  const getMonthDetails = (month: string): MonthDetail | null => {
    if (month === "Q1") return null; // Q1 doesn't have month details
    
    const monthKey = month.toLowerCase().slice(0, 3) as 'jan' | 'feb' | 'mar';
    const monthData = monthlyTotals.find(m => m.month === month);
    
    if (!monthData) return null;
    
    // Sort entertainers by this month's tips
    const entertainers = allDancers
      .map(d => ({ name: d.name, amount: d[monthKey] || 0 }))
      .filter(d => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    
    // Top 10 for this month
    const top10 = entertainers.slice(0, 10).map((e, i) => ({
      rank: i + 1,
      name: e.name,
      amount: e.amount,
      badge: i === 0 ? "gold" : i === 1 ? "gold" : i === 2 ? "silver" : i < 5 ? "silver" : "bronze",
    }));

    // Mock weekly breakdown (would come from real data)
    const weeklyBreakdown = [
      { week: "Week 1", amount: Math.round(monthData.amount * 0.28) },
      { week: "Week 2", amount: Math.round(monthData.amount * 0.22) },
      { week: "Week 3", amount: Math.round(monthData.amount * 0.26) },
      { week: "Week 4", amount: Math.round(monthData.amount * 0.24) },
    ];

    return {
      month,
      amount: monthData.amount,
      nights: monthData.nights,
      weeklyBreakdown,
      entertainers,
      top10,
    };
  };

  // Get dancer totals based on search and date range
  const getDancerTotals = () => {
    if (!searchName) return null;
    
    const dancer = allDancers.find(d => 
      d.name.toLowerCase().includes(searchName.toLowerCase())
    );
    
    if (!dancer) return null;

    let jan = dancer.jan;
    let feb = dancer.feb;
    let mar = dancer.mar;

    // Apply date range filter
    if (dateRange === "jan") { feb = 0; mar = 0; }
    else if (dateRange === "feb") { jan = 0; mar = 0; }
    else if (dateRange === "mar") { jan = 0; feb = 0; }
    else if (dateRange === "q1") { /* all months */ }

    const total = jan + feb + mar;
    
    return { name: dancer.name, jan, feb, mar, total };
  };

  const badgeStyle = (badge: string | null) => {
    if (badge === "gold") return { background: "#ffd700", color: "#000" };
    if (badge === "silver") return { background: "#c0c0c0", color: "#000" };
    if (badge === "bronze") return { background: "#cd7f32", color: "#fff" };
    return { background: "var(--border)", color: "var(--muted)" };
  };

  const monthDetail = selectedMonth ? getMonthDetails(selectedMonth) : null;
  const dancerResult = getDancerTotals();

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: "1.8rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #9b5de5, #c77dff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          💰 SRB Tips
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
          Spearmint Rhino Boise tip tracking · Jan-Mar 2026
        </p>
      </div>

      {/* Monthly Stats - Clickable */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 16,
        marginBottom: 28 
      }}>
        {monthlyTotals.map((m) => (
          <button
            key={m.month}
            onClick={() => setSelectedMonth(m.month)}
            style={{
              background: selectedMonth === m.month ? "linear-gradient(135deg, rgba(155,93,229,0.3), rgba(199,125,255,0.3))" : "var(--card)",
              border: selectedMonth === m.month ? "1px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: 12,
              padding: 20,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>{m.month} 2026</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>
              ${m.amount.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
              {m.nights} nights
            </div>
          </button>
        ))}
        
        {/* Quarter Total */}
        <button
          onClick={() => setSelectedMonth("Q1")}
          style={{
            background: selectedMonth === "Q1" ? "linear-gradient(135deg, rgba(155,93,229,0.4), rgba(199,125,255,0.4))" : "linear-gradient(135deg, rgba(155,93,229,0.2), rgba(199,125,255,0.2))",
            border: selectedMonth === "Q1" ? "1px solid var(--accent)" : "1px solid var(--accent)",
            borderRadius: 12,
            padding: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--accent2)", marginBottom: 4 }}>Q1 2026 Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent2)" }}>
            ${quarterTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Jan-Mar 2026
          </div>
        </button>
      </div>

      {/* Month Detail View */}
      {monthDetail && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              {monthDetail.month} 2026 Details
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Weekly Breakdown */}
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Weekly Breakdown
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {monthDetail.weeklyBreakdown.map((w) => (
                  <div key={w.week} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--muted)" }}>{w.week}</span>
                    <span style={{ fontWeight: 600 }}>${w.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 This Month */}
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🏆 Top 10 Tippers
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {monthDetail.top10.map((t) => (
                  <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "1px 6px",
                      borderRadius: 4,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      ...badgeStyle(t.badge),
                    }}>
                      {t.rank}
                    </span>
                    <span style={{ flex: 1 }}>{t.name}</span>
                    <span style={{ fontWeight: 600 }}>${t.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Entertainers This Month */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              All Entertainers — {monthDetail.month}
            </h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", 
              gap: 10,
              maxHeight: "200px",
              overflowY: "auto",
            }}>
              {monthDetail.entertainers.map((e) => (
                <div key={e.name} style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "8px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: "0.8rem" }}>{e.name}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent2)" }}>${e.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Q1 Summary View */}
      {selectedMonth === "Q1" && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              Q1 2026 Summary
            </h2>
            <button
              onClick={() => setSelectedMonth(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
            {monthlyTotals.map((m) => (
              <div key={m.month} style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
              }}>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{m.month}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)" }}>${m.amount.toLocaleString()}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{m.nights} nights</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🏆 Q1 Top 10 Overall
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {topTippers.slice(0, 10).map((t) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  ...badgeStyle(t.badge),
                }}>
                  {t.rank}
                </span>
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>J:${t.jan} F:${t.feb} M:${t.mar}</span>
                <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${t.total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Entertainer Totals - Collapsible */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <button
          onClick={() => setEntertainerTotalsOpen(!entertainerTotalsOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "16px 20px",
            background: "transparent",
            border: "none",
            color: "var(--text)",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span>🎭 Entertainer Totals</span>
          <span style={{ 
            transform: entertainerTotalsOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>▼</span>
        </button>
        
        {entertainerTotalsOpen && (
          <div style={{ padding: "0 20px 20px", animation: "fadeIn 0.2s ease" }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            
            {/* Search & Filter */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Search entertainer name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: "10px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  padding: "10px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--text)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Time (Q1)</option>
                <option value="jan">January Only</option>
                <option value="feb">February Only</option>
                <option value="mar">March Only</option>
                <option value="q1">Q1 Total</option>
              </select>
            </div>

            {/* Search Result */}
            {dancerResult ? (
              <div style={{
                background: "linear-gradient(135deg, rgba(155,93,229,0.1), rgba(199,125,255,0.1))",
                border: "1px solid var(--accent)",
                borderRadius: 12,
                padding: 20,
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", color: "var(--text)" }}>
                  {dancerResult.name}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
                  {dateRange === "all" || dateRange === "q1" ? (
                    <>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>January</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.jan}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>February</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.feb}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>March</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.mar}</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ gridColumn: "span 3" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {dateRange === "jan" ? "January" : dateRange === "feb" ? "February" : "March"}
                      </div>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent2)" }}>
                        ${dateRange === "jan" ? dancerResult.jan : dateRange === "feb" ? dancerResult.feb : dancerResult.mar}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent2)" }}>Total</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent2)" }}>${dancerResult.total}</div>
                  </div>
                </div>
              </div>
            ) : searchName ? (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
                No entertainer found matching "{searchName}"
              </div>
            ) : (
              <div style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
                Enter a name above to search entertainer totals
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
