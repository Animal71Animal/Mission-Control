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
  parents?: string[] | null;
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

    // Enumerate all folders the service account can see, then keep only those
    // at Drive root (parents is empty/missing — for personal Drive this is how
    // the API represents top-level folders, NOT the literal string "root").
    // Auto-reflects any folder Eric creates/renames/deletes — no hardcoded IDs.
    const listResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: "files(id, name, mimeType, modifiedTime, webViewLink, shared, owners, parents)",
      pageSize: 1000,
      orderBy: "name",
    });

    const allFiles: DriveFileData[] = (listResponse.data.files || []) as DriveFileData[];

    // Root-level folders: those with no parents array.
    const rootFolders = allFiles.filter(
      (f: any) => !Array.isArray(f.parents) || f.parents.length === 0
    );

    // Transform to our format
    const transformed = rootFolders.map((f) => ({
      id: f.id,
      name: f.name,
      type: "folder",
      mimeType: f.mimeType,
      modifiedTime: f.modifiedTime,
      webViewLink: f.webViewLink,
      shared: f.shared,
      owner: f.owners?.[0]?.displayName || f.owners?.[0]?.emailAddress || "Unknown",
    }));

    // DEBUG: look for known hardcoded folder IDs in the listing
      const knownIds = [
        "1OeQqwHkzqjCdPUdnpDPerBNtQF6_mwVn",
        "1j6mhfRzmeOQ3ythpSviOy9pvddzi8luQ",
        "1ZwRJm6JfDi57AJIrIw3SPuY6LYFOAews",
        "1kiRnlbHMtiE2QbuskK_1zZBtVzRVLY6W",
        "19h18hd2BTcbYx2rtInuOoL1H2jqoTjf_",
        "12L03abGuMhUZGwDMJnf_A3122xJIIjih",
        "185b-bn37rILVnN36no-40qfJnnHyw5ex",
        "1HRSsWa7rmST9uBYYl756FAx0ZDEiFiVr",
      ];
      const knownFound = allFiles.filter((f: any) => knownIds.includes(f.id));
      return NextResponse.json({
        debugAllCount: allFiles.length,
        debugKnownFound: knownFound.map((f: any) => ({
          id: f.id,
          name: f.name,
          parents: f.parents,
        })),
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