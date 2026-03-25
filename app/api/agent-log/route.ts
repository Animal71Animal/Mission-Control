export const dynamic = "force-static";

import { NextResponse } from "next/server";

// Static export - agent logging won't work in static mode
export async function GET() {
  return NextResponse.json({ entries: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Agent logging requires server mode" },
    { status: 405 }
  );
}
