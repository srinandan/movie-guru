import { gemini15Flash } from '@genkit-ai/vertexai';
import {ResponseQualityFlowInputSchema, ResponseQualityFlowOutputSchema, OUTCOME, USERSENTIMENT} from './verifyQualityTypes'
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
        console.log("history:", input.history)
        const response = await QualityFlowPrompt({ history: input.history });
        const jsonResponse =  JSON.parse(response.text);
        return {
          "outcome":  jsonResponse.outcome || 'OUTCOMEUNKNOWN',
          "userSentiment": jsonResponse.userSentiment || 'SENTIMENTUNKNOWN',
        }
      } catch (error) {
        console.error("Error generating response:", error);
        return { 
          outcome: 'OUTCOMEUNKNOWN',
          userSentiment: 'SENTIMENTUNKNOWN',         
         }; 
      }
    }
  );
  