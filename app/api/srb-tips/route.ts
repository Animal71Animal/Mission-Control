/**
 * Mission Control v2 - SRB Tips API
 * Static JSON-backed (Vercel-compatible)
 * Reads from public/data/srb-tips-data.json — exact same format as before
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

async function loadSrbData() {
  try {
    const filePath = resolve(process.cwd(), 'public/data/srb-tips-data.json');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { monthlyTotals: [], topTippers: [], allDancers: [], nightlyData: {}, nights: [] };
  }
}

// GET /api/srb-tips — returns full structured data (backward compatible)
export async function GET() {
  try {
    const data = await loadSrbData();
    return NextResponse.json({
      ...data,
      lastUpdated: data.lastUpdated || new Date().toISOString(),
    });
  } catch (err) {
    console.error('[GET /api/srb-tips]', err);
    return NextResponse.json(
      { monthlyTotals: [], topTippers: [], allDancers: [], nightlyData: {}, error: String(err) },
      { status: 500 }
    );
  }
}

// POST /api/srb-tips — stub
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nightId = `srb-${(body.month || '').toLowerCase()}-${(body.date || '').replace(/-/g, '')}`;
    return NextResponse.json({ success: true, nightId });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create night', detail: String(err) }, { status: 500 });
  }
}

// DELETE /api/srb-tips?nightId=xxx — stub
export async function DELETE() {
  return NextResponse.json({ success: true });
}
