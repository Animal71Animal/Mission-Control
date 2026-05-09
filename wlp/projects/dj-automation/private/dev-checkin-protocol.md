# Dev Check-In Protocol — BoothMind

**For:** Eric (Founder) + Micah (Dev/Partner)  
**Product:** BoothMind — Automated DJ System for Gentlemen's Clubs  
**Team Size:** 2  
**Last Updated:** 2026-05-08

---

## The Point

These check-ins are not about "are you working?" They're about:

- Are we building the right thing?
- Is anything blocked?
- Can we demo progress?

If none of those are at risk, stay hands-off.

---

## Daily — Async Update (5 min, text/Slack)

**Format:**

```
Yesterday: [what changed]
Today: [what's being built]
Blocked: [anything slowing you down]
Decision needed: [anything I need to answer]
```

**Example:**

```
Yesterday: finished queue advance logic, skip button works
Today: wiring dashboard controls to queue engine
Blocked: unclear rule for VIP override priority
Decision needed: should VIP requests override rotation or only insert next?
```

**Rule:** If nothing is blocked and progress is steady, don't dig. Early detection only.

---

## Twice Weekly — Build Review (20–30 min)

### Tuesday: Alignment / Risk Check

Ask:

- What is the top priority this week?
- What will be testable by Friday?
- What technical unknowns could blow up timing?
- What decisions are waiting on me?
- Are we building MVP functionality or "nice to have"?

### Friday: Demo / Acceptance

This is a **live demo**, not a status report.

Ask:

- Show me exactly what changed this week
- What can I test myself right now?
- What is still rough, fake, or incomplete?
- What did you learn from building it?
- What should be next week's priority?

**Rule:** "Show me" beats "tell me." If it can't be demoed, it's not done.

---

## Weekly — Planning Session (45–60 min)

**Not about code details. About product direction.**

Cover:

- What shipped / completed this week
- What didn't get done and why
- Upcoming priorities (max 3)
- Bigger blockers (tools, dependencies, unclear specs)
- Any process improvements
- Sanity-check timelines

**Key question every week:**

> "What gets us closer to a club being able to actually rely on this in a live environment?"

---

## What You Should NOT Do

| Don't | Why |
|-------|-----|
| "How's it going?" | Useless answer, no signal |
| "You still working on that?" | Assumes inspection, not partnership |
| "When will it be done?" | Better: "What exactly is left?" |
| Focus on hours worked | Focus on output and progress |
| Interrupt during deep work | Dev work needs long focus blocks |
| Accept "almost done" for weeks | Break it down or redefine done |
| Ask vague stuff like "how's it going?" | You'll get useless answers |
| Constantly interrupt during deep work | Dev work needs long focus blocks |

---

## What You SHOULD Push On

| If something feels off, ask | Example |
|-----------------------------|---------|
| **Specificity** | "What exactly is left to finish this task?" |
| **Time realism** | "You said 2 days — what could make it take longer?" |
| **Clarity of outcome** | "What does 'done' look like for this?" |
| **Blockers early** | "What's even slightly slowing you down right now?" |
| **Scope creep** | "What are we intentionally leaving out?" |
| **Real-world test** | "Would an actual club operator trust this for a live shift?" |

---

## The "Vertical Slice" Rule

**Bad request:**

> "Build backend for queue engine"  
> "Clean up auth state"  
> "Improve API layer"

**Good request:**

> "Give me a usable first version of the dancer rotation workflow"  
> "Give me a working shift-start to first-song flow"  
> "Give me a basic manager dashboard where I can test queue overrides"

A **vertical slice** = something you can actually interact with end-to-end.

That matters because weeks of "foundation" work can feel productive without proving business value.

---

## The Relational Piece

Because this is a **partner relationship**, normal employee-management language creates tension.

**Instead of:**
- "I need more updates"
- "You need to move faster"
- "I'm checking up on you"

**Frame it like:**
- "I want us to have tighter visibility so we stay aligned"
- "I want clearer weekly outcomes so we both know what success looks like"
- "I want to separate idea talk from actual build priorities"
- "I don't want to micromanage; I want a rhythm that keeps us honest"

That framing matters a lot.

---

## Good Update vs. Weak Update

**Good:**

> "I completed the basic automated rotation engine for normal shifts. It handles standard queue order and manual skip. It does not yet handle VIP priority or emergency overrides. You can now log in, create a shift, and simulate a rotation from the dashboard. I need a decision from you on whether requests can interrupt current sequencing or only affect next-up order."

**Weak:**

> "I worked on the backend and cleaned up the system architecture."

---

## Warning Signs — And What To Do

| Warning Sign | What It Usually Means | Your Response |
|--------------|----------------------|---------------|
| Same feature "almost done" for weeks | Scope fuzzy, quality bar undefined, edge cases eating time | Break into smaller pieces, define done tighter, ask what can ship before perfection |
| Weeks pass without anything demoable | Too much invisible work, tasks too broad | Ask for thinner vertical slices, require demoable progress weekly |
| Constant switching between areas | Momentum dies, product stays half-built | Cap weekly priorities to 1 main objective, maybe 2 max |
| Building cleverness before utility | AI/features that don't help run a shift | Ask: "Does this help someone run a real shift better this month?" |

### 1. "Almost Done" for Multiple Weeks

If the same feature is "almost done" repeatedly, that usually means:
- Scope is fuzzy
- Quality bar is undefined
- Edge cases are eating time
- Tasks are not broken down enough

**Your response:**
- Break the feature into smaller reviewable pieces
- Define done more tightly
- Ask what can ship before perfection

### 2. Too Much Invisible Work

Some invisible work is real and necessary. But if weeks pass without anything you can see/test, it's dangerous.

**Your response:**
- Ask for thinner vertical slices
- Require demoable progress weekly
- Ask what user-facing result the work enables

### 3. Constant Switching

If he keeps bouncing between auth, UI, backend, AI, infra, analytics:
- Momentum dies
- Quality drops
- Product stays half-built

**Your response:**
- Cap weekly priorities to 1 main build objective, maybe 2 max

### 4. Building Cleverness Before Utility

This is especially likely in AI software.

**Your response:**
- Ask: "Does this help someone run a real shift better this month?"
- If not, probably not now.

---

## The Conversation Starter

Say this to Micah:

> "I want us to tighten our build rhythm so we stay aligned without me hovering. I'm thinking: short async daily updates, two quick weekly check-ins, and a Friday demo. I want every task tied to a real workflow, with a clear definition of done and what's out of scope. My goal isn't to micromanage you — it's to make sure we're always clear on priority, blockers, and what's actually shippable."

That keeps it collaborative, not managerial.

---

## What Your Check-Ins Should Be About Specifically for This Product

Because this is automated DJ software, your check-ins should revolve around **operational workflows**.

You should frame everything around questions like:

- Can a club actually run a shift using this?
- What happens when something unusual happens?
- Where can the workflow break in real use?
- What still requires human workarounds?
- Which features are mission-critical vs cosmetic?

### The Main Product Buckets You Should Track

| Bucket | Why It Matters |
|--------|---------------|
| Authentication / Roles | Who can do what — critical for liability |
| Dashboard / Operations UI | What the manager sees and clicks during a live shift |
| Queue / Playlist / Rotation Logic | The core automation — this is the product |
| Scheduling | When things happen, not just what |
| Performer / Dancer Management | Check-in, preferences, rotation order |
| Requests / Priority Rules | VIP, house mom overrides, emergency stops |
| Reporting / Logs | What happened, for disputes and payroll |
| Settings / Business Rules | Per-venue configuration |
| Reliability / Fail-safes | What happens when something goes wrong |
| Integrations / AI Features | Voice, lighting, POS — later |

Every week, you want visibility into which bucket he is working in and why that bucket matters now.

---

## Task Board Requirement

Every task must answer three things:

1. **Outcome** — what business/user result does this create?
2. **Definition of done** — what must be true for it to count as complete?
3. **Out of scope** — what are we explicitly not doing?

**Example:**

| Field | Content |
|-------|---------|
| Task | Automated queue engine v1 |
| Outcome | Shift manager can run automatic song rotation without manual tracking |
| Done | Queue advances correctly, skip works, current/next display updates, session persists |
| Out of scope | VIP rules, analytics, AI suggestions, mobile optimization |

---

## Suggested Weekly Structure

| Day | Activity | Duration |
|-----|----------|----------|
| Monday | Priorities meeting — choose top 1–3, define "done" | 30 min |
| Tue/Wed | Async update — what changed, what's next, blockers | 5 min text |
| Thursday | Risk check — is Friday demo on track? | 15–20 min |
| Friday | Demo + retrospective — show working changes, decide next week | 30–45 min |

### Monday: Priorities Meeting

**You:**
- Choose top 1–3 priorities max
- Clarify business purpose
- Define what can realistically be demoed by Friday

**Him:**
- Estimates
- Flags risk
- Pushes back on over-scope
- Confirms what "done" means

### Tuesday/Wednesday: Async Update

He sends:
- What changed
- What's next
- Blockers
- Decisions needed

### Thursday: Risk Check

Ask:
- Is Friday demo still on track?
- What is slipping?
- Do we need to reduce scope?
- Is there anything I need to decide today?

### Friday: Demo + Retrospective

**He shows:**
- Working product changes
- Incomplete edges
- Known bugs
- Next recommended priority

**You decide:**
- Accept
- Revise
- Defer
- Simplify

---

## What You Should Ask Every Week

### Product Clarity
- What exact workflow are we making better this week?
- If we shipped only this piece, who could use it and for what?

### Scope Control
- What did we intentionally leave out?
- What tempted you to overbuild this?

### Delivery Confidence
- What part is done?
- What part only looks done?
- What part is riskier than it appears?

### Usability
- If I sat down cold and used this, where would I get confused?
- What still needs manual work outside the software?

### Real-World Validation
- Would an actual club operator trust this yet for a live shift?
- If not, what's missing most?

That last question is gold.

---

## Priority Lens for This Product

Every week, ask:

> "What gets us closer to a club being able to actually rely on this in a live environment?"

That usually means prioritizing:

- Reliability
- Speed of common actions
- Clear operator UI
- Override controls
- Logs/history
- Simple rule configuration
- Predictable behavior

**Before** sophisticated AI bells and whistles.

---

*Built for BoothMind. For strip clubs, by strip club people.*
