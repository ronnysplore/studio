import { auth } from "@/auth";
import { GoogleDriveService } from "@/lib/google-drive";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, fileData, folderType } = await request.json();

    const driveService = new GoogleDriveService(session.accessToken);
    const folders = await driveService.initializeFolders();

    let folderId: string;
    switch (folderType) {
      case "userPhotos":
        folderId = folders.userPhotosFolderId;
        break;
      case "wardrobeItems":
        folderId = folders.wardrobeItemsFolderId;
        break;
      case "generatedOutfits":
        folderId = folders.generatedOutfitsFolderId;
        break;
      default:
        folderId = folders.mainFolderId;
    }

    const result = await driveService.uploadFile(fileName, fileData, folderId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading to Drive:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderType = searchParams.get("folderType");

    const driveService = new GoogleDriveService(session.accessToken);
    const folders = await driveService.initializeFolders();

    let folderId: string;
    switch (folderType) {
      case "userPhotos":
        folderId = folders.userPhotosFolderId;
        break;
      case "wardrobeItems":
        folderId = folders.wardrobeItemsFolderId;
        break;
      case "generatedOutfits":
        folderId = folders.generatedOutfitsFolderId;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid folder type" },
          { status: 400 }
        );
    }

    const files = await driveService.listFiles(folderId);

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing Drive files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
