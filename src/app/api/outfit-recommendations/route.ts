import { NextResponse } from "next/server";
import { generateOutfitRecommendations } from "@/ai/flows/generate-outfit-recommendations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateOutfitRecommendations(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Outfit recommendations API error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
