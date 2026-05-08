# Trello Setup Guide — BoothMind Task Board

**For:** Eric (Founder) + Micah (Dev/Partner)  
**Tool:** Trello (free tier works fine)  
**Last Updated:** 2026-05-08

---

## Step 1: Create Your Trello Account

1. Go to **https://trello.com**
2. Click **"Sign Up — It's Free"**
3. Sign up with your **Google account** (ericmills71@gmail.com) — fastest option
4. Verify your email if prompted

---

## Step 2: Create the Board

1. Click **"Create"** (top-right, blue button)
2. Select **"Create board"**
3. Name it: **BoothMind — Dev Board**
4. Set visibility: **Private** (you'll invite Micah)
5. Click **"Create board"**

---

## Step 3: Create the Columns

Click **"Add a list"** and create these 6 columns in order:

1. **Backlog**
2. **This Week**
3. **In Progress**
4. **Ready for Review**
5. **Done**
6. **Blocked**

---

## Step 4: Invite Micah

1. Click **"Share"** (top-right of board)
2. Enter Micah's **email address**
3. Set his role to **Member** (can edit cards, move them, comment)
4. Click **"Send invitation"**

Micah will get an email invite. He clicks it, creates a free Trello account, and he's in.

---

## Step 5: Add the Starter Cards

Copy the 15 cards from the **Task Board Template** doc (already in Mission Control at `/wlp-task-board`).

For each card:

1. Click **"Add a card"** in the **Backlog** column
2. Paste the card title (e.g., "Shift Initialization Flow v1")
3. Click the card to open it
4. Paste the full card template into the **Description** field
5. Add a **label** if you want (optional — see label suggestions below)
6. Close the card

**Pro tip:** You can copy/paste the entire card template from the Task Board Template doc. Trello handles markdown formatting.

---

## Step 6: Move First 3 Cards to "This Week"

Drag these cards from **Backlog** to **This Week**:

1. **Shift Initialization Flow v1** (#1)
2. **Core Rotation Engine v1** (#2)
3. **Live Dashboard "Now Playing" View** (#4)

These give you:
- A way to begin a shift
- Core automation behavior
- Visibility during use

That's a **coherent vertical slice**.

---

## Step 7: Set Up Labels (Optional but Helpful)

Click **"Show menu"** → **"More"** → **"Labels"** → **"Create a new label"**

Create these:

| Label | Color |
|-------|-------|
| Core MVP | Green |
| Bug | Red |
| UI | Blue |
| Logic | Purple |
| Admin/Ops | Orange |
| Nice to Have | Gray |
| Urgent | Yellow |

Apply labels to cards by clicking the card → **Labels** → select the color.

---

## Step 8: Weekly Rhythm

| Day | Action |
|-----|--------|
| **Monday** | You + Micah: Move 2–3 cards into "This Week". Confirm outcome, done criteria, out of scope. |
| **Tue/Wed** | Micah: Moves cards to "In Progress". Sends async update via text/Slack. |
| **Thursday** | You: Check "In Progress". Ask: Is Friday demo on track? |
| **Friday** | Micah: Moves completed cards to "Ready for Review". You test/demo. Move to "Done" or comment with feedback. |

---

## Card Movement Rules

| From | To | When |
|------|-----|------|
| This Week | In Progress | Micah starts working on it |
| In Progress | Ready for Review | Micah thinks it's done — time for Eric to test |
| Ready for Review | Done | Eric tested it, it works, accepted |
| Ready for Review | In Progress | Eric found issues, send back with comments |
| Any | Blocked | Something is stopping progress — must state blocker clearly |
| Blocked | In Progress | Blocker resolved |

---

## Pro Tips

### Use Checklists for "Definition of Done"

Inside each card, click **"Checklist"** → add your done items. Micah checks them off as he completes them. You see progress at a glance.

### Use Comments for Feedback

When a card hits Ready for Review, don't just move it back if it's wrong. **Comment** with specific feedback. Micah replies when fixed.

### Use Due Dates

Set a **due date** on each "This Week" card for Friday. Creates urgency without nagging.

### Don't Let "Blocked" Cards Sit

A blocked card without a clear blocker statement is useless. Must say:

- "Waiting on Eric decision: can manual override insert immediately or only as next-up?"
- "Bug in queue logic — skip button crashes when queue is empty"
- "Need test data from Eric"

**Bad blocker:** "working through some stuff"

---

## Mobile App

Download the **Trello app** (iOS/Android) for quick checks on the go. Same login, same boards.

---

## Free Tier Limits

Trello free tier gives you:
- Unlimited cards
- Unlimited lists
- Up to 10 boards
- 1 Power-Up per board
- File attachments up to 10MB

**More than enough for a 2-person team.**

---

## Next Steps

1. Create board (5 min)
2. Add columns (2 min)
3. Invite Micah (1 min)
4. Add 15 starter cards (20 min)
5. Move 3 to "This Week" (1 min)
6. Send Micah the link + tell him Friday demo is the goal

**Total setup time: ~30 minutes**

---

*Built for BoothMind. For strip clubs, by strip club people.*
