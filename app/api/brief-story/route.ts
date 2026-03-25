export const dynamic = "force-static";

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    topic: "Example topic",
    left: "Left perspective placeholder",
    right: "Right perspective placeholder",
    truth: "Balanced analysis placeholder",
  });
}