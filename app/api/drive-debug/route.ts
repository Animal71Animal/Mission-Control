import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return NextResponse.json({ error: 'no env' }, { status: 500 });
    }
    const { google } = await import('googleapis');
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    const drive = google.drive({ version: 'v3', auth });

    const res = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id,name,parents,shared,owners(displayName,emailAddress),webViewLink)',
      pageSize: 1000,
    });
    const files = res.data.files || [];

    const owners: Record<string, number> = {};
    files.forEach((f: any) => {
      const o = f.owners?.[0]?.emailAddress || '?';
      owners[o] = (owners[o] || 0) + 1;
    });

    return NextResponse.json({
      total: files.length,
      ownerCounts: owners,
      noParent: files.filter((f: any) => !Array.isArray(f.parents) || f.parents.length === 0).length,
      hasParent: files.filter((f: any) => Array.isArray(f.parents) && f.parents.length > 0).length,
      sharedTrue: files.filter((f: any) => f.shared).length,
      sample: files.slice(0, 30).map((f: any) => ({
        id: f.id,
        name: f.name,
        parents: f.parents,
        shared: f.shared,
        owner: f.owners?.[0]?.emailAddress || '?',
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
