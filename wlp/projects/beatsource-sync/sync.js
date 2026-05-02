/**
 * Beatport Weekly Sync
 * Scrapes Top 10 + Latest Releases (5 pages) from Beatport genre pages
 * 
 * Usage: node sync.js [genre-name]
 * Runs: Wednesdays at noon MDT (via cron)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const AUTH_STATE  = path.join(__dirname, 'auth-state.json');
const SYNC_STATE  = path.join(__dirname, 'sync-state.json');
const LOG_DIR     = path.join(__dirname, 'logs');

// Genre → Beatport URL + playlist mapping
const TARGET_GENRE = process.argv[2] || null;

const ALL_GENRES = [
  { name: 'African',      url: 'https://www.beatport.com/genre/afro-house/89',       playlist: () => monthPlaylist('African') },
  { name: 'Country',      url: 'https://www.beatport.com/genre/country/16',          playlist: () => monthPlaylist('Country') },
  { name: 'DJ Edits',     url: 'https://www.beatport.com/genre/dj-tools/37',         playlist: () => monthPlaylist('DJ Exclusives') },
  { name: 'Hip-Hop',      url: 'https://www.beatport.com/genre/hip-hop-r-and-b/38',  playlist: () => monthPlaylist('HH/RnB') },
  { name: 'Latin',        url: 'https://www.beatport.com/genre/latin/2',             playlist: () => monthPlaylist('Latin') },
  { name: 'Pop',          url: 'https://www.beatport.com/genre/pop/14',              playlist: () => monthPlaylist('Pop/Top40') },
  { name: 'R&B',          url: 'https://www.beatport.com/genre/r-and-b-soul/40',     playlist: () => monthPlaylist('HH/RnB') },
  { name: 'Rock',         url: 'https://www.beatport.com/genre/indie-dance-rock/37', playlist: () => monthPlaylist('Rock') },
];

const GENRES = TARGET_GENRE
  ? ALL_GENRES.filter(g => g.name === TARGET_GENRE)
  : ALL_GENRES;

// Generate monthly playlist name: "May 2026 African"
function monthPlaylist(suffix) {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  return `${month} ${year} ${suffix}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadState() {
  try { return JSON.parse(fs.readFileSync(SYNC_STATE, 'utf8')); } 
  catch { return { seenTracks: {}, lastRun: null }; }
}

function saveState(state) {
  fs.writeFileSync(SYNC_STATE, JSON.stringify(state, null, 2));
}

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(path.join(LOG_DIR, `sync-${new Date().toISOString().slice(0,10)}.log`), line + '\n');
}

// ─── Track Extraction ─────────────────────────────────────────────────────────

async function extractTop10(page) {
  log('Extracting Top 10...');
  
  const tracks = await page.evaluate(() => {
    const results = [];
    
    // Look for Top 10 section heading
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let top10Section = null;
    
    for (const heading of headings) {
      const text = heading.textContent?.trim().toLowerCase() || '';
      if (text.includes('top 10') || text.includes('top ten')) {
        // Find the track list container after this heading
        top10Section = heading.closest('section') || heading.parentElement;
        break;
      }
    }
    
    if (!top10Section) {
      // Fallback: look for first track list on page (often Top 10)
      top10Section = document;
    }
    
    // Extract tracks - Beatport selectors
    const trackElements = top10Section.querySelectorAll('[data-testid="track-row"], .track-list-item, .buk-track, [class*="TrackListItem"]');
    
    let count = 0;
    for (const el of trackElements) {
      if (count >= 10) break;
      
      const titleEl = el.querySelector('.track-title, [data-testid="track-title"], .buk-track-title, [class*="title"]');
      const artistEl = el.querySelector('.track-artist, [data-testid="track-artist"], .buk-track-artists, [class*="artist"]');
      
      if (titleEl) {
        results.push({
          name: titleEl.textContent?.trim() || '',
          artist: artistEl?.textContent?.trim() || '',
          source: 'top10'
        });
        count++;
      }
    }
    
    return results;
  });
  
  log(`Found ${tracks.length} Top 10 tracks`);
  return tracks;
}

async function extractLatestReleases(page, maxPages = 5) {
  log(`Extracting Latest Releases (up to ${maxPages} pages)...`);
  
  const allTracks = [];
  let currentPage = 1;
  
  while (currentPage <= maxPages) {
    log(`  Page ${currentPage}...`);
    
    const tracks = await page.evaluate(() => {
      const results = [];
      
      // Look for Latest Releases section
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let latestSection = null;
      
      for (const heading of headings) {
        const text = heading.textContent?.trim().toLowerCase() || '';
        if (text.includes('latest releases') || text.includes('new releases') || text.includes('new tracks')) {
          latestSection = heading.closest('section') || heading.parentElement;
          break;
        }
      }
      
      if (!latestSection) {
        latestSection = document;
      }
      
      // Extract tracks
      const trackElements = latestSection.querySelectorAll('[data-testid="track-row"], .track-list-item, .buk-track, [class*="TrackListItem"]');
      
      for (const el of trackElements) {
        const titleEl = el.querySelector('.track-title, [data-testid="track-title"], .buk-track-title, [class*="title"]');
        const artistEl = el.querySelector('.track-artist, [data-testid="track-artist"], .buk-track-artists, [class*="artist"]');
        
        if (titleEl) {
          results.push({
            name: titleEl.textContent?.trim() || '',
            artist: artistEl?.textContent?.trim() || '',
            source: 'latest'
          });
        }
      }
      
      return results;
    });
    
    allTracks.push(...tracks);
    log(`    Found ${tracks.length} tracks`);
    
    // Look for next page arrow/button
    const hasNextPage = await page.evaluate(() => {
      const nextBtn = document.querySelector('[data-testid="pagination-next"], .pagination-next, [class*="next"], button[class*="arrow-right"]');
      if (nextBtn && !nextBtn.disabled) {
        nextBtn.click();
        return true;
      }
      return false;
    });
    
    if (!hasNextPage) {
      log('  No more pages');
      break;
    }
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    currentPage++;
  }
  
  log(`Total Latest Releases: ${allTracks.length} tracks from ${currentPage} page(s)`);
  return allTracks;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  log('=== Beatport Sync Starting ===');

  if (!fs.existsSync(AUTH_STATE)) {
    log('ERROR: No auth state found. Run login.js first.');
    process.exit(1);
  }

  const state = loadState();
  const summary = [];

  const browser = await chromium.launch({
    executablePath: '/usr/local/bin/chromium-browser',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    storageState: AUTH_STATE
  });

  const page = await context.newPage();
  await page.route('**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,otf,ttf}', r => r.abort());
  await page.route('**/google-analytics**', r => r.abort());
  await page.route('**/sentry**', r => r.abort());

  // Check if still logged in
  log('Checking session...');
  await page.goto('https://www.beatport.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  const signInVisible = await page.$('text=Sign In').then(el => !!el).catch(() => false);
  if (signInVisible) {
    log('Session expired. Attempting re-login...');
    await page.goto('https://www.beatport.com/account/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(1000);
    
    if (await page.$('input[name="username"]').catch(() => null)) {
      await page.fill('input[name="username"]', 'Animal7111');
      await page.fill('input[name="password"]', 'Wicked71!');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 25000 }).catch(() => {}),
        page.click('button[type="submit"]')
      ]);
      await page.waitForTimeout(3000);
      await context.storageState({ path: AUTH_STATE });
      log('Re-logged in and saved state');
    }
  } else {
    log('Session active');
  }

  // Process each genre
  for (const genre of GENRES) {
    const playlistName = genre.playlist();
    log(`\n--- Processing ${genre.name} → "${playlistName}" ---`);

    if (!state.seenTracks[genre.name]) state.seenTracks[genre.name] = [];
    const seen = new Set(state.seenTracks[genre.name]);

    try {
      // Load genre page
      await page.goto(genre.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Extract Top 10
      const top10Tracks = await extractTop10(page);
      
      // Extract Latest Releases (up to 5 pages)
      const latestTracks = await extractLatestReleases(page, 5);
      
      // Combine and dedupe
      const allTracks = [...top10Tracks];
      for (const track of latestTracks) {
        const key = `${track.artist} - ${track.name}`.toLowerCase();
        const exists = allTracks.some(t => `${t.artist} - ${t.name}`.toLowerCase() === key);
        if (!exists) {
          allTracks.push(track);
        }
      }

      log(`Total unique tracks: ${allTracks.length} (Top 10: ${top10Tracks.length}, Latest: ${latestTracks.length})`);

      if (allTracks.length === 0) {
        log('No tracks found - may need selector update');
        continue;
      }

      // Filter new tracks
      const newTracks = allTracks.filter(t => {
        const key = `${t.artist} - ${t.name}`.toLowerCase();
        return !seen.has(key);
      });

      log(`${newTracks.length} new tracks to add`);

      // TODO: Add tracks to playlist
      // This requires clicking "Add to playlist" buttons on each track
      // and selecting the correct playlist from dropdown

      // Mark tracks as seen
      for (const t of allTracks) {
        const key = `${t.artist} - ${t.name}`.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          state.seenTracks[genre.name].push(key);
        }
      }

      summary.push({
        genre: genre.name,
        playlist: playlistName,
        top10: top10Tracks.length,
        latest: latestTracks.length,
        total: allTracks.length,
        new: newTracks.length
      });

    } catch (err) {
      log(`ERROR processing ${genre.name}: ${err.message}`);
      summary.push({
        genre: genre.name,
        playlist: playlistName,
        error: err.message
      });
    }
  }

  saveState(state);
  await browser.close();

  // Print summary
  log('\n=== SYNC COMPLETE ===');
  for (const s of summary) {
    if (s.error) {
      log(`❌ ${s.genre}: ERROR - ${s.error}`);
    } else {
      log(`${s.new > 0 ? '✅' : '⏭'} ${s.genre} → "${s.playlist}": ${s.new} new / ${s.total} total (Top 10: ${s.top10}, Latest: ${s.latest})`);
    }
  }

})().catch(err => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
