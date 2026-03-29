import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

// Initialize auth with service account
function getAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set");
  }
  
  const credentials = JSON.parse(serviceAccountJson);
  
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
}

// GET /api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });
    
    // Use the user's calendar ID (ericmills71@gmail.com)
    const calendarId = "ericmills71@gmail.com";
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: `${from}T00:00:00Z`,
      timeMax: `${to}T23:59:59Z`,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 250,
    });
    
    const events = response.data.items || [];
    
    // Transform to our format
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
  } catch (error: any) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch calendar events", 
      details: error.message 
    }, { status: 500 });
  }
}

// POST /api/calendar - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, time, endTime, location, notes } = body;

    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });
    
    // Build event
    const event: any = {
      summary: title,
      location: location,
      description: notes,
    };
    
    if (time) {
      const startDateTime = `${date}T${time}:00`;
      const endDateTime = endTime 
        ? `${date}T${endTime}:00` 
        : `${date}T${parseInt(time.split(":")[0]) + 1}:${time.split(":")[1]}:00`;
      
      event.start = { dateTime: startDateTime, timeZone: "America/Denver" };
      event.end = { dateTime: endDateTime, timeZone: "America/Denver" };
    } else {
      event.start = { date: date };
      event.end = { date: date };
    }

    const response = await calendar.events.insert({
      calendarId: "ericmills71@gmail.com",
      requestBody: event,
    });

    return NextResponse.json({ success: true, event: response.data });
  } catch (error: any) {
    console.error("Calendar create error:", error);
    return NextResponse.json({ error: "Failed to create event", details: error.message }, { status: 500 });
  }
}

// PUT /api/calendar/:id - Update event
export async function PUT(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    const body = await request.json();
    const { title, date, time, endTime, location, notes } = body;

    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    const event: any = {
      summary: title,
      location: location,
      description: notes,
    };
    
    if (time) {
      const startDateTime = `${date}T${time}:00`;
      const endDateTime = endTime 
        ? `${date}T${endTime}:00` 
        : `${date}T${parseInt(time.split(":")[0]) + 1}:${time.split(":")[1]}:00`;
      
      event.start = { dateTime: startDateTime, timeZone: "America/Denver" };
      event.end = { dateTime: endDateTime, timeZone: "America/Denver" };
    } else {
      event.start = { date: date };
      event.end = { date: date };
    }

    const response = await calendar.events.update({
      calendarId: "ericmills71@gmail.com",
      eventId: id!,
      requestBody: event,
    });

    return NextResponse.json({ success: true, event: response.data });
  } catch (error: any) {
    console.error("Calendar update error:", error);
    return NextResponse.json({ error: "Failed to update event", details: error.message }, { status: 500 });
  }
}

// DELETE /api/calendar/:id - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    
    const auth = getAuth();
    const calendar = google.calendar({ version: "v3", auth });

    await calendar.events.delete({
      calendarId: "ericmills71@gmail.com",
      eventId: id!,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Calendar delete error:", error);
    return NextResponse.json({ error: "Failed to delete event", details: error.message }, { status: 500 });
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
