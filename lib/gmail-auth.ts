import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import sanitizeHtml from 'sanitize-html';

interface GmailTokenConfig {
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  token?: string;
  token_uri?: string;
  scopes?: string[];
}

const EMAIL_ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'span',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

const EMAIL_ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  table: ['border', 'cellpadding', 'cellspacing'],
  td: ['colspan', 'rowspan', 'align', 'valign'],
  th: ['colspan', 'rowspan', 'align', 'valign'],
  '*': ['class'],
};

export function sanitizeEmailHtml(input: string) {
  return sanitizeHtml(input, {
    allowedTags: EMAIL_ALLOWED_TAGS,
    allowedAttributes: EMAIL_ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data', 'cid'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data', 'cid'],
    },
    disallowedTagsMode: 'discard',
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }, true),
    },
  });
}

function parseTokenConfig() {
  const raw = process.env.GMAIL_TOKEN_JSON;

  if (!raw) {
    throw new Error('GMAIL_TOKEN_JSON environment variable is missing');
  }

  let parsed: GmailTokenConfig;
  try {
    parsed = JSON.parse(raw) as GmailTokenConfig;
  } catch {
    throw new Error('GMAIL_TOKEN_JSON is not valid JSON');
  }

  if (!parsed.client_id || !parsed.client_secret || !parsed.refresh_token) {
    throw new Error('GMAIL_TOKEN_JSON must include client_id, client_secret, and refresh_token');
  }

  return parsed;
}

export async function getGmailAuth() {
  const config = parseTokenConfig();
  const auth = new OAuth2Client({
    clientId: config.client_id,
    clientSecret: config.client_secret,
  });

  auth.setCredentials({
    access_token: config.token || undefined,
    refresh_token: config.refresh_token,
    scope: Array.isArray(config.scopes) ? config.scopes.join(' ') : undefined,
    token_type: 'Bearer',
    expiry_date: Date.now() - 1000,
  });

  await auth.getAccessToken();
  return auth;
}

export async function getGmailService() {
  const auth = await getGmailAuth();
  return google.gmail({ version: 'v1', auth });
}
