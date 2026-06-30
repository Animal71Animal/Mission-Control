import { NextRequest, NextResponse } from 'next/server';

import { getGmailService } from '@/lib/gmail-auth';
import { removeInboxMessage } from '@/lib/gmail-store';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    // TODO: Consider a stronger CSRF token if this endpoint is exposed beyond same-origin UI usage.
    return NextResponse.json({ ok: false, error: 'Unauthorized request origin' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const gmail = await getGmailService();

    await gmail.users.messages.trash({ userId: 'me', id });
    await removeInboxMessage(id);

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const status = typeof error === 'object' && error && 'code' in error && Number((error as { code?: number }).code) === 404
      ? 404
      : 500;

    const message = status === 404
      ? 'Message not found'
      : error instanceof Error
        ? error.message.replace(/\{[\s\S]*\}/, '[redacted]')
        : 'Failed to trash message';

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
