/**
 * Mission Control v2 - Tesla Charging API
 * Static JSON-backed (Vercel-compatible)
 * Reads from public/data/tesla-charging.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

interface TeslaSession {
  id: string;
  date: string;
  time?: string | null;
  location: string;
  kwh: number;
  cost: number;
  duration_minutes: number;
  rate_per_kwh?: number | null;
  notes?: string | null;
  created_at: string;
}

async function loadTeslaData() {
  try {
    const filePath = resolve(process.cwd(), 'public/data/tesla-charging.json');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { sessions: [], summary: {}, monthly_summary: {} };
  }
}

// GET /api/tesla — returns { sessions, summary, monthly_summary }
export async function GET() {
  try {
    const data = await loadTeslaData();
    return NextResponse.json({
      ...data,
      last_updated: data.last_updated || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[GET /api/tesla]', err);
    return NextResponse.json(
      { sessions: [], summary: {}, monthly_summary: {}, error: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/tesla — stub
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || `tesla-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json({ success: true, session: { id, ...body } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create session', detail: String(err) }, { status: 500 });
  }
}

// PATCH /api/tesla — stub
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, session: body });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update session', detail: String(err) }, { status: 500 });
  }
}

// DELETE /api/tesla?id=xxx — stub
export async function DELETE() {
  return NextResponse.json({ success: true });
}
