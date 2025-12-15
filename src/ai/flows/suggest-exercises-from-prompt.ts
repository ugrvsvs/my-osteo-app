'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting video exercises based on a patient's condition described in a prompt.
 *
 * - suggestExercises - A function that takes a prompt describing a patient's condition and returns a set of recommended video exercises.
 * - SuggestExercisesInput - The input type for the suggestExercises function.
 * - SuggestExercisesOutput - The return type for the suggestExercises function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExercisesInputSchema = z.object({
  prompt: z.string().describe('A description of the patient\'s condition, including area of concern, goal, and level (e.g., \'lower back pain relief, beginner level\').'),
});
export type SuggestExercisesInput = z.infer<typeof SuggestExercisesInputSchema>;

const SuggestExercisesOutputSchema = z.object({
  exercises: z.array(
    z.object({
      title: z.string().describe('The title of the exercise video.'),
      description: z.string().describe('A brief description of the exercise and its benefits.'),
      url: z.string().url().describe('The URL of the exercise video.'),
      zone: z.string().optional().describe('The zone of the body that the exercise targets (e.g., \'lower back\').'),
      level: z.string().optional().describe('The difficulty level of the exercise (e.g., \'beginner\', \'intermediate\', \'advanced\').'),
    })
  ).describe('A list of recommended video exercises tailored to the patient\'s needs.'),
});
export type SuggestExercisesOutput = z.infer<typeof SuggestExercisesOutputSchema>;

export async function suggestExercises(input: SuggestExercisesInput): Promise<SuggestExercisesOutput> {
  return suggestExercisesFlow(input);
}

const suggestExercisesPrompt = ai.definePrompt({
  name: 'suggestExercisesPrompt',
  input: {schema: SuggestExercisesInputSchema},
  output: {schema: SuggestExercisesOutputSchema},
  prompt: `You are an AI assistant that helps doctors create personalized treatment plans for their patients.

The doctor will provide a description of the patient's condition, including the area of concern, the goal of the treatment, and the patient's level.

Based on this information, you should suggest a set of video exercises that are tailored to the patient's needs.

Here's the patient's condition: {{{prompt}}}

Please provide a list of recommended video exercises in JSON format:

{
  "exercises": [
    {
      "title": "",
      "description": "",
      "url": "",
      "zone": "",
      "level": ""
    }
  ]
}`,
});

const suggestExercisesFlow = ai.defineFlow(
  {
    name: 'suggestExercisesFlow',
    inputSchema: SuggestExercisesInputSchema,
    outputSchema: SuggestExercisesOutputSchema,
  },
  async input => {
    const {output} = await suggestExercisesPrompt(input);
    return output!;
  }
);
