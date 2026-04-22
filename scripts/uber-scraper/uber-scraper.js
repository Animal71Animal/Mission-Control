#!/usr/bin/env node
/**
 * Uber Driver Earnings Scraper
 * 
 * Logs into Uber driver dashboard → extracts weekly earnings summary
 * → saves to Mission Control public/data/uber-earnings.json
 * 
 * Auth strategy: Persistent browser context (auth-state.json)
 * - First run: interactive login (prompts for OTP if needed)
 * - Subsequent runs: reuses saved session (fully headless)
 * 
 * Usage:
 *   node uber-scraper.js              # Normal run
 *   node uber-scraper.js --login      # Force fresh login
 *   node uber-scraper.js --dry-run    # Extract only, no file write
 *   node uber-scraper.js --weeks 4    # Pull last 4 weeks (default: 2)
 */

const { chromium } = require('./node_modules/playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── Config ───────────────────────────────────────────────────────────────────

const UBER_EMAIL    = process.env.UBER_EMAIL    || 'ericmills71@gmail.com';
const UBER_PHONE    = process.env.UBER_PHONE    || '';
const UBER_PASSWORD = process.env.UBER_PASSWORD || 'Wicked71!';

const EARNINGS_URL  = 'https://drivers.uber.com/earnings/activities';
const LOGIN_URL     = 'https://auth.uber.com/login';

const SCRIPT_DIR    = __dirname;
const AUTH_FILE     = path.join(SCRIPT_DIR, 'auth-state.json');
const OUTPUT_FILE   = path.join(
  '/home/ubuntu/wlp/projects/mission-control/public/data',
  'uber-earnings.json'
);
const LOG_FILE      = path.join(SCRIPT_DIR, 'cron.log');

const ARGS          = process.argv.slice(2);
const FORCE_LOGIN   = ARGS.includes('--login');
const DRY_RUN       = ARGS.includes('--dry-run');
const WEEKS_IDX     = ARGS.indexOf('--weeks');
const WEEKS_TO_PULL = WEEKS_IDX >= 0 ? parseInt(ARGS[WEEKS_IDX + 1]) || 2 : 2;

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

function logError(msg, err) {
  log(`❌ ${msg}: ${err?.message || err}`);
}

// ─── OTP Prompt (for interactive first login) ─────────────────────────────────

function promptOTP(prompt) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, answer => { rl.close(); resolve(answer.trim()); });
  });
}

// ─── Login Flow ───────────────────────────────────────────────────────────────

async function doLogin(page) {
  log('🔓 Starting Uber login flow...');

  await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const url = page.url();
  log(`📄 After goto: ${url}`);

  // Fill identifier (email or phone)
  const identifier = UBER_EMAIL || UBER_PHONE;
  try {
    // Uber uses a single input for email/phone on first step
    await page.waitForSelector('input[type="text"], input[type="email"], input[id*="USER_ID"]', { timeout: 10000 });
    await page.fill('input[type="text"], input[type="email"], input[id*="USER_ID"]', identifier);
    await page.waitForTimeout(500);

    // Click "Next" / "Continue"
    const nextBtn = page.locator('button[type="submit"], button:has-text("Next"), button:has-text("Continue")').first();
    await nextBtn.click();
    await page.waitForTimeout(2000);
  } catch (e) {
    log(`⚠️  Identifier step issue: ${e.message}`);
  }

  // Password step
  try {
    const pwInput = await page.waitForSelector('input[type="password"]', { timeout: 8000 });
    if (pwInput) {
      await page.fill('input[type="password"]', UBER_PASSWORD);
      await page.waitForTimeout(500);
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    log(`⚠️  Password step: ${e.message} — may have skipped to OTP`);
  }

  // OTP step — Uber often sends SMS or email verification
  const currentUrl = page.url();
  if (currentUrl.includes('verify') || currentUrl.includes('otp') || currentUrl.includes('mfa')) {
    log('📱 OTP/verification required — check your phone or email');
    const otp = await promptOTP('Enter OTP code: ');
    try {
      await page.fill('input[type="text"], input[type="number"], input[autocomplete="one-time-code"]', otp);
      await page.waitForTimeout(500);
      const submitBtn = page.locator('button[type="submit"]').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
    } catch (e) {
      log(`⚠️  OTP entry failed: ${e.message}`);
    }
  }

  // Verify we're logged in
  const finalUrl = page.url();
  log(`📄 Post-login URL: ${finalUrl}`);

  if (finalUrl.includes('drivers.uber.com') || finalUrl.includes('earnings')) {
    log('✅ Login successful');
    return true;
  }

  log('⚠️  Login may have failed — unexpected URL after auth');
  return false;
}

// ─── Earnings Extraction ──────────────────────────────────────────────────────

async function extractEarnings(page) {
  log(`🔍 Navigating to earnings: ${EARNINGS_URL}`);

  await page.goto(EARNINGS_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const url = page.url();
  log(`📄 Earnings page URL: ${url}`);

  if (url.includes('login') || url.includes('auth.uber')) {
    throw new Error('Redirected to login — session expired');
  }

  // ── Strategy 1: Intercept XHR/Fetch API responses ─────────────────────────
  log('🔍 Attempting API intercept strategy...');

  let apiData = null;
  page.on('response', async response => {
    const respUrl = response.url();
    if (respUrl.includes('/api/query') || respUrl.includes('/earnings') || respUrl.includes('/driver-profiles')) {
      try {
        const json = await response.json();
        if (json?.data?.driverEarnings || json?.earnings || json?.weeklyEarnings) {
          apiData = json;
          log(`✅ API intercept hit: ${respUrl}`);
        }
      } catch {}
    }
  });

  // Reload to trigger API calls
  await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  if (apiData) {
    log('✅ Got earnings data via API intercept');
    return parseApiData(apiData);
  }

  // ── Strategy 2: __NEXT_DATA__ / window state ───────────────────────────────
  log('🔍 Trying __NEXT_DATA__ extraction...');
  const nextData = await page.evaluate(() => {
    const el = document.getElementById('__NEXT_DATA__');
    if (el) {
      try { return JSON.parse(el.textContent); } catch {}
    }
    // Also check window.__PRELOADED_STATE__ or similar
    return window.__PRELOADED_STATE__ || window.__INITIAL_STATE__ || null;
  });

  if (nextData) {
    const parsed = parseNextData(nextData);
    if (parsed) {
      log('✅ Got earnings via __NEXT_DATA__');
      return parsed;
    }
  }

  // ── Strategy 3: DOM scraping ───────────────────────────────────────────────
  log('🔍 Falling back to DOM scraping...');
  const domData = await scrapeDOM(page);
  if (domData) {
    log('✅ Got earnings via DOM scrape');
    return domData;
  }

  // ── Strategy 4: Take screenshot for debugging ─────────────────────────────
  const screenshotPath = path.join(SCRIPT_DIR, 'debug-screenshot.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  log(`📸 Screenshot saved: ${screenshotPath}`);

  throw new Error('Could not extract earnings data — screenshot saved for debugging');
}

// ─── Parse Helpers ────────────────────────────────────────────────────────────

function parseApiData(json) {
  // Uber's internal API varies — try common shapes
  const raw = json?.data?.driverEarnings?.weeklyEarnings
    || json?.weeklyEarnings
    || json?.earnings?.weeks
    || [];

  return raw.map(week => buildWeekEntry(week));
}

function parseNextData(data) {
  try {
    const props = data?.props?.pageProps;
    const earnings = props?.initialState?.earnings
      || props?.earnings
      || props?.weeklyEarnings;
    if (!earnings) return null;
    return Array.isArray(earnings) ? earnings.map(buildWeekEntry) : null;
  } catch {
    return null;
  }
}

async function scrapeDOM(page) {
  return await page.evaluate(() => {
    const results = [];

    // Look for weekly summary cards
    const cards = document.querySelectorAll(
      '[data-testid*="week"], [class*="WeekCard"], [class*="weekly-summary"], [class*="earnings-row"]'
    );

    cards.forEach(card => {
      const text = card.innerText;
      const amountMatch = text.match(/\$[\d,]+\.?\d*/g);
      const dateMatch = text.match(/(\w{3}\s+\d{1,2})\s*[-–]\s*(\w{3}\s+\d{1,2})/);
      const tripsMatch = text.match(/(\d+)\s+trip/i);

      if (amountMatch || dateMatch) {
        results.push({
          raw: text.substring(0, 300),
          amounts: amountMatch,
          dateRange: dateMatch ? dateMatch[0] : null,
          trips: tripsMatch ? parseInt(tripsMatch[1]) : null,
        });
      }
    });

    // Also grab overall summary section
    const summaryEl = document.querySelector(
      '[class*="summary"], [class*="total-earnings"], [data-testid*="summary"]'
    );
    const summaryText = summaryEl?.innerText || '';

    return results.length > 0 ? results : (summaryText ? [{ raw: summaryText }] : null);
  });
}

function buildWeekEntry(week) {
  // Normalize various API shapes into our standard format
  const startDate = week.startDate || week.start_date || week.periodStart || '';
  const endDate   = week.endDate   || week.end_date   || week.periodEnd   || '';

  return {
    period_start: startDate,
    period_end:   endDate,
    total_earnings:  parseFloat(week.totalEarnings  || week.total_earnings  || week.gross || 0),
    total_trips:     parseInt(  week.totalTrips     || week.total_trips     || week.trips || 0),
    breakdown: {
      base_fare:   parseFloat(week.baseFare    || week.base_fare   || 0),
      surge:       parseFloat(week.surge       || week.surgePay    || 0),
      tips:        parseFloat(week.tips        || week.tip         || 0),
      promotions:  parseFloat(week.promotions  || week.boosts      || 0),
      expenses:    parseFloat(week.expenses    || week.deductions  || 0),
    },
    net_payout: parseFloat(week.netPayout || week.net_payout || week.payout || 0),
    scraped_at: new Date().toISOString(),
  };
}

// ─── Load / Merge / Save JSON ─────────────────────────────────────────────────

function loadExisting() {
  if (fs.existsSync(OUTPUT_FILE)) {
    try { return JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')); } catch {}
  }
  return { weekly_summaries: [], last_updated: null, scraper_version: '1.0' };
}

function mergeWeeks(existing, fresh) {
  const byKey = {};

  // Index existing entries
  for (const w of (existing.weekly_summaries || [])) {
    const key = `${w.period_start}:${w.period_end}`;
    byKey[key] = w;
  }

  // Merge/overwrite with fresh
  for (const w of fresh) {
    const key = `${w.period_start}:${w.period_end}`;
    byKey[key] = w;
  }

  // Sort newest first
  return Object.values(byKey).sort((a, b) =>
    (b.period_start || '').localeCompare(a.period_start || '')
  );
}

function saveData(weeks) {
  const data = loadExisting();
  data.weekly_summaries = mergeWeeks(data, weeks);
  data.last_updated = new Date().toISOString();

  if (DRY_RUN) {
    log('🧪 DRY RUN — data extracted but not written:');
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  log(`✅ Saved ${weeks.length} week(s) to ${OUTPUT_FILE}`);
}

// ─── Git Commit + Push ────────────────────────────────────────────────────────

function gitCommitPush() {
  const { execSync } = require('child_process');
  const repoDir = '/home/ubuntu/wlp/projects/mission-control';
  try {
    execSync(`cd "${repoDir}" && git add public/data/uber-earnings.json && git commit -m "chore: update uber earnings [$(date +%Y-%m-%d)]" && git push`, { stdio: 'inherit' });
    log('✅ Git commit + push complete');
  } catch (e) {
    logError('Git commit failed', e);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════');
  log('🚀 Uber Earnings Scraper starting');
  log(`   Weeks to pull: ${WEEKS_TO_PULL} | Dry run: ${DRY_RUN} | Force login: ${FORCE_LOGIN}`);

  const hasAuthState = fs.existsSync(AUTH_FILE) && !FORCE_LOGIN;
  const headless     = hasAuthState; // Interactive if no saved session

  if (!headless) {
    log('⚠️  No saved auth state — running in headed mode for interactive login');
    log('   (Set DISPLAY or run on a machine with a screen, or use --login on Mac)');
  }

  let browser, context;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      log(`🔄 Attempt ${attempt}/3`);

      browser = await chromium.launch({
        headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const contextOptions = hasAuthState
        ? { storageState: AUTH_FILE }
        : {};

      context = await browser.newContext({
        ...contextOptions,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
      });

      const page = await context.newPage();

      // If no auth state, do login
      if (!hasAuthState) {
        const loginOk = await doLogin(page);
        if (!loginOk) throw new Error('Login failed');

        // Save auth state for future headless runs
        await context.storageState({ path: AUTH_FILE });
        log(`💾 Auth state saved to ${AUTH_FILE}`);
      }

      // Extract earnings
      const weeks = await extractEarnings(page);

      if (!weeks || weeks.length === 0) {
        throw new Error('No earnings data extracted');
      }

      log(`📊 Extracted ${weeks.length} week(s) of earnings`);

      // Save + push
      saveData(weeks);
      if (!DRY_RUN) gitCommitPush();

      await browser.close();
      log('✅ Scraper finished successfully');
      process.exit(0);

    } catch (err) {
      logError(`Attempt ${attempt} failed`, err);

      // If session expired, clear auth state and retry with login
      if (err.message.includes('session expired') || err.message.includes('login')) {
        log('🗑️  Clearing auth state — session expired');
        try { fs.unlinkSync(AUTH_FILE); } catch {}
      }

      if (browser) await browser.close().catch(() => {});

      if (attempt < 3) {
        log(`⏳ Waiting 10s before retry...`);
        await new Promise(r => setTimeout(r, 10000));
      }
    }
  }

  log('❌ All attempts failed — exiting with error');
  process.exit(1);
}

main();
