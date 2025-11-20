import {genkit} from 'genkit';
import {vertexAI, imagen3} from '@genkit-ai/vertexai';

/**
 * Genkit AI instance configured with Vertex AI
 * Uses Imagen 3 for image generation
 * and Gemini 2.0 Flash for text generation
 */
export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: process.env.GCLOUD_PROJECT,
      location: process.env.GCLOUD_LOCATION || 'us-central1',
    }),
  ],
  model: 'vertexai/gemini-2.0-flash',
});
