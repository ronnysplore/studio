import { NextResponse } from "next/server";
import { generateBusinessCatalog } from "@/ai/flows/generate-business-catalogs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateBusinessCatalog(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Business catalog API error:", error);
    return NextResponse.json({ error: "Failed to generate business catalog" }, { status: 500 });
  }
}
