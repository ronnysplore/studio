import { NextResponse } from "next/server";
import { generateVirtualTryOnImages } from "@/ai/flows/generate-virtual-try-on-images";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Ensure outfitImageDataUris is an array
    if (body.outfitImageDataUri && !Array.isArray(body.outfitImageDataUri)) {
      body.outfitImageDataUris = [body.outfitImageDataUri];
    } else if (!body.outfitImageDataUris) {
      body.outfitImageDataUris = [];
    }

    const result = await generateVirtualTryOnImages(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Virtual try-on API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate virtual try-on";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
