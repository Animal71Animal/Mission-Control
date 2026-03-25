export const dynamic = "force-static";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }),
    weather: {
      temp: "--",
      condition: "Loading...",
      high: "--",
      low: "--",
      note: "",
    },
    stories: [],
    tasks: [],
  });
}