import { google } from "googleapis";

const FOLDER_NAME = "StyleAI";
const USER_PHOTOS_FOLDER = "User Photos";
const WARDROBE_ITEMS_FOLDER = "Wardrobe Items";
const GENERATED_OUTFITS_FOLDER = "Generated Outfits";

export class GoogleDriveService {
  private drive;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: "v3", auth });
  }

  /**
   * Get or create the main StyleAI folder
   */
  private async getOrCreateFolder(
    folderName: string,
    parentId?: string
  ): Promise<string> {
    // Search for existing folder
    const query = parentId
      ? `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const response = await this.drive.files.list({
      q: query,
      fields: "files(id, name)",
      spaces: "drive",
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!;
    }

    // Create folder if it doesn't exist
    const fileMetadata: any = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    };

    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: "id",
    });

    return folder.data.id!;
  }

  /**
   * Initialize folder structure: StyleAI/User Photos, StyleAI/Wardrobe Items, StyleAI/Generated Outfits
   */
  async initializeFolders() {
    const mainFolderId = await this.getOrCreateFolder(FOLDER_NAME);
    const userPhotosFolderId = await this.getOrCreateFolder(
      USER_PHOTOS_FOLDER,
      mainFolderId
    );
    const wardrobeItemsFolderId = await this.getOrCreateFolder(
      WARDROBE_ITEMS_FOLDER,
      mainFolderId
    );
    const generatedOutfitsFolderId = await this.getOrCreateFolder(
      GENERATED_OUTFITS_FOLDER,
      mainFolderId
    );

    return {
      mainFolderId,
      userPhotosFolderId,
      wardrobeItemsFolderId,
      generatedOutfitsFolderId,
    };
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    fileName: string,
    fileData: string, // Base64 data URI
    folderId: string
  ): Promise<{ id: string; webViewLink: string; thumbnailLink: string }> {
    // Extract MIME type and base64 data
    const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URI format");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      mimeType,
      body: require("stream").Readable.from(buffer),
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, thumbnailLink",
    });

    return {
      id: response.data.id!,
      webViewLink: response.data.webViewLink!,
      thumbnailLink: response.data.thumbnailLink!,
    };
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId: string) {
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "files(id, name, webViewLink, thumbnailLink, createdTime, size)",
      orderBy: "createdTime desc",
    });

    return response.data.files || [];
  }

  /**
   * Get file content as base64 data URI
   */
  async getFile(fileId: string): Promise<string> {
    // Get file metadata to get MIME type
    const metadata = await this.drive.files.get({
      fileId,
      fields: "mimeType",
    });

    // Get file content
    const response = await this.drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );

    const buffer = Buffer.from(response.data as ArrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = metadata.data.mimeType;

    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string) {
    await this.drive.files.delete({
      fileId,
    });
  }
}
