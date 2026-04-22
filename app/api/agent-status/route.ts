import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "..", "..", "data", "agent-status.json");
    
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), "..", "..", "data", "agent-status.json"),
      path.join(process.cwd(), "..", "data", "agent-status.json"),
      path.join(process.cwd(), "data", "agent-status.json"),
      "/home/ubuntu/wlp/data/agent-status.json",
    ];

    let fileContent = null;
    
    for (const tryPath of possiblePaths) {
      try {
        if (fs.existsSync(tryPath)) {
          fileContent = fs.readFileSync(tryPath, "utf-8");
          break;
        }
      } catch {
        // Continue to next path
      }
    }

    if (!fileContent) {
      return NextResponse.json(
        { error: "Agent status file not found" },
        { status: 404 }
      );
    }

    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading agent status:", error);
    return NextResponse.json(
      { error: "Failed to read agent status" },
      { status: 500 }
    );
  }
}
