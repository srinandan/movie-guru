import { z } from 'genkit';
import { SimpleMessageSchema } from './queryTransformTypes'; 

export const OUTCOME = z.enum([
    'OUTCOMEIRRELEVANT',
    'OUTCOMEACKNOWLEDGED',
    'OUTCOMEENGAGED',
    'OUTCOMETOPICCHANGE',
    'OUTCOMEAMBIGUOUS',
    'OUTCOMEREJECTED',
    'OUTCOMEOTHER',
    'OUTCOMEUNKNOWN'
  ]);

  export const USERSENTIMENT = z.enum([
    'SENTIMENTPOSITIVE',
    'SENTIMENTNEGATIVE',
    'SENTIMENTNEUTRAL',
    'SENTIMENTAMBIGUOUS',
    'SENTIMENTUNKNOWN',
  ]);

  
// ResponseQualityFlowInput represents the input to the response quality analysis flow.
export const ResponseQualityFlowInputSchema = z.object({
  history: z.array(SimpleMessageSchema),
})

export type ResponseQualityFlowInput = z.infer<typeof ResponseQualityFlowInputSchema>

// ResponseQualityFlowOutput represents the output of the response quality analysis flow.
export const ResponseQualityFlowOutputSchema = z.object({
	outcome: OUTCOME,
	userSentiment: USERSENTIMENT,
})

export type ResponseQualityFlowOutput = z.infer<typeof ResponseQualityFlowOutputSchema>
