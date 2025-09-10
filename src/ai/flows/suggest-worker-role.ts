'use server';

/**
 * @fileOverview A worker role suggestion AI agent.
 *
 * - suggestWorkerRole - A function that suggests a worker role based on the worker's description.
 * - SuggestWorkerRoleInput - The input type for the suggestWorkerRole function.
 * - SuggestWorkerRoleOutput - The return type for the suggestWorkerRole function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWorkerRoleInputSchema = z.object({
  workerDescription: z
    .string()
    .describe('The description of the worker, including their skills and experience.'),
});
export type SuggestWorkerRoleInput = z.infer<typeof SuggestWorkerRoleInputSchema>;

const SuggestWorkerRoleOutputSchema = z.object({
  suggestedRole: z
    .string()
    .describe('The suggested role for the worker based on their description.'),
});
export type SuggestWorkerRoleOutput = z.infer<typeof SuggestWorkerRoleOutputSchema>;

export async function suggestWorkerRole(input: SuggestWorkerRoleInput): Promise<SuggestWorkerRoleOutput> {
  return suggestWorkerRoleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkerRolePrompt',
  input: {schema: SuggestWorkerRoleInputSchema},
  output: {schema: SuggestWorkerRoleOutputSchema},
  prompt: `You are an expert in workforce management and role assignment.

You will receive a description of a worker and will suggest the most appropriate role for them.

Worker Description: {{{workerDescription}}}

Suggested Role:`,
});

const suggestWorkerRoleFlow = ai.defineFlow(
  {
    name: 'suggestWorkerRoleFlow',
    inputSchema: SuggestWorkerRoleInputSchema,
    outputSchema: SuggestWorkerRoleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
