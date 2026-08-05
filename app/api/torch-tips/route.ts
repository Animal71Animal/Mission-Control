/**
 * Mission Control - The Torch Tips API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/torch-tips.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'torch-tips.json');

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFromGitHub() {
  const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

function fetchFromLocal() {
  try {
    if (fs.existsSync(LOCAL_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('[torch-tips] Local read failed:', e);
  }
  return null;
}

export async function GET() {
  try {
    const data = await fetchFromGitHub();
    return NextResponse.json({ ...data, lastUpdated: data.last_updated || new Date().toISOString() });
  } catch (err) {
    console.error('[torch-tips] GitHub failed, falling back to local:', err);
    const localData = fetchFromLocal();
    if (localData) {
      return NextResponse.json({ ...localData, lastUpdated: localData.last_updated || new Date().toISOString() });
    }
    return NextResponse.json({ club: 'The Torch', monthlyTotals: [], topTippers: [], allDancers: [], nightlyData: {}, last_updated: null, lastUpdated: new Date().toISOString() }, { status: 200 });
  }
}
