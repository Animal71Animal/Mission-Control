# DJ Automation Software — Product Brief

**Version:** 1.1  
**Prepared for:** Developer Handoff  
**Owner:** ANIMAL

---

## What This Is

An automated DJ management system built specifically for strip clubs and gentlemen's clubs. The goal is to allow a venue to operate with one head DJ who programs the system — replacing the traditional multi-DJ staffing model.

Direct competitor to CoverJock (current market leader). We beat them on:
- AI-powered music intelligence
- Dancer self-service
- Content control
- Reliability
- Usability

---

## Integration Architecture: Built ON VirtualDJ, Not Against It

**Key strategic decision (added v1.1):** Most clubs already run VirtualDJ. Rather than building a competing audio engine from scratch (a massive engineering undertaking with hardware compatibility, codec licensing, and gapless playback complexity), the production architecture should build on top of VirtualDJ using its SDK and scripting API.

### What This Means

- **VirtualDJ handles:** All audio output, mixing, hardware I/O — it's already battle-tested in clubs
- **Our software is:** The intelligence layer: rotation management, AI track selection, announcements, dancer self-service, content filtering, reporting
- **We drive VirtualDJ programmatically:** Track queuing, crossfade triggers, deck control via VDJ SDK
- **Adoption friction drops:** Clubs don't need to replace software they already know

### What We Own

- The rotation brain (who goes when, for how long, fairness enforcement)
- The music constraint engine (BPM, energy, explicit filtering, anti-repeat)
- The announcement layer (AI TTS, smart insertion, role-based triggers)
- Dancer self-service portal (Spotify search, approval queue, personal folders)
- The admin/operator UI
- Reporting and shift analytics

**Key benefit:** We position ourselves as a platform layer rather than a hardware-dependent playout app — easier to build, easier to support, and easier to sell to venues already invested in VirtualDJ.

---

## VirtualDJ Partnership Strategy

Three deal structures, in order of when to pursue them:

### Stage 1 — No Deal (Ship Now)

- VirtualDJ has a public SDK. Use it. Build on it.
- Clubs use their own existing VirtualDJ license — nothing to negotiate.
- We charge for our software independently. VirtualDJ gets nothing, and doesn't need to.
- This is standard platform development (same as building on Spotify API or Ableton Live API).
- **No permission needed. Start here.**

### Stage 2 — Authorized Integration Partner (After First Customers)

- VirtualDJ runs an approved partner/integration program.
- Getting listed means: co-marketing exposure, "Works with VirtualDJ" badge, better API access, credibility with clubs.
- Typically free or minimal cost — VirtualDJ benefits from ecosystem growth.
- **Approach them once you have 5–10 paying club customers.** Negotiate from traction, not from nothing.

### Stage 3 — Bundled License Deal (Optional, Later)

- If you want to sell to clubs that don't already have VirtualDJ, bundle a license into your package.
- Negotiate OEM/reseller pricing — buy licenses at wholesale, include in your subscription or onboarding fee.
- Only relevant once you've proven the model and have volume to negotiate with.

**Key Principle:** Never let a partnership requirement become a prerequisite to shipping. Build first, negotiate later from strength.

---

## The Problem We're Solving

Strip clubs pay for multiple DJs per shift. Current automated systems (CoverJock, BoothPoint, Strip Sync) are:

- Difficult to set up (hours of configuration, extensive tutorial libraries)
- Brittle (one PC failure = dead air = revenue loss)
- Reactive, not intelligent (rules-based selection, not AI-adaptive)
- Slow on announcements (CoverJock takes up to 24 hours to record custom voiceovers)
- Designed for Windows-only, aging hardware
- Not designed for dancer self-service music management

**Our answer:** A modern, AI-assisted, offline-first automated DJ system that a single trained operator can run for an entire club.

---

## Users & Roles

| Role | Who They Are | What They Do |
|------|--------------|--------------|
| **Admin** | Head DJ / Club Manager | Full system access. Programs rotations, manages dancers, approves music, sets policy |
| **Operator** | Booth staff / manager-on-duty | Live controls, announcements, skip/extend, monitor stages |
| **Dancer** | Entertainers | Log in to see ONLY their personal music folder. Search Spotify, submit track requests |

---

## Core Features (MVP — Must Ship)

### 1. Stage & Rotation Management

- Support 1–12 active stages simultaneously
- Rotation board: Checked In → Queued → On Deck → On Stage → Break/VIP → Checked Out
- Configurable set lengths (2-song, 3-song, 4-song, feature)
- Per-dancer preferences (genre, BPM range, explicit/clean)
- Fairness enforcement + rotation audit log (dispute prevention)
- One-tap "Start Set" — system handles intro, timer, end cue

### 2. AI-Powered Music Engine

Constraint-based track selection (not just random):

- BPM range enforcement
- Energy level progression (curve management across a shift)
- Artist separation (no repeat within configurable window)
- Track repeat protection
- Genre weighting by time-of-night
- Explicit content filtering
- "Room Energy" slider (1–10) — manager shifts mood of entire set in real time
- Scenario modes: Open / Build / Prime / Last Call / After Hours
- Anti-repeat logic: track-level AND artist/vibe/BPM-band level

### 3. Announcements / MC Layer

- Pre-recorded + AI TTS voice library (no 24-hour wait like CoverJock)
- One-tap stingers: "Make noise," "VIP special," "Last call," policy reminders
- Smart insertion: announcements only play at natural music boundaries (never over drops)
- Scheduled announcement rules (frequency, blackout windows)
- Manager-defined announcement templates with variables ({dancer_name}, {stage}, etc.)
- Role-based announcement triggers (bartenders can trigger approved announcements only)

### 4. Dancer Music Self-Service

- Dancers log in with personal credentials
- Dancers ONLY see their own music folder (not other dancers' content)
- Search Spotify catalog → submit track requests
- All submissions go into manager approval queue before appearing in rotation
- Managers can preview 30-second audio snippet before approving/rejecting
- Content filtering layers:
  - Banned word list (title/artist, manager-defined)
  - Spotify explicit flag (auto-reject toggle)
  - Manager human review (final gate)
- Staff can add/remove tracks from any dancer's folder
- "Do Not Play For Me" list per dancer

### 5. Operator Control Interface

- Professional rotation queue manager (next 3 tracks, upcoming dancers)
- Stage selector — one interface manages all active stages simultaneously
- Live controls: skip track, extend set, manual queue override, emergency abort
- Announcement trigger panel (approved stingers only for operator role)
- Real-time timing display (set timer, stage occupancy, next dancer ETA)
- Mobile-responsive for tablet use in booth
- Integrates with VirtualDJ SDK: programmatically controls track queuing, crossfade triggers, deck state via VDJ API (does NOT replicate deck controls — mixing, EQ, BPM sync remain VirtualDJ's responsibility)

### 6. Content Policy Management

- Policy profiles (Weeknight / Weekend Prime / Clean Night / Custom)
- Rules: explicit on/off, banned artists, banned tracks, BPM boundaries
- Approved track pools: stage-safe pool, background/floor pool
- Configurable "no repeat" windows

### 7. Reliability & Failover

- Offline-first architecture — the show runs without internet (clubs have bad WiFi)
- Local cache of music, playlists, and policy — hours of buffer
- Automatic failover: if stream or audio device fails, switch to safe local playlist instantly with no dead air
- Watchdog process: monitors CPU, disk, audio device, network — alerts on risk
- "No updates during business hours" policy enforcement
- Health dashboard: all device/service status at a glance

### 8. Shift Logs & Reporting

- Auto-generated shift recap: peak times, slow patches, set performance
- Stage utilization metrics (active vs. idle minutes)
- Rotation fairness report (timestamps, who went when)
- Announcement performance tracking
- Dead air prevention events logged
- Export to CSV/JSON

---

## Architecture Requirements

### Three-Layer System Design

**Control Plane (Web/Cloud)** handles:
- Configuration: stages, dancers, rotation rules, policies
- Constraint engine: BPM, energy, fairness, repeat protection, artist separation
- Dancer self-service: music submissions, approvals, personal folders
- Announcement management & scheduling
- Analytics, reporting, shift logs
- Multi-location dashboard (for chains)

**Playout Engine (VirtualDJ — Third-Party)** handles:
- Audio output, mixing, crossfades, gapless playback
- Hardware I/O (soundcard, lighting, tempo sync)
- Already battle-tested in thousands of clubs
- We integrate programmatically via SDK

**Integration & Operator Layer (Tauri Desktop App — What You Build)** handles:
- Operator control UI: queue manager, stage controls, skip/extend, announcements
- Real-time sync with cloud control plane
- Offline cache: rotation configs, policies, music metadata
- Failover watchdog: monitors health, auto-switches to safe playlist if needed
- Programmatic control of VirtualDJ SDK: track queuing, deck state, crossfade triggers
- Local SQLite for offline-first operation

**Key principle:** You own the intelligence and the operator experience. VirtualDJ owns the audio. Your app orchestrates between them.

### Platform Targets

- **Cross-platform from day one** — macOS and Windows (clubs run both)
- **Playout app:** Tauri desktop app (Rust backend + React UI) — single codebase for both OS
- **Admin console:** Web-based (tablet + desktop, browser)
- **Dancer app:** Mobile web or native iOS/Android (Phase 2)

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Desktop shell | Tauri (Rust + React) | Cross-platform, single codebase for macOS & Windows |
| Local DB | SQLite | Zero-config, offline-capable, no server required |
| VirtualDJ SDK | Public API + scripting | Controls VDJ programmatically for track queuing, deck state, crossfades |
| Cloud sync | Optional REST API | Rotation/config syncs when online, queued if offline |
| TTS | ElevenLabs API (cached locally) | Instant voiceovers, no 24-hr wait like CoverJock |
| Music source | Venue's own + VirtualDJ streaming | No separate music licensing — clubs use existing VDJ subscriptions |
| Auth | JWT-based, offline-capable | Role-based access (Admin/Operator/Dancer) |
| Monitoring | Local watchdog + cloud health dashboard | Real-time status, failover automation, no dead air |

**Key architectural principle:** Three layers, clear separation. Control plane manages intelligence. Playout engine (VirtualDJ) handles audio. Integration layer orchestrates both offline-first with fallback. No single point of failure.

### Deployment

- Single executable installer (.exe for Windows, .app for macOS — Tauri handles both)
- Silent auto-update (outside business hours)
- Remote management via web admin panel

---

## Revenue Model & Upsell Stack

### Stream 1 — Software License (Core)

- **$2,000/month per venue** (flat rate — all stages, all DJs, all operators included)
- Chain discounts for multi-location operators (e.g., 20% off for 3+ locations — TBD)
- Includes: core platform, all stages, all accounts, dancer self-service, announcements, TTS, shift logs, offline playback

### Stream 2 — Record Pool Subscription (Future Revenue Stream)

Weekly curated drops specifically designed for club/automation use:

- Right BPM ranges for each energy tier
- Clean versions always included
- Tagged and rotation-ready (metadata pre-filled for our constraint engine)
- Genre-weighted for nightclub/gentlemen's club programming
- Priced competitively with existing pools (BPMSupreme ~$20/mo, DJCity ~$30/mo)

**Key differentiator:** Existing pools are for human DJs. Ours is built for automated systems — tracks pre-tagged with energy level, BPM band, explicit flag, set position (opener/mid/closer)

Creates sticky recurring revenue tied directly to the software. ANIMAL's 25+ years of programming instincts = genuine curatorial edge here.

### Stream 3 — VirtualDJ Streaming Integration

- Clubs using VirtualDJ already have access to integrated streaming services (SoundCloud Go+, Beatport Link, etc.)
- Our software routes track selection through those licensed streams — no separate music licensing required for base tier
- Reduces barrier to adoption (venue uses their existing VirtualDJ subscription for music)

---

## Competitive Differentiators vs. CoverJock

| Pain Point (CoverJock) | Our Solution |
|------------------------|--------------|
| 24-hour voiceover turnaround | Instant AI TTS, no waiting |
| Complex configuration (extensive tutorial library) | Setup wizard — configured in <15 minutes |
| Rules-based music selection | AI constraint engine with energy adaptation |
| Dependent on single on-prem Windows PC | Redundant local player + failover + watchdog |
| BoothPoint-only integration (closed ecosystem) | Open API layer, webhooks, CSV import |
| No dancer self-service | Dancer Spotify submissions with manager approval |
| Generic multi-venue reporting | Per-shift operational insights + chain analytics |

---

## Success Metrics

### Technical (Pilot Phase)

- Dead air incidents: 0 per 100 hours
- Crashes/restarts: <1 per 100 hours
- Manual interventions: <5 per 8-hour shift
- Setup time: <20 minutes for new venue

### Business (Chain Rollout)

- Manager NPS: 8+/10
- Dancer satisfaction: 80%+ prefer automated over traditional
- First chain contract signed: EOY 2026

---

## Phased Build Plan

### Phase 1 — Core Engine (Weeks 1–6)

Focus: Rotation logic + VirtualDJ integration for one stage

- Rotation scheduler (dancer timers, auto-next, fairness enforcement)
- Constraint engine (BPM, energy, repeat protection, artist separation)
- Basic VirtualDJ SDK integration (track queuing, deck state control)
- Local SQLite database (stages, dancers, music metadata)
- Setup wizard (quick configuration)
- Offline cache + failover watchdog
- TTS announcement engine (ElevenLabs API, cached locally)

### Phase 2 — V1 Operator Edition (Weeks 7–10)

Focus: Professional operator UI + dancer self-service

- Operator control UI (queue manager, stage selector, live controls)
- Dancer self-service + approval workflow (Spotify search, requests)
- Web admin panel (cloud-based configuration)
- Multi-stage support
- Content filtering (banned words, explicit flag)
- Shift logs and reporting
- Real-time cloud sync (when online)

### Phase 3 — Chain Launch (Weeks 11–16)

Focus: Multi-venue operations + production readiness

- Multi-location dashboard
- Chain pricing & billing integration
- Security audit + code signing
- Documentation + support portal
- On-site support runbooks

---

## What Developer Needs to Answer Before Week 1

- Windows-first or cross-platform from day one?
- Will we provide music licensing or is venue responsible for their own library?
- Preferred audio library (rodio/cpal in Rust, or different approach)?
- POS integration in V1 or Phase 3?
- Any preference on local DB (SQLite vs. embedded Postgres)?

---

**Document prepared by PriScylla (AI assistant) based on product research and development sessions.**  
**Last updated:** March 2026
