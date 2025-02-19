import { z } from 'genkit';

export const MockUserFlowInputSchema = z.object({
  expert_answer: z.string(),
  response_mood: z.string(),
  response_type: z.string(),
});

export const MockUserFlowOutputSchema = z.object({
  answer: z.string(),
});

export type MockUserFlowInput = z.infer<typeof MockUserFlowInputSchema>
export type MockUserFlowOutput = z.infer<typeof MockUserFlowOutputSchema>
