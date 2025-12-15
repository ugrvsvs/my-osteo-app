// Summarize Patient Activity Flow
'use server';
/**
 * @fileOverview Summarizes patient activity based on opened videos.
 *
 * - summarizePatientActivity - A function that summarizes patient activity.
 * - SummarizePatientActivityInput - The input type for the summarizePatientActivity function.
 * - SummarizePatientActivityOutput - The return type for the summarizePatientActivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePatientActivityInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  videoTitles: z.array(z.string()).describe('The titles of the videos opened by the patient.'),
});
export type SummarizePatientActivityInput = z.infer<typeof SummarizePatientActivityInputSchema>;

const SummarizePatientActivityOutputSchema = z.object({
  summary: z.string().describe('A summary of the patient activity, highlighting which videos were opened.'),
});
export type SummarizePatientActivityOutput = z.infer<typeof SummarizePatientActivityOutputSchema>;

export async function summarizePatientActivity(input: SummarizePatientActivityInput): Promise<SummarizePatientActivityOutput> {
  return summarizePatientActivityFlow(input);
}

const summarizePatientActivityPrompt = ai.definePrompt({
  name: 'summarizePatientActivityPrompt',
  input: {schema: SummarizePatientActivityInputSchema},
  output: {schema: SummarizePatientActivityOutputSchema},
  prompt: `Summarize the video activity for patient {{patientName}}. The following videos were opened: {{#each videoTitles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. Highlight which videos were opened to assess progress and adherence to the plan.`,
});

const summarizePatientActivityFlow = ai.defineFlow(
  {
    name: 'summarizePatientActivityFlow',
    inputSchema: SummarizePatientActivityInputSchema,
    outputSchema: SummarizePatientActivityOutputSchema,
  },
  async input => {
    const {output} = await summarizePatientActivityPrompt(input);
    return output!;
  }
);
