export const dynamic = "force-static";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join("/home/ubuntu", "wlp/data/tesla-charging.json");

interface ChargingSession {
  date: string;
  time?: string;
  duration_minutes: number;
  rate_per_kwh: number;
  cost: number;
  kwh: number;
  location?: string;
  notes?: string;
}

interface TeslaData {
  sessions: ChargingSession[];
  summary: {
    total_sessions: number;
    total_cost_usd: number;
    total_kwh: number;
    total_minutes: number;
    avg_cost_per_session: number;
    avg_duration_minutes: number;
  };
  monthly_summary: Record<string, {
    cost: number;
    kwh: number;
    sessions: number;
    minutes: number;
  }>;
  last_updated: string;
}

function calculateSummary(sessions: ChargingSession[]): TeslaData["summary"] {
  const total_sessions = sessions.length;
  const total_cost_usd = sessions.reduce((sum, s) => sum + s.cost, 0);
  const total_kwh = sessions.reduce((sum, s) => sum + s.kwh, 0);
  const total_minutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  
  return {
    total_sessions,
    total_cost_usd,
    total_kwh,
    total_minutes,
    avg_cost_per_session: total_sessions > 0 ? total_cost_usd / total_sessions : 0,
    avg_duration_minutes: total_sessions > 0 ? total_minutes / total_sessions : 0,
  };
}

function calculateMonthlySummary(sessions: ChargingSession[]): TeslaData["monthly_summary"] {
  const monthly: TeslaData["monthly_summary"] = {};
  
  for (const session of sessions) {
    const [year, month] = session.date.split("-");
    const key = `${year}-${month}`;
    
    if (!monthly[key]) {
      monthly[key] = { cost: 0, kwh: 0, sessions: 0, minutes: 0 };
    }
    
    monthly[key].cost += session.cost;
    monthly[key].kwh += session.kwh;
    monthly[key].sessions += 1;
    monthly[key].minutes += session.duration_minutes;
  }
  
  return monthly;
}

function readData(): TeslaData {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {
      sessions: [],
      summary: calculateSummary([]),
      monthly_summary: {},
      last_updated: new Date().toISOString(),
    };
  }
}

function writeData(data: TeslaData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      sessions: [], 
      summary: calculateSummary([]),
      monthly_summary: {},
      error: String(error)
    });
  }
}

export async function POST(request: Request) {
  try {
    const session: ChargingSession = await request.json();
    
    // Validate required fields
    if (!session.date || !session.duration_minutes || !session.cost || !session.kwh) {
      return NextResponse.json(
        { error: "Missing required fields: date, duration_minutes, cost, kwh" },
        { status: 400 }
      );
    }
    
    const data = readData();
    
    // Add new session
    data.sessions.push(session);
    
    // Recalculate summaries
    data.summary = calculateSummary(data.sessions);
    data.monthly_summary = calculateMonthlySummary(data.sessions);
    data.last_updated = new Date().toISOString();
    
    writeData(data);
    
    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
