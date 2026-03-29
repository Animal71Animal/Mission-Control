"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

interface SrbTipsData {
  monthlyTotals: { month: string; amount: number; nights: number }[];
  topTippers: { rank: number; name: string; jan: number; feb: number; mar: number; total: number; badge: string | null }[];
  allDancers: { name: string; jan: number; feb: number; mar: number }[];
  customerTips: { month: string; amount: number; topNight: string }[];
  dailyTips?: { date: string; amount: number; dancers: { name: string; amount: number }[] }[];
}

interface MonthDetail {
  month: string;
  amount: number;
  nights: number;
  weeklyBreakdown: { week: string; amount: number }[];
  entertainers: { name: string; amount: number }[];
  top10: { rank: number; name: string; amount: number; badge: string | null }[];
}

// Nightly breakdown data
const nightlyData: Record<string, { date: string; total: number; dancers: { name: string; amount: number }[] }[]> = {
  "January": [
    { date: "Fri Jan 2", total: 108, dancers: [{ name: "Indie", amount: 25 }, { name: "Georgia", amount: 5 }, { name: "Jocelyn", amount: 5 }, { name: "Kendall", amount: 20 }, { name: "Kiki", amount: 15 }, { name: "Kimberly", amount: 0 }, { name: "Mia", amount: 0 }, { name: "Star", amount: 6 }, { name: "Customers", amount: 5 }] },
    { date: "Sat Jan 3", total: 127, dancers: [{ name: "Allie", amount: 20 }, { name: "Genesis", amount: 14 }, { name: "Kody", amount: 34 }, { name: "Ruby", amount: 19 }, { name: "Selecia", amount: 0 }, { name: "Willow", amount: 32 }, { name: "Customers", amount: 5 }] },
    { date: "Sun Jan 4", total: 85, dancers: [{ name: "Alaska", amount: 5 }, { name: "Genesis", amount: 20 }, { name: "Kiki", amount: 10 }, { name: "Kimberly", amount: 0 }, { name: "Kody", amount: 30 }, { name: "Lilly", amount: 0 }, { name: "Customers", amount: 15 }] },
    { date: "Wed Jan 7", total: 52, dancers: [{ name: "Alaska", amount: 5 }, { name: "Georgia", amount: 5 }, { name: "Kiki", amount: 6 }, { name: "Nova", amount: 5 }, { name: "Quinn", amount: 5 }, { name: "Customers", amount: 30 }] },
    { date: "Thur Jan 8", total: 27, dancers: [{ name: "Adelia", amount: 10 }, { name: "Baby", amount: 0 }, { name: "Berlin", amount: 0 }, { name: "Dior", amount: 10 }, { name: "Kimberly", amount: 7 }, { name: "Mia", amount: 0 }, { name: "Natasha", amount: 0 }, { name: "Saylor", amount: 0 }, { name: "Shiiva", amount: 0 }, { name: "Zara", amount: 5 }, { name: "Customers", amount: 0 }] },
    { date: "Sat Jan 10", total: 209, dancers: [{ name: "Adelia", amount: 10 }, { name: "Baby", amount: 20 }, { name: "Cassandra", amount: 0 }, { name: "Dior", amount: 10 }, { name: "Effie", amount: 20 }, { name: "Essence", amount: 0 }, { name: "Karina", amount: 7 }, { name: "Kitty", amount: 4 }, { name: "Lilly", amount: 7 }, { name: "Macy", amount: 20 }, { name: "Mia", amount: 5 }, { name: "Milan", amount: 50 }, { name: "Mixie", amount: 0 }, { name: "Natasha", amount: 20 }, { name: "Natalie", amount: 6 }, { name: "Suki", amount: 80 }, { name: "Customers", amount: 20 }] },
    { date: "Sun Jan 11", total: 115, dancers: [{ name: "Baby", amount: 7 }, { name: "Berlin", amount: 10 }, { name: "Cassandra", amount: 10 }, { name: "Mia", amount: 4 }, { name: "Milan", amount: 0 }, { name: "Nova", amount: 5 }, { name: "Shelby", amount: 10 }, { name: "Shiiva", amount: 3 }, { name: "Willow", amount: 11 }, { name: "Customers", amount: 5 }] },
    { date: "Mon Jan 12", total: 29, dancers: [{ name: "Baby", amount: 7 }, { name: "Mia", amount: 0 }, { name: "Nova", amount: 5 }, { name: "Quinn", amount: 0 }, { name: "Tiana", amount: 7 }, { name: "Customers", amount: 0 }] },
    { date: "Tues Jan 13", total: 38, dancers: [{ name: "Georgia", amount: 7 }, { name: "Mia", amount: 0 }, { name: "Mixie", amount: 0 }, { name: "Quinn", amount: 0 }, { name: "Ruby", amount: 10 }, { name: "Zara", amount: 4 }, { name: "Customers", amount: 0 }] },
    { date: "Sun Jan 18", total: 115, dancers: [{ name: "Amity", amount: 0 }, { name: "Cassandra", amount: 8 }, { name: "Hunter", amount: 0 }, { name: "Milan", amount: 20 }, { name: "Nova", amount: 5 }, { name: "Shelby", amount: 0 }, { name: "Shiiva", amount: 0 }, { name: "Star", amount: 0 }, { name: "Customers", amount: 70 }] },
    { date: "Mon Jan 19", total: 15, dancers: [{ name: "Amity", amount: 0 }, { name: "Kody", amount: 0 }, { name: "Nova", amount: 0 }, { name: "Shelby", amount: 10 }, { name: "Customers", amount: 0 }] },
    { date: "Wed Jan 21", total: 95, dancers: [{ name: "Adelia", amount: 0 }, { name: "Alaska", amount: 0 }, { name: "Amity", amount: 5 }, { name: "Athena", amount: 20 }, { name: "Berlin", amount: 10 }, { name: "Kiki", amount: 0 }, { name: "Mixie", amount: 5 }, { name: "Natasha", amount: 0 }, { name: "Suki", amount: 0 }, { name: "Willow", amount: 5 }, { name: "Zara", amount: 10 }, { name: "Customers", amount: 15 }] },
    { date: "Thur Jan 22", total: 66, dancers: [{ name: "Alaska", amount: 0 }, { name: "Athena", amount: 40 }, { name: "Berlin", amount: 8 }, { name: "Cassandra", amount: 0 }, { name: "Kiki", amount: 0 }, { name: "Kimberly", amount: 0 }, { name: "Mia", amount: 8 }, { name: "Quinn", amount: 5 }, { name: "Shelby", amount: 0 }, { name: "Customers", amount: 0 }] },
    { date: "Sat Jan 24", total: 208, dancers: [{ name: "Adelia", amount: 10 }, { name: "Allie", amount: 0 }, { name: "Amity", amount: 10 }, { name: "Georgia", amount: 4 }, { name: "Genesis", amount: 25 }, { name: "Kody", amount: 0 }, { name: "Lilly", amount: 0 }, { name: "Natasha", amount: 5 }, { name: "Nova", amount: 0 }, { name: "Suki", amount: 100 }, { name: "Willow", amount: 0 }, { name: "Zara", amount: 5 }, { name: "Customers", amount: 33 }] },
    { date: "Tues Jan 27", total: 99, dancers: [{ name: "Amity", amount: 0 }, { name: "Athena", amount: 5 }, { name: "Effie", amount: 20 }, { name: "Essence", amount: 0 }, { name: "Georgia", amount: 5 }, { name: "Mia", amount: 60 }, { name: "Quinn", amount: 0 }, { name: "Shelby", amount: 5 }, { name: "Customers", amount: 0 }] },
    { date: "Wed Jan 28", total: 142, dancers: [{ name: "Amity", amount: 20 }, { name: "Georgia", amount: 0 }, { name: "Kimberly", amount: 0 }, { name: "Mia", amount: 12 }, { name: "Suki", amount: 20 }, { name: "Customers", amount: 55 }] },
    { date: "Sat Jan 31", total: 185, dancers: [{ name: "Adelia", amount: 30 }, { name: "Alaska", amount: 15 }, { name: "Allie", amount: 0 }, { name: "Baby", amount: 0 }, { name: "Berlin", amount: 0 }, { name: "Effie", amount: 0 }, { name: "Genesis", amount: 15 }, { name: "Hunter", amount: 20 }, { name: "Kitty", amount: 10 }, { name: "Lilly", amount: 5 }, { name: "Nala", amount: 20 }, { name: "Noelle", amount: 20 }, { name: "Suki", amount: 0 }, { name: "Customers", amount: 25 }] },
  ],
  "February": [
    { date: "Tue Feb 4", total: 119, dancers: [{ name: "Dakota", amount: 0 }, { name: "Hunter", amount: 20 }, { name: "Georgia", amount: 4 }, { name: "Mixie", amount: 5 }, { name: "Nala", amount: 40 }, { name: "Noelle", amount: 40 }, { name: "Star", amount: 5 }, { name: "Zara", amount: 5 }, { name: "Customers", amount: 0 }] },
    { date: "Thu Feb 5", total: 140, dancers: [{ name: "Alaska", amount: 0 }, { name: "Dior", amount: 0 }, { name: "Georgia", amount: 0 }, { name: "Hunter", amount: 20 }, { name: "Indie", amount: 5 }, { name: "Kody", amount: 8 }, { name: "Mia", amount: 12 }, { name: "Noelle", amount: 40 }, { name: "Skylar", amount: 0 }, { name: "Star", amount: 0 }, { name: "Suki", amount: 0 }, { name: "Tiana", amount: 0 }, { name: "Zara", amount: 10 }, { name: "Customers", amount: 0 }] },
    { date: "Sat Feb 7", total: 325, dancers: [{ name: "Amity", amount: 10 }, { name: "Asia", amount: 20 }, { name: "Baby", amount: 5 }, { name: "Cassandra", amount: 0 }, { name: "Dior", amount: 10 }, { name: "Ella", amount: 20 }, { name: "Georgia", amount: 0 }, { name: "Genesis", amount: 5 }, { name: "Hunter", amount: 20 }, { name: "Kendall", amount: 15 }, { name: "Lilly", amount: 10 }, { name: "Macy", amount: 0 }, { name: "Milan", amount: 20 }, { name: "Nala", amount: 40 }, { name: "Noelle", amount: 30 }, { name: "Suki", amount: 60 }, { name: "Customers", amount: 20 }] },
    { date: "Tue Feb 10", total: 41, dancers: [{ name: "Georgia", amount: 2 }, { name: "Genesis", amount: 0 }, { name: "Star", amount: 16 }, { name: "Taylor", amount: 0 }, { name: "Customers", amount: 18 }] },
    { date: "Fri Feb 13", total: 60, dancers: [{ name: "Allie", amount: 20 }, { name: "Jamira", amount: 5 }, { name: "Nala", amount: 40 }, { name: "Customers", amount: 0 }] },
    { date: "Sat Feb 14", total: 140, dancers: [{ name: "Allie", amount: 20 }, { name: "Amity", amount: 0 }, { name: "Amy", amount: 10 }, { name: "Baby", amount: 0 }, { name: "Dior", amount: 0 }, { name: "Nala", amount: 40 }, { name: "Nova", amount: 10 }, { name: "Shiiva", amount: 5 }, { name: "Skylar", amount: 10 }, { name: "Customers", amount: 30 }] },
    { date: "Wed Feb 18", total: 97, dancers: [{ name: "Adelia", amount: 0 }, { name: "Amy", amount: 10 }, { name: "Athena", amount: 0 }, { name: "Dior", amount: 5 }, { name: "Ella", amount: 0 }, { name: "Georgia", amount: 0 }, { name: "Genesis", amount: 0 }, { name: "Hunter", amount: 15 }, { name: "Kimberly", amount: 9 }, { name: "Macy", amount: 0 }, { name: "Mia", amount: 15 }, { name: "Natasha", amount: 0 }, { name: "Nova", amount: 0 }, { name: "Quinn", amount: 0 }, { name: "Shelby", amount: 5 }, { name: "Willow", amount: 2 }, { name: "Customers", amount: 20 }] },
    { date: "Thu Feb 19", total: 74, dancers: [{ name: "Alaska", amount: 0 }, { name: "Amity", amount: 0 }, { name: "Amy", amount: 5 }, { name: "Athena", amount: 10 }, { name: "Berlin", amount: 0 }, { name: "Dior", amount: 0 }, { name: "Ella", amount: 0 }, { name: "Georgia", amount: 10 }, { name: "Genesis", amount: 0 }, { name: "Hunter", amount: 0 }, { name: "Kimberly", amount: 10 }, { name: "Natasha", amount: 5 }, { name: "Nova", amount: 0 }, { name: "Quinn", amount: 10 }, { name: "Russia", amount: 5 }, { name: "Taylor", amount: 5 }, { name: "Zara", amount: 0 }, { name: "Customers", amount: 0 }] },
    { date: "Fri Feb 20", total: 117, dancers: [{ name: "Allie", amount: 20 }, { name: "Amity", amount: 15 }, { name: "Asia", amount: 0 }, { name: "Dior", amount: 0 }, { name: "Genesis", amount: 7 }, { name: "Hunter", amount: 20 }, { name: "Kimberly", amount: 0 }, { name: "Mia", amount: 0 }, { name: "Milan", amount: 0 }, { name: "Mixie", amount: 0 }, { name: "Nala", amount: 40 }, { name: "Noelle", amount: 0 }, { name: "Nova", amount: 5 }, { name: "Quinn", amount: 0 }, { name: "Ruby", amount: 4 }, { name: "Russia", amount: 5 }, { name: "Willow", amount: 10 }, { name: "Customers", amount: 0 }] },
    { date: "Wed Feb 25", total: 120, dancers: [{ name: "Dakota", amount: 0 }, { name: "Ella", amount: 20 }, { name: "Georgia", amount: 0 }, { name: "Genesis", amount: 5 }, { name: "Hunter", amount: 0 }, { name: "Mixie", amount: 5 }, { name: "Nala", amount: 0 }, { name: "Nova", amount: 5 }, { name: "Skylar", amount: 0 }, { name: "Zara", amount: 10 }, { name: "Customers", amount: 56 }] },
    { date: "Thu Feb 26", total: 60, dancers: [{ name: "Berlin", amount: 5 }, { name: "Mixie", amount: 0 }, { name: "Nala", amount: 40 }, { name: "Shiiva", amount: 5 }, { name: "Customers", amount: 0 }] },
    { date: "Sat Feb 27", total: 364, dancers: [{ name: "Adelia", amount: 20 }, { name: "Allie", amount: 35 }, { name: "Amity", amount: 10 }, { name: "Asia", amount: 25 }, { name: "Berlin", amount: 40 }, { name: "Dior", amount: 0 }, { name: "Ella", amount: 26 }, { name: "Georgia", amount: 33 }, { name: "Genesis", amount: 31 }, { name: "Hunter", amount: 20 }, { name: "Kimberly", amount: 2 }, { name: "Natasha", amount: 10 }, { name: "Nova", amount: 20 }, { name: "Quinn", amount: 4 }, { name: "Shiiva", amount: 0 }, { name: "Skylar", amount: 0 }, { name: "Willow", amount: 10 }, { name: "Zara", amount: 0 }, { name: "Customers", amount: 80 }] },
  ],
  "March": [
    { date: "Mon Mar 2", total: 187, dancers: [{ name: "Athena", amount: 40 }, { name: "Ella", amount: 10 }, { name: "Genesis", amount: 100 }, { name: "Mia", amount: 3 }, { name: "Customers", amount: 34 }] },
    { date: "Wed Mar 4", total: 40, dancers: [{ name: "Alaska", amount: 0 }, { name: "Georgia", amount: 0 }, { name: "London", amount: 25 }, { name: "Mia", amount: 0 }, { name: "Quinn", amount: 0 }, { name: "Suki", amount: 0 }, { name: "Customers", amount: 20 }] },
    { date: "Thu Mar 5", total: 94, dancers: [{ name: "Amity", amount: 11 }, { name: "Baby", amount: 7 }, { name: "Indie", amount: 6 }, { name: "Kiki", amount: 5 }, { name: "London", amount: 25 }, { name: "Natasha", amount: 5 }, { name: "Customers", amount: 0 }] },
    { date: "Fri Mar 6", total: 305, dancers: [{ name: "Amity", amount: 40 }, { name: "Asia", amount: 20 }, { name: "Athena", amount: 25 }, { name: "Brittany", amount: 25 }, { name: "Georgia", amount: 39 }, { name: "Genesis", amount: 5 }, { name: "Kendall", amount: 10 }, { name: "Lilly", amount: 10 }, { name: "Lola", amount: 10 }, { name: "Milan", amount: 5 }, { name: "Nova", amount: 5 }, { name: "Quinn", amount: 10 }, { name: "Star", amount: 6 }, { name: "Customers", amount: 20 }] },
    { date: "Wed Mar 11", total: 88, dancers: [{ name: "Athena", amount: 0 }, { name: "Berlin", amount: 0 }, { name: "Cassandra", amount: 8 }, { name: "Hunter", amount: 20 }, { name: "Mixie", amount: 10 }, { name: "Nova", amount: 10 }, { name: "Skylar", amount: 0 }, { name: "Zara", amount: 20 }, { name: "Customers", amount: 25 }] },
    { date: "Thu Mar 12", total: 63, dancers: [{ name: "Adelia", amount: 10 }, { name: "Alaska", amount: 0 }, { name: "Allie", amount: 0 }, { name: "Amity", amount: 0 }, { name: "Athena", amount: 0 }, { name: "Baby", amount: 0 }, { name: "Berlin", amount: 20 }, { name: "Cassandra", amount: 0 }, { name: "Dior", amount: 0 }, { name: "Effie", amount: 0 }, { name: "Georgia", amount: 4 }, { name: "Hunter", amount: 0 }, { name: "Mia", amount: 0 }, { name: "Shelby", amount: 0 }, { name: "Customers", amount: 5 }] },
    { date: "Sat Mar 14", total: 120, dancers: [{ name: "Giovanna", amount: 20 }, { name: "Kylie", amount: 10 }, { name: "Lola", amount: 5 }, { name: "Skylar", amount: 60 }, { name: "Customers", amount: 0 }] },
    { date: "Wed Mar 18", total: 45, dancers: [{ name: "Allie", amount: 10 }, { name: "Brooke", amount: 3 }, { name: "Customers", amount: 10 }] },
    { date: "Thu Mar 19", total: 86, dancers: [{ name: "Asia", amount: 15 }, { name: "Hunter", amount: 20 }, { name: "Lola", amount: 0 }, { name: "Macy", amount: 10 }, { name: "Nova", amount: 5 }, { name: "Skylar", amount: 20 }, { name: "Tiana", amount: 10 }, { name: "Customers", amount: 0 }] },
    { date: "Fri Mar 20", total: 209, dancers: [{ name: "Allie", amount: 10 }, { name: "Amity", amount: 45 }, { name: "Asia", amount: 0 }, { name: "Dior", amount: 10 }, { name: "Genesis", amount: 3 }, { name: "Hunter", amount: 20 }, { name: "Kendall", amount: 20 }, { name: "Lilly", amount: 20 }, { name: "Lola", amount: 5 }, { name: "Mixie", amount: 5 }, { name: "Natasha", amount: 5 }, { name: "Quinn", amount: 0 }, { name: "Skylar", amount: 9 }, { name: "Star", amount: 0 }, { name: "Willow", amount: 20 }, { name: "Zara", amount: 0 }, { name: "Customers", amount: 20 }] },
    { date: "Wed Mar 25", total: 196, dancers: [{ name: "Nova", amount: 10 }, { name: "Berlin", amount: 15 }, { name: "Dakota", amount: 10 }, { name: "Ella", amount: 10 }, { name: "Shiiva", amount: 15 }, { name: "Willow", amount: 27 }, { name: "Val", amount: 25 }, { name: "Lola", amount: 3 }, { name: "Mia", amount: 1 }, { name: "Hunter", amount: 20 }, { name: "Alaska", amount: 10 }, { name: "Allie", amount: 50 }] },
    { date: "Thu Mar 26", total: 42, dancers: [{ name: "Athena", amount: 20 }, { name: "Allie", amount: 17 }, { name: "Alaska", amount: 0 }, { name: "Quinn", amount: 0 }, { name: "Shiiva", amount: 5 }] },
    { date: "Fri Mar 27", total: 255, dancers: [{ name: "Giovanna", amount: 35 }, { name: "Kitty", amount: 21 }, { name: "Georgia", amount: 4 }, { name: "Shiiva", amount: 0 }, { name: "Dior", amount: 5 }, { name: "Genesis", amount: 30 }, { name: "Jamira", amount: 5 }, { name: "Nova", amount: 5 }, { name: "Quinn", amount: 5 }, { name: "Natasha", amount: 10 }, { name: "Willow", amount: 5 }, { name: "Hunter", amount: 20 }, { name: "Kendall", amount: 20 }, { name: "Macy", amount: 20 }, { name: "Amity", amount: 50 }, { name: "Maria", amount: 20 }] },
    { date: "Sat Mar 28", total: 223, dancers: [{ name: "Adelia", amount: 40 }, { name: "Amity", amount: 50 }, { name: "Brooke", amount: 5 }, { name: "Effie", amount: 10 }, { name: "Giovanna", amount: 20 }, { name: "Hunter", amount: 20 }, { name: "Jamira", amount: 5 }, { name: "Kimberly", amount: 8 }, { name: "Kylie", amount: 10 }, { name: "Natasha", amount: 20 }, { name: "Quinn", amount: 15 }, { name: "Customers", amount: 20 }] },
  ],
};

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
    if (month === "Q1") return null;
    
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
            {[...topTippers].sort((a, b) => b.total - a.total).slice(0, 10).map((t, i) => (
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
                <span style={{ color: "var(--muted)", fontSize: "0.75rem" }}>J:${t.jan} F:${t.feb} M:${t.mar}</span>
                <span style={{ fontWeight: 600, minWidth: 50, textAlign: "right" }}>${t.total}</span>
              </div>
            ))}
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
          const nights = nightlyData[month.month] || [];
          
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
