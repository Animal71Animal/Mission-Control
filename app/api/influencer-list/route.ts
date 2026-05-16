/**
 * Mission Control - Influencer List API
 * GitHub API-backed: reads/writes public/data/influencer-list.json in the repo.
 * All mutations commit directly to GitHub so data persists across deploys/devices.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_FILE_PATH = 'public/data/influencer-list.json';
const GITHUB_BRANCH = 'main';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'influencer-list.json');

export interface SocialProfile {
  handle: string;
  followers: string;
}

export interface Influencer {
  id: string;
  name: string;
  instagram?: SocialProfile;
  tiktok?: SocialProfile;
  twitter?: SocialProfile;
  youtube?: SocialProfile;
  facebook?: SocialProfile;
  status: 'active' | 'contacted' | 'pending' | 'passed';
  notes: string;
}

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFromGitHub(): Promise<{ influencers: Influencer[]; sha: string }> {
  const res = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
    headers: ghHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  const influencers: Influencer[] = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { influencers, sha: data.sha };
}

async function writeToGitHub(influencers: Influencer[], sha: string, message: string): Promise<void> {
  const res = await fetch(GITHUB_API_URL, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(influencers, null, 2)).toString('base64'),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

function fetchFromLocal(): Influencer[] | null {
  try {
    if (fs.existsSync(LOCAL_PATH)) return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8'));
  } catch (e) {
    console.error('[influencer-list] Local read failed:', e);
  }
  return null;
}

function writeToLocal(influencers: Influencer[]) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(influencers, null, 2));
  } catch (e) {
    console.error('[influencer-list] Local write failed:', e);
  }
}

export async function GET() {
  try {
    const { influencers } = await fetchFromGitHub();
    return NextResponse.json(influencers);
  } catch (err) {
    console.error('[GET /api/influencer-list] GitHub failed, falling back to local:', err);
    const local = fetchFromLocal();
    return NextResponse.json(local ?? []);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let influencers: Influencer[], sha: string;
    try {
      ({ influencers, sha } = await fetchFromGitHub());
    } catch {
      influencers = fetchFromLocal() ?? [];
      sha = '';
    }

    const newInfluencer: Influencer = {
      id: `inf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: body.name ?? '',
      status: body.status ?? 'pending',
      notes: body.notes ?? '',
      ...(body.instagram?.handle ? { instagram: body.instagram } : {}),
      ...(body.tiktok?.handle ? { tiktok: body.tiktok } : {}),
      ...(body.twitter?.handle ? { twitter: body.twitter } : {}),
      ...(body.youtube?.handle ? { youtube: body.youtube } : {}),
      ...(body.facebook?.handle ? { facebook: body.facebook } : {}),
    };

    const updated = [...influencers, newInfluencer];
    if (sha) await writeToGitHub(updated, sha, `feat: add influencer "${newInfluencer.name}"`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true, influencer: newInfluencer });
  } catch (err) {
    console.error('[POST /api/influencer-list]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...changes } = body;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    let influencers: Influencer[], sha: string;
    try {
      ({ influencers, sha } = await fetchFromGitHub());
    } catch {
      influencers = fetchFromLocal() ?? [];
      sha = '';
    }

    const idx = influencers.findIndex((i) => i.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const updated = [...influencers];
    updated[idx] = { ...influencers[idx], ...changes };
    if (sha) await writeToGitHub(updated, sha, `fix: update influencer "${updated[idx].name}"`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true, influencer: updated[idx] });
  } catch (err) {
    console.error('[PATCH /api/influencer-list]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    let influencers: Influencer[], sha: string;
    try {
      ({ influencers, sha } = await fetchFromGitHub());
    } catch {
      influencers = fetchFromLocal() ?? [];
      sha = '';
    }

    const updated = influencers.filter((i) => i.id !== id);
    if (sha) await writeToGitHub(updated, sha, `chore: delete influencer ${id}`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    console.error('[DELETE /api/influencer-list]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
