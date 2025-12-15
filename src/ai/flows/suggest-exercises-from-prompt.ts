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
import fs from 'fs/promises';
import path from 'path';
import type { Video } from '@/lib/types';


const jsonPath = path.join(process.cwd(), 'src', 'data', 'videos.json');

async function getVideos(): Promise<Video[]> {
  try {
    const fileContent = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read videos data for AI flow:', error);
    return [];
  }
}


const SuggestExercisesInputSchema = z.object({
  prompt: z.string().describe('A description of the patient\'s condition, including area of concern, goal, and level (e.g., \'lower back pain relief, beginner level\').'),
  availableVideos: z.array(z.any()).describe('A list of available video exercises for the AI to choose from.'),
});
export type SuggestExercisesInput = z.infer<typeof SuggestExercisesInputSchema>;

const SuggestExercisesOutputSchema = z.object({
  exercises: z.array(
    z.object({
      id: z.string().describe("The unique ID of the suggested video, which must match one of the IDs from the provided video library."),
      title: z.string().describe('The title of the exercise video.'),
      description: z.string().describe('A brief description of the exercise and its benefits.'),
      url: z.string().url().describe('The URL of the exercise video.'),
      thumbnailUrl: z.string().url().describe("The URL of the video's thumbnail image."),
      duration: z.string().describe('The duration of the video.'),
      zone: z.string().describe('The zone of the body that the exercise targets (e.g., \'lower back\').'),
      level: z.string().describe('The difficulty level of the exercise (e.g., \'beginner\', \'intermediate\', \'advanced\').'),
    })
  ).describe('A list of recommended video exercises tailored to the patient\'s needs, selected exclusively from the provided library.'),
});
export type SuggestExercisesOutput = z.infer<typeof SuggestExercisesOutputSchema>;

export async function suggestExercises(input: Omit<SuggestExercisesInput, 'availableVideos'>): Promise<SuggestExercisesOutput> {
  const videos = await getVideos();
  return suggestExercisesFlow({ ...input, availableVideos: videos });
}


const suggestExercisesPrompt = ai.definePrompt({
  name: 'suggestExercisesPrompt',
  input: {schema: SuggestExercisesInputSchema},
  output: {schema: SuggestExercisesOutputSchema},
  prompt: `You are an AI assistant that helps doctors create personalized treatment plans for their patients.

The doctor will provide a description of the patient's condition and a library of available exercise videos.

Based on the patient's condition, you MUST select a few relevant video exercises ONLY from the provided library. Return them in the specified JSON format. Ensure the 'id' of each returned exercise exactly matches an 'id' from the library.

Patient's condition: {{{prompt}}}

Available video library:
{{{json availableVideos}}}
`,
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
