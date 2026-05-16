import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const LOCAL_DATA_DIR = path.join(process.cwd(), "public", "data");

async function fetchGitHubJSON(filePath: string): Promise<any> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` }, cache: "no-store" }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return JSON.parse(Buffer.from(data.content, "base64").toString("utf-8"));
}

function fetchLocalJSON(filePath: string): any {
  const localPath = path.join(LOCAL_DATA_DIR, path.basename(filePath));
  try {
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, "utf-8"));
    }
  } catch (e) {
    console.error(`[calendar] Local read failed for ${filePath}:`, e);
  }
  return null;
}

function writeLocalJSON(filePath: string, data: any): boolean {
  const localPath = path.join(LOCAL_DATA_DIR, path.basename(filePath));
  try {
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error(`[calendar] Local write failed for ${filePath}:`, e);
    return false;
  }
}

// GET /api/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || new Date().toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    // Fetch all sources in parallel (GitHub first, fallback to local)
    const [calendarDataRaw, srbTodoDataRaw, personalTasksDataRaw] = await Promise.all([
      fetchGitHubJSON("public/data/calendar-events.json"),
      fetchGitHubJSON("public/data/srb-todo.json"),
      fetchGitHubJSON("public/data/personal-tasks.json"),
    ]);

    const calendarData = calendarDataRaw ?? fetchLocalJSON("public/data/calendar-events.json");
    const srbTodoData = srbTodoDataRaw ?? fetchLocalJSON("public/data/srb-todo.json");
    const personalTasksData = personalTasksDataRaw ?? fetchLocalJSON("public/data/personal-tasks.json");

    const allEvents: any[] = [];

    // 1. Calendar events (manually added)
    const calEvents = calendarData?.events || [];
    calEvents.forEach((e: any) => {
      if (e.date) allEvents.push({
        id: e.id,
        title: e.title || "Untitled",
        date: e.date,
        time: e.time,
        endTime: e.endTime,
        location: e.location,
        notes: e.notes,
        category: e.category || "other",
        color: getCategoryColor(e.category || "other"),
        source: "calendar",
      });
    });

    // 2. SRB Todo tasks with due dates
    const srbTasks = srbTodoData?.tasks || [];
    srbTasks.forEach((t: any) => {
      if (t.due_date && !t.completed) allEvents.push({
        id: `srb-${t.id}`,
        title: `🦏 ${t.text}`,
        date: t.due_date,
        category: "deadline",
        color: getCategoryColor("deadline"),
        notes: `SRB - ${t.category} [${t.priority}]`,
        source: "srb",
      });
    });

    // 3. Personal tasks with due dates
    const personalTasks = Array.isArray(personalTasksData) ? personalTasksData : [];
    personalTasks.forEach((t: any) => {
      if (t.due_date && !t.completed) allEvents.push({
        id: `task-${t.id}`,
        title: `✅ ${t.title}`,
        date: t.due_date,
        category: "deadline",
        color: getCategoryColor("deadline"),
        notes: `${t.category || "Task"} [${t.priority || "normal"}]`,
        source: "tasks",
      });
    });

    // Filter by date range
    const filteredEvents = allEvents.filter((e) => e.date >= from && e.date <= to);
    filteredEvents.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ events: filteredEvents });
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
    const { title, date, time, endTime, location, notes, category } = body;

    // Fetch current events (GitHub first, fallback to local)
    let calendarData: { events: Record<string, unknown>[] } = { events: [] };
    let sha = "";

    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/calendar-events.json`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        calendarData = JSON.parse(content);
      }
    } catch {
      const localData = fetchLocalJSON("public/data/calendar-events.json");
      if (localData) calendarData = localData;
    }

    // Add new event
    const newEvent = {
      id: `event-${Date.now()}`,
      title,
      date,
      time,
      endTime,
      location,
      notes,
      category: category || "other",
      created_at: new Date().toISOString(),
    };

    calendarData.events.push(newEvent);

    // Push to GitHub if possible, always write local
    if (sha) {
      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/calendar-events.json`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Add calendar event: ${title}`,
            content: Buffer.from(JSON.stringify(calendarData, null, 2)).toString("base64"),
            sha,
          }),
        }
      );
      if (!updateResponse.ok) {
        console.error("Calendar GitHub write failed, using local only");
      }
    }
    writeLocalJSON("public/data/calendar-events.json", calendarData);

    return NextResponse.json({ success: true, event: newEvent });
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
    const { title, date, time, endTime, location, notes, category } = body;

    // Fetch current events (GitHub first, fallback to local)
    let calendarData: any = { events: [] };
    let sha = "";
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/calendar-events.json`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        calendarData = JSON.parse(content);
      }
    } catch {
      const localData = fetchLocalJSON("public/data/calendar-events.json");
      if (localData) calendarData = localData;
    }

    // Find and update event
    const eventIndex = calendarData.events.findIndex((e: any) => e.id === id);
    if (eventIndex === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    calendarData.events[eventIndex] = {
      ...calendarData.events[eventIndex],
      title,
      date,
      time,
      endTime,
      location,
      notes,
      category: category || "other",
      updated_at: new Date().toISOString(),
    };

    // Push to GitHub if possible, always write local
    if (sha) {
      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/calendar-events.json`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Update calendar event: ${title}`,
            content: Buffer.from(JSON.stringify(calendarData, null, 2)).toString("base64"),
            sha,
          }),
        }
      );
      if (!updateResponse.ok) {
        console.error("Calendar GitHub update failed, using local only");
      }
    }
    writeLocalJSON("public/data/calendar-events.json", calendarData);

    return NextResponse.json({ success: true, event: calendarData.events[eventIndex] });
  } catch (error: any) {
    console.error("Calendar update error:", error);
    return NextResponse.json({ error: "Failed to update event", details: error.message }, { status: 500 });
  }
}

// DELETE /api/calendar/:id - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const id = request.url.split("/").pop();
    
    // Fetch current events (GitHub first, fallback to local)
    let calendarData: any = { events: [] };
    let sha = "";
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/calendar-events.json`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        calendarData = JSON.parse(content);
      }
    } catch {
      const localData = fetchLocalJSON("public/data/calendar-events.json");
      if (localData) calendarData = localData;
    }

    // Remove event
    calendarData.events = calendarData.events.filter((e: any) => e.id !== id);

    // Push to GitHub if possible, always write local
    if (sha) {
      const updateResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/public/data/calendar-events.json`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Delete calendar event: ${id}`,
            content: Buffer.from(JSON.stringify(calendarData, null, 2)).toString("base64"),
            sha,
          }),
        }
      );
      if (!updateResponse.ok) {
        console.error("Calendar GitHub delete failed, using local only");
      }
    }
    writeLocalJSON("public/data/calendar-events.json", calendarData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Calendar delete error:", error);
    return NextResponse.json({ error: "Failed to delete event", details: error.message }, { status: 500 });
  }
}

// Helper functions
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
