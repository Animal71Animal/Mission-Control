import { NextResponse } from "next/server";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

interface DriveFileData {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  modifiedTime?: string | null;
  size?: string | null;
  webViewLink?: string | null;
  shared?: boolean | null;
  owners?: Array<{ displayName?: string | null; emailAddress?: string | null }> | null;
}

// Initialize auth with service account
function getAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set");
  }

  const credentials = JSON.parse(serviceAccountJson);

  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
}

// GET /api/drive
export async function GET() {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    // Enumerate all folders in Drive root. Auto-reflects any folder Eric
    // creates/renames/deletes — no hardcoded IDs. Requires service account
    // to have root-level access (or "anyone with link can view" + shares).
    const listResponse = await drive.files.list({
      q: "'root' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name, mimeType, modifiedTime, webViewLink, shared, owners)",
      pageSize: 100,
      orderBy: "name",
    });

    const allFiles: DriveFileData[] = (listResponse.data.files || []) as DriveFileData[];

    // Transform to our format
    const transformed = allFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: "folder",
      mimeType: f.mimeType,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink,
      shared: f.shared,
      owner: f.owners?.[0]?.displayName || f.owners?.[0]?.emailAddress || "Unknown",
    }));

    return NextResponse.json({
      files: transformed,
      count: transformed.length,
    });
  } catch (error) {
    console.error("Drive fetch error:", error);
    return NextResponse.json({
      error: "Failed to fetch Drive files",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

// POST /api/drive - Upload file (future)
export async function POST() {
  return NextResponse.json({ error: "Upload not implemented yet" }, { status: 501 });
}