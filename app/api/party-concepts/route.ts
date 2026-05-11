/**
 * Mission Control - Party Concepts API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/party-concepts-data.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'party-concepts-data.json');

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
  const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
  return decoded;
}

function fetchFromLocal() {
  try {
    if (fs.existsSync(LOCAL_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('[party-concepts] Local read failed:', e);
  }
  return null;
}

export async function GET() {
  try {
    const data = await fetchFromGitHub();
    return NextResponse.json({ ...data, lastUpdated: data.lastUpdated || new Date().toISOString() });
  } catch (err) {
    console.error('[party-concepts] GitHub failed, falling back to local:', err);
    const localData = fetchFromLocal();
    if (localData) {
      return NextResponse.json({ ...localData, lastUpdated: localData.lastUpdated || new Date().toISOString() });
    }
    return NextResponse.json({ concepts: [], lastUpdated: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concepts } = body;
    
    if (!Array.isArray(concepts)) {
      return NextResponse.json({ error: 'concepts array required' }, { status: 400 });
    }

    const payload = {
      concepts,
      lastUpdated: new Date().toISOString(),
    };

    // Try GitHub first
    if (GITHUB_TOKEN) {
      const getRes = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders() });
      const sha = getRes.ok ? (await getRes.json()).sha : undefined;

      const putRes = await fetch(API_URL, {
        method: 'PUT',
        headers: ghHeaders(),
        body: JSON.stringify({
          message: `Update party concepts data — ${new Date().toISOString()}`,
          content: Buffer.from(JSON.stringify(payload, null, 2)).toString('base64'),
          branch: GITHUB_BRANCH,
          ...(sha ? { sha } : {}),
        }),
      });

      if (putRes.ok) {
        return NextResponse.json({ success: true, source: 'github', lastUpdated: payload.lastUpdated });
      }
    }

    // Fallback to local
    fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_PATH, JSON.stringify(payload, null, 2));
    return NextResponse.json({ success: true, source: 'local', lastUpdated: payload.lastUpdated });
  } catch (err) {
    console.error('[party-concepts] POST failed:', err);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
