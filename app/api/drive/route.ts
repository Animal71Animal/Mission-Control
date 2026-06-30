import { NextRequest, NextResponse } from 'next/server';

import { getDriveService } from '@/lib/drive-auth';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const DRIVE_FIELDS = 'files(id,name,mimeType,modifiedTime,webViewLink,shared,owners(displayName,emailAddress))';

type GoogleApiError = {
  code?: number;
  status?: number;
  message?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
};

type DriveOwner = {
  displayName?: string | null;
  emailAddress?: string | null;
};

function redactErrorMessage(message: string) {
  return message.replace(/\{[\s\S]*\}/g, '[redacted]');
}

function getErrorCode(error: unknown) {
  const typed = error as GoogleApiError | undefined;
  return typed?.code ?? typed?.status ?? typed?.response?.status;
}

function isAuthError(error: unknown) {
  const code = getErrorCode(error);
  const message = error instanceof Error ? error.message : String(error ?? '');

  return (
    code === 401 ||
    code === 403 ||
    message.includes('DRIVE_TOKEN_JSON') ||
    message.includes('invalid_grant') ||
    message.includes('invalid_client') ||
    message.includes('unauthorized')
  );
}

function formatOwner(owner?: DriveOwner | null) {
  const displayName = owner?.displayName?.trim();
  const emailAddress = owner?.emailAddress?.trim();

  if (displayName && emailAddress) {
    return `${displayName} / ${emailAddress}`;
  }

  return displayName || emailAddress || null;
}

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get('folderId') || 'root';

  try {
    const drive = await getDriveService();

    if (folderId !== 'root') {
      try {
        const folderResponse = await drive.files.get({
          fileId: folderId,
          fields: 'id,name,mimeType',
        });

        if (!folderResponse.data.id || folderResponse.data.mimeType !== FOLDER_MIME_TYPE) {
          return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }
      } catch (error) {
        if (getErrorCode(error) === 404) {
          return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
        }

        throw error;
      }
    }

    const response = await drive.files.list(
      folderId === 'root'
        ? {
            q: `mimeType='${FOLDER_MIME_TYPE}' and trashed=false`,
            corpora: 'user',
            pageSize: 1000,
            fields: DRIVE_FIELDS,
            orderBy: 'name',
          }
        : {
            q: `mimeType='${FOLDER_MIME_TYPE}' and trashed=false and '${folderId}' in parents`,
            pageSize: 1000,
            fields: DRIVE_FIELDS,
            orderBy: 'name',
          },
    );

    const folders = (response.data.files || []).map((folder) => ({
      id: folder.id || '',
      name: folder.name || 'Untitled folder',
      modifiedTime: folder.modifiedTime || null,
      webViewLink: folder.webViewLink || null,
      shared: Boolean(folder.shared),
      owner: formatOwner(folder.owners?.[0]),
    }));

    return NextResponse.json({
      folders,
      parentId: folderId,
      source: 'drive',
    });
  } catch (error) {
    const message = error instanceof Error
      ? redactErrorMessage(error.message)
      : 'Failed to fetch Drive folders';

    if (isAuthError(error)) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
