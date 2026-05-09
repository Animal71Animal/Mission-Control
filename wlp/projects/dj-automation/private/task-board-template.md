# Task Board Template — BoothMind

**For:** Eric (Founder) + Micah (Dev/Partner)  
**Tool:** Trello or Notion (start simple)  
**Last Updated:** 2026-05-08

---

## Board Columns

Create these columns exactly:

| Column | Purpose |
|--------|---------|
| **Backlog** | Ideas, future work, bugs, improvements — not currently committed |
| **This Week** | Only tasks you both agree matter this week. Max 1–3 major tasks. |
| **In Progress** | Actively being worked on right now |
| **Ready for Review** | Built enough for you to review/test/approve |
| **Done** | Accepted and complete |
| **Blocked** | Cannot move without a decision, dependency, bug fix, or missing info |

---

## Card Template

Copy/paste this into every card:

```
Task:
Owner:
Target date:

Why it matters:
[Why this is important to the business or user]

Outcome:
[What user/business result this creates]

Definition of done:
- [ ]
- [ ]
- [ ]
- [ ]

Out of scope:
- [ ]
- [ ]
- [ ]

Current blocker:
[None / describe blocker]

Notes:
[Any short technical or product notes]
```

---

## Starter Backlog — 15 Core Tasks

Copy these into your **Backlog** column. Move 2–3 into **This Week** to start.

---

### 1. Shift Initialization Flow

```
Task: Shift Initialization Flow v1
Owner: Micah
Target date:

Why it matters:
The system needs a fast, repeatable way to begin a live shift without confusion.

Outcome:
Manager can start a "Live Session" in under 60 seconds.

Definition of done:
- [ ] Create shift button works
- [ ] Date/time recorded automatically
- [ ] System enters "Live" mode
- [ ] Required inputs are minimal and clear
- [ ] Start flow works end-to-end without manual backend intervention

Out of scope:
- [ ] Scheduling future shifts
- [ ] Recurring shifts
- [ ] Advanced scheduling
- [ ] Historical reporting

Current blocker:
Need clarity on what minimum inputs are required at shift start.

Notes:
Optimize for speed and simplicity.
```

---

### 2. Core Rotation Engine v1

```
Task: Core Rotation Engine v1
Owner: Micah
Target date:

Why it matters:
Managers need the software to handle song/performance rotation automatically instead of tracking it manually.

Outcome:
Songs/performers rotate automatically without manual intervention.

Definition of done:
- [ ] Next item triggers when current ends
- [ ] Queue advances correctly
- [ ] State persists on refresh
- [ ] Current and next item display updates correctly
- [ ] Basic error handling prevents queue from breaking

Out of scope:
- [ ] Complex "weighted" AI logic
- [ ] VIP priority rules
- [ ] Analytics
- [ ] AI recommendations
- [ ] Mobile optimization

Current blocker:
Need decision on how manual override should affect next-up order.

Notes:
Keep logic simple and reliable for first version.
```

---

### 3. Manual "Skip/Next" Override

```
Task: Manual Override Controls v1
Owner: Micah
Target date:

Why it matters:
Live operations need human control when automation needs adjustment.

Outcome:
DJ can manually push the rotation forward without breaking the shift flow.

Definition of done:
- [ ] "Skip" button immediately ends current and starts next
- [ ] Queue remains synced after override
- [ ] Override updates display immediately
- [ ] Override does not crash queue logic
- [ ] Basic confirmation appears for high-impact actions

Out of scope:
- [ ] "Undo" skip
- [ ] Re-ordering the entire 2-hour queue
- [ ] Detailed permission layers
- [ ] Advanced override audit logs
- [ ] Voice controls

Current blocker:
Need founder decision on which actions require confirmation.

Notes:
Focus on reliability over advanced flexibility.
```

---

### 4. Live Dashboard "Now Playing" View

```
Task: Live Dashboard Visibility Improvements
Owner: Micah
Target date:

Why it matters:
Operators need to understand system status at a glance during a live shift.

Outcome:
Anyone looking at the screen knows exactly who is on stage and who is next.

Definition of done:
- [ ] High-visibility text for "Current" and "Up Next"
- [ ] Status indicators (Active/Paused)
- [ ] Active shift status is obvious
- [ ] Key controls are easy to access
- [ ] Layout works cleanly on standard desktop screen

Out of scope:
- [ ] Custom themes
- [ ] Mobile-responsive layout
- [ ] Full design polish
- [ ] Deep analytics widgets
- [ ] Theme customization

Current blocker:
None

Notes:
Prioritize clarity and speed over aesthetics.
```

---

### 5. Performer Entry/Check-in

```
Task: Performer Entry/Check-in v1
Owner: Micah
Target date:

Why it matters:
Manager needs to build the rotation roster for each shift.

Outcome:
Manager can add/remove dancers from the active rotation for the night.

Definition of done:
- [ ] Add performer to list
- [ ] Remove performer
- [ ] Toggle "Active/Inactive" status
- [ ] Stage name displays correctly
- [ ] List persists for the shift

Out of scope:
- [ ] Detailed performer profiles
- [ ] Photo uploads
- [ ] Nicknames, real-name tracking
- [ ] Permanent performer database

Current blocker:
None

Notes:
Keep it lightweight — this is for one shift at a time.
```

---

### 6. Emergency "Pause" Function

```
Task: Emergency Pause Function v1
Owner: Micah
Target date:

Why it matters:
Live operations sometimes need to stop immediately for announcements or issues.

Outcome:
Stop all automation immediately, resume exactly where it left off.

Definition of done:
- [ ] Global pause button works
- [ ] "Resume" picks up exactly where it left off
- [ ] Visual indicator shows paused state
- [ ] Cannot accidentally resume

Out of scope:
- [ ] Fading audio out
- [ ] Automated "Intermission" music
- [ ] Scheduled pauses

Current blocker:
None

Notes:
This is a safety feature — make it obvious and reliable.
```

---

### 7. Basic Authentication & Session Security

```
Task: Basic Authentication & Session Security v1
Owner: Micah
Target date:

Why it matters:
Only authorized staff should access the dashboard. Session dying mid-shift is unacceptable.

Outcome:
Login works, session doesn't expire mid-shift, "Protected Content" gate is solid.

Definition of done:
- [ ] Login page works
- [ ] Session persists through shift duration
- [ ] "Protected Content" gate blocks unauthorized access
- [ ] Logout works
- [ ] Basic session timeout handling

Out of scope:
- [ ] Multi-level permissions (Admin vs. DJ)
- [ ] Password reset flow
- [ ] 2FA
- [ ] Role-based access control

Current blocker:
None

Notes:
Reliability > features for auth. A session dying mid-shift is a failure.
```

---

### 8. VIP/Priority Request Insertion

```
Task: VIP/Priority Request Insertion v1
Owner: Micah
Target date:

Why it matters:
High-priority requests need to slot in without breaking the rotation.

Outcome:
Insert a high-priority item into the "Next" slot without breaking the rotation.

Definition of done:
- [ ] "Insert Next" button works
- [ ] Item plays after current
- [ ] Rotation resumes normal order after
- [ ] Visual indicator shows inserted item

Out of scope:
- [ ] Bidding/Payment integration for requests
- [ ] VIP override rules
- [ ] Request queue management

Current blocker:
Need decision: can manual override insert immediately or only as next-up?

Notes:
Simple insertion only — no complex priority logic yet.
```

---

### 9. House Rules Configuration

```
Task: House Rules Configuration v1
Owner: Micah
Target date:

Why it matters:
Each club has different set lengths, break policies, etc.

Outcome:
Manager can set the "Standard" set length (e.g., 2 songs or 6 minutes).

Definition of done:
- [ ] Settings page exists
- [ ] Set length configurable
- [ ] Logic respects these settings
- [ ] Settings persist between shifts

Out of scope:
- [ ] Different rules for different performers
- [ ] Per-day rules
- [ ] Advanced scheduling rules

Current blocker:
None

Notes:
Start with one global setting. Per-performer rules come later.
```

---

### 10. Shift Log / History

```
Task: Shift Log / History v1
Owner: Micah
Target date:

Why it matters:
Clubs need records for payroll, disputes, and compliance.

Outcome:
See what happened during the night — who performed and when.

Definition of done:
- [ ] Simple list of performances with timestamps
- [ ] Exportable to CSV/Text
- [ ] Log persists after shift ends
- [ ] Basic search/filter

Out of scope:
- [ ] Advanced analytics
- [ ] Charts or graphs
- [ ] Automated email reports
- [ ] Integration with payroll systems

Current blocker:
None

Notes:
Keep it simple — a clean table with timestamps is enough for v1.
```

---

### 11. System Heartbeat / Reliability Check

```
Task: System Heartbeat / Reliability v1
Owner: Micah
Target date:

Why it matters:
Clubs have spotty WiFi. The system can't die because the internet flickers.

Outcome:
Software doesn't "die" if the internet flickers for 10 seconds.

Definition of done:
- [ ] Local state caching works
- [ ] Auto-reconnect logic
- [ ] Visual "Online/Offline" indicator
- [ ] Graceful degradation (reduced features, not crash)

Out of scope:
- [ ] Full offline-mode functionality
- [ ] Offline music playback
- [ ] Sync conflict resolution

Current blocker:
None

Notes:
This is about surviving hiccups, not full offline operation.
```

---

### 12. Dancer "Stage Name" Display Logic

```
Task: Stage Name Display Logic v1
Owner: Micah
Target date:

Why it matters:
Public-facing displays must use stage names, not real names.

Outcome:
UI uses correct stage names for all public-facing displays.

Definition of done:
- [ ] Input field for Stage Name
- [ ] Display logic pulls from Stage Name field only
- [ ] Stage Name used in dashboard, logs, and any public view
- [ ] Real name never exposed in UI

Out of scope:
- [ ] Nicknames
- [ ] Real-name tracking
- [ ] Performer profile photos

Current blocker:
None

Notes:
Privacy and professionalism — stage names only in the UI.
```

---

### 13. Audio/Trigger Integration v1

```
Task: Audio/Trigger Integration v1
Owner: Micah
Target date:

Why it matters:
The software needs to actually trigger music or announcements, not just track state.

Outcome:
Software triggers music or "Next Up" announcement at the right time.

Definition of done:
- [ ] Basic audio trigger works
- [ ] API call to music player on track end
- [ ] Trigger timing is reliable
- [ ] Fallback if trigger fails

Out of scope:
- [ ] Full Spotify/Serato integration
- [ ] Crossfading
- [ ] Multi-zone audio
- [ ] Advanced audio routing

Current blocker:
Need to confirm which audio player/API the club uses.

Notes:
Start with a simple trigger. Full integration comes later.
```

---

### 14. Dashboard "Quick Actions" Sidebar

```
Task: Quick Actions Sidebar v1
Owner: Micah
Target date:

Why it matters:
Managers need common tasks accessible in 1 click during a live shift.

Outcome:
Common tasks (Add Dancer, Skip, Pause) are accessible in 1 click.

Definition of done:
- [ ] Sidebar or Floating Action Button exists
- [ ] Top 3 most used tools accessible
- [ ] Works during live shift without scrolling
- [ ] Visual hierarchy is clear

Out of scope:
- [ ] Customizable shortcuts
- [ ] User-configurable layout
- [ ] Mobile-optimized sidebar

Current blocker:
None

Notes:
Speed matters — this is for live use, not setup.
```

---

### 15. End-of-Shift Summary

```
Task: End-of-Shift Summary v1
Owner: Micah
Target date:

Why it matters:
Clean closeout prevents data leaks and prepares for the next shift.

Outcome:
Close out the night and clear the queue for tomorrow.

Definition of done:
- [ ] "End Shift" button works
- [ ] Clears active queue
- [ ] Saves final log
- [ ] Redirects to login or dashboard
- [ ] Confirms save before exit

Out of scope:
- [ ] Automated email reports to owner
- [ ] Shift comparison analytics
- [ ] Revenue integration

Current blocker:
None

Notes:
Clean, simple, reliable — no data loss on closeout.
```

---

## How to Use This Today

1. **Pick 3 cards** from the list above (recommend #1, #2, #4)
2. **Move them to "This Week"**
3. **Ask Micah:** "Can we have these 3 outcomes demo-able by Friday?"
   - If yes: Great.
   - If no: Ask "Which one is the biggest hurdle?" and split that card into two smaller ones.

---

## Rules That Save Pain

| Rule | Why |
|------|-----|
| **One card = one outcome** | Don't mix queue engine + reporting + dashboard cleanup into one task |
| **No card without "out of scope"** | Prevents feature creep |
| **No card stays "In Progress" forever** | If it's been there too long: split it, simplify it, redefine done, or move to blocked |
| **Demo over explanation** | If he says it's done, it should be demoable or testable |
| **Keep "This Week" brutally small** | For a 2-person team, overcommitting kills momentum |

---

## Pro-Tip: Ready for Review

When Micah moves a card to **Ready for Review**:

1. **You must click it/test it** before it moves to Done
2. If it doesn't work, it stays in Ready for Review with a comment on what failed
3. Ask:
   - Can you show me this working live?
   - Does it match the defined outcome?
   - Are all "done" items actually complete?
   - What's still rough but acceptable?
   - Is anything missing that belongs in a separate follow-up card?

**Important:** If new ideas come up during review, don't stuff them into the same card unless tiny. Create a new backlog card instead.

---

## Recommended Labels

If your board tool supports labels, keep them simple:

- `Core MVP`
- `Bug`
- `UI`
- `Logic`
- `Admin/Ops`
- `Nice to Have`
- `Urgent`

---

*Built for BoothMind. For strip clubs, by strip club people.*
