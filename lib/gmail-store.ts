import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export interface StoredGmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
  fetchedAt: string;
  category?: 'dj-booking' | 'payment' | 'label-business' | 'personal' | 'newsletter' | 'spam';
  categoryReason?: string;
  actionable?: boolean;
  actionExtracted?: boolean;
  actionTitle?: string;
  starred?: boolean;
  archived?: boolean;
  labelIds?: string[];
}

export interface GmailInboxStore {
  fetchedAt: string | null;
  count: number;
  unreadCount: number;
  messages: StoredGmailMessage[];
  status?: string;
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'Animal71Animal/Mission-Control';
const GITHUB_BRANCH = 'main';
const FILE_PATH = 'public/data/gmail-inbox.json';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
const LOCAL_PATH = path.join(process.cwd(), 'public', 'data', 'gmail-inbox.json');

interface InboxSource {
  data: GmailInboxStore;
  sha?: string;
  source: 'github' | 'local';
}

function ghHeaders() {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

function normalizeMessage(message: StoredGmailMessage): StoredGmailMessage {
  const labelIds = Array.isArray(message.labelIds) ? Array.from(new Set(message.labelIds)) : undefined;
  const unread = labelIds ? labelIds.includes('UNREAD') : Boolean(message.unread);
  const starred = labelIds ? labelIds.includes('STARRED') : Boolean(message.starred);
  const archived = labelIds ? !labelIds.includes('INBOX') : Boolean(message.archived);

  return {
    ...message,
    unread,
    starred,
    archived,
    labelIds,
  };
}

function normalizeStore(data: Partial<GmailInboxStore> | null | undefined): GmailInboxStore {
  const messages = Array.isArray(data?.messages)
    ? data!.messages.map((message) => normalizeMessage(message))
    : [];

  return {
    fetchedAt: data?.fetchedAt ?? null,
    count: messages.length,
    unreadCount: messages.filter((message) => message.unread).length,
    messages,
    ...(data?.status ? { status: data.status } : {}),
  };
}

async function readFromGitHub(): Promise<InboxSource> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const response = await fetch(`${API_URL}?ref=${GITHUB_BRANCH}`, {
    headers: ghHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`GitHub GET failed: ${response.status}`);
  }

  const payload = await response.json() as { content?: string; sha?: string };
  const decoded = payload.content
    ? JSON.parse(Buffer.from(payload.content, 'base64').toString('utf-8'))
    : null;

  return {
    data: normalizeStore(decoded),
    sha: payload.sha,
    source: 'github',
  };
}

async function readFromLocal(): Promise<InboxSource> {
  try {
    const raw = await readFile(LOCAL_PATH, 'utf-8');
    return {
      data: normalizeStore(JSON.parse(raw) as GmailInboxStore),
      source: 'local',
    };
  } catch {
    return {
      data: normalizeStore({ fetchedAt: null, count: 0, unreadCount: 0, messages: [], status: 'no-data' }),
      source: 'local',
    };
  }
}

export async function readInboxStore() {
  try {
    return await readFromGitHub();
  } catch {
    return readFromLocal();
  }
}

async function writeToGitHub(data: GmailInboxStore, sha?: string) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  let currentSha = sha;
  if (!currentSha) {
    const current = await readFromGitHub();
    currentSha = current.sha;
  }

  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify({
      message: 'Update Gmail inbox cache',
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      branch: GITHUB_BRANCH,
      sha: currentSha,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub PUT failed: ${response.status}`);
  }
}

async function writeToLocal(data: GmailInboxStore) {
  await writeFile(LOCAL_PATH, JSON.stringify(data, null, 2));
}

export async function writeInboxStore(data: GmailInboxStore, source?: InboxSource) {
  const normalized = normalizeStore(data);

  if (source?.source === 'github' && GITHUB_TOKEN) {
    try {
      await writeToGitHub(normalized, source.sha);
    } catch {
      await writeToLocal(normalized);
    }
    return normalized;
  }

  if (GITHUB_TOKEN) {
    try {
      const latest = await readFromGitHub();
      await writeToGitHub(normalized, latest.sha);
      return normalized;
    } catch {
      await writeToLocal(normalized);
      return normalized;
    }
  }

  await writeToLocal(normalized);
  return normalized;
}

export async function removeInboxMessage(messageId: string) {
  const source = await readInboxStore();
  const before = source.data.messages.length;
  const updated = normalizeStore({
    ...source.data,
    messages: source.data.messages.filter((message) => message.id !== messageId),
  });

  if (updated.messages.length !== before) {
    await writeInboxStore(updated, source);
    return { removed: true, data: updated };
  }

  return { removed: false, data: source.data };
}

export async function updateInboxMessage(
  messageId: string,
  updater: (message: StoredGmailMessage) => StoredGmailMessage,
) {
  const source = await readInboxStore();
  let changed = false;

  const updated = normalizeStore({
    ...source.data,
    messages: source.data.messages.map((message) => {
      if (message.id !== messageId) {
        return message;
      }

      changed = true;
      return normalizeMessage(updater(message));
    }),
  });

  if (changed) {
    await writeInboxStore(updated, source);
  }

  return { updated: changed, data: updated };
}
