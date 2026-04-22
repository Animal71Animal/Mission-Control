#!/usr/bin/env python3
"""
Uber Driver Earnings Scraper
Logs into drivers.uber.com and extracts weekly earnings summary.
Saves structured JSON to public/data/uber-earnings.json in Mission Control repo.

Usage:
    python3 uber-scraper.py              # scrape current week
    python3 uber-scraper.py --all        # scrape all available weeks
    python3 uber-scraper.py --dry-run    # scrape but don't save/commit

Requirements:
    pip install playwright python-dotenv
    playwright install chromium  (or use system chromium)
"""

import os
import sys
import json
import time
import argparse
import traceback
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Load .env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

# ── Config ────────────────────────────────────────────────────────────────────
CHROMIUM_PATH    = "/usr/local/bin/chromium"
REPO_ROOT        = Path(__file__).resolve().parents[2]   # mission-control/
OUTPUT_JSON      = REPO_ROOT / "public" / "data" / "uber-earnings.json"
AUTH_STATE_FILE  = Path(__file__).parent / "uber-auth-state.json"

UBER_EMAIL       = os.getenv("UBER_EMAIL", "")
UBER_PASSWORD    = os.getenv("UBER_PASSWORD", "")
DISCORD_WEBHOOK  = os.getenv("DISCORD_WEBHOOK_URL", "")
GITHUB_TOKEN     = os.getenv("GITHUB_TOKEN", "")

MAX_RETRIES      = 3
HEADLESS         = True

# ── Helpers ───────────────────────────────────────────────────────────────────
def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)

def alert_discord(message: str):
    """Post failure alert to Discord webhook."""
    if not DISCORD_WEBHOOK:
        return
    try:
        import urllib.request, urllib.parse
        payload = json.dumps({"content": f"🚨 **Uber Scraper Alert**\n{message}"}).encode()
        req = urllib.request.Request(DISCORD_WEBHOOK, data=payload,
                                     headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        log(f"  Discord alert failed: {e}")

def load_existing_earnings():
    if OUTPUT_JSON.exists():
        with open(OUTPUT_JSON) as f:
            return json.load(f)
    return {"weekly_summaries": [], "last_updated": None, "metadata": {}}

def save_earnings(data: dict, dry_run=False):
    data["last_updated"] = datetime.now(timezone.utc).isoformat()
    if dry_run:
        log("  [DRY RUN] Would save:")
        print(json.dumps(data, indent=2))
        return
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(data, f, indent=2)
    log(f"  Saved → {OUTPUT_JSON}")

def git_commit_push():
    """Auto-commit and push the updated JSON."""
    try:
        cwd = str(REPO_ROOT)
        subprocess.run(["git", "add", str(OUTPUT_JSON)], cwd=cwd, check=True)
        msg = f"auto: uber earnings update {datetime.now().strftime('%Y-%m-%d')}"
        subprocess.run(["git", "commit", "-m", msg], cwd=cwd, check=True)

        # Set remote URL with token if available
        if GITHUB_TOKEN:
            result = subprocess.run(["git", "remote", "get-url", "origin"],
                                    capture_output=True, text=True, cwd=cwd)
            remote_url = result.stdout.strip()
            if "https://" in remote_url and "@" not in remote_url:
                authed = remote_url.replace("https://", f"https://{GITHUB_TOKEN}@")
                subprocess.run(["git", "remote", "set-url", "origin", authed], cwd=cwd)

        subprocess.run(["git", "push", "origin", "main"], cwd=cwd, check=True)
        log("  ✅ Committed + pushed to GitHub")
    except subprocess.CalledProcessError as e:
        log(f"  ⚠️  Git push failed: {e}")


# ── Scraper ───────────────────────────────────────────────────────────────────
def parse_amount(text: str) -> float:
    """'$1,234.56' → 1234.56"""
    if not text:
        return 0.0
    cleaned = text.replace("$", "").replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def scrape_earnings(page, scrape_all=False) -> list:
    """Navigate to earnings page and extract weekly summaries."""
    log("  Navigating to earnings page…")
    page.goto("https://drivers.uber.com/earnings/activities", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)

    # Check if we landed on a login page
    if "login" in page.url or "signin" in page.url:
        raise RuntimeError("Not authenticated — login redirect detected")

    log(f"  Page title: {page.title()}")
    log(f"  URL: {page.url}")

    # Take a debug screenshot
    screenshot_path = Path(__file__).parent / "debug-screenshot.png"
    page.screenshot(path=str(screenshot_path))
    log(f"  Screenshot saved: {screenshot_path}")

    weekly_summaries = []

    # ── Strategy 1: Look for weekly summary cards/rows ──────────────────────
    # Uber's earnings page shows pay periods — try multiple selectors
    selectors_to_try = [
        "[data-testid='weekly-summary']",
        "[data-testid='earnings-period']",
        ".earnings-summary",
        "[class*='earningsPeriod']",
        "[class*='weeklyEarning']",
        "[class*='PayStatement']",
        "//div[contains(text(), 'Week of')]",
        "//div[contains(text(), 'Pay period')]",
    ]

    found_element = None
    for sel in selectors_to_try:
        try:
            if sel.startswith("//"):
                elements = page.locator(f"xpath={sel}").all()
            else:
                elements = page.locator(sel).all()
            if elements:
                log(f"  Found {len(elements)} elements with selector: {sel}")
                found_element = sel
                break
        except Exception:
            continue

    # ── Strategy 2: Extract via page text + structured parsing ───────────────
    log("  Extracting page content for parsing…")
    content = page.content()

    # Try to find JSON data embedded in page (common in React apps)
    import re
    json_matches = re.findall(r'window\.__INITIAL_STATE__\s*=\s*({.+?});', content)
    if not json_matches:
        json_matches = re.findall(r'window\.__PRELOADED_STATE__\s*=\s*({.+?});', content)

    if json_matches:
        log("  Found embedded state JSON — extracting earnings…")
        try:
            state = json.loads(json_matches[0])
            # Try to find earnings in state tree
            earnings_data = find_earnings_in_state(state)
            if earnings_data:
                return earnings_data
        except Exception as e:
            log(f"  State parse failed: {e}")

    # ── Strategy 3: API intercept approach ───────────────────────────────────
    log("  Attempting API-based extraction…")
    api_data = extract_via_api(page)
    if api_data:
        return api_data

    # ── Strategy 4: DOM text scraping fallback ───────────────────────────────
    log("  Falling back to DOM text extraction…")
    return extract_from_dom(page)


def find_earnings_in_state(state: dict, depth=0) -> list:
    """Recursively search for earnings data in embedded state."""
    if depth > 8:
        return []
    if isinstance(state, dict):
        for key in ["earnings", "weeklyEarnings", "payStatements", "earningsSummary"]:
            if key in state and isinstance(state[key], (list, dict)):
                return normalize_earnings(state[key])
        for v in state.values():
            result = find_earnings_in_state(v, depth + 1)
            if result:
                return result
    elif isinstance(state, list):
        for item in state:
            result = find_earnings_in_state(item, depth + 1)
            if result:
                return result
    return []


def extract_via_api(page) -> list:
    """Intercept Uber's internal API calls for earnings data."""
    earnings_responses = []

    def handle_response(response):
        url = response.url
        if "earnings" in url.lower() and response.status == 200:
            try:
                body = response.json()
                earnings_responses.append(body)
                log(f"  Captured API response from: {url[:80]}")
            except Exception:
                pass

    page.on("response", handle_response)

    # Trigger page reload to capture API calls
    page.reload(wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(5000)

    if earnings_responses:
        for resp in earnings_responses:
            normalized = normalize_earnings(resp)
            if normalized:
                return normalized

    return []


def extract_from_dom(page) -> list:
    """Last resort: parse visible text for dollar amounts and dates."""
    import re

    text = page.locator("body").inner_text()
    log(f"  Page text length: {len(text)} chars")

    # Look for weekly earnings patterns
    # "Apr 14 – Apr 20  $158.36  8 trips"
    pattern = re.compile(
        r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+\s*[–\-—]\s*'
        r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+.*?\$(\d+\.?\d*)',
        re.DOTALL
    )
    matches = pattern.findall(text)
    if matches:
        log(f"  Found {len(matches)} date-range matches")

    # Build minimal summary from what we can find
    return []


def normalize_earnings(raw) -> list:
    """Normalize API response into our standard weekly summary format."""
    summaries = []
    if isinstance(raw, dict):
        raw = [raw]
    if not isinstance(raw, list):
        return []
    for item in raw:
        if not isinstance(item, dict):
            continue
        summary = {
            "period_start": item.get("periodStart") or item.get("startDate") or item.get("weekStart", ""),
            "period_end":   item.get("periodEnd")   or item.get("endDate")   or item.get("weekEnd", ""),
            "total_earnings": float(item.get("totalEarnings") or item.get("earnings") or 0),
            "total_trips":    int(item.get("totalTrips")    or item.get("trips")   or 0),
            "breakdown": {
                "base_fare":   float(item.get("baseFare")   or 0),
                "surge":       float(item.get("surge")      or 0),
                "promotions":  float(item.get("promotions") or 0),
                "tips":        float(item.get("tips")       or item.get("tip") or 0),
                "expenses":    float(item.get("expenses")   or 0),
            },
            "scraped_at": datetime.now(timezone.utc).isoformat(),
        }
        if summary["period_start"] or summary["total_earnings"]:
            summaries.append(summary)
    return summaries


# ── Auth ──────────────────────────────────────────────────────────────────────
def login(page, context):
    """Log into Uber driver portal. Saves auth state for reuse."""
    log("  Starting login flow…")
    page.goto("https://auth.uber.com/v2/", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2000)

    # If already logged in (saved state), skip
    if "drivers.uber.com" in page.url or page.url.startswith("https://drivers.uber.com"):
        log("  Already authenticated via saved state")
        return True

    # Enter email
    try:
        email_input = page.locator("input[type='email'], input[name='email'], #useridInput")
        email_input.first.fill(UBER_EMAIL)
        page.keyboard.press("Enter")
        page.wait_for_timeout(2000)
    except Exception as e:
        log(f"  Email input not found: {e}")
        return False

    # Enter password
    try:
        pwd_input = page.locator("input[type='password'], #password")
        pwd_input.first.fill(UBER_PASSWORD)
        page.keyboard.press("Enter")
        page.wait_for_timeout(3000)
    except Exception as e:
        log(f"  Password input not found: {e}")
        return False

    # Check for 2FA / phone verification
    if "verify" in page.url or "2fa" in page.url.lower():
        log("  ⚠️  2FA required — cannot proceed headlessly")
        log("  Run with HEADLESS=false to complete 2FA manually, then save auth state")
        return False

    # Check if login succeeded
    page.wait_for_timeout(3000)
    if "drivers.uber.com" in page.url:
        # Save auth state for future runs
        context.storage_state(path=str(AUTH_STATE_FILE))
        log(f"  Auth state saved → {AUTH_STATE_FILE}")
        return True

    log(f"  Login may have failed. Current URL: {page.url}")
    return False


# ── Main ──────────────────────────────────────────────────────────────────────
def run(scrape_all=False, dry_run=False, commit=True):
    from playwright.sync_api import sync_playwright

    if not UBER_EMAIL or not UBER_PASSWORD:
        log("❌ UBER_EMAIL and UBER_PASSWORD must be set in .env")
        sys.exit(1)

    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        log(f"\n── Attempt {attempt}/{MAX_RETRIES} ─────────────────────────────")
        try:
            with sync_playwright() as p:
                # Use saved auth state if it exists
                context_opts = {
                    "executable_path": CHROMIUM_PATH if os.path.exists(CHROMIUM_PATH) else None,
                }
                if AUTH_STATE_FILE.exists():
                    log("  Loading saved auth state…")
                    context_opts["storage_state"] = str(AUTH_STATE_FILE)

                browser = p.chromium.launch(
                    headless=HEADLESS,
                    executable_path=CHROMIUM_PATH if os.path.exists(CHROMIUM_PATH) else None,
                    args=["--no-sandbox", "--disable-dev-shm-usage"],
                )
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                               "AppleWebKit/537.36 (KHTML, like Gecko) "
                               "Chrome/124.0.0.0 Safari/537.36",
                    storage_state=str(AUTH_STATE_FILE) if AUTH_STATE_FILE.exists() else None,
                    viewport={"width": 1280, "height": 900},
                )
                page = context.new_page()

                # Navigate to earnings page (redirect to login if not authed)
                page.goto("https://drivers.uber.com/earnings/activities",
                          wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(2000)

                # If redirected to login, do the login flow
                if "login" in page.url or "auth.uber.com" in page.url or "signin" in page.url:
                    log("  Not authenticated — logging in…")
                    success = login(page, context)
                    if not success:
                        raise RuntimeError("Login failed")
                    # Navigate back to earnings
                    page.goto("https://drivers.uber.com/earnings/activities",
                              wait_until="networkidle", timeout=60000)
                    page.wait_for_timeout(3000)
                else:
                    log("  ✅ Already authenticated")

                # Scrape
                weekly = scrape_earnings(page, scrape_all=scrape_all)
                browser.close()

                if not weekly:
                    log("  ⚠️  No weekly data extracted — check debug-screenshot.png")
                    # Still save whatever we have (won't overwrite good data)
                    weekly = []

                # Merge with existing data
                existing = load_existing_earnings()
                existing = merge_earnings(existing, weekly)
                existing["metadata"] = {
                    "source": "drivers.uber.com",
                    "scrape_method": "playwright",
                    "last_scrape_attempt": datetime.now(timezone.utc).isoformat(),
                }
                save_earnings(existing, dry_run=dry_run)

                if not dry_run and commit and weekly:
                    git_commit_push()

                log(f"\n✅ Done — {len(weekly)} week(s) extracted")
                return weekly

        except Exception as e:
            last_error = e
            log(f"  ❌ Error: {e}")
            if attempt < MAX_RETRIES:
                wait = attempt * 15
                log(f"  Retrying in {wait}s…")
                time.sleep(wait)

    # All retries failed
    msg = f"Failed after {MAX_RETRIES} attempts: {last_error}"
    log(f"\n❌ {msg}")
    alert_discord(msg)
    sys.exit(1)


def merge_earnings(existing: dict, new_weeks: list) -> dict:
    """Merge new weekly summaries, deduplicating by period_start."""
    summaries = existing.get("weekly_summaries", [])
    existing_keys = {w.get("period_start") for w in summaries if w.get("period_start")}

    added = 0
    for week in new_weeks:
        key = week.get("period_start")
        if key and key not in existing_keys:
            summaries.append(week)
            existing_keys.add(key)
            added += 1
        elif not key:
            summaries.append(week)
            added += 1

    # Sort by period_start descending
    summaries.sort(key=lambda w: w.get("period_start", ""), reverse=True)
    existing["weekly_summaries"] = summaries
    log(f"  Merged: {added} new week(s) added ({len(summaries)} total)")
    return existing


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Uber Earnings Scraper")
    parser.add_argument("--all",     action="store_true", help="Scrape all available weeks")
    parser.add_argument("--dry-run", action="store_true", help="Don't save or commit")
    parser.add_argument("--no-commit", action="store_true", help="Save but don't git push")
    parser.add_argument("--visible", action="store_true", help="Run with visible browser (debug)")
    args = parser.parse_args()

    if args.visible:
        HEADLESS = False

    log("🚗 Uber Earnings Scraper starting…")
    log(f"   Email: {UBER_EMAIL or '(not set)'}")
    log(f"   Output: {OUTPUT_JSON}")
    log(f"   Auth state: {'found' if AUTH_STATE_FILE.exists() else 'not found (will login)'}")

    run(
        scrape_all=args.all,
        dry_run=args.dry_run,
        commit=not args.no_commit,
    )
