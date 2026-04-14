"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface UberShift {
  id: string;
  date: string;
  platform: "uber" | "lyft" | "both";
  hours_worked: number;
  gross_earnings: number;
  tips: number;
  charging_cost: number;
  miles_driven: number;
  notes?: string;
}

interface Expense {
  id: string;
  date: string;
  category: "insurance" | "maintenance" | "cleaning" | "registration" | "other";
  amount: number;
  description: string;
}

interface MonthlyData {
  uber_gross: number;
  uber_charging: number;
  uber_net: number;
  uber_hours: number;
  total_net: number;
}

interface ProfitData {
  uber_shifts: UberShift[];
  expenses: Expense[];
  monthly_summary: Record<string, MonthlyData>;
  last_updated: string;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "January", "02": "February", "03": "March", "04": "April",
  "05": "May", "06": "June", "07": "July", "08": "August",
  "09": "September", "10": "October", "11": "November", "12": "December",
};

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[month]} ${year}`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default function UberProfitPage() {
  const [data, setData] = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "shifts" | "expenses">("overview");

  useEffect(() => {
    fetch("/api/uber-profit")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)" }}>🚕 Uber Profit Tracker</h1>
        <p style={{ color: "var(--muted)", marginTop: 20 }}>Loading...</p>
      </div>
    );
  }

  const uberShifts = data?.uber_shifts || [];
  const expenses = data?.expenses || [];
  const monthly = data?.monthly_summary || {};

  // Calculate totals
  const uberTotals = {
    gross: uberShifts.reduce((sum, s) => sum + (s.gross_earnings || 0), 0),
    tips: uberShifts.reduce((sum, s) => sum + (s.tips || 0), 0),
    charging: uberShifts.reduce((sum, s) => sum + (s.charging_cost || 0), 0),
    hours: uberShifts.reduce((sum, s) => sum + (s.hours_worked || 0), 0),
    miles: uberShifts.reduce((sum, s) => sum + (s.miles_driven || 0), 0),
    get net() { return this.gross + this.tips - this.charging; },
    get hourly() { return this.hours > 0 ? this.net / this.hours : 0; },
    get perMile() { return this.miles > 0 ? this.net / this.miles : 0; },
  };

  const expenseTotals = {
    total: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
  };

  const grandTotal = uberTotals.net - expenseTotals.total;

  const sortedUberShifts = [...uberShifts].sort((a, b) => b.date.localeCompare(a.date));
  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>
        🚕 Uber Profit Tracker
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 28px", fontSize: "0.875rem" }}>
        Track Uber/Lyft income, charging costs, and profit margins
      </p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          { key: "shifts", label: "Shifts", icon: "🚕" },
          { key: "expenses", label: "Expenses", icon: "💸" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: activeTab === tab.key ? "var(--accent)" : "transparent",
              color: activeTab === tab.key ? "white" : "var(--text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          {/* Top stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            <Card>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent2)" }}>
                {formatCurrency(grandTotal)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Total Net Profit</div>
            </Card>
            <Card>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent2)" }}>
                {formatCurrency(uberTotals.net)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Uber Net (after charging)</div>
            </Card>
            <Card>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent2)" }}>
                {formatCurrency(uberTotals.gross + uberTotals.tips)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Gross Earnings</div>
            </Card>
            <Card>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--danger)" }}>
                {formatCurrency(expenseTotals.total)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4 }}>Other Expenses</div>
            </Card>
          </div>

          {/* Key Metrics */}
          <Card title="🚕 Uber Metrics">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text)" }}>
                  {formatCurrency(uberTotals.hourly)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Net per hour</div>
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text)" }}>
                  {formatCurrency(uberTotals.perMile)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Net per mile</div>
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text)" }}>
                  {uberTotals.hours.toFixed(1)}h
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Total hours</div>
              </div>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--danger)" }}>
                  {formatCurrency(uberTotals.charging)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Charging costs</div>
              </div>
            </div>
          </Card>

          {/* Monthly breakdown */}
          <div style={{ marginTop: 24 }}>
            <Card title="Monthly Profit Summary">
              {Object.keys(monthly).length === 0 ? (
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>No data yet. Add Uber shifts to see monthly breakdown.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    padding: "0 0 8px",
                    borderBottom: "1px solid var(--border)",
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    <span>Month</span>
                    <span>Gross</span>
                    <span>Charging</span>
                    <span>Expenses</span>
                    <span>Total Net</span>
                    <span>Margin</span>
                  </div>
                  {Object.entries(monthly)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .map(([month, v], i, arr) => {
                      const margin = v.uber_gross > 0 ? ((v.total_net / v.uber_gross) * 100).toFixed(1) : "0.0";
                      return (
                        <div
                          key={month}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                            alignItems: "center",
                            padding: "12px 0",
                            borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                            fontSize: "0.875rem",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{formatMonth(month)}</span>
                          <span style={{ color: "var(--text)" }}>{formatCurrency(v.uber_gross)}</span>
                          <span style={{ color: "var(--danger)" }}>{formatCurrency(v.uber_charging)}</span>
                          <span style={{ color: "var(--danger)" }}>{formatCurrency(v.uber_gross - v.total_net)}</span>
                          <span style={{ color: "var(--accent2)", fontWeight: 600 }}>{formatCurrency(v.total_net)}</span>
                          <span style={{ color: "var(--muted)" }}>{margin}%</span>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* SHIFTS TAB */}
      {activeTab === "shifts" && (
        <Card title="Uber/Lyft Shifts">
          {sortedUberShifts.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              No shifts logged yet. Tell PriScylla in Telegram to log a shift.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 0.6fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                padding: "0 0 8px",
                borderBottom: "1px solid var(--border)",
                fontSize: "0.7rem",
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                <span>Date</span>
                <span>Hours</span>
                <span>Gross</span>
                <span>Tips</span>
                <span>Charging</span>
                <span>Net</span>
                <span>$/hr</span>
              </div>
              {sortedUberShifts.map((s, i) => {
                const net = s.gross_earnings + (s.tips || 0) - (s.charging_cost || 0);
                const hourly = s.hours_worked > 0 ? net / s.hours_worked : 0;
                return (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 0.6fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                      padding: "10px 0",
                      borderBottom: i < sortedUberShifts.length - 1 ? "1px solid var(--border)" : "none",
                      fontSize: "0.85rem",
                      alignItems: "center",
                    }}
                  >
                    <span>{s.date}</span>
                    <span style={{ color: "var(--muted)" }}>{s.hours_worked}h</span>
                    <span>{formatCurrency(s.gross_earnings)}</span>
                    <span style={{ color: "var(--accent2)" }}>+{formatCurrency(s.tips || 0)}</span>
                    <span style={{ color: "var(--danger)" }}>-{formatCurrency(s.charging_cost || 0)}</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(net)}</span>
                    <span style={{ color: "var(--muted)" }}>{formatCurrency(hourly)}/hr</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* EXPENSES TAB */}
      {activeTab === "expenses" && (
        <Card title="Business Expenses">
          {sortedExpenses.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              No expenses logged yet. Tell PriScylla in Telegram to log an expense.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 2fr",
                padding: "0 0 8px",
                borderBottom: "1px solid var(--border)",
                fontSize: "0.7rem",
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                <span>Date</span>
                <span>Category</span>
                <span>Amount</span>
                <span>Description</span>
              </div>
              {sortedExpenses.map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 2fr",
                    padding: "10px 0",
                    borderBottom: i < sortedExpenses.length - 1 ? "1px solid var(--border)" : "none",
                    fontSize: "0.85rem",
                    alignItems: "center",
                  }}
                >
                  <span>{e.date}</span>
                  <span style={{ textTransform: "capitalize" }}>{e.category}</span>
                  <span style={{ color: "var(--danger)", fontWeight: 600 }}>{formatCurrency(e.amount)}</span>
                  <span style={{ color: "var(--muted)" }}>{e.description}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
