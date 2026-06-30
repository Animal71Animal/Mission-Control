import { NextRequest, NextResponse } from 'next/server';
import type { gmail_v1 } from 'googleapis';

import { getGmailService, sanitizeEmailHtml } from '@/lib/gmail-auth';

interface ParsedMessage {
  bodyText: string;
  bodyHtml: string;
  attachments: Array<{ filename: string; mimeType: string; size: number }>;
}

function decodeBase64Url(input?: string | null) {
  if (!input) {
    return '';
  }

  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function getHeaderValue(headers: gmail_v1.Schema$MessagePartHeader[] | undefined, name: string) {
  const match = headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase());
  return match?.value || '';
}

function parsePayload(part?: gmail_v1.Schema$MessagePart): ParsedMessage {
  if (!part) {
    return { bodyText: '', bodyHtml: '', attachments: [] };
  }

  const textChunks: string[] = [];
  const htmlChunks: string[] = [];
  const attachments: Array<{ filename: string; mimeType: string; size: number }> = [];

  const visit = (node?: gmail_v1.Schema$MessagePart) => {
    if (!node) {
      return;
    }

    if (node.filename) {
      attachments.push({
        filename: node.filename,
        mimeType: node.mimeType || 'application/octet-stream',
        size: Number(node.body?.size || 0),
      });
    }

    if (node.mimeType === 'text/plain' && node.body?.data) {
      textChunks.push(decodeBase64Url(node.body.data));
    }

    if (node.mimeType === 'text/html' && node.body?.data) {
      htmlChunks.push(decodeBase64Url(node.body.data));
    }

    node.parts?.forEach(visit);
  };

  visit(part);

  if (!textChunks.length && !htmlChunks.length && part.body?.data) {
    if (part.mimeType === 'text/html') {
      htmlChunks.push(decodeBase64Url(part.body.data));
    } else {
      textChunks.push(decodeBase64Url(part.body.data));
    }
  }

  const bodyText = textChunks.join('\n\n').trim();
  const bodyHtml = sanitizeEmailHtml(htmlChunks.join('<hr />').trim());

  return { bodyText, bodyHtml, attachments };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gmail = await getGmailService();
    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    if (!response.data.id) {
      return NextResponse.json({ ok: false, error: 'Message not found' }, { status: 404 });
    }

    const payload = response.data.payload;
    const headers = {
      from: getHeaderValue(payload?.headers, 'From'),
      to: getHeaderValue(payload?.headers, 'To'),
      cc: getHeaderValue(payload?.headers, 'Cc'),
      subject: getHeaderValue(payload?.headers, 'Subject'),
      date: getHeaderValue(payload?.headers, 'Date'),
    };

    const parsed = parsePayload(payload);

    return NextResponse.json({
      id: response.data.id,
      threadId: response.data.threadId,
      headers,
      bodyText: parsed.bodyText,
      bodyHtml: parsed.bodyHtml,
      attachments: parsed.attachments,
      labelIds: response.data.labelIds || [],
    });
  } catch (error) {
    const status = typeof error === 'object' && error && 'code' in error && Number((error as { code?: number }).code) === 404
      ? 404
      : 500;

    const message = status === 404
      ? 'Message not found'
      : error instanceof Error
        ? error.message.replace(/\{[\s\S]*\}/, '[redacted]')
        : 'Failed to fetch message';

    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
