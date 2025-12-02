'use server';
/**
 * @fileOverview Generates virtual try-on images using a user-provided photo and outfit image.
 *
 * - generateVirtualTryOnImages - A function that generates virtual try-on images.
 * - GenerateVirtualTryOnImagesInput - The input type for the generateVirtualTryOnImages function.
 * - GenerateVirtualTryOnImagesOutput - The return type for the generateVirtualTryOnImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVirtualTryOnImagesInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      "A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  outfitImageDataUris: z
    .array(z.string())
    .describe(
      "An array of photos of the outfit items, as data URIs that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  customInstructions: z
    .string()
    .optional()
    .describe(
      "Optional custom styling instructions from the user, such as occasion, style preferences, or specific requirements."
    ),
});
export type GenerateVirtualTryOnImagesInput = z.infer<typeof GenerateVirtualTryOnImagesInputSchema>;

const GenerateVirtualTryOnImagesOutputSchema = z.object({
  tryOnImageDataUri: z
    .string()
    .describe('The generated try-on image, as a data URI.'),
  usage: z.object({
    inputTokens: z.number().describe('Number of input tokens used'),
    outputTokens: z.number().describe('Number of output tokens used'),
    inputCostUsd: z.number().describe('Cost of input tokens in USD'),
    outputCostUsd: z.number().describe('Cost of output image in USD'),
    totalCostUsd: z.number().describe('Total cost in USD'),
  }).optional().describe('Token usage and cost information'),
});
export type GenerateVirtualTryOnImagesOutput = z.infer<typeof GenerateVirtualTryOnImagesOutputSchema>;

// Pricing constants for Gemini 2.5 Flash Image
const INPUT_PRICE_PER_MILLION_TOKENS_USD = 0.30; // $0.30 per 1M tokens for text/image input
const OUTPUT_PRICE_PER_MILLION_TOKENS_USD = 30.00; // $30 per 1M tokens for image output
const OUTPUT_IMAGE_TOKENS = 1290; // Tokens consumed by output image up to 1024x1024px

export async function generateVirtualTryOnImages(
  input: GenerateVirtualTryOnImagesInput
): Promise<GenerateVirtualTryOnImagesOutput> {
  return generateVirtualTryOnImagesFlow(input);
}

const generateVirtualTryOnImagesFlow = ai.defineFlow(
  {
    name: 'generateVirtualTryOnImagesFlow',
    inputSchema: GenerateVirtualTryOnImagesInputSchema,
    outputSchema: GenerateVirtualTryOnImagesOutputSchema,
  },
  async input => {
    const mediaParts = input.outfitImageDataUris.map(uri => ({ media: { url: uri } }));

    // Create custom instructions text if provided
    const customInstructionsText = input.customInstructions 
      ? `\n\nADDITIONAL STYLING REQUIREMENTS:\n- User Request: "${input.customInstructions}"\n- Ensure the final result aligns with this specific styling direction while maintaining all other protocols.\n- Adapt the clothing fit, styling, and presentation to match the requested aesthetic or occasion.`
      : "";

    // Use gemini-2.5-flash-image-preview (nano-banana) for virtual try-on image generation
    const result = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview', // Ensure this model ID is correct for your provider
      prompt: [
        {
          text: `You are a High-Fidelity Virtual Try-On Engine. Your sole function is to perform photorealistic image manipulation to digitally dress the target person in the provided clothing items.
    
    STRICT OPERATIONAL PROTOCOLS:
    
    1. THE ANCHOR (Immutable Data):
       - The first image provided is the "Anchor."
       - You MUST preserve the Anchor's exact facial features, hair, skin texture, body shape, pose, background, and lighting conditions.
       - DO NOT regenerate the face. The identity must be a pixel-perfect match to the source.
       - DO NOT alter the background or environment.
    
    2. THE ASSETS (Mutable Data):
       - All subsequent images are "Assets" (clothing).
       - Extract the texture, pattern, and material properties from the Assets.
       - Warp and drape these Assets onto the Anchor's body using realistic physics (gravity, tension, folds).
       - If multiple Assets are provided, layer them logically (e.g., inner wear first, outerwear second).
    
    3. INTEGRATION & LIGHTING:
       - The clothing must interact with the Anchor's original lighting. Cast shadows where the clothes meet the skin.
       - Match the grain and resolution of the clothing to the Anchor image.
       - Ensure the clothing follows the volumetric curve of the body; it must not look like a flat sticker.
    
    FORBIDDEN ACTIONS:
    - DO NOT output illustrations, cartoons, or artistic interpretations.
    - DO NOT change the person's gender, ethnicity, or age.
    - DO NOT generate a new background.
    - DO NOT crop the head or change the camera angle.
    
    FINAL OUTPUT REQUIREMENT:
    Return ONLY the modified Anchor image with the Assets applied. The result must be indistinguishable from a real photograph taken in the original setting.${customInstructionsText}`,
        },
        { media: { url: input.userPhotoDataUri } },
        ...mediaParts,
      ],
      config: {
        responseModalities: ['IMAGE'],
        // Lower temperature forces more deterministic, "grounded" results
        temperature: 0.1, 
        // Lower TopK restricts the model to the most probable pixels, reducing weird artifacts
        topK: 10,         
        topP: 0.9,
      },
    });

    const imageDataUri = result.media?.url;
    
    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
      console.error('FAILED: No valid image data URI. Full result:', JSON.stringify(result, null, 2));
      throw new Error('No valid image data URI generated by the model. Response: ' + JSON.stringify(result));
    }

    // Calculate token usage and costs
    const inputTokens = result.usage?.inputTokens ?? 0;
    const outputTokens = OUTPUT_IMAGE_TOKENS; // Fixed output tokens for image generation
    
    const inputCostUsd = (inputTokens / 1_000_000) * INPUT_PRICE_PER_MILLION_TOKENS_USD;
    const outputCostUsd = (outputTokens / 1_000_000) * OUTPUT_PRICE_PER_MILLION_TOKENS_USD;
    const totalCostUsd = inputCostUsd + outputCostUsd;
    
    return {
      tryOnImageDataUri: imageDataUri,
      usage: {
        inputTokens,
        outputTokens,
        inputCostUsd,
        outputCostUsd,
        totalCostUsd,
      },
    };
  }
);
