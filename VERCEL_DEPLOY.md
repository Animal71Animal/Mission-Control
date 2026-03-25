# Vercel Deployment Guide

## Prerequisites
1. Create account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. Or use GitHub integration (recommended)

## Environment Variables (Required)
Add these in Vercel dashboard → Project Settings → Environment Variables:

```
GOOGLE_API_KEY=your_google_api_key
NEWS_API_KEY=167ccb3accaa4d58a357dc703cc2fbed
```

## Deployment Steps

### Option 1: GitHub Integration (Recommended)
1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repo
4. Framework Preset: Next.js
5. Add environment variables
6. Deploy

### Option 2: Vercel CLI
```bash
cd /home/ubuntu/wlp/projects/mission-control
vercel login
vercel --prod
```

## Post-Deployment
- URL will be: `https://mission-control-wlp.vercel.app` (or similar)
- Custom domain can be added in Vercel settings
- Automatic deployments on every git push

## Features Enabled with Vercel
✅ Live Calendar sync (Google Calendar API)
✅ Task CRUD operations (read/write to tasks.json)
✅ Live Drive folder list
✅ Unfiltered analysis API
✅ Server-side API routes
✅ Responsive design (mobile/tablet/desktop)

## Mobile Responsiveness
- Sidebar collapses to hamburger menu on mobile (< 768px)
- Content adjusts padding for touch devices
- Grid layouts stack vertically on small screens
- Touch-friendly button sizes
