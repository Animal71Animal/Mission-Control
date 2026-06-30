'use client';

import { useEffect, useState, useMemo } from 'react';
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
  category?: 'dj-booking' | 'payment' | 'label-business' | 'personal' | 'newsletter' | 'spam';
  categoryReason?: string;
  actionable?: boolean;
  actionExtracted?: boolean;
  actionTitle?: string;
}

interface GmailPayload {
  fetchedAt: string | null;
  count: number;
  unreadCount: number;
  messages: GmailMessage[];
  status?: string;
}

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  'dj-booking': { label: 'DJ Booking', emoji: '🎧', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  'payment':    { label: 'Payment',    emoji: '💵', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'label-business': { label: 'Label',  emoji: '🎵', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  'personal':   { label: 'Personal',   emoji: '👤', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  'newsletter': { label: 'Newsletter', emoji: '📰', color: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40' },
  'spam':       { label: 'Spam',       emoji: '🚫', color: 'bg-red-900/20 text-red-400 border-red-700/30' },
};

export default function GmailPage() {
  const [data, setData] = useState<GmailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [catFilter, setCatFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/gmail/inbox', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  const catCounts = useMemo(() => {
    const c: Record<string, number> = {};
    data?.messages.forEach((m) => {
      const cat = m.category || 'newsletter';
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [data]);

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

  let messages = data.messages;
  if (readFilter === 'unread') messages = messages.filter((m) => m.unread);
  if (readFilter === 'read') messages = messages.filter((m) => !m.unread);
  if (catFilter) messages = messages.filter((m) => (m.category || 'newsletter') === catFilter);

  const fetchedAt = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : '—';
  const actionableCount = data.messages.filter((m) => m.actionable).length;
  const taskCreatedCount = data.messages.filter((m) => m.actionExtracted).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-zinc-100">📧 Gmail</h1>
        <div className="text-sm text-zinc-500">Last fetch: {fetchedAt}</div>
      </div>
      <p className="text-zinc-400 mb-6">
        Inbox at a glance. Read-only — AI manages nothing destructive.{' '}
        {actionableCount > 0 && (
          <span className="text-cyan-400">
            {actionableCount} flagged as needing action{taskCreatedCount > 0 && ` (${taskCreatedCount} task${taskCreatedCount === 1 ? '' : 's'} added to <Link href="/tasks" className="underline">/tasks</Link>)`}.
          </span>
        )}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total" value={data.count} />
        <Stat label="Unread" value={data.unreadCount} highlight />
        <Stat label="Actionable" value={actionableCount} highlight={actionableCount > 0} />
        <Stat label="Showing" value={messages.length} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setReadFilter(f)}
            className={`px-3 py-1.5 rounded text-sm ${readFilter === f ? 'bg-cyan-500 text-zinc-950 font-medium' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? `Unread (${data.unreadCount})` : 'Read'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCatFilter(null)}
          className={`px-2.5 py-1 rounded text-xs ${catFilter === null ? 'bg-zinc-100 text-zinc-900 font-medium' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
        >
          All categories
        </button>
        {Object.entries(CATEGORY_META).map(([cat, meta]) => {
          const n = catCounts[cat] || 0;
          if (n === 0 && catFilter !== cat) return null;
          const active = catFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setCatFilter(active ? null : cat)}
              className={`px-2.5 py-1 rounded text-xs border ${active ? meta.color + ' font-medium' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
            >
              {meta.emoji} {meta.label} {n > 0 && `(${n})`}
            </button>
          );
        })}
      </div>

      {messages.length === 0 ? (
        <div className="text-center text-zinc-500 py-12">No messages match these filters.</div>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => {
            const meta = CATEGORY_META[m.category || 'newsletter'];
            return (
              <a
                key={m.id}
                href={m.source_url || `https://mail.google.com/mail/u/0/#inbox/${m.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-cyan-500/40 transition p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="font-medium text-zinc-100 truncate flex-1 flex items-center gap-2">
                    {m.unread && <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />}
                    <span className="truncate">{m.subject || '(no subject)'}</span>
                    {m.category && (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${meta.color} flex-shrink-0`}>
                        {meta.emoji} {meta.label}
                      </span>
                    )}
                    {m.actionExtracted && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                        ✓ Task created
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 whitespace-nowrap">{m.date}</div>
                </div>
                <div className="text-sm text-zinc-400 mb-1 truncate">{m.from}</div>
                <div className="text-sm text-zinc-500 line-clamp-2">{m.snippet}</div>
                {m.actionTitle && (
                  <div className="mt-2 text-xs text-amber-300/80 italic">📋 {m.actionTitle}</div>
                )}
              </a>
            );
          })}
        </div>
      )}
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
