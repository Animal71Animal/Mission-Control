# Beatport Rewrite Plan

**Status:** In Progress
**Goal:** Switch from BeatSource to Beatport charts for playlist curation

## Beatport Structure

### Genre Pages
- URL pattern: `https://www.beatport.com/genre/{slug}/{id}`
- Example: `https://www.beatport.com/genre/tech-house/11`

### Charts on Genre Pages
Each genre has curated charts:
- Weekend Picks
- Best New {Genre}
- Best New Hype {Genre}
- Best of Classics

### Target Genres (Beatport IDs)
| Genre | ID | Playlist Name |
|---|---|---|
| Tech House | 11 | Tech House |
| House | 5 | House |
| Deep House | 12 | Deep House |
| Drum & Bass | 1 | Drum & Bass |
| Techno | 6 | Techno |
| Trance | 7 | Trance |
| Progressive House | 15 | Progressive |
| Electro House | 17 | Electro House |
| Future House | 65 | Future House |
| Bass House | 91 | Bass House |

## Scraping Strategy

### Option 1: Scrape Genre Charts
- Navigate to genre page
- Extract chart links
- Scrape each chart for tracks
- Add tracks to playlists

### Option 2: Scrape Top 100
- Navigate to genre top 100
- Extract top tracks
- Add to playlists

### Option 3: Scrape DJ Charts
- Navigate to charts page
- Filter by genre
- Extract tracks from charts

## Implementation Notes

### Beatport Login
- Same company as BeatSource (Beatport/BeatSource share auth)
- May need separate login flow
- Check if BeatSource auth works on Beatport

### Track Data
- Track title
- Artist name
- Label
- Release date
- BPM/Key (if available)

### Playlist Naming
- Same pattern: "May 2026 Tech House"
- Monthly playlists per genre

## Next Steps
1. Test Beatport login with existing BeatSource credentials
2. Identify correct selectors for track extraction
3. Build new scraper
4. Test and deploy
