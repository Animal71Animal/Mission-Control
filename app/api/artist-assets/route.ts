/**
 * Mission Control v2 - Artist Assets API
 * GitHub-backed (no redeploy needed for data updates)
 */

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "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";
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const FILE_PATH = "public/data/artist-assets.json";

export interface ArtistAsset {
  id: string;
  artist_name: string;
  asset_type: string;
  status: string;
  url?: string | null;
  notes?: string | null;
  created_at: string;
}

async function getFileFromGitHub(): Promise<{ assets: ArtistAsset[]; sha: string }> {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` }, cache: "no-store" }
  );
  if (!response.ok) return { assets: [], sha: "" };
  const data = await response.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { assets: JSON.parse(content), sha: data.sha };
}

async function saveToGitHub(assets: ArtistAsset[], sha: string, message: string) {
  await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(JSON.stringify(assets, null, 2)).toString("base64"),
        sha,
      }),
    }
  );
}

// GET /api/artist-assets
export async function GET(request: NextRequest) {
  try {
    const artist = request.nextUrl.searchParams.get('artist');
    let { assets } = await getFileFromGitHub();
    if (artist) assets = assets.filter((a) => a.artist_name === artist);
    return NextResponse.json(assets);
  } catch (err) {
    console.error('[GET /api/artist-assets]', err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST /api/artist-assets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assets, sha } = await getFileFromGitHub();
    const newAsset: ArtistAsset = {
      id: body.id || `asset-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...body,
    };
    assets.push(newAsset);
    await saveToGitHub(assets, sha, `Add artist asset: ${newAsset.id}`);
    return NextResponse.json({ success: true, asset: newAsset });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create asset', detail: String(err) }, { status: 500 });
  }
}

// PATCH /api/artist-assets
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { assets, sha } = await getFileFromGitHub();
    const idx = assets.findIndex((a) => a.id === body.id);
    if (idx === -1) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    assets[idx] = { ...assets[idx], ...body };
    await saveToGitHub(assets, sha, `Update artist asset: ${body.id}`);
    return NextResponse.json({ success: true, asset: assets[idx] });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update asset', detail: String(err) }, { status: 500 });
  }
}

// DELETE /api/artist-assets?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { assets, sha } = await getFileFromGitHub();
    const filtered = assets.filter((a) => a.id !== id);
    await saveToGitHub(filtered, sha, `Delete artist asset: ${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete asset', detail: String(err) }, { status: 500 });
  }
}
