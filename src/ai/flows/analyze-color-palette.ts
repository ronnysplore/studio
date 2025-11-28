'use server';

/**
 * @fileOverview Analyzes a user's photo to determine their seasonal color palette.
 *
 * - analyzeColorPalette - A function that returns a color palette analysis.
 * - AnalyzeColorPaletteInput - The input type for the analyzeColorPalette function.
 * - AnalyzeColorPaletteOutput - The return type for the analyzeColorPalette function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeColorPaletteInputSchema = z.object({
  userImageDataUri: z
    .string()
    .describe(
      "A close-up image of the user's face in natural light, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeColorPaletteInput = z.infer<typeof AnalyzeColorPaletteInputSchema>;


export const AnalyzeColorPaletteOutputSchema = z.object({
  season: z.string().describe("The determined seasonal color palette (e.g., 'Warm Autumn', 'Cool Winter')."),
  palette: z.array(z.string().regex(/^#[0-9A-F]{6}$/i)).describe("An array of 5-7 hex color codes that are most flattering for the user."),
  description: z.string().describe("A detailed description of the user's color palette, explaining the characteristics and why these colors are flattering."),
});
export type AnalyzeColorPaletteOutput = z.infer<typeof AnalyzeColorPaletteOutputSchema>;


export async function analyzeColorPalette(
  input: AnalyzeColorPaletteInput
): Promise<AnalyzeColorPaletteOutput> {
  return analyzeColorPaletteFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeColorPalettePrompt',
  input: {schema: AnalyzeColorPaletteInputSchema},
  output: {schema: AnalyzeColorPaletteOutputSchema},
  prompt: `You are an expert personal stylist specializing in color analysis. Your task is to analyze the provided user image to determine their seasonal color palette.

  Analyze the user's skin undertones (cool, warm, or neutral), hair color, and eye color from the image. Based on this analysis, determine which of the 12 seasonal color palettes they fit into (e.g., Light Spring, Deep Autumn, Cool Winter, etc.).

  Your response must include:
  1.  **season**: The name of the determined seasonal color palette.
  2.  **palette**: An array of 5-7 hex color codes representing the most flattering colors for this season.
  3.  **description**: A helpful paragraph explaining the characteristics of this season and why these colors are suitable for the user. Be encouraging and positive.

  User's Photo: {{media url=userImageDataUri}}`,
});

const analyzeColorPaletteFlow = ai.defineFlow(
  {
    name: 'analyzeColorPaletteFlow',
    inputSchema: AnalyzeColorPaletteInputSchema,
    outputSchema: AnalyzeColorPaletteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
