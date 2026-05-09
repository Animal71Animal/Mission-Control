# Interface Specification — DJ Automation SaaS

**Date:** 2026-05-08
**Status:** Draft — Eric review needed

---

## A) Playback Engine (VirtualDJ Plugin / Standalone)

**Core Responsibilities**
- Beat-matched mixing, cueing, transitions
- Scenario mode execution (Open → Build → Prime → Last Call → After-hours)
- Energy slider response (1–10 → BPM, intensity, drop frequency, familiarity)
- Hard guarantees: no vocals first 20s, no abrupt tempo changes, never crossfade on drops
- Instant stingers: "make noise," "VIP special," "last call" — ducks music properly
- Offline-first: deterministic playback from local cache

**Key Design Principle**
Audio engine is **reliable first, clever second.** No experimental AI in the signal path.

---

## B) Manager Console (Web App) — "Operations + Policy"

**Core Responsibilities**
- Rotation board management
- Policy profiles (explicit rules, do-not-play)
- Announcement scheduling + approvals
- Staff accounts + permissions
- Reporting + logs

**Key Design Principle**
Designed for **managers, not DJs:** clear control, auditability, low training.

### Page 1: "Dashboard / Tonight"

**Purpose:** Manager overview in 10 seconds.

**Widgets**
| Widget | Data |
|--------|------|
| Stage Utilization | Minutes active vs. idle this shift |
| VIP Triggers | Last 60 min (manual or integrated) |
| Room Energy Trend | Visual graph of energy slider over time |
| Alerts | "Stage idle 9 min", "Too many skips", "Explicit policy violation prevented" |

**Quick Buttons**
- Switch Mode
- Lock Explicit Off
- Send Announcement Now
- Open Rotation Board

---

### Page 2: "Rotation Board"

**Purpose:** The heart of strip-club ops workflow.

**Layout: Kanban-Style Columns**
| Column | Description |
|--------|-------------|
| Checked In | Dancers present and available |
| Queued | In rotation order |
| On Deck | Next up |
| On Stage | Currently performing |
| Break / VIP | Off stage, optionally still in rotation |
| Checked Out | Done for the night |

**Dancer Card Contents**
- Stage preference tags (genre, intensity, explicit allowed)
- "Last set time", "Time since stage"
- Fairness indicator (green = balanced, yellow = overdue, red = unfair gap)
- Manager-only notes

**Actions**
- Drag/drop reorder
- Assign set type (regular / feature)
- Lock order (prevent accidental changes)
- Dispute-safe: "Rotation history" side panel

**Audit Log (Built Into Page)**
- "Who moved who, when, from where to where"

---

### Page 3: "Announcements"

**Purpose:** Reduce annoyance, increase VIP conversions, stay compliant.

**Subpages**

**Library**
- Audio clips + TTS scripts + voice packs
- Preview with ducking over sample music

**Scheduler**
- Rules: "Every 15–25 min, but only between tracks"
- "Increase frequency in slow hours"
- Blackout windows (during features / peak moments)

**Approvals**
- Which roles can create vs. trigger vs. schedule
- Preview before commit

---

### Page 4: "Music Policy & Content"

**Purpose:** Prevent "wrong song at wrong time" and reduce manual policing.

**Policy Profiles**
| Profile | Use Case |
|---------|----------|
| Weeknight | Lower energy, tighter explicit control |
| Weekend Prime | Higher energy, explicit allowed |
| Clean Night | No explicit content, family-friendly / city compliance |

**Rules Engine**
| Rule | Control |
|------|---------|
| Explicit | On / Off |
| Banned Artists / Tracks / Words | Search + add to ban list |
| BPM Boundaries | Min / Max per profile |
| No-Repeats Window | Track / Artist / Vibe — time before replay allowed |

**Approved Pools**
| Pool | Description |
|------|-------------|
| Stage-Safe Pool | Curated cuts with clean intros/outros, guaranteed structure |
| Floor / Background Pool | Lower intensity, continuous mix, no jarring transitions |

---

### Page 5: "Users & Permissions"

**Purpose:** Role-based access + damage control.

**Role Templates**
| Role | Default Permissions |
|------|---------------------|
| Owner | All permissions + billing |
| Manager | Skip tracks, trigger announcements, edit rotation, change explicit policy |
| House Mom | Edit rotation, dancer check-ins |
| DJ / Booth | Skip tracks, trigger announcements, energy slider |
| Bartender | Trigger approved announcements only |
| Dancer | Request tracks, set preferences |

**Per-Permission Toggles**
- Can skip tracks?
- Can trigger announcements?
- Can edit rotation?
- Can change explicit policy?
- 2FA option for managers/owners (recommended)

---

### Page 6: "Analytics & Reports"

**Purpose:** Owners want ROI + operational clarity.

**Reports**
| Report | Contents |
|--------|----------|
| Shift Recap (Auto-Generated) | Peak times, slow patches, top sets, announcement performance |
| Stage Utilization | Minutes active vs. idle |
| "Dead Air Prevented" Count | System interventions that avoided silence |
| Top Sets | Correlated with sales signals if POS integrated |
| Announcement Performance | Timing + response proxies (VIP inquiries after promos) |

**Important Note:** Show as operational insights, not causal claims. "This song caused revenue" is misleading. Correlations are fine; causality requires controlled experiments.

---

### Page 7: "Locations / Zones / Devices"

**Purpose:** Multi-room setups, multiple stages, signage/lighting later.

**Zones**
| Zone | Typical Use |
|------|-------------|
| Main Floor | Primary stage, highest energy |
| VIP Hallway | Lower energy, discretion |
| Patio | Background, weather-dependent policy |

**Device Management**
- Assign devices to zones
- Different policy profiles per zone
- Player status cards: online/offline, last heartbeat, version

---

## C) Dancer App / Kiosk

**Core Responsibilities**
- Check in/out
- Set preferences
- Request tracks (from approved pool)
- See "You're up next" + countdown
- Dispute reduction: transparent rotation + history

### Screen 1: "Check-In"

| Field | Description |
|-------|-------------|
| Stage Name | Choose or confirm |
| ID Verification | Optional — if club wants |
| Preference Pack | Genre, intensity, explicit allowed |
| Availability | On floor / VIP / Break |

### Screen 2: "My Turn"

| Display | Description |
|---------|-------------|
| Position in Queue | "3rd in rotation" |
| On Deck Countdown | "~12 min until stage" |
| Set Length | Configured per club |
| Start Set | **Not dancer-triggered** unless club policy allows (usually manager/booth triggers) |

### Screen 3: "Requests"

| Feature | Description |
|---------|-------------|
| Search | Only within approved pool |
| Request Button | + status (pending / approved / played) |
| "Do Not Play For Me" List | Personal ban list |

---

## D) Backend Architecture

### Core Services

| Service | Responsibility |
|---------|---------------|
| Auth & RBAC | Users, roles, permissions, sessions, 2FA |
| Venue/Zone Service | Club locations, zones, device assignments |
| Rotation Service | Dancer state machine, ordering, fairness metrics |
| Music Catalog Service | Tracks, tags, explicit flags, "stage-safe score", pools |
| Policy Engine | Evaluate if track is allowed in context (profile + time + zone + dancer) |
| Announcement Service | Library, scheduler, "safe insertion" decisions |
| Playback Coordination API | Sends "desired state" to Player (mode, energy target, next set plan) |
| Telemetry / Logging | Player heartbeats, errors, event stream |
| Analytics Pipeline | Aggregates shift reports |

### Minimum Data Model

| Entity | Purpose |
|--------|---------|
| Venue | Club identity, billing, global settings |
| Zone | Physical area with independent policy |
| Device (Player) | Hardware running playback engine |
| User | Staff account |
| Role | Permission template |
| Permission | Granular capability |
| Session | Active login |
| Dancer | Performer profile |
| Shift | Time-bound work period |
| RotationEntry | Dancer's place in queue |
| Set | Individual stage performance |
| Track | Music file + metadata |
| Tag | Classification (genre, energy, explicit, etc.) |
| Pool | Curated subset of tracks |
| PolicyProfile | Rule set for a context |
| BanRule | Explicit block (artist, track, word) |
| Announcement | Audio clip or TTS script |
| AnnouncementSchedule | When and how often to play |
| EventLog | Append-only audit trail — **very important** |

---

### Page 5: "Staff + Permissions"

**Purpose:** Role-based access control.

**Roles Table**
| Role | Can Create | Can Trigger | Can Schedule | Can Override Policy |
|------|------------|-------------|--------------|---------------------|
| Manager | ✅ All | ✅ All | ✅ All | ✅ All |
| House Mom | ❌ | Rotation only | Dancer check-ins | ❌ |
| Dancer | ❌ | Requests (approved pool) | Preferences | ❌ |
| Bartender / Door | ❌ | Approved announcements only | ❌ | ❌ |

**Audit Log**
- Filter by user, action type, time range
- Export to CSV

---

### Page 6: "Reports"

**Purpose:** ROI proof for owners.

**Reports**
| Report | Contents |
|--------|----------|
| Shift Recap | Peak times, slow patches, top-performing sets, announcement performance |
| Rotation Metrics | Average set length, gaps between dancers, stage utilization rate |
| Operational Alerts Log | "Stage idle 9 min", "Too many skips", "Energy too low during peak" |
| Health Dashboard | Audio device status, CPU, network, "risk of dropout" warnings |

---

## C) Dancer UX (Mobile / Kiosk)

**Core Responsibilities**
- Check in/out
- Set preferences
- Request tracks (from approved pool)
- See "You're up next" + countdown
- Dispute reduction: transparent rotation + history

**Screens**

### Screen 1: "My Status"
- Current position in rotation
- Estimated time until stage
- "Check In" / "Check Out" buttons
- Last set timestamp

### Screen 2: "My Preferences"
- Genre boundaries (pick from approved list)
- Tempo range slider
- Explicit allowed toggle (subject to venue policy)
- "Do not play" list (search + add)

### Screen 3: "Request Track"
- Search approved pool only
- "This works for my set" quick-add
- Request history

### Screen 4: "Rotation Transparency"
- Full rotation order (read-only)
- "Who's on deck", "Who's after me"
- Dispute: "I was skipped" → auto-file with timestamp + rotation history

---

## E) Hardware / Deployment

| Component | Spec | Notes |
|-----------|------|-------|
| Venue Box | Intel NUC or equivalent | Local cache + playback engine |
| Audio Interface | USB, 2-channel minimum | Main + booth monitor |
| Network | Ethernet preferred, Wi-Fi fallback | Cloud sync only, not runtime dependency |
| Backup | USB stick with "safe set" | Failover if box dies |

---

## F) Open Questions

1. **Micah's scope:** Is he building all three interfaces (engine, manager console, dancer UX) or just the engine?
2. **POS integration priority:** Which POS systems? (Square, Toast, club-specific?)
3. **Lighting integration:** DMX via USB or network? Which controllers are common in target venues?
4. **Mobile vs. kiosk:** Dancer UX — personal phones or venue tablet? Implies auth model.
5. **Offline sync frequency:** How often does local cache refresh? Every hour? Every night?

---

*Next: Fold into product brief and investor pitch.*
