'use server';

/**
 * @fileOverview Analyzes a user's photo to determine their seasonal color palette.
 *
 * - analyzeColorPalette - A function that returns a color palette analysis.
 */

import {ai} from '@/ai/genkit';
import {
  AnalyzeColorPaletteInput,
  AnalyzeColorPaletteInputSchema,
  AnalyzeColorPaletteOutput,
  AnalyzeColorPaletteOutputSchema,
} from '@/ai/schemas';

export async function analyzeColorPalette(
  input: AnalyzeColorPaletteInput
): Promise<AnalyzeColorPaletteOutput> {
  return analyzeColorPaletteFlow(input);
}

// A simple text prompt for the primary image analysis
const analysisPrompt = `You are an expert personal stylist specializing in color analysis. Analyze the provided user image to determine their seasonal color palette.

Analyze the user's skin undertones (cool, warm, or neutral), hair color, and eye color from the image. Based on this analysis, determine which of the 12 seasonal color palettes they fit into (e.g., Light Spring, Deep Autumn, Cool Winter, etc.).

Your response should be a simple text block containing:
1. The determined seasonal color palette name.
2. A list of 5-7 hex color codes for that palette.
3. A helpful paragraph explaining the characteristics of this season and why these colors are suitable.

User's Photo: {{media url=userImageDataUri}}`;


// A flow that uses a two-step process:
// 1. Analyze the image with a powerful vision model.
// 2. Take the text output and structure it into JSON with a fast text model.
const analyzeColorPaletteFlow = ai.defineFlow(
  {
    name: 'analyzeColorPaletteFlow',
    inputSchema: AnalyzeColorPaletteInputSchema,
    outputSchema: AnalyzeColorPaletteOutputSchema,
  },
  async input => {
    // Step 1: Analyze the image and get a text response.
    // We use the model we know works for image tasks.
    const analysisResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {text: analysisPrompt},
        {media: {url: input.userImageDataUri}}
      ],
       config: {
        responseModalities: ['TEXT'],
      },
    });
    
    const analysisText = analysisResponse.text;

    // Step 2: Structure the text response into JSON using a text-focused model.
    const structuringResponse = await ai.generate({
        model: 'gemini-1.5-flash-latest',
        prompt: `Parse the following text from a color analysis and format it into a JSON object. The JSON object must match this schema:
        {
          "season": "The determined seasonal color palette (e.g., 'Warm Autumn', 'Cool Winter').",
          "palette": ["An array of 5-7 hex color codes that are most flattering for the user."],
          "description": "A detailed description of the user's color palette, explaining the characteristics and why these colors are flattering."
        }
        
        Here is the text to parse:
        ---
        ${analysisText}
        ---`,
        output: {
            format: 'json',
            schema: AnalyzeColorPaletteOutputSchema,
        },
    });

    return structuringResponse.output!;
  }
);
