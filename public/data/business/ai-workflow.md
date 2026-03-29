# 🤖 ANIMAL — AI Generation Workflow

**Eric "ANIMAL" Mills | DJ · Producer · Musician**

**Managed by PriScylla 🦞 | Last updated:** 2026-03-12

---

## Table of Contents

1. [AI Agent Architecture Overview](#1-ai-agent-architecture-overview)
2. [DJ Automation Software AI Workflow](#2-dj-automation-software-ai-workflow)
3. [Music Production AI Workflow](#3-music-production-ai-workflow)
4. [Visual Content AI Workflow](#4-visual-content-ai-workflow)
5. [Written Content AI Workflow](#5-written-content-ai-workflow)
6. [Video Content AI Workflow](#6-video-content-ai-workflow)
7. [Social Media AI Workflow](#7-social-media-ai-workflow)
8. [Analytics & Reporting AI Workflow](#8-analytics--reporting-ai-workflow)
9. [Prompt Library](#9-prompt-library)

---

## 1. AI Agent Architecture Overview

### PriScylla 🦞 — Primary Orchestrator

PriScylla is the main AI interface, manager, and coordinator for all AI-assisted operations. Think of her as the executive producer of the AI layer — she receives requests, routes them to the right specialist, synthesizes outputs, and delivers back to ANIMAL. She holds context across all workflows and maintains the memory/continuity of the operation.

**PriScylla's core responsibilities:**

- Direct communication with ANIMAL (Telegram, primary channel)
- Routing tasks to specialized sub-agents
- Synthesizing multi-agent outputs into coherent deliverables
- Memory management (MEMORY.md, daily logs, project files)
- Quality control before anything reaches ANIMAL
- Calendar awareness, deadline tracking, priority triage

### Sub-Agent Roster

| Agent | Specialization | Triggers |
|-------|----------------|----------|
| **Ops Agent** | Organization & operations — scheduling, file management, project tracking | "organize", "schedule", "track", "set up" |
| **Finance Agent** | Revenue tracking, invoice management, royalty monitoring, budget planning | "invoice", "royalties", "revenue", "pay", "budget" |
| **Release Agent** | Full release pipeline — DSP delivery, metadata, promo timelines, Crooklyn Clan coordination | "release", "drop", "distribute", "submit" |
| **Marketing Agent** | Campaign strategy, EPK, press, booking pitches, sponsorship outreach | "campaign", "pitch", "press", "market" |
| **Content Agent** | AI content generation — captions, copy, prompts, image briefs, newsletter drafts | "write", "caption", "generate", "draft", "content" |
| **Analytics Agent** | Data pulls, trend interpretation, Chartmetric/Soundcharts reporting, KPI summaries | "data", "stats", "report", "how's [X] performing" |
| **Software Product Agent** | DJ automation software — competitive research, product spec updates, pilot data analysis, investor materials, developer coordination | "coverjock", "software", "pilot", "investor", "dev", "product brief" |

### Agent Communication & Handoff Protocol

```
ANIMAL
  └─▶ PriScylla 🦞  (receives, interprets, routes)
        ├─▶ Ops Agent        → returns: schedule/file/task output
        ├─▶ Finance Agent    → returns: financial summary/action
        ├─▶ Release Agent    → returns: release checklist/status
        ├─▶ Marketing Agent  → returns: strategy/copy/pitch
        ├─▶ Content Agent    → returns: generated content (text/prompts)
        └─▶ Analytics Agent  → returns: data report/interpretation
              └─▶ PriScylla synthesizes → delivers to ANIMAL
```

**Handoff rules:**

- PriScylla spawns a sub-agent when the task is time-consuming, specialized, or needs isolation
- Sub-agents report back to PriScylla; ANIMAL only ever talks to PriScylla
- Sub-agents can share context files (in /workspace/business/) but don't communicate directly
- PriScylla arbitrates when two agents need to collaborate (e.g., Release Agent + Marketing Agent on a campaign)

### When to Spawn vs. Handle In Main Session

| Handle in main session (PriScylla directly) | Spawn a sub-agent |
|---------------------------------------------|-------------------|
| Quick questions, lookups, one-liner tasks | Generating a full press kit or campaign brief |
| Reading/writing single files | Building/updating a release timeline |
| Short content generation (one caption, one reply) | Batch content generation (10+ captions, full newsletter) |
| Checking calendar or weather | Running analytics across multiple platforms |
| Anything under ~2 minutes of compute | Tasks requiring 3+ tool calls in sequence |
| | Anything ANIMAL wants to "set and forget" while doing other things |

---

## 2. DJ Automation Software AI Workflow

### 2.1 Overview

The software division has its own AI-assisted workflows, distinct from the music label operations. These support product development, go-to-market, and investor/sales activities.

**Documents to maintain:**

- `/business/dj-software/PRODUCT-BRIEF.md` — living spec; update when features change
- `/business/dj-software/COMPETITIVE-POSITIONING.md` — update when new competitors emerge or pricing confirmed
- `/business/dj-software/INVESTOR-PITCH.md` — update with traction milestones as they're hit

### 2.2 Competitive Intelligence Workflow

**Trigger:** New competitor info surfaces, pricing confirmed, feature parity changes

**Workflow:**

1. Web search: CoverJock updates, Strip Sync updates, BoothPoint updates, new entrants
2. Update competitive matrix in COMPETITIVE-POSITIONING.md
3. Flag any changes that affect positioning or pricing strategy
4. Brief ANIMAL with 3-bullet summary of what changed and what it means

**Prompt for Software Product Agent:**

> "Search for any new information on CoverJock pricing, features, or customer reviews. Also check if Strip Sync or BoothPoint have launched any new features. Update the competitive matrix and flag any positioning implications."

### 2.3 Pilot Data Analysis Workflow

**Trigger:** After every pilot test session (after-hours test, weekday shift, weekend shift)

**Data to capture per session:**

| Metric | Notes |
|--------|-------|
| Dead air incidents | Count + cause |
| Manual interventions | Count + type |
| Manager feedback | Qualitative notes |
| Dancer feedback | Qualitative notes |
| Technical issues | Crashes, audio dropouts, latency |
| What worked / what didn't | |

**Workflow:**

1. ANIMAL or DJ friend fills out post-session debrief (template below)
2. Analytics Agent analyzes across sessions for patterns
3. PriScylla summarizes top 5 fixes needed for developer
4. Update pilot report in `/business/dj-software/pilot-report.md`

**Post-Session Debrief Template:**

```
Date:
Venue:
Shift Length:
Dead air incidents: [count] — [causes]
Manual interventions: [count] — [types]
Manager feedback: [notes]
Dancer feedback: [notes]
Crashes/errors: [count + description]
Top 3 things that worked:
Top 3 things that need fixing:
```

### 2.4 Investor Materials Workflow

**Trigger:** Traction milestone hit, new pilot data available, investor meeting scheduled

**Milestones that trigger pitch updates:**

| Milestone | Update Section |
|-----------|----------------|
| First pilot venue live | Traction section |
| First chain demo scheduled | Pipeline section |
| CoverJock pricing confirmed | Competitive section + pricing strategy |
| First paying customer | Traction + financial projections |

**Workflow:**

1. Identify which section of INVESTOR-PITCH.md needs updating
2. Content Agent drafts updated section
3. PriScylla reviews for consistency with other docs
4. ANIMAL approves

### 2.5 Developer Communication Workflow

**Trigger:** Weekly check-in, milestone delivery, scope question

**Weekly dev check-in structure:**

- What shipped this week (vs. what was planned)
- Any scope creep or blockers
- Next week's priorities (top 3 only)
- Any open questions for ANIMAL

**Scope discipline rule:** Any feature request not in PRODUCT-BRIEF.md Phase 1 goes to a "backlog" list. Nothing gets added to active sprint without ANIMAL approval.

**Prompt for Ops Agent:**

> "Review the dev check-in notes for this week. Flag any scope additions vs. Phase 1 spec. Summarize blockers and confirm next week's top 3 priorities align with the 12-week build plan."

### 2.6 Chain Sales Workflow

**Trigger:** Chain meeting scheduled, demo request, proposal needed

**Pre-meeting prep:**

- Pull pilot report data (success metrics)
- Identify chain's specific pain points (how many stages? current system? chain size?)
- Customize the competitive positioning for their specific situation (CoverJock customer? DIY? BoothPoint?)
- Prepare live demo talking points

**Follow-up cadence:**

| Timing | Action |
|--------|--------|
| Same day | Send pilot report PDF + product brief |
| +3 days | Follow-up with any answers to questions raised |
| +7 days | Check-in if no response |
| +14 days | Final follow-up, then move to cold list |

### 2.7 Software Prompt Library

**SW1 — Competitive Update**

> "Search for new information on CoverJock, Strip Sync, BoothPoint, and PCDJ DEX since March 2026. Focus on: pricing changes, new features, customer reviews, funding news. Summarize in 5 bullets and flag anything that changes our competitive positioning."

**SW2 — Pilot Report Summary**

> "Analyze these pilot session notes: [paste notes]. Identify: top 3 reliability issues, top 3 usability issues, patterns across sessions, and the 5 highest-priority fixes for the developer. Format as a prioritized backlog."

**SW3 — Chain Sales Prep**

> "Prepare a pre-meeting brief for a chain sales call with [chain name], [X] locations, currently using [system]. Customize our CoverJock pitch to address their specific situation. Include 3 talking points, 2 likely objections with responses, and the key success metric from our pilot to lead with."

**SW4 — Investor Update**

> "Draft an investor update email covering: new traction milestones [list them], pilot results summary, development progress, and next 30-day milestones. Tone: confident, data-forward, no fluff. Under 300 words."

**SW5 — Feature Scoping**

> "Review this feature request: [description]. Does it fall within Phase 1 scope in PRODUCT-BRIEF.md? If yes, which week does it belong to? If no, log it to the backlog and explain the tradeoff of adding it now vs. post-MVP."

---

## 3. Music Production AI Workflow

### 3.1 AI Music Generation — Tool Stack

These tools are the core of the virtual artist label. Each serves a different production role.

#### 🎵 Suno

**Best for:** Full song generation — lyrics, vocals, instrumentation, production, in one shot

**Strength:** Remarkably complete songs from a single prompt. Best for demos, reference tracks, and getting a full song structure fast.

**Use cases for ANIMAL:**

- Generate demo versions of Kade Rivers, Madison Blair, and Aria Vale tracks before full production
- Create influencer licensing catalog tracks at high volume
- Rapid prototyping of new sound directions per artist
- Generate "bed" versions (no vocals) for instrumental licensing

**Workflow:**

1. Write a detailed Suno prompt (see Prompt Library — M2)
2. Generate 3–5 variations
3. Select best version → use as structural reference or final with light post-processing
4. Run through Lalal.ai if stems needed for remix/edit work
5. Master via LANDR or Matchering for distribution

**Suno prompt structure:**

```
[genre], [tempo descriptor], [mood], [vocal style if any], [key instrumentation],
[structural note: e.g., "builds to a drop", "verse-chorus-verse", "instrumental"],
[reference artists: e.g., "Foo Fighters meets Nothing But Thieves"],
[any specific instructions: "no rap", "female vocals", "club-ready extended mix"]
```

#### 🎵 Udio

**Best for:** Alternative to Suno — different sonic character, sometimes better for dance/electronic

**Strength:** Strong on EDM, house, and electronic genres. Good variety within genre.

**Use cases:** Aria Vale tracks, influencer licensing (EDM/electronic category), club edits

**When to use Udio vs. Suno:**

| Track Type | Primary Tool |
|------------|--------------|
| Aria Vale electronic tracks | Udio |
| Kade Rivers rock tracks | Suno |
| Madison Blair pop | Test both, pick best |
| Influencer licensing (EDM) | Udio |
| Influencer licensing (everything else) | Suno |

#### ✂️ Lalal.ai

**Best for:** Stem separation — isolate vocals, drums, bass, instruments from any audio

**Strength:** Best-in-class stem quality. Handles complex mixes cleanly.

**Use cases for ANIMAL:**

- Crooklyn Clan mashup work: extract vocals from source tracks
- Clean up AI-generated tracks: isolate and replace individual stems
- Create instrumentals from Suno/Udio outputs for licensing
- Remix and edit source material
- Extract clean acapellas for mashup builds

**Workflow:**

1. Upload source audio to Lalal.ai
2. Select stem type (vocal, drums, bass, other instruments)
3. Download stems at 44.1kHz / WAV
4. Import into DAW (Ableton/FL/Logic) for edit/remix work
5. Reassemble with new elements as needed

**Alternative stem tools (ranked by quality):**

| Tool | Best For | Notes |
|------|----------|-------|
| Lalal.ai | Clean multi-stem separation | Best overall quality |
| Moises | Quick vocal isolation, mobile-friendly | Good for fast turnarounds |
| AudioShake | Complex mix separation | Strong on full-band recordings |
| RipX | Deep stem editing + repair | Best for surgical control |
| iZotope RX | Audio repair + stem clean-up | Industry standard for cleanup |

#### 🔊 Stability Audio / AudioCraft (Meta)

**Best for:** Sound design, ambient textures, experimental audio generation

**Use cases:** Aria Vale's atmospheric intro/outro elements, background sound design for sync catalog

### 3.2 Image Generation — Best-in-Market Stack (2026)

| Tool | Tier | Best For | Access |
|------|------|----------|--------|
| Midjourney v6+ | 🥇 Top tier | Artistic quality, atmosphere, cinematic renders | midjourney.com |
| Flux Pro / Flux Ultra (Black Forest Labs) | 🥇 Top tier | Photorealistic, detailed, fast | fal.ai, Replicate, ComfyUI |
| DALL-E 3 / GPT-4o | 🥈 Strong | Clean composition, text integration, fast iteration | ChatGPT Plus or API |
| Adobe Firefly 3 | 🥈 Strong | Brand-safe (licensed training data), Photoshop integration | Creative Cloud |
| Ideogram v2 | 🥈 Strong | Text-in-image generation (best for posters/flyers with legible type) | ideogram.ai |
| Stable Diffusion 3.5 | 🥉 Flexible | Full local control, custom LoRA, batch generation | ComfyUI / A1111 |
| Leonardo AI | 🥉 Flexible | Consistent character/style across images | leonardo.ai |

**ANIMAL's recommended default stack:**

- Primary artistic renders: Midjourney or Flux Pro
- Posters/flyers with text: Ideogram (best legible text in generated images)
- Brand-safe / Photoshop integration: Adobe Firefly
- Batch social variants: Stable Diffusion 3.5 via ComfyUI
- Quick iterations: DALL-E 3 via ChatGPT

### 3.3 Video Generation — Best-in-Market Stack (2026)

| Tool | Tier | Best For | Access |
|------|------|----------|--------|
| Sora (OpenAI) | 🥇 Top tier | Longer coherent video, realistic motion, cinematic scenes | sora.com (ChatGPT Plus) |
| Kling AI v2 | 🥇 Top tier | Realistic motion, human movement, strong physics | klingai.com |
| Veo 2 (Google) | 🥇 Top tier | High quality, long duration, camera control | VideoFX / via API |
| Runway ML Gen-3 Alpha | 🥈 Strong | Creative video generation, motion brush, image-to-video | runwayml.com |
| Luma Dream Machine | 🥈 Strong | Fast generation, good image-to-video, creative variety | lumalabs.ai |
| Pika Labs 2.0 | 🥈 Strong | Quick clips, effects, scene transitions | pika.art |
| Hailuo (MiniMax) | 🥉 Flexible | Fast, free tier available, decent quality | hailuoai.com |
| Hedra | 🥉 Flexible | Talking head / lip sync (useful for "artist interviews") | hedra.com |

**ANIMAL's recommended default stack:**

- Music video / cinematic: Sora or Kling AI
- Quick social clips: Runway ML or Pika 2.0
- Image-to-video (album art animated): Luma Dream Machine
- Talking head / "artist speaks" content: Hedra
- Batch visualizer content: Pika 2.0

### 3.4 Music Production AI Workflow — End to End

```
CONCEPT  →  GENERATION  →  STEM WORK  →  DAW PRODUCTION  →  MASTERING  →  DISTRIBUTION
```

**Step 1 — Concept:**

- Define: artist identity, mood, target audience, BPM range, reference artists
- Write Suno/Udio prompt using the structure in 3.1

**Step 2 — Generation:**

- Generate 3–5 versions in Suno (and/or Udio for EDM)
- Select best 1–2 versions
- Flag: vocal quality, structure, energy, vibe match

**Step 3 — Stem Work (if needed):**

- Upload selected track to Lalal.ai
- Extract stems needed for editing (vocal, instrumental, drums, bass)
- Import into DAW

**Step 4 — DAW Production:**

- Layer additional elements, fix transitions, extend/shorten for club use
- Add effects, EQ, compression
- Build intro/outro for DJ-friendliness (club edits: 16-bar intro, clean outro)

**Step 5 — Mastering:**

- LANDR (fast, good quality) or Matchering (reference-track mastering)
- Target: -14 LUFS integrated for streaming; -9 LUFS for club use
- Export: WAV 44.1kHz/24-bit (master); MP3 320kbps (distribution copy)

**Step 6 — Distribution:**

- Upload via DistroKid (or TuneCore for flagship releases)
- Metadata: artist name, title, genre, BPM, key, ISRC
- Submit to Spotify editorial (via Spotify for Artists) 7+ days before release

### 3.5 Volume Targets by Division

| Division | Weekly Output | Primary Tools |
|----------|---------------|---------------|
| Virtual Artist Label (3 artists) | 2–3 tracks/week | Suno, Udio, DAW + Lalal.ai |
| Influencer Licensing Catalog | 5–10 tracks/week | Suno (primary), Udio (EDM) |
| **Total** | **7–13 tracks/week** | |

**Batching strategy:** Dedicate specific days to each artist. Don't context-switch between artists mid-session — the prompts and creative headspace are different.

---

## 4. Visual Content AI Workflow

### 4.1 Artwork Generation Pipeline

```
BRIEF  →  PROMPT CRAFT  →  GENERATION  →  REFINEMENT  →  EXPORT
```

**Step 1 — Brief** (fill this out for every asset):

| Field | Notes |
|-------|-------|
| Track/project name | |
| Mood/energy | e.g., dark, euphoric, raw, cinematic |
| Color palette | max 3 primary colors |
| Key visual elements | e.g., lasers, cityscape, abstract waves |
| Format | square 3000×3000, portrait 1080×1920, etc. |
| Reference images or artists | optional |

**Step 2 — Prompt Craft:**

Use the Prompt Library (Section 8) as starting templates. Iterate 2–3 variations before generating.

**Step 3 — Generation:**

Run across 2 tools minimum (e.g., Midjourney + DALL-E 3) to compare directions.

**Step 4 — Refinement:**

- Midjourney: use `--v 6` + `vary(region)` for targeted edits
- Adobe Firefly: use for text additions, background cleanup, brand overlays
- Upscale to 4K+ if needed (Topaz Gigapixel or Midjourney upscaler)

**Step 5 — Export:**

| Type | Spec |
|------|------|
| Master | PNG, 3000×3000px minimum, sRGB |
| Web | JPEG 85% quality |
| Social | platform-specific crops (see Section 6) |
| Animated | export as MP4 loop (3–10 sec) or GIF |

### 4.2 Tool Selection Guide

*(Full rankings and notes in Section 3.2 — Music Production AI Workflow)*

| Tool | Best For | Access |
|------|----------|--------|
| Midjourney v6+ | High-quality artistic renders, atmospheric/moody work | midjourney.com |
| Flux Pro / Flux Ultra | Photorealistic, fast, highly detailed | fal.ai, Replicate, ComfyUI |
| DALL-E 3 / GPT-4o | Cleaner composition, text integration, quick iterations | ChatGPT Plus or API |
| Ideogram v2 | Posters/flyers with legible text in-image | ideogram.ai |
| Adobe Firefly 3 | Brand-safe generation, Photoshop integration | Creative Cloud |
| Stable Diffusion 3.5 | Full local control, custom LoRA models, batch generation | ComfyUI / Automatic1111 |

**ANIMAL's default visual stack:** Midjourney or Flux Pro for primary artwork → Ideogram for text-heavy assets → Adobe Firefly for cleanup → Stable Diffusion for batch social variants

### 4.3 Prompt Templates by Asset Type

**Single Track Artwork**

```
[mood] electronic music artwork, [main visual element], [color palette], 
cinematic lighting, ultra-detailed, 4K, square format, no text, 
professional album cover aesthetic --ar 1:1 --v 6 --style raw
```

**EP/Album Cover**

```
[artist alias] themed artwork, [concept/theme], [color palette], 
abstract [visual metaphor], atmospheric depth, dark background, 
professional music packaging, photorealistic textures --ar 1:1 --v 6
```

**Event Poster/Flyer**

```
Dark nightclub poster aesthetic, [event name] [date placeholder], 
[venue vibe: underground/warehouse/festival], neon [color] light beams, 
fog machine atmosphere, crowd silhouettes, dramatic stage lighting, 
high contrast, editorial style --ar 9:16 --v 6
```

**Social Media Visual (Square)**

```
Bold graphic artwork for social media, [mood] electronic music,
[key element], [2–3 color palette], modern minimalist composition,
eye-catching, mobile-first framing --ar 1:1 --v 6
```

**Animated Visual / Loop Art**

```
Seamlessly looping abstract [visual element] animation concept,
[color palette], hypnotic motion, electronic music aesthetic,
designed as a 3–5 second loop, VJ-ready, dark background
```
*[Generate as static → animate in Runway ML or Pika Labs]*

### 4.4 ANIMAL Brand Style Guide (AI Visual Consistency)

**Core aesthetic:** Dark, cinematic, high-energy. Underground credibility meets major label polish.

**Color palette:**

| Role | Color | Hex |
|------|-------|-----|
| Primary | Deep black | #0A0A0A |
| Primary | Electric blue | #0066FF |
| Accent | Neon white | #F5F5F5 |
| Accent | Acid yellow | #CCFF00 |

**Avoid:** pastels, flat bright colors, overly "pop" aesthetics

**Visual motifs to use:**

- Sound waves, laser grids, urban architecture
- Abstract particle fields, silhouetted figures
- Fog/haze, vinyl/analog textures

**Visual motifs to avoid:**

- Generic stock photo vibes
- Overly literal illustrations
- Cartoonish styles
- Serif-heavy typography overlays

**Typography in AI art:** Keep text out of AI generation — add in Photoshop/Canva/After Effects for consistency. Font family: bold grotesque (e.g., Bebas Neue, Monument Extended, or custom type)

**Consistency checklist before publishing:**

- [ ] Dark background (or intentional light treatment)
- [ ] Color palette matches brand
- [ ] No AI artifacts on faces/hands (fix in Photoshop or regenerate)
- [ ] Readable at thumbnail size
- [ ] Aspect ratio correct for platform

---

## 5. Written Content AI Workflow

### 5.1 Press Release Pipeline

```
TRACK INFO  →  DRAFT  →  REVIEW  →  LOCALIZE  →  DISTRIBUTE
```

**Inputs required:**

- Track/EP/album name
- Release date
- Label / distributor
- Genre, BPM, key influences
- 2–3 quotes from ANIMAL
- Booking/management contact info
- Any notable collaborators, Crooklyn Clan credits

**Workflow:**

1. Fill out press-release-brief.md template (see /workspace/templates/)
2. Prompt Content Agent: "Write a press release for [track], using the brief in [file path]"
3. PriScylla reviews for voice consistency, factual accuracy, tone
4. ANIMAL approves or requests edits
5. Distribute via: Submithub, music blogs (direct email), DSP press contacts, Crooklyn Clan network

**Tone:** Authoritative but not stiff. The press release should feel like it's coming from a 25-year vet who doesn't need to prove himself — but still gives context for the uninitiated.

### 5.2 Bio Updates & EPK Writing

**Bio tiers to maintain:**

| Length | Use Case |
|--------|----------|
| Short (50 words) | Spotify, social profiles, festival programs |
| Medium (150 words) | Press, bookings, event promoters |
| Long (400+ words) | EPK, press kits, Wikipedia-style reference |
| Third-person narrative | Intro DJs, podcast intros, award submissions |

**Update triggers:** New major release, notable credit added, new residency/venue, significant booking milestone.

**EPK components (all AI-assisted):**

- Artist bio (all tiers)
- Press release for current single/EP
- Selected press quotes (curated)
- Tech rider summary
- Booking contact block
- Embedded streaming links
- Hi-res photo references

### 5.3 Social Media Caption Tone Guides

| Platform | Tone | Length | Style Notes |
|----------|------|--------|-------------|
| Instagram | Personal, hype, visual-led | 1–3 lines + hashtags | Use emojis selectively; strong first line |
| TikTok | Casual, hook-first, conversational | Very short or none | Let the video speak; caption = CTA |
| X / Twitter | Sharp, direct, cultural | 1 sentence to 280 chars | Wit > verbosity; engage the discourse |
| Facebook | Informative, slightly longer | 2–4 lines | Community-focused; event promotion friendly |
| YouTube | Descriptive, SEO-rich | 150–300 words | Include all relevant keywords, links, timestamps |

### 5.4 Email Newsletter Drafts

**Structure:**

1. Subject line (A/B test 2 options)
2. Preview text (40–90 chars)
3. Opening hook (1 line, personal)
4. Main content block (new release / event / story)
5. CTA (stream this / grab tickets / reply to this email)
6. Closing (signature, socials)

**Cadence:** Bi-weekly minimum. Spike around releases (1 week before + day-of).

**Tone:** Like ANIMAL is talking directly to his core fans — people who've been in the crowd since the Playboy Mansion days and the new listeners who just found him.

### 5.5 Booking Inquiry Responses

**Standard response template flow:**

1. Acknowledge the inquiry warmly but professionally
2. Confirm date/venue availability (manually check calendar)
3. State technical and hospitality rider in brief
4. Direct to full rider document
5. Quote fee range or defer to booking rep
6. Set follow-up timeline (48-hour reply window)

**Prompt for Content Agent:**

> "Draft a professional booking inquiry response for an event on [date] at [venue], [city]. Event type: [club night / festival / private]. Include a brief artist intro and request for their production specs. Tone: professional, warm, no-nonsense."

### 5.6 Artist Statement & Interview Prep

**Keep a running interview-prep.md file with:**

- 5 go-to talking points (craft, career, influences)
- Answers to 10 most common interview questions
- Crooklyn Clan story talking points
- Current project elevator pitch (updated each release cycle)
- "Off limits" topics list

**AI assist:** Before any interview, prompt PriScylla: "Review interview-prep.md and brief me for a [podcast / magazine / video] interview focused on [topic/release]."

---

## 6. Video Content AI Workflow

### 6.1 Lyric Video / Visualizer Pipeline

```
AUDIO MASTER  →  BRIEF  →  VISUAL GENERATION  →  SYNC  →  EXPORT
```

**Tools:**

| Tool | Use Case |
|------|----------|
| Sora (OpenAI) | Cinematic video generation, coherent long-form scenes, camera control |
| Kling AI v2 | Realistic motion, strong physics, excellent for human/dancer footage |
| Runway ML Gen-3 Alpha | Motion brush, image-to-video, creative clip generation |
| Pika Labs 2.0 | Fast video generation, good for abstract/particle visuals, effects |
| Luma Dream Machine | Image-to-video (animate album art) |
| Vizzy / Riffusion Visualizer | Auto-reactive visualizers from audio waveforms |
| After Effects + AI plugins | For pro-grade lyric videos with beat-synced animations |
| Hedra | Talking head / lip sync — use for "artist statement" content |

**Visualizer workflow (quick):**

1. Export final audio master (WAV)
2. Run through Vizzy or similar for auto-reactive base
3. Layer AI-generated clips (Runway ML / Pika) as B-roll
4. Add track info/lyrics in After Effects or CapCut
5. Export: 1920×1080 H.264 for YouTube; 1080×1920 for Reels/TikTok cuts

### 6.2 Short-Form Video (Reels / TikTok)

| Tool | Use Case |
|------|----------|
| CapCut AI | Auto-cut to beat, captions, transitions, templates |
| Runway ML Gen-3 | B-roll generation, background replacement, slow-mo |
| Pika Labs 2.0 | Quick AI clip generation for visual accents, effects |
| Kling AI v2 | Realistic human movement clips, dancer footage |
| Descript | AI transcription + video editing by script |

**Short-form content types:**

| Type | Description |
|------|-------------|
| Drop clip | 15–30 sec peak moment of a set or track |
| Behind the scenes | Studio, soundcheck, gear shots → CapCut auto-edit |
| Transition content | Visual spectacle clips synced to drops |
| DJ perspective | POV booth footage, crowd reaction |

**Workflow:**

1. Raw footage → CapCut AI "Auto-cut to music" with track
2. Add captions (CapCut auto-caption → review for accuracy)
3. Add intro hook text in first 1–2 seconds
4. Export 9:16, under 60 seconds for TikTok/Reels; up to 3 min for YouTube Shorts

### 6.3 Performance Clip Editing Assistance

**Tools:**

| Tool | Feature |
|------|---------|
| Descript | Transcribe, edit by word, remove filler, AI-generated B-roll |
| CapCut AI | Beat sync, auto-crop, color grade presets |
| Adobe Premiere (Sensei AI) | Auto-reframe, scene detection, smart trim |

**Process:**

1. Ingest all raw footage into project folder
2. Use scene detection (Premiere) to auto-chapter
3. Select hero moments manually (drops, crowd reactions, key transitions)
4. AI-assisted color grade (CapCut "Filter" or Premiere Lumetri)
5. Export multi-format: landscape (YouTube), square (IG feed), portrait (Reels/TikTok)

### 6.4 Thumbnail Generation

**Process:**

1. Export key frame from video (high-action moment)
2. Run through Midjourney or Firefly for enhanced/stylized version (optional)
3. Overlay in Canva or Photoshop: track name, bold typography, brand colors
4. A/B test thumbnails using YouTube's built-in test feature

**Thumbnail rules:**

- High contrast, readable at small size
- Human face or dramatic visual = higher CTR
- Brand-consistent color treatment
- Text: max 3–4 words, huge font

---

## 7. Social Media AI Workflow

### 7.1 Content Calendar Automation

**Setup:** Maintain `/workspace/content/content-calendar.md` with 4-week rolling plan.

**Structure per post:**

| Field | Value |
|-------|-------|
| Date | |
| Platform | |
| Type | |
| Asset file | |
| Caption | |
| Status | |

**Content types to rotate:**

- New release push (stream link + artwork)
- Behind the scenes (studio/booth)
- Throwback / archive content
- Industry news reaction
- Fan engagement (question, poll)
- Event announcement / countdown
- Educational / music craft content

**Cadence targets:**

| Platform | Target Frequency |
|----------|-----------------|
| Instagram | 4–5x/week (mix feed + stories) |
| TikTok | 5–7x/week |
| X/Twitter | 1–2x/day |
| Facebook | 3–4x/week |
| YouTube | 1–2x/week (Shorts daily if possible) |

### 7.2 Caption Generation by Platform

**Prompt workflow:**

Provide Content Agent with: platform + asset type + track/event name + 1–2 key facts → get 3 caption options → ANIMAL picks or edits.

**Platform-specific guidelines:**

**Instagram:**
- Hook in first line (before "more" cutoff)
- 3–5 relevant emojis max
- 10–20 hashtags (first comment or end of caption)
- Tagging strategy: venue, collaborators, labels

**TikTok:**
- Caption = hook or CTA only ("Turn this up 🔊" / "Which set do you want next?")
- 3–5 hashtags including niche dance/DJ tags
- Trending audio integration where relevant

**X / Twitter:**
- One strong declarative sentence or rhetorical question
- Quote or cultural moment hook
- No hashtag spam — 1–2 max, only if trending

**Facebook:**
- Slightly longer, include event logistics if relevant
- Link previews pull well — include clean URL
- Tag venue pages, fan groups

**YouTube:**
- Full description: who, what, where, when + all links
- Timestamps for longer content
- Subscribe/notification CTA
- Keyword-rich (genre, city, event name)

### 7.3 Hashtag Strategy

**Core hashtags (always-on):**

```
#ANIMAL #DJAnimal #ElectronicMusic #DJLife #HouseMusic
#TechHouse #ProgressiveHouse #EDM #DJ #LiveSet
```

**Release-specific (generate per track):**

```
#[TrackName] #[Genre] #[Label] #NewMusic #OutNow #[Mood]
```

**Discovery/growth tags (rotate):**

```
#DJSet #ClubMusic #NightlifeMusic #UndergroundHouse
#CrooklynClan #Mashup #RemixCulture #BoiseMusic
```

**Location-specific:**

```
#Boise #BoiseIDaho #MountainTime #WesternEDM
```

**Hashtag research tools:** Flick.tech (IG), Tokboard (TikTok), RiteTag (X)

### 7.4 Posting Schedule Optimization

**Best posting times (Mountain Time):**

| Platform | Best Days | Best Times (MDT) |
|----------|-----------|------------------|
| Instagram | Tue, Thu, Fri | 7–9 AM, 11 AM–1 PM, 7–9 PM |
| TikTok | Tue–Fri | 7–9 AM, 12–3 PM, 7–11 PM |
| X/Twitter | Mon–Thu | 8–10 AM, 12–1 PM |
| Facebook | Wed, Thu, Fri | 9 AM–12 PM, 1–3 PM |
| YouTube | Thu, Fri, Sat | 2–4 PM |

**Tools for scheduling:**

- Later — IG, TikTok, Facebook, Pinterest scheduling + analytics
- Buffer — Cross-platform, good analytics, simple interface
- Metricool — All-in-one scheduling + deep analytics

---

## 8. Analytics & Reporting AI Workflow

### 8.1 Weekly Automated Reporting Setup

PriScylla runs a weekly report every Monday morning (8 AM MDT) pulling from:

- Spotify for Artists (streams, listeners, saves, playlist adds)
- Chartmetric (cross-platform trends, playlist tracking, audience demographics)
- Soundcharts (radio/TV monitoring, editorial playlist activity)
- Social analytics (IG Insights, TikTok Analytics, YouTube Studio)

**Output:** `/workspace/reports/weekly-YYYY-MM-DD.md` with executive summary + key numbers.

### 8.2 Tools Reference

| Tool | What It Tracks | Access Level |
|------|----------------|--------------|
| Spotify for Artists | Streams, listeners, saves, city data, playlist adds | Free (artist login) |
| Chartmetric | All DSPs + social, playlist tracking, audience insights, trend scoring | Paid (Chartmetric Pro) |
| Soundcharts | Real-time streaming + radio/TV monitoring, playlist editorial | Paid |
| Instagram Insights | Reach, engagement rate, follower growth, top posts | Free (via Meta Business Suite) |
| TikTok Analytics | Views, followers, engagement, traffic sources | Free (Creator account) |
| YouTube Studio | Watch time, subscribers, revenue, impressions CTR | Free |
| Metricool | Unified social + blog analytics, competitor tracking | Freemium |

### 8.3 KPI Dashboard

**Weekly Checks ✅**

- Spotify: streams vs. prior week, top markets, playlist adds/drops
- Instagram: reach, profile visits, follower delta
- TikTok: video views, follower count, top content
- YouTube: views, watch time, new subscribers
- Chartmetric Score: trending up or down?
- Any editorial playlist adds/removals?

**Monthly Checks 📊**

- All-platform stream totals (MoM comparison)
- Audience demographics (age, location, gender breakdown)
- Top markets — are we growing in target cities?
- Revenue summary: streaming royalties estimate, sync/licensing activity
- Social follower growth rate (are we accelerating or stalling?)
- Engagement rate by platform (1–3% healthy; 3–6% strong; 6%+ exceptional)
- Chartmetric: Peer benchmarking against similar artists
- Booking inquiry volume and conversion rate

**Quarterly Reviews 🔭**

- Full revenue audit across all channels
- Catalog performance (which tracks are still getting streams?)
- DSP algorithm health (are we getting editorial consideration?)
- Audience overlap analysis (where fans follow you across platforms)
- Campaign ROI on any paid promotion
- Strategy adjustment for next quarter

### 8.4 How AI Agents Pull & Interpret Data

**Manual export + AI interpretation:**

1. Export CSV/PDF from each platform weekly
2. Store in `/workspace/reports/raw/`
3. Prompt Analytics Agent: "Analyze this week's Spotify data vs. last week. What's growing, what's declining, and what should ANIMAL focus on?"
4. Agent returns: 3–5 bullet summary + 1–2 action recommendations
5. PriScylla consolidates into weekly report

**Automation note:** Chartmetric and Soundcharts have API access — when ready to automate, the Analytics Agent can pull data directly via API calls and auto-generate reports without manual CSV exports.

---

## 9. Prompt Library

Ready-to-use prompt templates. Fill in [brackets] before sending. Copy directly to PriScylla or the relevant sub-agent.

### 📢 Press & PR

**P1 — Press Release**

> "Write a professional press release for ANIMAL's new [single/EP/album] titled '[title]'. Release date: [date]. Genre: [genre]. Key facts: [3 bullet points]. Include a quote from ANIMAL: '[quote]'. Distribution: [label/distributor]. Booking contact: [email]. Tone: authoritative, 25-year vet energy, accessible to non-fans."

**P2 — Short Bio Refresh**

> "Update ANIMAL's 50-word bio. Current version: [paste current bio]. New info to add: [new credit/release/milestone]. Keep the energy sharp and credible."

**P3 — EPK Artist Statement**

> "Write a 300-word artist statement for ANIMAL's EPK. Themes to include: musical journey, Crooklyn Clan work, genre versatility, Boise base, future direction. Tone: personal, confident, story-driven."

### 📸 Visual / Artwork

**V1 — Midjourney Single Artwork**

> "Create a Midjourney prompt for dark electronic single artwork. Track: '[title]'. Mood: [dark/euphoric/raw/hypnotic]. Key visual: [e.g., neon cityscape / abstract waveform / laser grid]. Colors: [primary palette]. Style: cinematic, ultra-detailed, professional album cover, no text. --ar 1:1 --v 6 --style raw"

**V2 — Event Flyer Concept**

> "Generate a Midjourney prompt for an event flyer for [event name] at [venue], [city], on [date]. Vibe: [underground club / rooftop festival / warehouse rave]. Colors: [palette]. Must feel: dark, high energy, professional. --ar 9:16 --v 6"

**V3 — Social Media Visual Set**

> "Generate 3 Midjourney prompt variations for social media visuals promoting '[track name]'. Each should use the same color palette ([colors]) but different compositions: one abstract, one architectural, one motion-blur aesthetic. All --ar 1:1 --v 6"

**V4 — Animated Loop Brief**

> "Describe a 5-second seamlessly looping visual concept for '[track name]'. Mood: [adjective]. Key element: [e.g., pulsing sound waves / light tunnel / particle explosion]. Colors: [palette]. This will be generated in Runway ML — describe the motion, starting frame, and loop point."

### 🎵 Music Production

**M1 — Stem Separation Brief**

> "I need to isolate vocals from '[track name]' by [original artist] for a mashup. Recommend whether to use Moises, AudioShake, or RipX for this specific use case, and outline the workflow steps."

**M2 — Suno/Udio Sample Prompt**

> "Generate a Suno prompt for a [genre] placeholder bed at [BPM] BPM. Energy: [build/peak/breakdown]. Key elements: [e.g., punchy kick, sub bass, rising synth pad]. References: [2 artist names]. Output should be usable as a structural demo."

**M3 — Mastering Brief for LANDR**

> "Prepare mastering notes for '[track name]'. Genre: [genre]. Target loudness: -14 LUFS. Special instructions: [e.g., preserve low-end weight / don't over-compress the dynamics / bright high end]. Reference tracks: [2 titles]."

### 📱 Social Media

**S1 — Instagram Caption (New Release)**

> "Write 3 Instagram captions for the release of '[track name]'. Streaming now on all platforms. Include: hype, 1–2 key facts about the track, CTA to stream. Tone: ANIMAL's voice — direct, authentic, no fluff. Each option under 150 characters before hashtags."

**S2 — TikTok Caption**

> "Write 5 TikTok captions for a DJ set clip from [event/venue]. Each should be under 100 characters and end with a CTA or engagement hook. Options should range from hype to curious to funny."

**S3 — X/Twitter Post**

> "Write 3 tweet options for [context: new release / show announcement / industry opinion]. Each under 240 characters. Tone: sharp, no hashtag spam, culturally aware. One should be conversational, one declarative, one a question."

**S4 — YouTube Description**

> "Write a full YouTube description for '[video title]'. Include: what the video is, key moments with timestamps (placeholder format), artist bio link, streaming links, social handles, subscribe CTA. SEO keywords: [genre], [city], [event name], DJ set, electronic music."

**S5 — Content Calendar Block**

> "Build a 2-week social media content calendar for ANIMAL around the release of '[track name]' dropping on [date]. Include pre-release buildup (teaser, countdown), release day blitz, and post-release sustain. Format as a table: Date | Platform | Content Type | Caption Direction | Asset Needed."

### 📧 Email & Outreach

**E1 — Newsletter**

> "Draft an email newsletter for ANIMAL's list. Subject: new release of '[track name]'. Include: personal hook from ANIMAL's perspective, track story (2–3 sentences), streaming CTA, upcoming shows teaser, sign-off. Tone: talking to day-one fans. Under 300 words in body."

**E2 — Booking Inquiry Response**

> "Draft a professional booking inquiry response. Event: [type] at [venue], [city] on [date]. Respond professionally, include brief artist intro, confirm interest, request production specs and offer, state 48-hour follow-up. Tone: experienced, no-nonsense, collaborative."

**E3 — Collaboration Pitch**

> "Write a cold outreach email to [DJ/producer name] pitching a collaboration on a [genre] project. Angle: ANIMAL's Crooklyn Clan credentials and mashup expertise. Keep it under 150 words, respect their time, propose a specific next step."

### 📊 Analytics

**A1 — Weekly Data Summary**

> "Analyze this Spotify for Artists weekly data: [paste or attach CSV]. Compare to the prior week. Identify: top growing tracks, markets showing movement, playlist activity, and 2 action recommendations. Format as a brief executive summary."

**A2 — Social Performance Review**

> "Review these social analytics for the past 30 days: [paste data or attach]. Platforms: [IG/TikTok/X/YouTube]. Identify: best-performing content types, engagement rate trends, audience growth, and what content to do more or less of."

**A3 — Release Performance Report**

> "Compile a 30-day performance report for '[track name]' released on [date]. Data sources: [list available]. Cover: total streams, playlist adds, social engagement on release content, Chartmetric score movement, and overall assessment: exceeds/meets/below expectation for this tier."

### 🎤 Interview & Narrative

**I1 — Interview Prep Brief**

> "Review my interview-prep.md and prepare a briefing for a [podcast / magazine / live video] interview focused on [topic: new release / career retrospective / DJ craft]. Give me: 5 talking points, 3 memorable one-liners, and 2 stories I should tell."

**I2 — Award/Submission Bio**

> "Write a 100-word third-person bio for ANIMAL for submission to [festival/award/conference]. Emphasize: [Crooklyn Clan work / longevity / genre range / specific credential]. Tone: formal enough for submission, but doesn't lose the personality."

---

*Document maintained by PriScylla 🦞 | Update this file when new tools are adopted, workflows change, or new prompt templates prove effective.*

*Version 1.2 | 2026-03-13 — Added DJ Automation Software + Music Production AI workflow sections; updated image/video tool stacks to 2026 best-in-market*
