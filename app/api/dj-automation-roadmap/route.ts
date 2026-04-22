import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_FILE_PATH = 'public/data/dj-automation-roadmap.json';
const GITHUB_BRANCH = 'main';
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

    const res = await fetch(`${GITHUB_API_BASE}?ref=${GITHUB_BRANCH}`, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch roadmap' }, { status: 500 });
    }

    const data = await res.json();
    const roadmap = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));

    return NextResponse.json(roadmap);
  } catch (err) {
    console.error('Roadmap API error:', err);
    return NextResponse.json({ error: 'Failed to load roadmap' }, { status: 500 });
  }
}
