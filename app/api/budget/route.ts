/**
 * Mission Control - Budget Tracker API
 * GitHub-backed: reads/writes budget-transactions.json via GitHub Contents API
 */
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/budget-transactions.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

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
  return {
    content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')),
    sha: data.sha,
  };
}

export async function GET() {
  try {
    const { content } = await fetchFromGitHub();
    return NextResponse.json(content);
  } catch (err) {
    console.error('[budget] GitHub failed:', err);
    return NextResponse.json({ transactions: [], last_updated: null }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sha } = await fetchFromGitHub();
    const encoded = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: ghHeaders(),
      body: JSON.stringify({
        message: `chore: update budget transactions ${new Date().toISOString().slice(0, 10)}`,
        content: encoded,
        sha,
        branch: GITHUB_BRANCH,
      }),
    });
    if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[budget] PUT failed:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
