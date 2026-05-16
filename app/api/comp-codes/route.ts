/**
 * Mission Control - Complimentary Entry Codes API
 * GitHub API-backed: reads/writes public/data/comp-codes.json in the repo.
 * All mutations commit directly to GitHub so data persists across deploys/devices.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_FILE_PATH = 'public/data/comp-codes.json';
const GITHUB_BRANCH = 'main';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'comp-codes.json');

export interface CompCode {
  id: string;
  code: string;
  recipientName: string;
  issuedDate: string;
  expiryDate: string;
  used: boolean;
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

async function fetchFromGitHub(): Promise<{ codes: CompCode[]; sha: string }> {
  const res = await fetch(`${GITHUB_API_URL}?ref=${GITHUB_BRANCH}`, {
    headers: ghHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  const codes: CompCode[] = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return { codes, sha: data.sha };
}

async function writeToGitHub(codes: CompCode[], sha: string, message: string): Promise<void> {
  const res = await fetch(GITHUB_API_URL, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(codes, null, 2)).toString('base64'),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

function fetchFromLocal(): CompCode[] | null {
  try {
    if (fs.existsSync(LOCAL_PATH)) return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8'));
  } catch (e) {
    console.error('[comp-codes] Local read failed:', e);
  }
  return null;
}

function writeToLocal(codes: CompCode[]) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(codes, null, 2));
  } catch (e) {
    console.error('[comp-codes] Local write failed:', e);
  }
}

export async function GET() {
  try {
    const { codes } = await fetchFromGitHub();
    return NextResponse.json(codes);
  } catch (err) {
    console.error('[GET /api/comp-codes] GitHub failed, falling back to local:', err);
    const local = fetchFromLocal();
    return NextResponse.json(local ?? []);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let codes: CompCode[], sha: string;
    try {
      ({ codes, sha } = await fetchFromGitHub());
    } catch {
      codes = fetchFromLocal() ?? [];
      sha = '';
    }

    const newCode: CompCode = {
      id: `cc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: body.code ?? '',
      recipientName: body.recipientName ?? '',
      issuedDate: body.issuedDate ?? new Date().toISOString().split('T')[0],
      expiryDate: body.expiryDate ?? '',
      used: body.used ?? false,
      notes: body.notes ?? '',
    };

    const updated = [newCode, ...codes];
    if (sha) await writeToGitHub(updated, sha, `feat: add comp code "${newCode.code}" for ${newCode.recipientName}`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true, code: newCode });
  } catch (err) {
    console.error('[POST /api/comp-codes]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...changes } = body;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    let codes: CompCode[], sha: string;
    try {
      ({ codes, sha } = await fetchFromGitHub());
    } catch {
      codes = fetchFromLocal() ?? [];
      sha = '';
    }

    const idx = codes.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const updated = [...codes];
    updated[idx] = { ...codes[idx], ...changes };
    if (sha) await writeToGitHub(updated, sha, `fix: update comp code ${id}`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true, code: updated[idx] });
  } catch (err) {
    console.error('[PATCH /api/comp-codes]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    let codes: CompCode[], sha: string;
    try {
      ({ codes, sha } = await fetchFromGitHub());
    } catch {
      codes = fetchFromLocal() ?? [];
      sha = '';
    }

    const updated = codes.filter((c) => c.id !== id);
    if (sha) await writeToGitHub(updated, sha, `chore: delete comp code ${id}`);
    writeToLocal(updated);
    return NextResponse.json({ ok: true, deleted: id });
  } catch (err) {
    console.error('[DELETE /api/comp-codes]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
