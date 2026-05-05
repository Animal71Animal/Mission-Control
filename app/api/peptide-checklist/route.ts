/**
 * Mission Control - Peptide Checklist API
 * GitHub API-backed: always live, no deploy needed
 */
import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = "Animal71Animal/Mission-Control";
const GITHUB_BRANCH = "main";
const FILE_PATH = "public/data/peptide-checklist-state.json";
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;

function ghHeaders() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function fetchFile() {
  const res = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders(), cache: "no-store" });
  if (res.status === 404) return { data: {}, sha: null };
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const json = await res.json();
  return { data: JSON.parse(Buffer.from(json.content, "base64").toString("utf-8")), sha: json.sha };
}

async function writeFile(data: Record<string, boolean>, sha: string | null, msg: string) {
  const encoded = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
  const body: any = { message: msg, content: encoded, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: ghHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
}

export async function GET() {
  try {
    const { data } = await fetchFile();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, sha } = await fetchFile();
    const updated = { ...data, ...body };
    await writeFile(updated, sha, "fix: update peptide checklist state");
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save checklist" }, { status: 500 });
  }
}
