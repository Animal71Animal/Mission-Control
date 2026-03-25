"use client";

import { useState, useEffect, useCallback } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  category: "gig" | "studio" | "meeting" | "personal" | "deadline" | "other";
  location?: string;
  notes?: string;
  color?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  gig: "#9b5de5",
  studio: "#00bbf9",
  meeting: "#fee440",
  personal: "#00f5d4",
  deadline: "#f15bb5",
  other: "#888",
};

const CATEGORY_LABELS: Record<string, string> = {
  gig: "Gig",
  studio: "Studio",
  meeting: "Meeting",
  personal: "Personal",
  deadline: "Deadline",
  other: "Other",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const emptyForm = (): Partial<CalendarEvent> => ({
  title: "",
  date: "",
  time: "",
  endTime: "",
  category: "gig",
  location: "",
  notes: "",
});

export default function CalendarPage() {
  const today = new Date();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<Partial<CalendarEvent>>(emptyForm());
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setError(null);
    // Calculate date range for the current view
    const fromDate = new Date(currentYear, currentMonth, 1).toISOString().split("T")[0];
    const toDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split("T")[0];
    
    try {
      const res = await fetch(`/api/calendar?from=${fromDate}&to=${toDate}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
        setEvents([]);
      } else {
        setEvents(data.events || []);
      }
    } catch (e) {
      setError("Failed to connect to calendar service");
      setEvents([]);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const d = i - firstDay + 1;
    return d > 0 && d <= daysInMonth ? d : null;
  });

  const todayYMD = toYMD(today);

  function getCellDate(day: number) {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function eventsForDay(day: number) {
    const ymd = getCellDate(day);
    return events.filter((e) => e.date === ymd).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  function goToday() {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  }

  function openNewEvent(date?: string) {
    setEditingEvent(null);
    setForm({ ...emptyForm(), date: date || "" });
    setModalOpen(true);
  }

  function openEditEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setForm({ ...event });
    setModalOpen(true);
  }

  async function saveEvent() {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      if (editingEvent) {
        await fetch(`/api/calendar/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      await fetchEvents();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    await fetchEvents();
    // If no more events for that day, close panel
    const remaining = events.filter(e => e.id !== id && e.date === selectedDay);
    if (remaining.length === 0) setSelectedDay(null);
  }

  // Upcoming events: next 10 from today
  const upcoming = events
    .filter((e) => e.date >= todayYMD)
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return (a.time || "").localeCompare(b.time || "");
    })
    .slice(0, 10);

  const selectedEvents = selectedDay
    ? events.filter((e) => e.date === selectedDay).sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{
          fontSize: "1.5rem", fontWeight: 700, margin: 0,
          background: "linear-gradient(135deg, #9b5de5, #c77dff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Calendar
        </h1>
        <div style={{ flex: 1 }} />
        <button onClick={prevMonth} style={btnStyle}>←</button>
        <span style={{ fontWeight: 700, fontSize: "1.1rem", minWidth: 160, textAlign: "center" }}>
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button onClick={nextMonth} style={btnStyle}>→</button>
        <button onClick={goToday} style={btnOutlineStyle}>Today</button>
        <button onClick={() => openNewEvent()} style={btnPrimaryStyle}>+ New Event</button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: "rgba(224,92,92,0.1)",
          border: "1px solid rgba(224,92,92,0.3)",
          borderRadius: 8,
          padding: "12px 16px",
          color: "#e05c5c",
          fontSize: "0.85rem",
        }}>
          <strong>⚠️ Calendar Error:</strong> {error}
          <div style={{ marginTop: 8, fontSize: "0.8rem" }}>
            Make sure gog is authenticated: <code style={{ background: "rgba(0,0,0,0.2)", padding: "2px 6px", borderRadius: 4 }}>gog auth add ericmills71@gmail.com --services calendar</code>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {/* Calendar grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 0 }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{
                padding: "8px 4px",
                textAlign: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--muted)",
                background: (i === 0 || i === 6) ? "rgba(0,0,0,0.15)" : "transparent",
                border: "1px solid var(--border)",
                borderBottom: "none",
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((day, idx) => {
              const col = idx % 7;
              const isWeekend = col === 0 || col === 6;
              const ymd = day ? getCellDate(day) : null;
              const isToday = ymd === todayYMD;
              const isSelected = ymd === selectedDay;
              const dayEvents = day ? eventsForDay(day) : [];
              const extra = dayEvents.length > 3 ? dayEvents.length - 3 : 0;

              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDay(ymd === selectedDay ? null : ymd)}
                  style={{
                    minHeight: 90,
                    border: "1px solid var(--border)",
                    padding: "6px 4px",
                    background: isSelected
                      ? "rgba(155,93,229,0.08)"
                      : isWeekend
                        ? "rgba(0,0,0,0.12)"
                        : "transparent",
                    cursor: day ? "pointer" : "default",
                    position: "relative",
                    boxSizing: "border-box",
                    transition: "background 0.1s",
                  }}
                >
                  {day && (
                    <>
                      {/* Day number */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                        <span style={{
                          width: 24, height: 24,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "50%",
                          fontSize: "0.8rem",
                          fontWeight: isToday ? 700 : 400,
                          color: isToday ? "#fff" : "var(--text)",
                          background: isToday ? "#9b5de5" : "transparent",
                          flexShrink: 0,
                        }}>
                          {day}
                        </span>
                      </div>

                      {/* Event chips */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            style={{
                              background: ev.color || "#888",
                              color: ev.category === "meeting" ? "#222" : "#fff",
                              borderRadius: 3,
                              padding: "1px 5px",
                              fontSize: "0.7rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: "1.4",
                            }}
                          >
                            {ev.time && <span style={{ opacity: 0.8, marginRight: 3 }}>{ev.time}</span>}
                            {ev.title}
                          </div>
                        ))}
                        {extra > 0 && (
                          <div style={{ fontSize: "0.68rem", color: "var(--muted)", paddingLeft: 4 }}>
                            +{extra} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Day Detail Panel */}
          {selectedDay && (
            <div style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 16,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    {formatDate(new Date(selectedDay + "T12:00:00"))}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
                    {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  style={{ ...btnStyle, padding: "2px 8px", fontSize: "0.75rem" }}
                >✕</button>
              </div>

              {selectedEvents.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: 12 }}>
                  No events on this day.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                  {selectedEvents.map((ev) => (
                    <div key={ev.id} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${ev.color || "#888"}44`,
                      borderLeft: `3px solid ${ev.color || "#888"}`,
                      borderRadius: 6,
                      padding: "8px 10px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", flex: 1, marginRight: 8 }}>
                          {ev.title}
                        </div>
                        <span style={{
                          background: ev.color || "#888",
                          color: ev.category === "meeting" ? "#222" : "#fff",
                          borderRadius: 3,
                          padding: "1px 6px",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {CATEGORY_LABELS[ev.category]}
                        </span>
                      </div>
                      {(ev.time || ev.endTime) && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 3 }}>
                          🕐 {ev.time}{ev.endTime ? ` – ${ev.endTime}` : ""}
                        </div>
                      )}
                      {ev.location && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
                          📍 {ev.location}
                        </div>
                      )}
                      {ev.notes && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>
                          {ev.notes}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => openEditEvent(ev)} style={{ ...btnOutlineStyle, fontSize: "0.7rem", padding: "3px 8px" }}>
                          Edit
                        </button>
                        <button onClick={() => deleteEvent(ev.id)} style={{ ...btnDangerStyle, fontSize: "0.7rem", padding: "3px 8px" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => openNewEvent(selectedDay)}
                style={{ ...btnPrimaryStyle, width: "100%", fontSize: "0.8rem" }}
              >
                + Add event on this day
              </button>
            </div>
          )}

          {/* Upcoming Events */}
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 16,
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 12, color: "var(--text)" }}>
              Upcoming Events
            </div>
            {upcoming.length === 0 ? (
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>No upcoming events.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      const [y, m] = ev.date.split("-").map(Number);
                      setCurrentYear(y);
                      setCurrentMonth(m - 1);
                      setSelectedDay(ev.date);
                    }}
                    style={{
                      cursor: "pointer",
                      borderLeft: `3px solid ${ev.color || "#888"}`,
                      paddingLeft: 8,
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{ev.title}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {new Date(ev.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {ev.time ? ` · ${ev.time}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New/Edit Event Modal */}
      {modalOpen && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 28,
            width: "100%",
            maxWidth: 480,
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 700 }}>
              {editingEvent ? "Edit Event" : "New Event"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={labelStyle}>
                Title *
                <input
                  value={form.title || ""}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Mynt Lounge Set"
                  style={inputStyle}
                  autoFocus
                />
              </label>

              <label style={labelStyle}>
                Date *
                <input
                  type="date"
                  value={form.date || ""}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  style={inputStyle}
                />
              </label>

              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ ...labelStyle, flex: 1 }}>
                  Start Time
                  <input
                    type="time"
                    value={form.time || ""}
                    onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                    style={inputStyle}
                  />
                </label>
                <label style={{ ...labelStyle, flex: 1 }}>
                  End Time
                  <input
                    type="time"
                    value={form.endTime || ""}
                    onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                    style={inputStyle}
                  />
                </label>
              </div>

              <label style={labelStyle}>
                Category
                <select
                  value={form.category || "gig"}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value as CalendarEvent["category"] }))}
                  style={inputStyle}
                >
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                Location
                <input
                  value={form.location || ""}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Venue, city, or Zoom"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Notes
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Load-in time, set length, contacts..."
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)} style={btnOutlineStyle}>Cancel</button>
              <button
                onClick={saveEvent}
                disabled={saving || !form.title || !form.date}
                style={{
                  ...btnPrimaryStyle,
                  opacity: (saving || !form.title || !form.date) ? 0.5 : 1,
                  cursor: (saving || !form.title || !form.date) ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared button styles
const btnStyle: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const btnOutlineStyle: React.CSSProperties = {
  ...btnStyle,
};

const btnPrimaryStyle: React.CSSProperties = {
  background: "#9b5de5",
  border: "1px solid #9b5de5",
  color: "#fff",
  borderRadius: 6,
  padding: "6px 16px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: 600,
};

const btnDangerStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #f15bb5",
  color: "#f15bb5",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "0.85rem",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  fontSize: "0.8rem",
  color: "var(--muted)",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "8px 10px",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
