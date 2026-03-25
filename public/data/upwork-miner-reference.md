# Upwork Opportunity Mining — Reference

**Source:** OpenClaw Playlist Report Video #31  
**Status:** Not yet implemented — filed for future

---

## What It Is

Using OpenClaw sub-agents to scan Upwork for RPA/automation jobs, build demos, and submit proposals at scale.

From Video #31 — Nick (founder of Orgo) demonstrated this as a monetization strategy.

---

## The Workflow

### Step 1: Opportunity Scanning

Sub-agent monitors Upwork for specific job types:
- RPA (Robotic Process Automation)
- AI automation
- Workflow optimization
- Data scraping/pipeline jobs

**Filters:**
- Budget range ($500-$20K)
- Client history (payment verified)
- Job description keywords
- Competition level (proposals < 20)

### Step 2: Demo Building

For matching jobs, agent:
1. Reads job requirements
2. Builds working demo/prototype
3. Records demo video or creates screenshots
4. Drafts custom proposal referencing the demo

### Step 3: Proposal Submission

Agent submits proposals with:
- Personalized intro (referencing client's specific problem)
- Demo link/screenshots
- Clear scope and timeline
- Competitive but fair pricing

---

## Why This Works

**The Arbitrage:**
- Most Upwork proposals are generic copy-paste
- A working demo immediately differentiates
- AI can build demos faster than humans
- Volume + quality = consistent wins

**From Video #31:**
> "Having working demos built by your own OpenClaw to submit as proposals is genuinely clever arbitrage."

---

## Technical Implementation

### Required Components

1. **Upwork RSS/API access** — Monitor new jobs
2. **Job filter skill** — Score/rank opportunities
3. **Demo builder sub-agent** — Create working prototypes
4. **Proposal writer** — Draft personalized proposals
5. **Submission automation** — (Manual approval recommended)

### Example Job Types to Target

| Category | Example Jobs | Demo Approach |
|----------|--------------|---------------|
| Data Pipeline | "Extract data from 5 websites daily" | Build scraper prototype |
| Report Automation | "Weekly sales reports from CSV" | Create sample report |
| Integration | "Connect Shopify to QuickBooks" | Show workflow diagram |
| AI Chatbot | "Customer service bot for website" | Deploy working demo |
| Workflow | "Automate invoice processing" | Build proof-of-concept |

---

## WLP Application

**Potential Services to Offer:**

1. **DJ Automation Setup** — Configure CoverJock/StripperVille for clubs
2. **AI Content Systems** — TikTok automation, social media pipelines
3. **Music Production Workflows** — Ableton template setups, sample organization
4. **Business Automation** — Mission Control style dashboards

**Advantage:** WLP already has working systems to demo.

---

## Implementation Priority

**Priority:** Low-Medium

**Do this when:**
- Looking for additional revenue streams
- Have working demos ready to showcase
- Want to test market demand for WLP services

**Don't do this when:**
- Current projects need full attention
- No bandwidth for client work

---

## Future Skill: `upwork-miner`

When implemented:

```yaml
name: upwork-miner
description: Automated Upwork opportunity scanning and proposal generation. Use when seeking RPA/automation contract work or testing market demand for AI services.
```

**Scripts:**
- `scripts/scan-upwork.sh` — Monitor new job postings
- `scripts/score-opportunity.sh` — Rank jobs by fit/profitability
- `scripts/build-demo.sh` — Create working prototype
- `scripts/draft-proposal.sh` — Generate personalized proposal
- `scripts/submit-proposal.sh` — Submit (with approval)

---

## Related Concepts

- Video #31: Computer use agents, Orgo platform
- Video #43: Setup-as-a-service monetization ($2K setup + $500-1K/month retainer)
- Video #09: AI-native business vs. AI automation agency distinction

---

*Filed for future reference: 2026-03-24*
