"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface SrbTipsData {
  monthlyTotals: { month: string; amount: number; nights: number }[];
  topTippers: { rank: number; name: string; jan: number; feb: number; mar: number; apr?: number; may?: number; jun?: number; total: number; badge: string | null }[];
  allDancers: { name: string; jan: number; feb: number; mar: number; apr?: number; may?: number; jun?: number; total?: number }[];
  customerTips: { month: string; amount: number; topNight: string }[];
  dailyTips?: { date: string; amount: number; dancers: { name: string; amount: number }[] }[];
  nightlyData?: Record<string, { date: string; total: number; dancers: { name: string; amount: number }[] }[]>;
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
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedNights, setExpandedNights] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/srb-tips")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.monthlyTotals && data.monthlyTotals.length > 0) {
          setData(data);
        } else {
          // Fallback to local JSON if API returns empty/error
          fetch("/data/srb-tips-data.json")
            .then((r) => r.json())
            .then((localData) => setData(localData))
            .catch(() => setData(null));
        }
        setLoading(false);
      })
      .catch(() => {
        fetch("/data/srb-tips-data.json")
          .then((r) => r.json())
          .then((localData) => {
            setData(localData);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>💰 SRB Tips</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const { monthlyTotals, topTippers, allDancers, nightlyData } = data;
  
  // Q1 = January, February, March
  const q1Months = monthlyTotals.filter(m => ['January', 'February', 'March'].includes(m.month));
  const q1Nights = q1Months.reduce((sum, m) => sum + m.nights, 0);
  const quarterTotal = q1Months.reduce((sum, m) => sum + m.amount, 0);
  
  // Calculate Q2 total (April, May, June)
  const q2Months = monthlyTotals.filter(m => ['April', 'May', 'June'].includes(m.month));
  const q2Total = q2Months.reduce((sum, m) => sum + m.amount, 0);
  const q2Nights = q2Months.reduce((sum, m) => sum + m.nights, 0);
  
  // Calculate May total from daily data
  const mayNights = nightlyData?.['May'] || [];
  const mayTotal = mayNights.reduce((sum, n) => sum + n.total, 0);
  const mayNightsCount = mayNights.length;

  // Generate month details from data
  const getMonthDetails = (month: string): MonthDetail | null => {
    if (month === "Q1" || month === "Q2") return null;
    
    const monthKey = month.toLowerCase().slice(0, 3) as 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun';
    const monthData = monthlyTotals.find(m => m.month === month);
    
    if (!monthData) return null;
    
    // Sort entertainers by this month's tips
    const entertainers = allDancers
      .map(d => ({ name: d.name, amount: (d as any)[monthKey] || 0 }))
      .filter(d => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    
    // Top 10 for this month
    const top10 = entertainers.slice(0, 10).map((e, i) => ({
      rank: i + 1,
      name: e.name,
      amount: e.amount,
      badge: i === 0 ? "gold" : i === 1 ? "gold" : i === 2 ? "silver" : i < 5 ? "silver" : "bronze",
    }));

    // Weekly breakdown removed per user request
    const weeklyBreakdown: { week: string; amount: number }[] = [];

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

    let jan = dancer.jan || 0;
    let feb = dancer.feb || 0;
    let mar = dancer.mar || 0;
    let apr = (dancer as any).apr || 0;
    let may = (dancer as any).may || 0;

    // Apply date range filter
    if (dateRange === "jan") { feb = 0; mar = 0; apr = 0; may = 0; }
    else if (dateRange === "feb") { jan = 0; mar = 0; apr = 0; may = 0; }
    else if (dateRange === "mar") { jan = 0; feb = 0; apr = 0; may = 0; }
    else if (dateRange === "q1") { apr = 0; may = 0; }
    else if (dateRange === "apr") { jan = 0; feb = 0; mar = 0; may = 0; }
    else if (dateRange === "may") { jan = 0; feb = 0; mar = 0; apr = 0; }
    else if (dateRange === "q2") { jan = 0; feb = 0; mar = 0; }

    const total = jan + feb + mar + apr + may;
    
    return { name: dancer.name, jan, feb, mar, apr, may, total };
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const toggleNight = (nightKey: string) => {
    setExpandedNights(prev => ({ ...prev, [nightKey]: !prev[nightKey] }));
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
          Spearmint Rhino Boise tip tracking · Jan-May 2026
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
        
        {/* Q1 Total */}
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

        {/* Q2 Total */}
        <button
          onClick={() => setSelectedMonth("Q2")}
          style={{
            background: selectedMonth === "Q2" ? "linear-gradient(135deg, rgba(0,200,124,0.4), rgba(0,255,157,0.4))" : "linear-gradient(135deg, rgba(0,200,124,0.2), rgba(0,255,157,0.2))",
            border: selectedMonth === "Q2" ? "1px solid #00c87c" : "1px solid #00c87c",
            borderRadius: 12,
            padding: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#00c87c", marginBottom: 4 }}>Q2 2026 Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#00c87c" }}>
            ${q2Total.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Apr-Jun 2026 · {q2Nights} nights
          </div>
        </button>

        {/* 2026 Annual Total */}
        <button
          onClick={() => setSelectedMonth("2026")}
          style={{
            background: selectedMonth === "2026" ? "linear-gradient(135deg, rgba(255,204,0,0.4), rgba(255,230,0,0.4))" : "linear-gradient(135deg, rgba(255,204,0,0.2), rgba(255,230,0,0.2))",
            border: selectedMonth === "2026" ? "1px solid #ffcc00" : "1px solid #ffcc00",
            borderRadius: 12,
            padding: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#ffcc00", marginBottom: 4 }}>2026 Annual Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#ffcc00" }}>
            ${(quarterTotal + q2Total).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Jan-May 2026 · {q1Nights + q2Nights} nights
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
            {/* Top 10 This Month */}
            <div>
              <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🏆 Most Generous
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

      {/* Q2 Summary View */}
      {selectedMonth === "Q2" && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              Q2 2026 Summary
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
            {q2Months.map((m) => (
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
            🏆 Q2 Top Entertainers
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...allDancers]
              .map(d => ({ 
                name: d.name, 
                total: (d.apr || 0) + (d.may || 0) + (d.jun || 0),
                apr: d.apr || 0,
                may: d.may || 0,
                jun: d.jun || 0
              }))
              .filter(d => (d.total ?? 0) > 0)
              .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
              .slice(0, 10)
              .map((t, i) => (
                <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    ...badgeStyle(i === 0 ? "gold" : i === 1 ? "gold" : i === 2 ? "silver" : i < 5 ? "silver" : "bronze"),
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1 }}>{t.name}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>A:${t.apr} M:${t.may} J:${t.jun}</span>
                  <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${t.total}</span>
                </div>
              ))}
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
            {monthlyTotals.filter(m => ['January', 'February', 'March'].includes(m.month)).map((m) => (
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
            {[...topTippers].map(t => ({
              ...t,
              q1Total: (t.jan || 0) + (t.feb || 0) + (t.mar || 0)
            })).sort((a, b) => b.q1Total - a.q1Total).slice(0, 10).map((t, i) => (
              <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{
                  display: "inline-block",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  ...badgeStyle(t.badge),
                }}>
                  {i + 1}
                </span>
                <span style={{ flex: 1 }}>{t.name}</span>
                <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>J:${t.jan || 0} F:${t.feb || 0} M:${t.mar || 0}</span>
                <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${t.q1Total}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 2026 Annual Summary View */}
      {selectedMonth === "2026" && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              2026 Annual Summary
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 20 }}>
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

          <div style={{ 
            background: "linear-gradient(135deg, rgba(255,204,0,0.2), rgba(255,230,0,0.1))", 
            border: "1px solid #ffcc00", 
            borderRadius: 12, 
            padding: 24,
            textAlign: "center",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: "0.8rem", color: "#ffcc00", marginBottom: 4 }}>2026 TOTAL (Jan-May)</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffcc00" }}>
              ${(quarterTotal + q2Total).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
              {q1Nights + q2Nights} total nights
            </div>
          </div>

          <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🏆 2026 Top Entertainers
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {allDancers.filter(d => (d.total ?? 0) > 0).sort((a, b) => (b.total ?? 0) - (a.total ?? 0)).slice(0, 10).map((d, i) => {
              const badge = i === 0 ? "gold" : i === 1 ? "gold" : i === 2 ? "silver" : i < 5 ? "silver" : "bronze";
              return (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    background: badge === "gold" ? "#ffd700" : badge === "silver" ? "#c0c0c0" : "#cd7f32",
                    color: "#000",
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>J:${d.jan || 0} F:${d.feb || 0} M:${d.mar || 0} A:${d.apr || 0} M:${d.may || 0}</span>
                  <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${d.total}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Nightly Breakdown by Month - Collapsible Sections */}
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 24,
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
            📅 Nightly Breakdown
          </h2>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "4px 0 0" }}>
            Click a month to view individual night totals
          </p>
        </div>

        {monthlyTotals.map((month) => {
          const isExpanded = expandedMonths[month.month];
          const nights = nightlyData?.[month.month] || [];
          
          return (
            <div key={month.month} style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                onClick={() => toggleMonth(month.month)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "14px 20px",
                  background: isExpanded ? "rgba(155,93,229,0.1)" : "transparent",
                  border: "none",
                  color: "var(--text)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ 
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    fontSize: "0.8rem",
                  }}>▶</span>
                  <span>{month.month} 2026</span>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    color: "var(--muted)",
                    fontWeight: 400,
                  }}>
                    ${month.amount.toLocaleString()} · {month.nights} nights
                  </span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent2)" }}>
                  ${month.amount.toLocaleString()}
                </span>
              </button>

              {isExpanded && (
                <div style={{ 
                  background: "var(--bg)",
                  borderTop: "1px solid var(--border)",
                }}>
                  {nights.map((night) => {
                    const nightKey = `${month.month}-${night.date}`;
                    const isNightExpanded = expandedNights[nightKey];
                    
                    return (
                      <div key={night.date} style={{ borderBottom: "1px solid var(--border)" }}>
                        <button
                          onClick={() => toggleNight(nightKey)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            padding: "10px 20px 10px 48px",
                            background: "transparent",
                            border: "none",
                            color: "var(--text)",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ 
                              transform: isNightExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.2s",
                              fontSize: "0.7rem",
                              color: "var(--muted)",
                            }}>▶</span>
                            <span>{night.date}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: "var(--accent2)" }}>
                            ${night.total}
                          </span>
                        </button>

                        {isNightExpanded && night.dancers.length > 0 && (
                          <div style={{ 
                            padding: "8px 20px 12px 68px",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                            gap: "6px 12px",
                          }}>
                            {night.dancers
                              .filter(d => d.amount > 0)
                              .sort((a, b) => b.amount - a.amount)
                              .map((dancer) => (
                                <div key={dancer.name} style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  fontSize: "0.75rem",
                                  padding: "4px 8px",
                                  background: "var(--card)",
                                  borderRadius: 4,
                                }}>
                                  <span style={{ color: "var(--muted)" }}>{dancer.name}</span>
                                  <span style={{ fontWeight: 600 }}>${dancer.amount}</span>
                                </div>
                              ))}
                          </div>
                        )}

                        {isNightExpanded && night.dancers.length === 0 && (
                          <div style={{ 
                            padding: "8px 20px 12px 68px",
                            fontSize: "0.8rem",
                            color: "var(--muted)",
                            fontStyle: "italic",
                          }}>
                            No data available for this night
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
                <option value="q1">Q1 Total (Jan-Mar)</option>
                <option value="jan">January Only</option>
                <option value="feb">February Only</option>
                <option value="mar">March Only</option>
                <option value="apr">April Only</option>
                <option value="may">May Only</option>
                <option value="q2">Q2 Total (Apr-Jun)</option>
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
                <div style={{ display: "grid", gridTemplateColumns: dateRange === "q1" || dateRange === "q2" ? "repeat(3, 1fr)" : "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
                  {dateRange === "q1" ? (
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
                  ) : dateRange === "q2" ? (
                    <>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>April</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.apr}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>May</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.may}</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ gridColumn: "span 3" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {dateRange === "jan" ? "January" : dateRange === "feb" ? "February" : dateRange === "mar" ? "March" : dateRange === "apr" ? "April" : "May"}
                      </div>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent2)" }}>
                        ${dateRange === "jan" ? dancerResult.jan : dateRange === "feb" ? dancerResult.feb : dateRange === "mar" ? dancerResult.mar : dateRange === "apr" ? dancerResult.apr : dancerResult.may}
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
