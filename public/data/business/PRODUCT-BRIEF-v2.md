# Wicked Liquid Productions — DJ Automation SaaS
## Product Brief v2.0

**Date:** 2026-05-08
**Status:** Draft — Eric review needed before investor pitch
**Pricing:** $2,000/month per venue (flat rate, all stages and DJs included)
**Platform:** Cross-platform from day one (macOS + Windows via Tauri)

---

## 1. The Problem

Strip clubs and nightlife venues run on thin margins. Labor is the #1 cost. The DJ booth is staffed 12+ hours a day, 7 days a week, often with:
- Inexperienced DJs who can't read a room
- No-shows, callouts, scheduling chaos
- Inconsistent music policy enforcement
- Manual rotation management eating manager time
- No data on what actually drives VIP sales

Current "automated" solutions (CoverJock, etc.) play "technically fine" music but don't understand strip club operations. Managers override them constantly. Dancers complain. Customers leave.

**The result:** Venues pay for automation AND still need a body in the booth.

---

## 2. The Solution

An AI-driven DJ automation system built specifically for strip clubs and nightlife venues.

**Not a replacement for the head DJ.** A replacement for the 2–4 shifts per week where a warm body plays Spotify playlists.

**Core promise:** "Set it and forget it" — the system reads the room, manages rotations, enforces policy, and reports ROI. Manager intervention is optional, not required.

---

## 3. Competitive Differentiation

We asked 25+ club managers what broke with existing automation. Here's what they said — and how we solve it:

### A) "It doesn't adapt to the room"
| Pain Point | Our Solution |
|------------|--------------|
| Slow hours vs. rush, bachelor party vs. regulars | **Room Energy Slider (1–10):** Single control shifts BPM, genre intensity, drop frequency, track familiarity |
| Big spender sits down, system doesn't notice | **Scenario Modes:** Open → Build → Prime → Last Call → After-hours Cleaning |
| No spending awareness | **Spending-Triggered Bumps (optional):** POS/VIP sales spike → bias toward higher-energy sets |
| Listener fatigue | **Micro-Recovery Logic:** After 2–3 high-intensity tracks, auto-inserts palate cleanser |

### B) Dead air / awkward transitions / bad cueing
| Pain Point | Our Solution |
|------------|--------------|
| Dancers need clean intros, predictable structure | **"Stage-Safe" Track Tagging:** Curated "club cuts" with standardized intros/outros |
| No set arc | **Set Templates:** 2-song, 3-song, 4-song structures — warm-up → peak → finish |
| Abrupt changes kill the moment | **Hard Guarantees:** "No vocals first 20s" toggle, "No abrupt tempo change" toggle, "Never crossfade on drops" |
| Need instant reactions | **Instant Stingers:** One-tap "make noise," "VIP special," "last call" — ducks music properly |

### C) Announcements are clunky, repetitive, poorly timed
| Pain Point | Our Solution |
|------------|--------------|
| Too frequent = annoys customers | **Musical Awareness Scheduler:** Insert only at natural boundaries (end of track, low-energy segment) |
| Too sparse = misses VIP sales | **Dynamic Frequency:** More promos during slow hours, fewer during peak |
| Robotic voice | **Multi-Voice Packs + Custom Recordings + TTS** that sounds human |
| Compliance gaps | **Compliance Announcements:** ID checks, no-touch reminders, policy reminders on manager schedule |

### D) Dancer rotation is a mess
| Pain Point | Our Solution |
|------------|--------------|
| "Who's up next?" chaos | **Built-In Rotation Board:** Kanban-style — Checked In → Queued → On Deck → On Stage → Break/VIP → Checked Out |
| Dancer preferences ignored | **Per-Dancer Preferences:** Genre boundaries, "do not play" list, tempo range, explicit/no-explicit |
| Manual set management | **One-Tap "Start Set":** System handles intro, set length, end cue |
| Disputes about fairness | **Fairness + Dispute Reduction:** Logs of rotations, timestamps, manager overrides |

### E) Music library: explicit filtering, repeats, "wrong vibe"
| Pain Point | Our Solution |
|------------|--------------|
| Explicit control varies by night/city | **Policy Profiles:** "Explicit allowed tonight" / "Clean only" / "No certain words/artists" |
| Repeats kill the room | **Anti-Repeat Engine:** Track + artist + vibe + BPM band + chorus similarity |
| No learning from "this works here" | **Local Taste Tuning:** Manager labels "works here" / "never again" — system learns fast |
| No data on what drives sales | **Heatmap Analytics:** What correlates with VIP sales / longer stays (pattern-based, not causal) |

### F) Reliability: Wi-Fi issues, updates, crashes
| Pain Point | Our Solution |
|------------|--------------|
| System goes down = revenue loss | **True Offline Mode:** Cached playlists, edits, deterministic playback — no network required |
| Dead air during failover | **Failover Audio:** Stream fails → instant switch to local "safe set" |
| Updates during business hours | **Venue-Grade Update Policy:** "No updates during business hours" + one-click rollback |
| No warning before failure | **Health Dashboard:** Audio device status, CPU, network, "risk of dropout" warnings |

### G) Staff control and permissions
| Pain Point | Our Solution |
|------------|--------------|
| Too locked down or too open | **Role-Based Permissions:** Manager, House Mom, Dancer, Bartender/Door — each with scoped access |
| No accountability | **Audit Logs:** Who skipped what and when — dispute resolution built-in |

### H) Integration gaps (POS, VIP rooms, lighting, signage)
| Pain Point | Our Solution |
|------------|--------------|
| DJ system is isolated island | **POS/VIP Hooks:** "VIP sold" trigger → audio sting + optional signage update |
| One-size-fits-all audio | **Multi-Zone Audio:** Main room vs VIP hallway vs patio, each with independent policies |
| Lighting manual | **Lighting Integration (optional):** Simple DMX scenes tied to "modes," not full show control |

### I) Reporting is too generic
| Pain Point | Our Solution |
|------------|--------------|
| "It plays music" isn't enough | **Shift Recap:** Peak times, slow patches, top-performing sets, announcement performance |
| No operational visibility | **Rotation Metrics:** Average set length, gaps between dancers, stage utilization rate |
| Problems caught too late | **Operational Alerts:** "Stage idle 9 min", "Too many skips", "Energy too low during peak" |

---

## 4. Architecture Overview

### A) Playback Engine (VirtualDJ Plugin / Standalone)
- Beat-matched mixing, cueing, transitions
- Scenario mode execution
- Energy slider response
- Hard guarantees (no vocals first 20s, etc.)
- Instant stingers with ducking
- Offline-first deterministic playback

**Key principle:** Reliable first, clever second. No experimental AI in the signal path.

### B) Manager Console (Web App)
- Rotation board management
- Policy profiles
- Announcement scheduling + approvals
- Staff accounts + permissions
- Reporting + logs

**Key principle:** Designed for managers, not DJs. Clear control, auditability, low training.

### C) Dancer UX (Mobile / Kiosk)
- Check in/out
- Set preferences
- Request tracks (approved pool only)
- "You're up next" + countdown
- Transparent rotation history (dispute reduction)

### D) Backend Services
| Service | Responsibility |
|---------|---------------|
| Auth & RBAC | Users, roles, permissions, 2FA |
| Venue/Zone Service | Locations, zones, device assignments |
| Rotation Service | Dancer state machine, ordering, fairness metrics |
| Music Catalog Service | Tracks, tags, explicit flags, "stage-safe score", pools |
| Policy Engine | Evaluate track allowance in context |
| Announcement Service | Library, scheduler, "safe insertion" decisions |
| Playback Coordination API | Sends "desired state" to Player |
| Telemetry / Logging | Player heartbeats, errors, event stream |
| Analytics Pipeline | Aggregates shift reports |

---

## 5. Go-to-Market

### Primary Channels
1. **RCI Relationships** — Eric's existing network (needs rehab before August)
2. **ED Expo Booth** — Las Vegas, August 2026. Three demo moments:
   - Financial hook: "This costs $2K/mo vs. $6K/mo for a DJ"
   - AI DJ personality: Show energy slider + scenario modes live
   - Reliability signal: Pull the network cable, show failover

### Pricing
- **$2,000/month per venue** — flat rate, all stages and DJs included
- No per-DJ upsell, no per-stage upsell
- Annual contract with quarterly reviews

---

## 6. Status & Next Steps

| Item | Status |
|------|--------|
| Product brief (this doc) | ✅ Draft complete |
| Manager pain points research | ✅ Documented |
| Interface specification | ✅ Draft complete |
| Investor pitch | ❌ Not started |
| 90-day plan | ❌ Not started |
| Micah scope alignment | ❌ Pending |
| RCI relationship rehab | ❌ Eric's action |
| ED Expo demo prep | ❌ August deadline |

**Immediate Actions:**
1. Eric: Review this brief, confirm accuracy
2. Eric: Send Micah `august-demo-scope.md` + this brief — align on scope
3. Eric: Begin RCI relationship rehab (low-key message, plant seed)
4. PriScylla: Draft investor pitch once Eric confirms brief

---

*Built by Wicked Liquid Productions. For strip clubs, by strip club people.*
