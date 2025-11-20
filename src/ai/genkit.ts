import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * Genkit AI instance configured with Google AI (Gemini)
 */
export const ai = genkit({
  plugins: [
    googleAI({
      projectId: process.env.GCLOUD_PROJECT,
      location: process.env.GCLOUD_LOCATION || 'us-central1',
    }),
  ],
  model: 'gemini-2.0-flash',
});
