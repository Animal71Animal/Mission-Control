/**
 * Beatport Login - saves browser state for reuse
 * Run: node login.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'auth-state.json');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/local/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({ 
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    storageState: fs.existsSync(STATE_FILE) ? STATE_FILE : undefined
  });
  
  const page = await context.newPage();
  await page.route('**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,otf,ttf}', r => r.abort());
  await page.route('**/google-analytics**', r => r.abort());
  await page.route('**/sentry**', r => r.abort());

  console.log('Loading Beatport...');
  await page.goto('https://www.beatport.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Check if already logged in
  const signInLink = await page.$('text=Sign In').catch(() => null);
  
  if (!signInLink) {
    console.log('Already logged in! Saving state...');
    await context.storageState({ path: STATE_FILE });
    await browser.close();
    console.log('State saved to', STATE_FILE);
    return;
  }

  console.log('Logging in...');
  await signInLink.click();
  await page.waitForTimeout(1000);
  
  // Fill credentials
  await page.fill('input[name="username"]', 'Animal7111');
  await page.fill('input[name="password"]', 'Wicked71!');
  
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);

  console.log('After login URL:', page.url().substring(0, 80));

  // Wait for session to be fully established
  await page.waitForTimeout(3000);
  
  // Save the state
  await context.storageState({ path: STATE_FILE });
  console.log('Auth state saved to', STATE_FILE);

  // Verify by checking for user menu or library link
  const libraryLink = await page.$('text=Library').catch(() => null);
  if (libraryLink) {
    console.log('✅ Login verified - library accessible!');
  } else {
    console.log('⚠️ Login may not have worked - check manually');
  }

  await browser.close();
})().catch(err => { 
  console.error(err.message); 
  process.exit(1); 
});
