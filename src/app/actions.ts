// @/app/actions.ts
'use server';

import type {
  AnalyzeColorPaletteInput,
  AnalyzeColorPaletteOutput,
} from '@/ai/flows/analyze-color-palette';
import type {
  GenerateVirtualTryOnImagesInput,
  GenerateVirtualTryOnImagesOutput,
} from '@/ai/flows/generate-virtual-try-on-images';
import type {
  GenerateBusinessCatalogInput,
  GenerateBusinessCatalogOutput,
} from '@/ai/flows/generate-business-catalogs';

export async function getColorPalette(
  input: AnalyzeColorPaletteInput
): Promise<AnalyzeColorPaletteOutput | { error: string }> {
  try {
    const { analyzeColorPalette } = await import('@/ai/flows/analyze-color-palette');
    const result = await analyzeColorPalette(input);
    return result;
  } catch (e: any) {
    console.error('Color palette analysis error:', e);
    return { error: e.message || 'Failed to analyze color palette.' };
  }
}

export async function getVirtualTryOn(
  input: GenerateVirtualTryOnImagesInput
): Promise<GenerateVirtualTryOnImagesOutput | { error: string }> {
  try {
    const { generateVirtualTryOnImages } = await import('@/ai/flows/generate-virtual-try-on-images');
    const result = await generateVirtualTryOnImages(input);
    return result;
  } catch (e: any) {
    console.error('Virtual try-on error:', e);
    return { error: e.message || 'Failed to generate virtual try-on. Please try again.' };
  }
}

export async function getBusinessCatalog(
  input: GenerateBusinessCatalogInput
): Promise<GenerateBusinessCatalogOutput | { error:string }> {
  try {
    const { generateBusinessCatalog } = await import('@/ai/flows/generate-business-catalogs');
    const result = await generateBusinessCatalog(input);
    return result;
  } catch (e: any) {
    console.error('Business catalog error:', e);
    return { error: e.message || 'Failed to generate catalog.' };
  }
}
