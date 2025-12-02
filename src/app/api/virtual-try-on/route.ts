import { NextResponse } from "next/server";
import { generateVirtualTryOnImages } from "@/ai/flows/generate-virtual-try-on-images";
import { recordUsage } from "@/services/usage-service";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    // Get the authenticated session
    const session = await auth();
    const userEmail = session?.user?.email;

    const body = await request.json();
    const { userPhotoDataUri, outfitImageDataUris, customInstructions } = body;
    
    // Ensure outfitImageDataUris is an array
    if (body.outfitImageDataUri && !Array.isArray(body.outfitImageDataUri)) {
      body.outfitImageDataUris = [body.outfitImageDataUri];
    } else if (!body.outfitImageDataUris) {
      body.outfitImageDataUris = [];
    }

    const result = await generateVirtualTryOnImages({
      userPhotoDataUri,
      outfitImageDataUris,
      customInstructions
    });
    
    // Record usage in Firestore if user is authenticated
    if (userEmail && result.usage) {
      try {
        await recordUsage(userEmail, result.usage);
      } catch (usageError) {
        console.error("Failed to record usage:", usageError);
        // Don't fail the request if usage recording fails
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Virtual try-on API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate virtual try-on";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
