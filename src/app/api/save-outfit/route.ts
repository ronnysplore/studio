import { auth } from "@/auth";
import { GoogleDriveService } from "@/lib/google-drive";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageDataUri, fileName } = await request.json();

    const driveService = new GoogleDriveService(session.accessToken);
    const folders = await driveService.initializeFolders();

    const result = await driveService.uploadFile(
      fileName || `outfit-${Date.now()}.png`,
      imageDataUri,
      folders.generatedOutfitsFolderId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving generated outfit:", error);
    return NextResponse.json(
      { error: "Failed to save outfit" },
      { status: 500 }
    );
  }
}
