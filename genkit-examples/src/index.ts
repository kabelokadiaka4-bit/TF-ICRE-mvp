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
