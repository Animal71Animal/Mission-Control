import { NextRequest, NextResponse } from 'next/server';

import { getGmailService } from '@/lib/gmail-auth';
import { updateInboxMessage } from '@/lib/gmail-store';

const ACTIONS: Record<string, { addLabelIds: string[]; removeLabelIds: string[] }> = {
  read: { addLabelIds: [], removeLabelIds: ['UNREAD'] },
  unread: { addLabelIds: ['UNREAD'], removeLabelIds: [] },
  archive: { addLabelIds: [], removeLabelIds: ['INBOX'] },
  unarchive: { addLabelIds: ['INBOX'], removeLabelIds: [] },
  star: { addLabelIds: ['STARRED'], removeLabelIds: [] },
  unstar: { addLabelIds: [], removeLabelIds: ['STARRED'] },
};

type ModifyAction = keyof typeof ACTIONS;

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const requestOrigin = request.nextUrl.origin;

  if (origin) {
    return origin === requestOrigin;
  }

  if (referer) {
    return referer.startsWith(requestOrigin);
  }

  return false;
}

function normalizeLabels(labels: string[] | undefined, fallback: ModifyAction) {
  const next = new Set(labels || []);

  if (labels) {
    return Array.from(next);
  }

  if (fallback === 'read') next.delete('UNREAD');
  if (fallback === 'unread') next.add('UNREAD');
  if (fallback === 'archive') next.delete('INBOX');
  if (fallback === 'unarchive') next.add('INBOX');
  if (fallback === 'star') next.add('STARRED');
  if (fallback === 'unstar') next.delete('STARRED');

  return Array.from(next);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    // TODO: Consider a stronger CSRF token if this endpoint is exposed beyond same-origin UI usage.
    return NextResponse.json({ ok: false, error: 'Unauthorized request origin' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null) as { action?: ModifyAction } | null;
    const action = body?.action;

    if (!action || !(action in ACTIONS)) {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }

    const { id } = await params;
    const gmail = await getGmailService();
    const response = await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        addLabelIds: [...ACTIONS[action].addLabelIds],
        removeLabelIds: [...ACTIONS[action].removeLabelIds],
      },
    });

    const labelIds = normalizeLabels(response.data.labelIds || undefined, action);

    await updateInboxMessage(id, (message) => ({
      ...message,
      unread: labelIds.includes('UNREAD'),
      starred: labelIds.includes('STARRED'),
      archived: !labelIds.includes('INBOX'),
      labelIds,
    }));

    return NextResponse.json({ ok: true, id, action });
  } catch (error) {
    const status = typeof error === 'object' && error && 'code' in error && Number((error as { code?: number }).code) === 404
      ? 404
      : 500;

    const message = status === 404
      ? 'Message not found'
      : error instanceof Error
        ? error.message.replace(/\{[\s\S]*\}/, '[redacted]')
        : 'Failed to modify message';

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
