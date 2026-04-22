#!/usr/bin/env python3
"""
Seed uber-earnings.json with sample data based on Eric's recent Uber activity.
Run this once to populate the MC dashboard with real-world test data.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT   = Path(__file__).resolve().parents[2]
OUTPUT_JSON = REPO_ROOT / "public" / "data" / "uber-earnings.json"

sample = {
  "weekly_summaries": [
    {
      "period_start": "2026-04-20",
      "period_end":   "2026-04-22",
      "total_earnings": 158.36,
      "total_trips": 8,
      "breakdown": {
        "base_fare":  119.36,
        "surge":       9.75,
        "promotions":  5.25,
        "tips":       24.00,
        "expenses":    0.00
      },
      "scraped_at": "2026-04-22T08:00:00Z",
      "source": "manual_seed"
    },
    {
      "period_start": "2026-04-14",
      "period_end":   "2026-04-15",
      "total_earnings": 86.18,
      "total_trips": 4,
      "breakdown": {
        "base_fare":  77.18,
        "surge":       0.00,
        "promotions":  0.00,
        "tips":        9.00,
        "expenses":    0.00
      },
      "charging_deduction": 5.96,
      "net_profit": 80.22,
      "scraped_at": "2026-04-22T08:00:00Z",
      "source": "manual_seed"
    },
    {
      "period_start": "2026-04-18",
      "period_end":   "2026-04-18",
      "total_earnings": 147.55,
      "total_trips": 8,
      "breakdown": {
        "base_fare":  107.55,
        "surge":        9.75,
        "promotions":   5.25,
        "tips":        35.00,
        "expenses":     0.00
      },
      "charging_deduction": 7.19,
      "net_profit": 140.36,
      "scraped_at": "2026-04-22T08:00:00Z",
      "source": "manual_seed"
    }
  ],
  "monthly_totals": {
    "2026-04": {
      "total_earnings": 392.09,
      "total_net":      361.36,
      "total_trips":     20,
      "total_tips":      68.00,
      "total_charging_deductions": 13.15
    }
  },
  "metadata": {
    "source": "drivers.uber.com",
    "scrape_method": "manual_seed",
    "last_scrape_attempt": datetime.now(timezone.utc).isoformat()
  },
  "last_updated": datetime.now(timezone.utc).isoformat()
}

OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
with open(OUTPUT_JSON, "w") as f:
    json.dump(sample, f, indent=2)

print(f"✅ Seeded {OUTPUT_JSON}")
print(f"   Weeks: {len(sample['weekly_summaries'])}")
print(f"   Apr total: ${sample['monthly_totals']['2026-04']['total_earnings']}")
