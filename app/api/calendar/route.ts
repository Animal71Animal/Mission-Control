import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const CALENDAR_ID = "ericmills71@gmail.com";
const GOG_ACCOUNT = "ericmills71@gmail.com";

// Helper to run gog commands
async function runGog(args: string): Promise<any> {
  const cmd = `GOG_ACCOUNT=${GOG_ACCOUNT} gog ${args} --json`;
  try {
    const { stdout } = await execAsync(cmd);
    return JSON.parse(stdout);
  } catch (error) {
    console.error("gog command failed:", error);
    throw error;
  }
}

// GET /api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const events = await runGog(`calendar events ${CALENDAR_ID} --from ${from} --to ${to}`);
    
    // Transform gog events to our format
    const transformedEvents = events.map((e: any) => ({
      id: e.id,
      title: e.summary || "Untitled",
      date: e.start?.date || e.start?.dateTime?.split("T")[0],
      time: e.start?.dateTime ? e.start.dateTime.split("T")[1]?.substring(0, 5) : undefined,
      endTime: e.end?.dateTime ? e.end.dateTime.split("T")[1]?.substring(0, 5) : undefined,
      location: e.location,
      notes: e.description,
      category: categorizeEvent(e.summary),
      color: getCategoryColor(categorizeEvent(e.summary)),
    }));

    return NextResponse.json({ events: transformedEvents });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

// POST /api/calendar - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, time, endTime, location, notes, category } = body;

    // Build gog command for creating event
    let startTime = date;
    let endTimeStr = date;
    
    if (time) {
      startTime = `${date}T${time}:00`;
      endTimeStr = endTime ? `${date}T${endTime}:00` : `${date}T${parseInt(time.split(":")[0]) + 1}:${time.split(":")[1]}:00`;
    }

    const cmd = `calendar create ${CALENDAR_ID} --summary "${title}" --start "${startTime}" --end "${endTimeStr}"${location ? ` --location "${location}"` : ""}${notes ? ` --description "${notes}"` : ""}`;
    
    const result = await runGog(cmd);
    
    return NextResponse.json({ success: true, event: result });
  } catch (error) {
    console.error("Calendar create error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

// PUT /api/calendar/:id - Update event
export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    const body = await request.json();
    const { title, date, time, endTime, location, notes } = body;

    let startTime = date;
    let endTimeStr = date;
    
    if (time) {
      startTime = `${date}T${time}:00`;
      endTimeStr = endTime ? `${date}T${endTime}:00` : `${date}T${parseInt(time.split(":")[0]) + 1}:${time.split(":")[1]}:00`;
    }

    const cmd = `calendar update ${CALENDAR_ID} ${id} --summary "${title}" --start "${startTime}" --end "${endTimeStr}"${location ? ` --location "${location}"` : ""}${notes ? ` --description "${notes}"` : ""}`;
    
    const result = await runGog(cmd);
    
    return NextResponse.json({ success: true, event: result });
  } catch (error) {
    console.error("Calendar update error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/calendar/:id - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    
    await runGog(`calendar delete ${CALENDAR_ID} ${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Calendar delete error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

// Helper functions
function categorizeEvent(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("gig") || t.includes("set") || t.includes("show") || t.includes("performance")) return "gig";
  if (t.includes("studio") || t.includes("recording") || t.includes("production")) return "studio";
  if (t.includes("meeting") || t.includes("call") || t.includes("zoom")) return "meeting";
  if (t.includes("deadline") || t.includes("due") || t.includes("submit")) return "deadline";
  if (t.includes("personal") || t.includes("appointment") || t.includes("dentist") || t.includes("doctor")) return "personal";
  return "other";
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    gig: "#9b5de5",
    studio: "#00bbf9",
    meeting: "#fee440",
    personal: "#00f5d4",
    deadline: "#f15bb5",
    other: "#888",
  };
  return colors[category] || "#888";
}
