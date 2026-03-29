import { NextRequest, NextResponse } from 'next/server';
import { getTeslaSessions, addTeslaSession } from '@/lib/data-store';

// GET /api/tesla
export async function GET() {
  try {
    const data = await getTeslaSessions();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Tesla fetch error:', err);
    return NextResponse.json({ sessions: [], summary: {}, monthly_summary: {} }, { status: 500 });
  }
}

// POST /api/tesla
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await addTeslaSession(body);
    return NextResponse.json({ success: true, session });
  } catch (err) {
    console.error('Tesla create error:', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
