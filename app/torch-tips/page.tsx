"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface TorchTipsData {
  monthlyTotals: { month: string; amount: number; nights: number }[];
  topTippers: { rank: number; name: string; jul: number; aug: number; sep: number; oct?: number; nov?: number; dec?: number; total: number; badge: string | null }[];
  allDancers: { name: string; jul: number; aug: number; sep: number; oct?: number; nov?: number; dec?: number; total?: number }[];
  customerTips: { month: string; amount: number; topNight: string }[];
  dailyTips?: { date: string; amount: number; dancers: { name: string; amount: number }[] }[];
  nightlyData?: Record<string, { date: string; total: number; dancers: { name: string; amount: number }[]; mgrTip?: number; settlement?: number }[]>;
}

interface MonthDetail {
  month: string;
  amount: number;
  nights: number;
  entertainers: { name: string; amount: number }[];
  top10: { rank: number; name: string; amount: number; badge: string | null }[];
}

export default function TorchTipsPage() {
  const [data, setData] = useState<TorchTipsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [entertainerTotalsOpen, setEntertainerTotalsOpen] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});
  const [expandedNights, setExpandedNights] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/torch-tips")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.monthlyTotals && data.monthlyTotals.length > 0) {
          const monthOrder = ['July', 'August', 'September', 'October', 'November', 'December'];
          data.monthlyTotals.sort((a: any, b: any) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
          setData(data);
        } else {
          fetch("/data/torch-tips.json")
            .then((r) => r.json())
            .then((localData) => setData(localData))
            .catch(() => setData(null));
        }
        setLoading(false);
      })
      .catch(() => {
        fetch("/data/torch-tips.json")
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
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <img src="/torch-logo-clean.png" alt="The Torch" style={{ height: 72, width: "auto", filter: "drop-shadow(0 0 12px rgba(236, 72, 153, 0.35))" }} />
          <div>
            <h1 style={{
              fontSize: "1.8rem", fontWeight: 700, margin: 0,
              background: "linear-gradient(135deg, var(--torch-pink), var(--torch-red))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              🕯️ Torch Tips
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
              The Torch Boise tip tracking · Q3 2026 onwards
            </p>
          </div>
        </div>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const { monthlyTotals, allDancers = [], nightlyData = {} } = data;

  // Q3 = July, August, September
  const q3Months = monthlyTotals.filter(m => ['July', 'August', 'September'].includes(m.month));
  const q3Nights = q3Months.reduce((sum, m) => sum + m.nights, 0);
  const q3Total = q3Months.reduce((sum, m) => sum + m.amount, 0);

  // Q4 = October, November, December
  const q4Months = monthlyTotals.filter(m => ['October', 'November', 'December'].includes(m.month));
  const q4Total = q4Months.reduce((sum, m) => sum + m.amount, 0);
  const q4Nights = q4Months.reduce((sum, m) => sum + m.nights, 0);

  // Generate month details from data
  const getMonthDetails = (month: string): MonthDetail | null => {
    if (month === "Q3" || month === "Q4" || month === "H2") return null;

    const monthKeyMap: Record<string, 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec'> = {
      July: 'jul', August: 'aug', September: 'sep',
      October: 'oct', November: 'nov', December: 'dec',
    };
    const monthKey = monthKeyMap[month];
    if (!monthKey) return null;

    const monthData = monthlyTotals.find(m => m.month === month);
    if (!monthData) return null;

    const entertainers = allDancers
      .map(d => ({ name: d.name, amount: (d as any)[monthKey] || 0 }))
      .filter(d => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    const top10 = entertainers.slice(0, 10).map((e, i) => ({
      rank: i + 1,
      name: e.name,
      amount: e.amount,
      badge: i === 0 ? "gold" : i === 1 ? "gold" : i === 2 ? "silver" : i < 5 ? "silver" : "bronze",
    }));

    return {
      month,
      amount: monthData.amount,
      nights: monthData.nights,
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

    let jul = dancer.jul || 0;
    let aug = dancer.aug || 0;
    let sep = dancer.sep || 0;
    let oct = (dancer as any).oct || 0;
    let nov = (dancer as any).nov || 0;
    let dec = (dancer as any).dec || 0;

    // Apply date range filter
    if (dateRange === "jul") { aug = 0; sep = 0; oct = 0; nov = 0; dec = 0; }
    else if (dateRange === "aug") { jul = 0; sep = 0; oct = 0; nov = 0; dec = 0; }
    else if (dateRange === "sep") { jul = 0; aug = 0; oct = 0; nov = 0; dec = 0; }
    else if (dateRange === "q3") { oct = 0; nov = 0; dec = 0; }
    else if (dateRange === "oct") { jul = 0; aug = 0; sep = 0; nov = 0; dec = 0; }
    else if (dateRange === "nov") { jul = 0; aug = 0; sep = 0; oct = 0; dec = 0; }
    else if (dateRange === "dec") { jul = 0; aug = 0; sep = 0; oct = 0; nov = 0; }
    else if (dateRange === "q4") { jul = 0; aug = 0; sep = 0; }

    const total = jul + aug + sep + oct + nov + dec;

    return { name: dancer.name, jul, aug, sep, oct, nov, dec, total };
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
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
        <img
          src="/torch-logo-clean.png"
          alt="The Torch"
          style={{
            height: 72,
            width: "auto",
            filter: "drop-shadow(0 0 12px rgba(236, 72, 153, 0.35))",
          }}
        />
        <div>
          <h1 style={{
            fontSize: "1.8rem", fontWeight: 700, margin: 0,
            background: "linear-gradient(135deg, var(--torch-pink), var(--torch-red))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            🕯️ Torch Tips
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: "0.9rem" }}>
            The Torch Boise tip tracking · Q3 2026 onwards
          </p>
        </div>
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
              background: selectedMonth === m.month ? "linear-gradient(135deg, var(--torch-glow-1), var(--torch-glow-2))" : "var(--card)",
              border: selectedMonth === m.month ? "1px solid var(--torch-pink)" : "1px solid var(--border)",
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

        {/* Q3 Total */}
        <button
          onClick={() => setSelectedMonth("Q3")}
          style={{
            background: selectedMonth === "Q3" ? "linear-gradient(135deg, var(--torch-glow-1), var(--torch-glow-2))" : "linear-gradient(135deg, var(--torch-glow-1), var(--torch-glow-2))",
            border: selectedMonth === "Q3" ? "1px solid var(--torch-pink)" : "1px solid var(--torch-pink)",
            borderRadius: 12,
            padding: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--torch-pink)", marginBottom: 4 }}>Q3 2026 Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--torch-pink)" }}>
            ${q3Total.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Jul–Sep 2026 · {q3Nights} nights
          </div>
        </button>

        {/* Q4 Total */}
        <button
          onClick={() => setSelectedMonth("Q4")}
          style={{
            background: selectedMonth === "Q4" ? "linear-gradient(135deg, rgba(0,200,124,0.4), rgba(0,255,157,0.4))" : "linear-gradient(135deg, rgba(0,200,124,0.2), rgba(0,255,157,0.2))",
            border: selectedMonth === "Q4" ? "1px solid #00c87c" : "1px solid #00c87c",
            borderRadius: 12,
            padding: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#00c87c", marginBottom: 4 }}>Q4 2026 Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#00c87c" }}>
            ${q4Total.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Oct–Dec 2026 · {q4Nights} nights
          </div>
        </button>

        {/* H2 2026 Annual Total */}
        <button
          onClick={() => setSelectedMonth("H2")}
          style={{
            background: selectedMonth === "H2" ? "linear-gradient(135deg, rgba(255,204,0,0.4), rgba(255,230,0,0.4))" : "linear-gradient(135deg, rgba(255,204,0,0.2), rgba(255,230,0,0.2))",
            border: selectedMonth === "H2" ? "1px solid #ffcc00" : "1px solid #ffcc00",
            borderRadius: 12,
            padding: 20,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#ffcc00", marginBottom: 4 }}>H2 2026 Total</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#ffcc00" }}>
            ${(q3Total + q4Total).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
            Jul–Dec 2026 · {q3Nights + q4Nights} nights
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
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--torch-pink)" }}>${e.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Q4 Summary View */}
      {selectedMonth === "Q4" && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              Q4 2026 Summary
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
            {q4Months.map((m) => (
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
            🏆 Q4 Top Entertainers
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...allDancers]
              .map(d => ({
                name: d.name,
                total: (d.oct || 0) + (d.nov || 0) + (d.dec || 0),
                oct: d.oct || 0,
                nov: d.nov || 0,
                dec: d.dec || 0
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
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>O:${t.oct} N:${t.nov} D:${t.dec}</span>
                  <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${t.total}</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Q3 Summary View */}
      {selectedMonth === "Q3" && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              Q3 2026 Summary
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
            {monthlyTotals.filter(m => ['July', 'August', 'September'].includes(m.month)).map((m) => (
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
            🏆 Q3 Top 10 Overall
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...allDancers]
              .map(d => ({
                name: d.name,
                total: (d.jul || 0) + (d.aug || 0) + (d.sep || 0),
                jul: d.jul || 0,
                aug: d.aug || 0,
                sep: d.sep || 0
              }))
              .filter(d => d.total > 0)
              .sort((a, b) => b.total - a.total)
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
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>J:${t.jul} A:${t.aug} S:${t.sep}</span>
                  <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${t.total}</span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* H2 Annual Summary View */}
      {selectedMonth === "H2" && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: 0, color: "var(--text)" }}>
              H2 2026 (Q3 + Q4) Summary
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
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
            <div style={{ fontSize: "0.8rem", color: "#ffcc00", marginBottom: 4 }}>H2 2026 TOTAL (Jul–Dec)</div>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffcc00" }}>
              ${(q3Total + q4Total).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>
              {q3Nights + q4Nights} total nights
            </div>
          </div>

          <h3 style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🏆 Top Entertainers (H2 YTD)
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
                  <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>J:${d.jul || 0} A:${d.aug || 0} S:${d.sep || 0} O:${d.oct || 0} N:${d.nov || 0} D:${d.dec || 0}</span>
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
                  background: isExpanded ? "rgba(236, 72, 153, 0.1)" : "transparent",
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
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--torch-pink)" }}>
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
                          <span style={{ fontWeight: 600, color: "var(--torch-pink)" }}>
                            ${night.total}
                          </span>
                        </button>

                        {isNightExpanded && (night.mgrTip ?? 0) > 0 && (
                          <div style={{
                            padding: "8px 20px 4px 68px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: "0.78rem",
                          }}>
                            <span style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "rgba(255, 204, 0, 0.15)",
                              border: "1px solid #ffcc00",
                              color: "#ffcc00",
                              fontWeight: 700,
                            }}>
                              👔 Mgr Tip
                            </span>
                            <span style={{ fontWeight: 700, color: "var(--torch-pink)" }}>
                              ${night.mgrTip}
                            </span>
                          </div>
                        )}

                        {isNightExpanded && (night.settlement ?? 0) > 0 && (
                          <div style={{
                            padding: "8px 20px 4px 68px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: "0.78rem",
                          }}>
                            <span style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 4,
                              background: "rgba(34, 197, 94, 0.15)",
                              border: "1px solid #22c55e",
                              color: "#22c55e",
                              fontWeight: 700,
                            }}>
                              💵 Settlement
                            </span>
                            <span style={{ fontWeight: 700, color: "var(--torch-pink)" }}>
                              ${night.settlement}
                            </span>
                          </div>
                        )}

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

                        {isNightExpanded && night.dancers.length === 0 && (night.mgrTip ?? 0) === 0 && (night.settlement ?? 0) === 0 && (
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
                <option value="all">All Months (H2 YTD)</option>
                <option value="q3">Q3 Total (Jul–Sep)</option>
                <option value="jul">July Only</option>
                <option value="aug">August Only</option>
                <option value="sep">September Only</option>
                <option value="q4">Q4 Total (Oct–Dec)</option>
                <option value="oct">October Only</option>
                <option value="nov">November Only</option>
                <option value="dec">December Only</option>
              </select>
            </div>

            {/* Search Result */}
            {dancerResult ? (
              <div style={{
                background: "linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(239, 68, 68, 0.1))",
                border: "1px solid var(--torch-pink)",
                borderRadius: 12,
                padding: 20,
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", color: "var(--text)" }}>
                  {dancerResult.name}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: dateRange === "q3" || dateRange === "q4" ? "repeat(3, 1fr)" : "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
                  {dateRange === "q3" ? (
                    <>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>July</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.jul}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>August</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.aug}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>September</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.sep}</div>
                      </div>
                    </>
                  ) : dateRange === "q4" ? (
                    <>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>October</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.oct}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>November</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.nov}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>December</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>${dancerResult.dec || 0}</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ gridColumn: "span 3" }}>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        {dateRange === "jul" ? "July" : dateRange === "aug" ? "August" : dateRange === "sep" ? "September" : dateRange === "oct" ? "October" : dateRange === "nov" ? "November" : "December"}
                      </div>
                      <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--torch-pink)" }}>
                        ${dateRange === "jul" ? dancerResult.jul : dateRange === "aug" ? dancerResult.aug : dateRange === "sep" ? dancerResult.sep : dateRange === "oct" ? dancerResult.oct : dateRange === "nov" ? dancerResult.nov : dancerResult.dec || 0}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--torch-pink)" }}>Total</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--torch-pink)" }}>${dancerResult.total}</div>
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
