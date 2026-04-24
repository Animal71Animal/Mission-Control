# DJ Automation — August ED Expo Demo Scope
**Deadline:** Exotic Dancer Expo, Las Vegas — August 2026
**Purpose:** Polished, working prototype to demo at vendor booth
**Audience:** Club owners and managers
**Goal:** Get 5-minute conversations that end with "call me Monday"

---

## The Three Demo Moments (Non-Negotiable)

Every feature below exists to support one of these three moments:

### Moment 1 — The Financial Hook
> "Here's what you're paying now. Here's what you pay with us."

- On-screen ROI calculator built into the UI
- Input: # of DJs, shifts per week, average DJ pay
- Output: weekly savings, annual savings, payback period
- Simple, visual, undeniable

### Moment 2 — The AI DJ Personality
> They hear it and say "that sounds like a real DJ"

- At least 2-3 distinct AI DJ voice personalities (e.g. hype/energy, smooth/professional, neutral)
- Live announcement demos: dancer intro, stage transition, VIP callout, last call
- Announcements feel natural, not robotic
- Music playing underneath with proper ducking when announcer speaks

### Moment 3 — The Reliability Signal
> "This feels like something I can trust running my club"

- Clean, professional UI — no rough edges visible in demo
- Stage rotation board showing dancers moving through queue in real time
- System status / health indicator visible (green = all good)
- No crashes, no dead air, no awkward pauses during demo

---

## Must-Have Features for August

### 1. AI Announcement Engine
- [ ] 2-3 voice personality options
- [ ] Pre-built announcement templates (dancer intro, stage call, VIP, last call, custom)
- [ ] Smart ducking — music drops when announcement fires
- [ ] Natural insertion timing (fires at phrase/beat boundaries, not mid-song)
- [ ] Manager can trigger announcements one-tap from main UI

### 2. Stage & Rotation Board
- [ ] Visual rotation board: Queue → On Deck → On Stage → Break
- [ ] Support at least 2 stages simultaneously for demo
- [ ] One-tap "Start Set" — system handles intro announcement + timer
- [ ] Configurable set length (2, 3, or 4 songs)
- [ ] Auto-advance rotation when set ends

### 3. Music Playback (VirtualDJ Integration)
- [ ] Music plays continuously without dead air
- [ ] Basic constraint engine: BPM range, no-repeat window, energy level
- [ ] "Room Energy" slider (1–10) shifts music mood in real time
- [ ] Seamless transition between tracks
- [ ] Visual: current track, next track, waveform or album art

### 4. Manager Control Interface
- [ ] Clean dashboard: stages, rotation, music, announcements in one view
- [ ] Mobile-responsive (tablet-friendly for booth demo)
- [ ] Override controls: skip track, extend set, emergency announcement
- [ ] Looks professional — this is what they'll photograph and share

### 5. ROI Calculator (Demo Tool)
- [ ] Simple input form: DJ count, shifts/week, avg DJ pay
- [ ] Live output: monthly savings vs. our $2,000/month subscription
- [ ] Visual — chart or bold numbers, not a spreadsheet

---

## Explicitly OUT OF SCOPE for August

These are real features but do NOT belong in the August build:

- ❌ Dancer self-service portal / Spotify submissions
- ❌ Full content filtering / approval queue
- ❌ Multi-location / chain dashboard
- ❌ Detailed shift reports and analytics
- ❌ Dancer authentication / login system
- ❌ Full VirtualDJ SDK deep integration (basic API connection is fine)
- ❌ Windows installer / production deployment
- ❌ POS integration
- ❌ Record pool subscription features

---

## Build Priority Order

| Priority | Feature | Why |
|----------|---------|-----|
| 1 | AI announcement engine + voices | The wow moment. Build this first. |
| 2 | Stage rotation board | Visual proof the system works |
| 3 | Music playback with basic constraints | The foundation everything else sits on |
| 4 | Manager control UI (polished) | What they'll actually interact with |
| 5 | ROI calculator | Closes the financial argument |

---

## Definition of "Demo Ready"

- Runs for 4+ hours without crash or intervention
- Sounds professional (announcements, music transitions)
- Looks professional (no placeholder text, no broken UI)
- Can be operated by someone who's never seen it before within 5 minutes
- Has a recovery path if something goes wrong mid-demo (failover playlist, manual override)

---

## Hard Deadline Milestones

| Date | Milestone |
|------|-----------|
| End of Week 4 | Music playback + basic rotation working |
| End of Week 6 | AI announcements integrated, ducking working |
| End of Week 8 | Full demo loop runs start to finish |
| End of Week 10 | Polish pass — UI, edge cases, stability |
| End of Week 12 | Stress test: 4-hour continuous run, zero crashes |
| Week 14-16 | Travel prep, booth materials, backup hardware |

---

*Scope owner: ANIMAL | Dev: Micah | Last updated: April 2026*
