/**
 * Mission Control v2 - Artist Assets API
 * Static JSON-backed (Vercel-compatible)
 * Reads from public/data/artist-assets.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export interface ArtistAsset {
  id: string;
  artist_name: string;
  asset_type: string;
  status: string;
  url?: string | null;
  notes?: string | null;
  created_at: string;
}

async function loadAssets(): Promise<ArtistAsset[]> {
  try {
    const filePath = resolve(process.cwd(), 'public/data/artist-assets.json');
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// GET /api/artist-assets — optionally filter by artist_name
export async function GET(request: NextRequest) {
  try {
    const artist = request.nextUrl.searchParams.get('artist');
    let assets = await loadAssets();
    if (artist) {
      assets = assets.filter((a) => a.artist_name === artist);
    }
    return NextResponse.json(assets);
  } catch (err) {
    console.error('[GET /api/artist-assets]', err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/artist-assets — stub
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    return NextResponse.json({ success: true, asset: { id, ...body } });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create asset', detail: String(err) }, { status: 500 });
  }
}

// PATCH /api/artist-assets — stub
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, asset: body });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update asset', detail: String(err) }, { status: 500 });
  }
}

// DELETE /api/artist-assets?id=xxx — stub
export async function DELETE() {
  return NextResponse.json({ success: true });
}
