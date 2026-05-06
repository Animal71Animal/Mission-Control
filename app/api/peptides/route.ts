/**
 * Mission Control - Peptides API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents`;
const LOCAL_DIR = path.join(process.cwd(), 'public', 'data');

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFromGitHub(filePath: string) {
  const res = await fetch(`${BASE}/${filePath}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub GET failed for ${filePath}: ${res.status}`);
  const data = await res.json();
  return { content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8')), sha: data.sha };
}

function fetchFromLocal(filePath: string) {
  const localPath = path.join(LOCAL_DIR, path.basename(filePath));
  try {
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
    }
  } catch (e) {
    console.error(`[peptides] Local read failed for ${filePath}:`, e);
  }
  return null;
}

function writeToLocal(filePath: string, content: unknown) {
  const localPath = path.join(LOCAL_DIR, path.basename(filePath));
  try {
    fs.writeFileSync(localPath, JSON.stringify(content, null, 2));
    return true;
  } catch (e) {
    console.error(`[peptides] Local write failed for ${filePath}:`, e);
    return false;
  }
}

async function writeToGitHub(filePath: string, content: unknown, sha: string, msg: string) {
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const res = await fetch(`${BASE}/${filePath}`, {
    method: 'PUT', headers: ghHeaders(),
    body: JSON.stringify({ message: msg, content: encoded, sha, branch: GITHUB_BRANCH }),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed for ${filePath}: ${res.status}`);
}

// GET - returns both stack and checkins
export async function GET() {
  try {
    const [stack, checkins] = await Promise.all([
      fetchFromGitHub('public/data/peptide-stack.json'),
      fetchFromGitHub('public/data/peptide-checkins.json'),
    ]);
    return NextResponse.json({ stack: stack.content, checkins: checkins.content });
  } catch (err) {
    console.error('[peptides] GitHub failed, falling back to local:', err);
    const stackLocal = fetchFromLocal('public/data/peptide-stack.json');
    const checkinsLocal = fetchFromLocal('public/data/peptide-checkins.json');
    if (stackLocal || checkinsLocal) {
      return NextResponse.json({ stack: stackLocal || [], checkins: checkinsLocal || [] });
    }
    return NextResponse.json({ stack: [], checkins: [] }, { status: 500 });
  }
}

// PATCH - toggle a dose check-in
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekId, date, doseIndex, checked } = body;
    let content, sha;
    try {
      ({ content, sha } = await fetchFromGitHub('public/data/peptide-checkins.json'));
    } catch {
      content = fetchFromLocal('public/data/peptide-checkins.json') || [];
      sha = null;
    }
    
    const updated = content.map((week: any) => {
      if (week.id !== weekId) return week;
      const day = week.checkIns[date];
      if (!day) return week;
      const newDoses = [...day.doses];
      newDoses[doseIndex] = { ...newDoses[doseIndex], taken: checked };
      return { ...week, checkIns: { ...week.checkIns, [date]: { ...day, doses: newDoses } } };
    });

    if (sha) {
      await writeToGitHub('public/data/peptide-checkins.json', updated, sha, `fix: peptide checkin week ${weekId} ${date} dose ${doseIndex}`);
    }
    writeToLocal('public/data/peptide-checkins.json', updated);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
