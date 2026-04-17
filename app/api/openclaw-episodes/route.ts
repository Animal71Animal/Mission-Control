/**
 * Mission Control - OpenClaw Episodes API
 * GitHub API-backed: always live
 */
import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/openclaw-episodes.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

export async function GET() {
  try {
    const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
    if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
    const data = await res.json();
    const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
    return NextResponse.json(decoded);
  } catch (err) {
    return NextResponse.json({ episodes: [], last_checked: null, total: 0 }, { status: 500 });
  }
}
