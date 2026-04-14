/**
 * Mission Control v2 - Uber Profit API
 * Static JSON-backed (Vercel-compatible)
 * Reads from public/data/uber-profit.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

async function loadProfitData() {
  try {
    const filePath = resolve(process.cwd(), 'public/data/uber-profit.json');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { 
      uber_shifts: [], 
      expenses: [], 
      monthly_summary: {},
      last_updated: new Date().toISOString()
    };
  }
}

// GET /api/uber-profit — returns { uber_shifts, expenses, monthly_summary }
export async function GET() {
  try {
    const data = await loadProfitData();
    return NextResponse.json({
      ...data,
      last_updated: data.last_updated || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[GET /api/uber-profit]', err);
    return NextResponse.json(
      { uber_shifts: [], expenses: [], monthly_summary: {}, error: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/uber-profit — stub for adding entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || `uber-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json({ success: true, entry: { id, ...body } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create entry', detail: String(err) }, { status: 500 });
  }
}
