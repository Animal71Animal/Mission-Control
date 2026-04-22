# Uber Earnings Scraper

Playwright-powered scraper for Uber driver dashboard → Mission Control Uber Profit tab.

**Location:** `/home/ubuntu/wlp/scripts/uber-scraper/`  
**Output:** `/home/ubuntu/wlp/projects/mission-control/public/data/uber-earnings.json`  
**Schedule:** Every Sunday 11 PM MDT (auto-commit + push to GitHub)

---

## First-Time Setup

### 1. Authenticate (one-time, interactive)

This step requires a display OR running from Eric's Mac where you can see the browser.

```bash
cd /home/ubuntu/wlp/scripts/uber-scraper
node uber-scraper.js --login
```

Walk through the Uber login:
- Enter email/phone when prompted
- Enter OTP from SMS/email when prompted
- Session saved to `auth-state.json` — all future runs are fully headless

### 2. Test headless run

```bash
node uber-scraper.js --dry-run
```

Output shows extracted JSON without writing to disk.

### 3. Install cron

```bash
bash install-cron.sh
```

Installs: `Every Monday 05:00 UTC` (= Sunday 11 PM MDT)

---

## Running Manually

```bash
# Normal run (extract + save + git push)
node uber-scraper.js

# Pull last 4 weeks
node uber-scraper.js --weeks 4

# Dry run (no write, no push)
node uber-scraper.js --dry-run

# Force fresh login (clears saved session)
node uber-scraper.js --login
```

---

## Output Format

```json
{
  "weekly_summaries": [
    {
      "period_start": "2026-04-14",
      "period_end":   "2026-04-20",
      "total_earnings": 86.18,
      "total_trips": 5,
      "breakdown": {
        "base_fare":  69.44,
        "surge":       3.75,
        "tips":        9.00,
        "promotions":  4.22,
        "expenses":   -0.23
      },
      "net_payout": 85.95,
      "scraped_at": "2026-04-22T08:00:00.000Z",
      "source": "auto"
    }
  ],
  "last_updated": "2026-04-22T08:00:00.000Z",
  "scraper_version": "1.0"
}
```

Weeks are merged on re-run (no duplicates). Sorted newest first.

---

## Troubleshooting

### Session Expired
```bash
node uber-scraper.js --login   # Re-auth interactively
```

### Debug Screenshot
If extraction fails, a screenshot is saved:
```
/home/ubuntu/wlp/scripts/uber-scraper/debug-screenshot.png
```

### View Logs
```bash
tail -50 /home/ubuntu/wlp/scripts/uber-scraper/cron.log
```

### Check Cron
```bash
crontab -l | grep uber
```

### Uber Changed DOM / API
The scraper tries 3 extraction strategies in order:
1. **API intercept** — intercepts Uber's internal JSON calls (most reliable)
2. **`__NEXT_DATA__`** — Next.js server-rendered state
3. **DOM scrape** — reads visible text from earnings cards

If all fail, a screenshot is saved at `debug-screenshot.png`. File an issue or check the screenshot to identify new selectors.

---

## Credentials

Stored in `.env` (git-ignored):
```
UBER_EMAIL=ericmills71@gmail.com
UBER_PASSWORD=...
```

Or set as environment variables before running.

---

## Architecture

```
uber-scraper.js
  ├── doLogin()           — handles email → password → OTP flow
  ├── extractEarnings()   — 3-strategy extraction (API / Next / DOM)
  ├── buildWeekEntry()    — normalizes API response shape
  ├── mergeWeeks()        — deduplicates + sorts weekly entries
  ├── saveData()          — writes to uber-earnings.json
  └── gitCommitPush()     — auto-commits + pushes MC repo
```

Session persisted in `auth-state.json` (Playwright storageState — cookies + localStorage).

---

## Limitations

- **OTP Required on First Login** — Uber uses SMS/email 2FA. One-time interactive step.
- **Session Duration** — Uber sessions typically last 30–90 days. Re-auth needed when expired.
- **Headless Detection** — If Uber blocks headless, add `--login` to trigger full-browser re-auth.
- **Data Granularity** — Weekly summaries only. Per-trip detail available in shift tracker.
