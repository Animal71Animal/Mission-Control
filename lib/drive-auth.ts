import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

interface DriveTokenConfig {
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  token?: string;
  token_uri?: string;
  scopes?: string[];
}

function parseTokenConfig() {
  const raw = process.env.DRIVE_TOKEN_JSON;

  if (!raw) {
    throw new Error('DRIVE_TOKEN_JSON environment variable is missing');
  }

  let parsed: DriveTokenConfig;
  try {
    parsed = JSON.parse(raw) as DriveTokenConfig;
  } catch {
    throw new Error('DRIVE_TOKEN_JSON is not valid JSON');
  }

  if (!parsed.client_id || !parsed.client_secret || !parsed.refresh_token) {
    throw new Error('DRIVE_TOKEN_JSON must include client_id, client_secret, and refresh_token');
  }

  return parsed;
}

export async function getDriveAuth() {
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

export async function getDriveService() {
  const auth = await getDriveAuth();
  return google.drive({ version: 'v3', auth });
}
