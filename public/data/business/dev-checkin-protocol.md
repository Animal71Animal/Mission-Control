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

---

## The Conversation Starter

Say this to Micah:

> "I want us to tighten our build rhythm so we stay aligned without me hovering. I'm thinking: short async daily updates, two quick weekly check-ins, and a Friday demo. I want every task tied to a real workflow, with a clear definition of done and what's out of scope. My goal isn't to micromanage you — it's to make sure we're always clear on priority, blockers, and what's actually shippable."

That keeps it collaborative, not managerial.

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
