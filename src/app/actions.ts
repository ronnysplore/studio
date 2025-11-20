// @/app/actions.ts
'use server';

import type {
  GenerateOutfitRecommendationsInput,
  GenerateOutfitRecommendationsOutput,
} from '@/ai/flows/generate-outfit-recommendations';
import type {
  GenerateVirtualTryOnImagesInput,
  GenerateVirtualTryOnImagesOutput,
} from '@/ai/flows/generate-virtual-try-on-images';
import type {
  GenerateBusinessCatalogInput,
  GenerateBusinessCatalogOutput,
} from '@/ai/flows/generate-business-catalogs';

export async function getOutfitRecommendations(
  input: Omit<GenerateOutfitRecommendationsInput, 'fullBodyImageDataUri' | 'faceImageDataUri' | 'wardrobeItemDataUris'>
): Promise<GenerateOutfitRecommendationsOutput | { error: string }> {
  try {
    // Mocking the AI response for UI development
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockOutput: GenerateOutfitRecommendationsOutput = [
        {
          outfitDescription: "A chic and modern look combining a classic white tee with tailored black pants. Perfect for a casual day out or a semi-formal event. Accessorize with a statement necklace.",
          outfitImageDataUri: 'https://picsum.photos/seed/outfit1/400/600',
          confidenceScore: 0.92,
        },
        {
          outfitDescription: "Embrace a bohemian vibe with this flowing floral dress. The lightweight fabric makes it ideal for warm weather, while the vibrant pattern adds a pop of color.",
          outfitImageDataUri: 'https://picsum.photos/seed/outfit2/400/600',
          confidenceScore: 0.88,
        },
        {
          outfitDescription: "A sophisticated and edgy ensemble featuring a leather jacket over a simple silk camisole and dark wash jeans. This outfit transitions effortlessly from day to night.",
          outfitImageDataUri: 'https://picsum.photos/seed/outfit3/400/600',
          confidenceScore: 0.85,
        },
    ];

    return mockOutput;
  } catch (e) {
    return { error: 'Failed to generate recommendations.' };
  }
}

export async function getVirtualTryOn(
  input: GenerateVirtualTryOnImagesInput
): Promise<GenerateVirtualTryOnImagesOutput | { error: string }> {
  try {
    const { generateVirtualTryOnImages } = await import('@/ai/flows/generate-virtual-try-on-images');
    const result = await generateVirtualTryOnImages(input);
    return result;
  } catch (e) {
    console.error('Virtual try-on error:', e);
    return { error: 'Failed to generate virtual try-on. Please try again.' };
  }
}

export async function getBusinessCatalog(
  input: Omit<GenerateBusinessCatalogInput, 'mannequinImage' | 'productImage'>
): Promise<GenerateBusinessCatalogOutput | { error:string }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockOutput: GenerateBusinessCatalogOutput = {
      catalogImage: 'https://picsum.photos/seed/catalog1/800/600'
    };
    return mockOutput;
  } catch (e) {
    return { error: 'Failed to generate catalog.' };
  }
}
