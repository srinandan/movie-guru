import { gemini15Flash } from '@genkit-ai/vertexai';
import {
  USERINTENT,
  QueryTransformFlowInputSchema,
  QueryTransformFlowOutputSchema,
  QueryTransformFlowOutput
} from './queryTransformTypes';
import { QueryTransformPromptText } from './prompts';
import { ai } from './genkitConfig';
import { GenerationBlockedError } from 'genkit';

export const QueryTransformPrompt = ai.definePrompt(
  {
    name: 'queryTransformFlowPrompt',
    model: gemini15Flash,
    input: {
      schema: QueryTransformFlowInputSchema,
    },
    output: {
      format: 'json',
    },
  },
  QueryTransformPromptText
);

export const QueryTransformFlow = ai.defineFlow(
  {
    name: 'queryTransformFlow',
    inputSchema: QueryTransformFlowInputSchema,
    outputSchema: QueryTransformFlowOutputSchema,
  },
  async (input) => {
    try {
      const response = await QueryTransformPrompt({
        history: input.history,
        userMessage: input.userMessage,
        userProfile: input.userProfile,
      });

      const jsonResponse = JSON.parse(response.text)
      const qtOutput: QueryTransformFlowOutput = {
        transformedQuery: jsonResponse.transformedQuery || "",
        userIntent: USERINTENT.parse(jsonResponse.userIntent) || USERINTENT.parse('UNCLEAR'),
        modelOutputMetadata: {
          justification: jsonResponse.justification || "",
          safetyIssue: jsonResponse.safetyIssue || false,
        },
      };
      return qtOutput;
    } catch (error) {
      console.error('QTFlow: Error generating response:', {
        error,
        input,
      });
      if (error instanceof GenerationBlockedError){
        console.error("QTFlow: GenerationBlockedError generating response:", error.message);
        return {
          transformedQuery: input.userMessage,
          userIntent: USERINTENT.parse('UNCLEAR'),
          modelOutputMetadata: {
            justification: '',
            safetyIssue: true,
          },
        };
      }
      else{
        console.error("QTFlow: Error generating response:", error);
        return {
          transformedQuery: input.userMessage,
          userIntent: USERINTENT.parse('UNCLEAR'),
          modelOutputMetadata: {
            justification: '',
            safetyIssue: false,
          },
        };
      }
      
    }
  }
);
