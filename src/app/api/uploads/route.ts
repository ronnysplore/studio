import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { fileName, fileData, folderType } = await request.json();

    if (!fileName || !fileData) {
      return NextResponse.json({ error: "Missing fileName or fileData" }, { status: 400 });
    }

    const folder = folderType || "misc";
    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // Expect data URI: data:<mime>;base64,<data>
    const matches = fileData.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: "Invalid data URI" }, { status: 400 });
    }

    const mime = matches[1];
    const base64 = matches[2];
    const buffer = Buffer.from(base64, "base64");

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const safeName = `${id}-${fileName.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);

    await fs.promises.writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${safeName}`;

    return NextResponse.json({ id, url, fileName: safeName });
  } catch (error) {
    console.error("Error saving upload:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
