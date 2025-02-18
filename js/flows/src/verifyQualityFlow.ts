import { gemini15Flash } from '@genkit-ai/vertexai';
import {ResponseQualityFlowInputSchema, ResponseQualityFlowOutputSchema, OUTCOME, USERSENTIMENT, ResponseQualityFlowOutput} from './verifyQualityTypes'
import { ConversationQualityAnalysisPromptText } from './prompts';
import { ai } from './genkitConfig'

export const QualityFlowPrompt = ai.definePrompt(
    {
      name: 'qualityFlowPrompt',
      model: gemini15Flash,
      input: {
        schema: ResponseQualityFlowInputSchema,
      },
      output: {
        format: 'json',
      },  
    }, 
    ConversationQualityAnalysisPromptText)
  
  export const QualityFlow = ai.defineFlow(
    {
      name: 'qualityFlow',
      inputSchema: ResponseQualityFlowInputSchema,
      outputSchema: ResponseQualityFlowOutputSchema
    },
    async (input) => {
      try {
        const response = await QualityFlowPrompt({ history: input.history });
        const jsonResponse =  JSON.parse(response.text);
        console.log("quality response:", jsonResponse)
        const output: ResponseQualityFlowOutput = {
          "outcome":  jsonResponse.outcome || OUTCOME.parse('OUTCOMEUNKNOWN'),
          "userSentiment": jsonResponse.sentiment  || USERSENTIMENT.parse('SENTIMENTUNKNOWN'),
        }
        return output;
      } catch (error) {
        console.error("Error generating response:", error);
        return { 
          outcome: OUTCOME.parse('OUTCOMEUNKNOWN'),
          userSentiment: USERSENTIMENT.parse('SENTIMENTUNKNOWN'),         
         }; 
      }
    }
  );
  