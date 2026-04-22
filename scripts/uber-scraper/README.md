# Uber Earnings Scraper

Auto-scrapes Eric's Uber driver dashboard weekly → saves structured JSON → auto-populates Mission Control Uber Profit tab.

## Quick Start

```bash
cd /home/ubuntu/wlp/projects/mission-control/scripts/uber-scraper

# 1. Copy env file and add credentials
cp .env.example .env
nano .env   # set UBER_EMAIL and UBER_PASSWORD

# 2. Run once to test
python3 uber-scraper.py --dry-run

# 3. Install weekly cron
bash setup-cron.sh
```

## First Run (No Auth State)

The first time you run, it'll attempt headless login. Uber often requires phone/2FA verification on new sessions. If that fails:

```bash
# Run with visible browser to complete 2FA manually
python3 uber-scraper.py --visible
# Browser opens → complete 2FA → auth state saves → future runs headless
```

Auth state is saved to `uber-auth-state.json` — keep this file, it avoids re-login.

## Commands

| Command | What it does |
|---------|-------------|
| `python3 uber-scraper.py` | Scrape current week, save, commit |
| `python3 uber-scraper.py --all` | Scrape all available weeks |
| `python3 uber-scraper.py --dry-run` | Scrape but don't save or commit |
| `python3 uber-scraper.py --no-commit` | Save to JSON but don't git push |
| `python3 uber-scraper.py --visible` | Open browser visibly (debug/2FA) |
| `python3 seed-sample-data.py` | Populate with known real data (no login needed) |

## Files

```
scripts/uber-scraper/
├── uber-scraper.py        ← Main scraper
├── seed-sample-data.py    ← Seed with known data (no login required)
├── setup-cron.sh          ← Install weekly cron
├── .env                   ← Your credentials (gitignored)
├── .env.example           ← Template
├── uber-auth-state.json   ← Saved browser session (auto-created)
└── debug-screenshot.png   ← Auto-captured on each run (for debugging)

public/data/
└── uber-earnings.json     ← Output consumed by Mission Control
```

## Output Format (`uber-earnings.json`)

```json
{
  "weekly_summaries": [
    {
      "period_start": "2026-04-20",
      "period_end":   "2026-04-22",
      "total_earnings": 158.36,
      "total_trips": 8,
      "breakdown": {
        "base_fare":   119.36,
        "surge":         9.75,
        "promotions":    5.25,
        "tips":         24.00,
        "expenses":      0.00
      },
      "scraped_at": "2026-04-22T08:00:00Z"
    }
  ],
  "monthly_totals": { "2026-04": { ... } },
  "metadata": { "source": "drivers.uber.com", ... },
  "last_updated": "2026-04-22T08:00:00Z"
}
```

## Cron Schedule

Installed by `setup-cron.sh`:

```
0 5 * * 1   # Every Monday 05:00 UTC = Sunday 11 PM MDT
```

Auto-commits + pushes to GitHub. MC dashboard picks up new data on next page load.

## Troubleshooting

**Login fails headlessly:**
→ Run `--visible` to complete 2FA, saves auth state for future headless runs.

**"Not authenticated — login redirect":**
→ Auth state expired. Delete `uber-auth-state.json` and re-run `--visible`.

**No data extracted:**
→ Check `debug-screenshot.png` to see what the page looks like.
→ Uber may have changed their DOM. File an issue or update selectors in `scrape_earnings()`.

**Git push fails:**
→ Check `GITHUB_TOKEN` in `.env`. Token needs `repo` scope.

**Discord alert on failure:**
→ Set `DISCORD_WEBHOOK_URL` in `.env` to get pinged when scrape fails.

## Important Notes

- Uber's driver portal is a React SPA — DOM structure changes without notice
- The scraper uses multiple extraction strategies (embedded JSON → API intercept → DOM text)
- Auth state (`uber-auth-state.json`) is your session cookie — treat like a password, gitignored
- Charges are NOT auto-deducted here — the existing uber-profit.json handles per-shift deductions

## Dependencies

```bash
pip install playwright python-dotenv
# Chromium already at /usr/local/bin/chromium in this environment
```
