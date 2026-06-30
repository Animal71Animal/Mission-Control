'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
  fetchedAt: string;
}

interface GmailPayload {
  fetchedAt: string | null;
  count: number;
  unreadCount: number;
  messages: GmailMessage[];
  status?: string;
}

export default function GmailPage() {
  const [data, setData] = useState<GmailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetch('/api/gmail/inbox', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!data) return <div className="p-6 text-zinc-400">Loading…</div>;

  if (data.status === 'no-data' || data.count === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">📧 Gmail</h1>
        <p className="text-zinc-400 mb-6">Inbox at a glance. Read-only — AI manages nothing destructive.</p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-zinc-300 text-lg mb-2">No inbox data yet.</p>
          <p className="text-zinc-500 text-sm">
            Run the fetch script to populate:
            <code className="block mt-3 p-3 bg-zinc-950 rounded text-xs text-zinc-300 font-mono">
              cd /home/ubuntu/wlp/projects/gmail-integration/src && python3 gmail_fetch.py
            </code>
          </p>
          <p className="text-zinc-500 text-sm mt-4">
            Need to set up OAuth first? See <Link href="#" className="text-cyan-400 underline">docs/SETUP.md</Link>.
          </p>
        </div>
      </div>
    );
  }

  const messages = filter === 'unread' ? data.messages.filter((m) => m.unread) : data.messages;
  const fetchedAt = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-zinc-100">📧 Gmail</h1>
        <div className="text-sm text-zinc-500">Last fetch: {fetchedAt}</div>
      </div>
      <p className="text-zinc-400 mb-6">Inbox at a glance. Read-only — AI manages nothing destructive.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={data.count} />
        <Stat label="Unread" value={data.unreadCount} highlight />
        <Stat label="Showing" value={messages.length} />
        <Stat label="Filter" value={filter === 'unread' ? 'Unread only' : 'All'} />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded text-sm ${filter === 'all' ? 'bg-cyan-500 text-zinc-950 font-medium' : 'bg-zinc-800 text-zinc-300'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded text-sm ${filter === 'unread' ? 'bg-cyan-500 text-zinc-950 font-medium' : 'bg-zinc-800 text-zinc-300'}`}
        >
          Unread ({data.unreadCount})
        </button>
      </div>

      <div className="space-y-2">
        {messages.map((m) => (
          <a
            key={m.id}
            href={`https://mail.google.com/mail/u/0/#inbox/${m.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-cyan-500/40 transition p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-1">
              <div className="font-medium text-zinc-100 truncate flex-1">
                {m.unread && <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2" />}
                {m.subject || '(no subject)'}
              </div>
              <div className="text-xs text-zinc-500 whitespace-nowrap">{m.date}</div>
            </div>
            <div className="text-sm text-zinc-400 mb-1 truncate">{m.from}</div>
            <div className="text-sm text-zinc-500 line-clamp-2">{m.snippet}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
      <div className="text-xs text-zinc-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-cyan-400' : 'text-zinc-100'}`}>{value}</div>
    </div>
  );
}
