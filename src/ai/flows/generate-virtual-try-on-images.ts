'use server';
/**
 * @fileOverview Generates virtual try-on images using a user-provided photo and outfit image.
 *
 * - generateVirtualTryOnImages - A function that generates virtual try-on images.
 * - GenerateVirtualTryOnImagesInput - The input type for the generateVirtualTryOnImages function.
 * - GenerateVirtualTryOnImagesOutput - The return type for the generateVirtualTryOnImages function.
 */

import {ai} from '@/ai/genkit';
import {imagen3} from '@genkit-ai/vertexai';
import {z} from 'genkit';

const GenerateVirtualTryOnImagesInputSchema = z.object({
  userPhotoDataUri: z
    .string()
    .describe(
      'A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  outfitImageDataUri: z
    .string()
    .describe(
      'A photo of the outfit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateVirtualTryOnImagesInput = z.infer<typeof GenerateVirtualTryOnImagesInputSchema>;

const GenerateVirtualTryOnImagesOutputSchema = z.object({
  tryOnImageDataUri: z
    .string()
    .describe('The generated try-on image, as a data URI.'),
});
export type GenerateVirtualTryOnImagesOutput = z.infer<typeof GenerateVirtualTryOnImagesOutputSchema>;

export async function generateVirtualTryOnImages(
  input: GenerateVirtualTryOnImagesInput
): Promise<GenerateVirtualTryOnImagesOutput> {
  return generateVirtualTryOnImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVirtualTryOnImagesPrompt',
  input: {schema: GenerateVirtualTryOnImagesInputSchema},
  output: {schema: GenerateVirtualTryOnImagesOutputSchema},
  prompt: [
    {
      text: `You are a professional virtual fashion try-on AI. Your task is to generate a photorealistic image of a person wearing specific clothing.

CRITICAL INSTRUCTIONS:
- Generate ONLY an image of the person wearing the clothing
- DO NOT generate abstract images, landscapes, or unrelated content
- The output MUST show the person from the first image wearing the clothing from the second image
- Preserve the person's facial features, body proportions, and pose exactly
- Apply the clothing item naturally with realistic fit, wrinkles, and fabric behavior
- Match the original photo's lighting, background, and photography style
- Ensure seamless integration between the person and the clothing`,
    },
    {
      media: {url: '{{userPhotoDataUri}}'},
    },
    {
      text: 'Person to dress (maintain their exact appearance, pose, and setting)',
    },
    {
      media: {url: '{{outfitImageDataUri}}'},
    },
    {
      text: 'Clothing item to apply to the person above. Generate the image NOW showing the person wearing this clothing.',
    },
  ],
  model: 'googleai/gemini-2.5-flash-image',
  config: {
    temperature: 0.3,
    topK: 20,
    topP: 0.8,
    responseModalities: ['IMAGE'],
  },
});

const generateVirtualTryOnImagesFlow = ai.defineFlow(
  {
    name: 'generateVirtualTryOnImagesFlow',
    inputSchema: GenerateVirtualTryOnImagesInputSchema,
    outputSchema: GenerateVirtualTryOnImagesOutputSchema,
  },
  async input => {
    // Extract content type from data URI
    const getContentType = (dataUri: string): string => {
      const match = dataUri.match(/^data:([^;]+);/);
      return match ? match[1] : 'image/jpeg';
    };

    const userPhotoContentType = getContentType(input.userPhotoDataUri);
    const outfitContentType = getContentType(input.outfitImageDataUri);

    // Use Imagen 3 for virtual try-on image generation
    const result = await ai.generate({
      model: imagen3,
      prompt: [
        {
          text: `You are a professional virtual fashion try-on AI. Your task is to generate a photorealistic image of a person wearing specific clothing.

CRITICAL INSTRUCTIONS:
- Generate ONLY an image of the person wearing the clothing
- DO NOT generate abstract images, landscapes, or unrelated content
- The output MUST show the person from the first image wearing the clothing from the second image
- Preserve the person's facial features, body proportions, and pose exactly
- Apply the clothing item naturally with realistic fit, wrinkles, and fabric behavior
- Match the original photo's lighting, background, and photography style
- Ensure seamless integration between the person and the clothing`,
        },
        {
          media: {
            url: input.userPhotoDataUri,
            contentType: userPhotoContentType,
          },
        },
        {
          text: 'Person to dress (maintain their exact appearance, pose, and setting)',
        },
        {
          media: {
            url: input.outfitImageDataUri,
            contentType: outfitContentType,
          },
        },
        {
          text: 'Clothing item to apply to the person above. Generate the image NOW showing the person wearing this clothing.',
        },
      ],
      config: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
      },
      output: {
        format: 'media',
      },
    });
    
    // Log the full response for debugging
    console.log('=== GEMINI RESPONSE DEBUG ===');
    console.log('Full result object:', JSON.stringify(result, null, 2));
    console.log('Result keys:', Object.keys(result));
    console.log('result.text:', result.text);
    console.log('result.media:', result.media);
    console.log('result.output:', result.output);
    console.log('result.data:', result.data);
    console.log('Type of result:', typeof result);
    console.log('=== END GEMINI RESPONSE ===');
    
    // The gemini-2.5-flash-image model returns the generated image as a data URI
    // in the text output: data:image/png;base64,<b64_encoded_generated_image>
    const imageDataUri = result.text;
    
    console.log('Extracted imageDataUri:', imageDataUri?.substring(0, 100));
    console.log('Starts with data:image/?', imageDataUri?.startsWith('data:image/'));
    
    if (!imageDataUri || !imageDataUri.startsWith('data:image/')) {
      console.error('FAILED: No valid image data URI. Full result:', JSON.stringify(result, null, 2));
      throw new Error('No valid image data URI generated by the model. Response: ' + JSON.stringify(result));
    }
    
    return {tryOnImageDataUri: imageDataUri};
  }
);
