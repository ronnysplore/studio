import { NextResponse } from "next/server";
import { analyzeColorPalette } from "@/ai/flows/analyze-color-palette";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await analyzeColorPalette(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Color palette API error:", error);
    const errorMessage = error.message || "Failed to analyze color palette";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
