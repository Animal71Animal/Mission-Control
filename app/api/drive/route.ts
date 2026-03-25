import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const DRIVE_FOLDER_ID = "root"; // Your root Drive, or specific folder ID

export async function GET(request: NextRequest) {
  try {
    // List folders in root
    const url = `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and trashed=false and '${DRIVE_FOLDER_ID}' in parents&orderBy=name&key=${GOOGLE_API_KEY}&fields=files(id,name,description)`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }
    
    const folders = (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      desc: f.description || "",
    }));
    
    return NextResponse.json({ folders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Drive folders" }, { status: 500 });
  }
}
