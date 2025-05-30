'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting class activities.
 *
 * - suggestClassActivities - A function that suggests class activities based on the grade and subject.
 * - SuggestClassActivitiesInput - The input type for the suggestClassActivities function.
 * - SuggestClassActivitiesOutput - The return type for the suggestClassActivities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestClassActivitiesInputSchema = z.object({
  grade: z.string().describe('The grade level of the class.'),
  subject: z.string().describe('The subject of the class.'),
});
export type SuggestClassActivitiesInput = z.infer<typeof SuggestClassActivitiesInputSchema>;

const SuggestClassActivitiesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of suggested activities, assignments, or topics for the class.'),
});
export type SuggestClassActivitiesOutput = z.infer<typeof SuggestClassActivitiesOutputSchema>;

export async function suggestClassActivities(input: SuggestClassActivitiesInput): Promise<SuggestClassActivitiesOutput> {
  return suggestClassActivitiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestClassActivitiesPrompt',
  input: {schema: SuggestClassActivitiesInputSchema},
  output: {schema: SuggestClassActivitiesOutputSchema},
  prompt: `You are an AI assistant helping teachers to come up with activities for their classes.

  Based on the grade and subject, suggest a list of activities, assignments, or topics that the teacher could use in their class.

  Grade: {{{grade}}}
  Subject: {{{subject}}}

  Suggestions:
  `,
});

const suggestClassActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestClassActivitiesFlow',
    inputSchema: SuggestClassActivitiesInputSchema,
    outputSchema: SuggestClassActivitiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
