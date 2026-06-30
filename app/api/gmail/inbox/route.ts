/**
 * Mission Control - Gmail Inbox API
 * Reads gmail-inbox.json (written by wlp/projects/gmail-integration/src/gmail_fetch.py)
 * GitHub-backed via public/data/, same pattern as SRB tips
 */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/gmail-inbox.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'gmail-inbox.json');

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
    console.error('[gmail] Local read failed:', e);
  }
  return null;
}

export async function GET() {
  try {
    const data = await fetchFromGitHub();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[gmail] GitHub failed, falling back to local:', err);
    const localData = fetchFromLocal();
    if (localData) return NextResponse.json(localData);
    return NextResponse.json(
      { fetchedAt: null, count: 0, unreadCount: 0, messages: [], status: 'no-data' },
      { status: 200 }
    );
  }
}
