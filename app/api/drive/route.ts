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
    
    // Specific folder IDs that Eric wants to see (the 15 he shared)
    const targetFolderIds = [
      "1OeQqwHkzqjCdPUdnpDPerBNtQF6_mwVn", // DJ Library
      "1j6mhfRzmeOQ3ythpSviOy9pvddzi8luQ", // Wicked Liquid Productions Business
      "1ZwRJm6JfDi57AJIrIw3SPuY6LYFOAews", // Education & Resources
      "1kiRnlbHMtiE2QbuskK_1zZBtVzRVLY6W", // Headshots
      "19h18hd2BTcbYx2rtInuOoL1H2jqoTjf_", // Micah
      "12L03abGuMhUZGwDMJnf_A3122xJIIjih", // (another Micah?)
      "185b-bn37rILVnN36no-40qfJnnHyw5ex", // OpenClaw Backup
      "1HRSsWa7rmST9uBYYl756FAx0ZDEiFiVr", // Personal
      "1xspZQ4pdkvXpcuU89dpD4tne_VZ76SKX", // Stuff to Move to Desktop
      "1CpzbBC9Fh7zf0oee_AIX0nbcUnvg7796", // (unknown)
      "1nIw_tGmirbeqktx-s4nHBO_xeHCrg2gY", // Sample Packs
      "1r9ES0o0Fb3FMJAuxlrQusMwrhXFOl8Bl", // (unknown)
      "1ziaxg_5-siAizY5MSqSd4v-7CR3-rMOD", // (unknown)
      "1ChDveR3dbX3aNzmtb4NT3u-PFNxgBJRR", // (unknown)
      "15EKT4q9sWQyM0yo4U1uA5WoAkz-aHttE", // (unknown)
    ];
    
    // Fetch each folder by ID
    const allFiles: DriveFileData[] = [];
    for (const folderId of targetFolderIds) {
      try {
        const response = await drive.files.get({
          fileId: folderId,
          fields: "id, name, mimeType, modifiedTime, size, webViewLink, shared, owners",
        });
        if (response.data) {
          allFiles.push(response.data);
        }
      } catch {
        // Folder might not be accessible, skip silently
      }
    }
    
    // Transform to our format
    const transformed = allFiles.map((f) => ({
      id: f.id,
      name: f.name,
      type: "folder",
      mimeType: f.mimeType,
      modifiedTime: f.modifiedTime,
      size: f.size,
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
