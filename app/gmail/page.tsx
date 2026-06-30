"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

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
  starred?: boolean;
  archived?: boolean;
  labelIds?: string[];
}

interface GmailPayload {
  fetchedAt: string | null;
  count: number;
  unreadCount: number;
  messages: GmailMessage[];
  status?: string;
}

interface MessageDetail {
  id: string;
  threadId: string;
  headers: {
    from: string;
    to: string;
    cc: string;
    subject: string;
    date: string;
  };
  bodyText: string;
  bodyHtml: string;
  attachments: Array<{ filename: string; mimeType: string; size: number }>;
  labelIds: string[];
}

type ToastState = {
  kind: 'success' | 'error';
  text: string;
  undoAction?: () => void;
} | null;

type ModifyAction = 'read' | 'unread' | 'archive' | 'unarchive' | 'star' | 'unstar';

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  'dj-booking': { label: 'DJ Booking', emoji: '🎧', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  payment: { label: 'Payment', emoji: '💵', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  'label-business': { label: 'Label', emoji: '🎵', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  personal: { label: 'Personal', emoji: '👤', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  newsletter: { label: 'Newsletter', emoji: '📰', color: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40' },
  spam: { label: 'Spam', emoji: '🚫', color: 'bg-red-900/20 text-red-400 border-red-700/30' },
};

const ACTION_COPY: Record<ModifyAction, { done: string; undo?: ModifyAction }> = {
  read: { done: '✓ Marked read', undo: 'unread' },
  unread: { done: '✓ Marked unread', undo: 'read' },
  archive: { done: '✓ Archived', undo: 'unarchive' },
  unarchive: { done: '✓ Restored to inbox', undo: 'archive' },
  star: { done: '✓ Starred', undo: 'unstar' },
  unstar: { done: '✓ Unstarred', undo: 'star' },
};

function applyLabels(message: GmailMessage, labelIds: string[]) {
  return {
    ...message,
    unread: labelIds.includes('UNREAD'),
    starred: labelIds.includes('STARRED'),
    archived: !labelIds.includes('INBOX'),
    labelIds,
  };
}

function nextLabels(currentLabels: string[] | undefined, action: ModifyAction, message: GmailMessage) {
  const labels = new Set(currentLabels || message.labelIds || []);

  if (!currentLabels && !message.archived) labels.add('INBOX');
  if (!currentLabels && message.unread) labels.add('UNREAD');
  if (!currentLabels && message.starred) labels.add('STARRED');

  if (action === 'read') labels.delete('UNREAD');
  if (action === 'unread') labels.add('UNREAD');
  if (action === 'archive') labels.delete('INBOX');
  if (action === 'unarchive') labels.add('INBOX');
  if (action === 'star') labels.add('STARRED');
  if (action === 'unstar') labels.delete('STARRED');

  return Array.from(labels);
}

export default function GmailPage() {
  const [data, setData] = useState<GmailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedBody, setSelectedBody] = useState<MessageDetail | null>(null);
  const [bodyLoading, setBodyLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [trashConfirm, setTrashConfirm] = useState(false);
  const [mutationLoading, setMutationLoading] = useState<string | null>(null);

  const fetchInbox = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/gmail/inbox', { cache: 'no-store' });
      const payload = await response.json();
      setData(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : String(fetchError));
    }
  }, []);

  useEffect(() => {
    void fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data?.messages.forEach((message) => {
      const category = message.category || 'newsletter';
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [data]);

  const selectedMessage = useMemo(
    () => data?.messages.find((message) => message.id === selectedId) || null,
    [data, selectedId],
  );

  const openMessage = useCallback(async (message: GmailMessage) => {
    setSelectedId(message.id);
    setSelectedBody(null);
    setTrashConfirm(false);
    setBodyLoading(true);

    try {
      const response = await fetch(`/api/gmail/message/${message.id}`, { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || 'Failed to load message');
      }

      setSelectedBody(payload);
      if (Array.isArray(payload.labelIds)) {
        setData((current) => current ? {
          ...current,
          messages: current.messages.map((item) =>
            item.id === message.id ? applyLabels(item, payload.labelIds) : item,
          ),
        } : current);
      }
    } catch (openError) {
      setToast({
        kind: 'error',
        text: openError instanceof Error ? openError.message : 'Failed to load message',
      });
      setSelectedId(null);
      setSelectedBody(null);
    } finally {
      setBodyLoading(false);
    }
  }, []);

  const closePanel = useCallback(() => {
    setSelectedId(null);
    setSelectedBody(null);
    setTrashConfirm(false);
    void fetchInbox();
  }, [fetchInbox]);

  const handleModify = useCallback(async (message: GmailMessage, action: ModifyAction, silent = false) => {
    const optimisticLabels = nextLabels(selectedBody?.labelIds, action, message);

    setMutationLoading(action);
    setTrashConfirm(false);
    setData((current) => current ? {
      ...current,
      messages: current.messages.map((item) =>
        item.id === message.id ? applyLabels(item, optimisticLabels) : item,
      ),
    } : current);
    setSelectedBody((current) => current && current.id === message.id ? { ...current, labelIds: optimisticLabels } : current);

    try {
      const response = await fetch(`/api/gmail/message/${message.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const payload = await response.json();

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || 'Failed to update message');
      }

      if (!silent) {
        const undoAction = ACTION_COPY[action].undo;
        setToast({
          kind: 'success',
          text: ACTION_COPY[action].done,
          undoAction: undoAction ? () => void handleModify(message, undoAction, true) : undefined,
        });
      }
    } catch (modifyError) {
      const rollbackLabels = nextLabels(optimisticLabels, ACTION_COPY[action].undo || action, {
        ...message,
        labelIds: optimisticLabels,
      });

      setData((current) => current ? {
        ...current,
        messages: current.messages.map((item) =>
          item.id === message.id ? applyLabels(item, rollbackLabels) : item,
        ),
      } : current);
      setSelectedBody((current) => current && current.id === message.id ? { ...current, labelIds: rollbackLabels } : current);
      setToast({
        kind: 'error',
        text: modifyError instanceof Error ? modifyError.message : 'Failed to update message',
      });
    } finally {
      setMutationLoading(null);
    }
  }, [selectedBody]);

  const handleTrash = useCallback(async (message: GmailMessage) => {
    setMutationLoading('trash');
    setTrashConfirm(false);
    const previousMessages = data?.messages || [];

    setData((current) => current ? {
      ...current,
      messages: current.messages.filter((item) => item.id !== message.id),
      count: Math.max(0, current.count - 1),
      unreadCount: Math.max(0, current.unreadCount - (message.unread ? 1 : 0)),
    } : current);

    try {
      const response = await fetch(`/api/gmail/message/${message.id}/trash`, {
        method: 'POST',
      });
      const payload = await response.json();

      if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || 'Failed to trash message');
      }

      setToast({ kind: 'success', text: '✓ Trashed' });
      closePanel();
    } catch (trashError) {
      setData((current) => current ? {
        ...current,
        messages: previousMessages,
        count: previousMessages.length,
        unreadCount: previousMessages.filter((item) => item.unread).length,
      } : current);
      setToast({
        kind: 'error',
        text: trashError instanceof Error ? trashError.message : 'Failed to trash message',
      });
    } finally {
      setMutationLoading(null);
    }
  }, [closePanel, data]);

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!data) return <div className="p-6 text-zinc-400">Loading…</div>;

  if (data.status === 'no-data' || data.count === 0) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="mb-2 text-3xl font-bold text-zinc-100">📧 Gmail</h1>
        <p className="mb-6 text-zinc-400">Inbox at a glance. Read + inbox cleanup only.</p>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="mb-2 text-lg text-zinc-300">No inbox data yet.</p>
          <p className="text-sm text-zinc-500">
            Run the fetch script to populate:
            <code className="mt-3 block rounded bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
              cd /home/ubuntu/wlp/projects/gmail-integration/src && python3 gmail_fetch.py
            </code>
          </p>
        </div>
      </div>
    );
  }

  let messages = data.messages;
  if (readFilter === 'unread') messages = messages.filter((message) => message.unread);
  if (readFilter === 'read') messages = messages.filter((message) => !message.unread);
  if (catFilter) messages = messages.filter((message) => (message.category || 'newsletter') === catFilter);

  const fetchedAt = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString() : '—';
  const actionableCount = data.messages.filter((message) => message.actionable).length;
  const taskCreatedCount = data.messages.filter((message) => message.actionExtracted).length;
  const selectedIsUnread = selectedBody?.labelIds.includes('UNREAD') ?? selectedMessage?.unread ?? false;
  const selectedIsArchived = selectedBody ? !selectedBody.labelIds.includes('INBOX') : selectedMessage?.archived ?? false;
  const selectedIsStarred = selectedBody?.labelIds.includes('STARRED') ?? selectedMessage?.starred ?? false;

  return (
    <div className="mx-auto max-w-7xl p-6">
      {toast && (
        <div className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${toast.kind === 'success' ? 'border-cyan-500/40 bg-zinc-950 text-cyan-300' : 'border-red-500/40 bg-zinc-950 text-red-300'}`}>
          <span className="flex-1 text-sm">{toast.text}</span>
          {toast.undoAction && (
            <button
              onClick={() => {
                const action = toast.undoAction;
                if (!action) return;
                setToast(null);
                action();
              }}
              className="rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:border-cyan-400 hover:text-cyan-300"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {selectedId && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={closePanel} />
      )}

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100">📧 Gmail</h1>
        <div className="text-sm text-zinc-500">Last fetch: {fetchedAt}</div>
      </div>
      <p className="mb-6 text-zinc-400">
        Inbox at a glance. Read + inbox cleanup only.{' '}
        {actionableCount > 0 && (
          <span className="text-cyan-400">
            {actionableCount} flagged as needing action{taskCreatedCount > 0 ? ` (${taskCreatedCount} task${taskCreatedCount === 1 ? '' : 's'} added to /tasks)` : ''}.
          </span>
        )}
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total" value={data.count} />
            <Stat label="Unread" value={data.unreadCount} highlight />
            <Stat label="Actionable" value={actionableCount} highlight={actionableCount > 0} />
            <Stat label="Showing" value={messages.length} />
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {(['all', 'unread', 'read'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setReadFilter(filter)}
                className={`rounded px-3 py-1.5 text-sm ${readFilter === filter ? 'bg-cyan-500 font-medium text-zinc-950' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
              >
                {filter === 'all' ? 'All' : filter === 'unread' ? `Unread (${data.unreadCount})` : 'Read'}
              </button>
            ))}
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setCatFilter(null)}
              className={`rounded px-2.5 py-1 text-xs ${catFilter === null ? 'bg-zinc-100 font-medium text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              All categories
            </button>
            {Object.entries(CATEGORY_META).map(([category, meta]) => {
              const count = catCounts[category] || 0;
              if (count === 0 && catFilter !== category) return null;
              const active = catFilter === category;
              return (
                <button
                  key={category}
                  onClick={() => setCatFilter(active ? null : category)}
                  className={`rounded border px-2.5 py-1 text-xs ${active ? `${meta.color} font-medium` : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'}`}
                >
                  {meta.emoji} {meta.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">No messages match these filters.</div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => {
                const meta = CATEGORY_META[message.category || 'newsletter'];
                return (
                  <button
                    key={message.id}
                    onClick={() => void openMessage(message)}
                    className={`block w-full rounded-lg border p-4 text-left transition ${selectedId === message.id ? 'border-cyan-500/50 bg-zinc-900' : 'border-zinc-800 bg-zinc-900/50 hover:border-cyan-500/40 hover:bg-zinc-900'}`}
                  >
                    <div className="mb-1 flex items-start justify-between gap-4">
                      <div className="flex flex-1 items-center gap-2 truncate font-medium text-zinc-100">
                        {message.unread && <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />}
                        <span className="truncate">{message.subject || '(no subject)'}</span>
                        {message.starred && <span className="text-amber-300">★</span>}
                        {message.category && (
                          <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 text-xs ${meta.color}`}>
                            {meta.emoji} {meta.label}
                          </span>
                        )}
                        {message.archived && (
                          <span className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-300">
                            Archived
                          </span>
                        )}
                        {message.actionExtracted && (
                          <span className="inline-flex flex-shrink-0 items-center rounded border border-amber-500/40 bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                            ✓ Task created
                          </span>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-xs text-zinc-500">{message.date}</div>
                    </div>
                    <div className="mb-1 truncate text-sm text-zinc-400">{message.from}</div>
                    <div className="line-clamp-2 text-sm text-zinc-500">{message.snippet}</div>
                    {message.actionTitle && (
                      <div className="mt-2 text-xs italic text-amber-300/80">📋 {message.actionTitle}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className={`fixed inset-y-0 right-0 z-40 w-full transform border-l border-zinc-800 bg-zinc-950/98 shadow-2xl transition duration-200 md:static md:z-auto md:w-auto md:translate-x-0 md:rounded-xl md:border ${selectedId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} ${selectedId ? '' : 'md:opacity-100'}`}>
          {!selectedId ? (
            <div className="hidden h-full items-center justify-center p-8 text-center text-sm text-zinc-500 md:flex">
              Select an email to read it here.
            </div>
          ) : (
            <div className="flex h-full max-h-screen flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">Message</div>
                  <div className="text-xs text-zinc-500">Read, archive, star, or trash</div>
                </div>
                <button
                  onClick={closePanel}
                  className="rounded border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:border-cyan-400 hover:text-cyan-300"
                >
                  ✕
                </button>
              </div>

              {bodyLoading || !selectedMessage ? (
                <div className="flex flex-1 items-center justify-center text-zinc-500">Loading message…</div>
              ) : (
                <>
                  <div className="border-b border-zinc-800 px-4 py-3">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setTrashConfirm((current) => !current)}
                        disabled={mutationLoading !== null}
                        className="rounded border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Trash
                      </button>
                      <button
                        onClick={() => void handleModify(selectedMessage, selectedIsUnread ? 'read' : 'unread')}
                        disabled={mutationLoading !== null}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                      >
                        {selectedIsUnread ? 'Mark read' : 'Mark unread'}
                      </button>
                      <button
                        onClick={() => void handleModify(selectedMessage, selectedIsArchived ? 'unarchive' : 'archive')}
                        disabled={mutationLoading !== null}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                      >
                        {selectedIsArchived ? 'Restore to inbox' : 'Archive'}
                      </button>
                      <button
                        onClick={() => void handleModify(selectedMessage, selectedIsStarred ? 'unstar' : 'star')}
                        disabled={mutationLoading !== null}
                        className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                      >
                        {selectedIsStarred ? 'Unstar' : 'Star'}
                      </button>
                      <a
                        href={`https://mail.google.com/mail/u/0/#inbox/${selectedMessage.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
                      >
                        Open in Gmail
                      </a>
                    </div>

                    {trashConfirm && (
                      <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                        <span>Trash?</span>
                        <button
                          onClick={() => void handleTrash(selectedMessage)}
                          disabled={mutationLoading !== null}
                          className="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-400 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setTrashConfirm(false)}
                          className="rounded border border-zinc-700 px-2.5 py-1 text-xs text-zinc-200 hover:border-zinc-500"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="space-y-1 text-sm text-zinc-300">
                      <div><span className="text-zinc-500">From:</span> {selectedBody?.headers.from || selectedMessage.from}</div>
                      <div><span className="text-zinc-500">To:</span> {selectedBody?.headers.to || '—'}</div>
                      {selectedBody?.headers.cc && <div><span className="text-zinc-500">Cc:</span> {selectedBody.headers.cc}</div>}
                      <div><span className="text-zinc-500">Subject:</span> {selectedBody?.headers.subject || selectedMessage.subject}</div>
                      <div><span className="text-zinc-500">Date:</span> {selectedBody?.headers.date || selectedMessage.date}</div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4">
                    {selectedBody?.attachments.length ? (
                      <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Attachments</div>
                        <div className="space-y-1 text-sm text-zinc-300">
                          {selectedBody.attachments.map((attachment) => (
                            <div key={`${attachment.filename}-${attachment.size}`}>
                              {attachment.filename || '(unnamed attachment)'} · {attachment.mimeType} · {attachment.size} bytes
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedBody?.bodyHtml ? (
                      <div
                        className="prose prose-invert prose-sm max-w-none prose-a:text-cyan-300 prose-blockquote:border-cyan-500/40 prose-code:text-cyan-200 prose-pre:bg-zinc-900"
                        dangerouslySetInnerHTML={{ __html: selectedBody.bodyHtml }}
                      />
                    ) : (
                      <pre className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
                        {selectedBody?.bodyText || selectedMessage.snippet}
                      </pre>
                    )}
                  </div>

                  <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-400">
                    <a
                      href={`https://mail.google.com/mail/u/0/#inbox/${selectedMessage.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 underline underline-offset-2"
                    >
                      View full message
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-cyan-400' : 'text-zinc-100'}`}>{value}</div>
    </div>
  );
}
