import { NextResponse } from "next/server";
import { generateVirtualTryOnImages } from "@/ai/flows/generate-virtual-try-on-images";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateVirtualTryOnImages(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Virtual try-on API error:", error);
    return NextResponse.json({ error: "Failed to generate virtual try-on" }, { status: 500 });
  }
}
