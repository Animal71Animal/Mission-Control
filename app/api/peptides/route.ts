/**
 * Mission Control - Peptides API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchGHFile(path: string) {
  const res = await fetch(`${BASE}/${path}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub GET failed for ${path}: ${res.status}`);
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha };
}

async function writeGHFile(path: string, content: unknown, sha: string, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await fetch(`${BASE}/${path}`, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed for ${path}: ${res.status}`);
}

// GET - returns both stack and checkins
export async function GET() {
  try {
    const [stack, checkins] = await Promise.all([
      fetchGHFile('public/data/peptide-stack.json'),
      fetchGHFile('public/data/peptide-checkins.json'),
    ]);
    return NextResponse.json({ stack: stack.content, checkins: checkins.content });
  } catch (err) {
    return NextResponse.json({ stack: [], checkins: [] }, { status: 500 });
  }
}

// PATCH - toggle a dose check-in
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekId, date, doseIndex, checked } = body;
    const { content, sha } = await fetchGHFile('public/data/peptide-checkins.json');
    
    const updated = content.map((week: any) => {
      if (week.id !== weekId) return week;
      const day = week.checkIns[date];
      if (!day) return week;
      const newDoses = [...day.doses];
      newDoses[doseIndex] = { ...newDoses[doseIndex], taken: checked };
      return { ...week, checkIns: { ...week.checkIns, [date]: { ...day, doses: newDoses } } };
    });

    await writeGHFile('public/data/peptide-checkins.json', updated, sha, `fix: peptide checkin week ${weekId} ${date} dose ${doseIndex}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
