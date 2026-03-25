export const dynamic = "force-static";

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join("/home/ubuntu", "wlp/data", "srb-tips-data.json");

interface DailyTip {
  date: string;
  totalTips: number;
  customerTips: number;
  dancerTips: Record<string, number>;
}

interface SrbTipsData {
  monthlyTotals: { month: string; amount: number; nights: number }[];
  topTippers: { rank: number; name: string; jan: number; feb: number; mar: number; total: number; badge: string | null }[];
  customerTips: { month: string; amount: number; topNight: string }[];
  allDancers: { name: string; jan: number; feb: number; mar: number }[];
  dailyTips: DailyTip[];
  lastUpdated: string;
}

function readData(): SrbTipsData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      monthlyTotals: [],
      topTippers: [],
      customerTips: [],
      allDancers: [],
      dailyTips: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

function writeData(data: SrbTipsData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, totalTips, customerTips, dancerTips } = body;

    if (!date || typeof totalTips !== "number" || typeof customerTips !== "number" || !dancerTips) {
      return NextResponse.json(
        { error: "Missing required fields: date, totalTips, customerTips, dancerTips" },
        { status: 400 }
      );
    }

    const data = readData();
    
    const newDailyTip: DailyTip = {
      date,
      totalTips,
      customerTips,
      dancerTips,
    };

    // Check if entry for this date already exists
    const existingIndex = data.dailyTips.findIndex((t) => t.date === date);
    if (existingIndex >= 0) {
      data.dailyTips[existingIndex] = newDailyTip;
    } else {
      data.dailyTips.push(newDailyTip);
    }

    data.lastUpdated = new Date().toISOString();
    writeData(data);

    return NextResponse.json({ success: true, dailyTip: newDailyTip }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save tip data" }, { status: 500 });
  }
}