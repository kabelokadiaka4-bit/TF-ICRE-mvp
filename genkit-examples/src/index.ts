/**
 * @file This file contains a simple Genkit flow that demonstrates the basic functionality of the Genkit framework.
 * @see https://firebase.google.com/docs/genkit
 */

import { defineFlow, runFlow } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/googleai';
import { configureGenkit } from '@genkit-ai/core';

configureGenkit({
  plugins: [
    geminiPro(), // Initialize the Gemini Pro plugin
  ],
  logLevel: 'debug',
  enableTracing: true,
});

/**
 * A simple Genkit flow that takes a name as input and returns a greeting.
 *
 * @param {string} name - The name to include in the greeting.
 * @returns {string} A greeting message.
 */
export const helloWorldFlow = defineFlow(
  {
    name: 'helloWorldFlow',
    inputSchema: { type: 'string' }, // Expects a string input
    outputSchema: { type: 'string' }, // Outputs a string
  },
  async (name) => {
    return `Hello, ${name}! This is a Genkit flow.`;
  }
);

// To run this flow manually (for demonstration):
// runFlow(helloWorldFlow, 'Genkit User').then(console.log);
