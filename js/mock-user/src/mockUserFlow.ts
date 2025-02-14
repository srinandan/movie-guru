import { ai } from './genkitConfig'
import { gemini15Flash } from '@genkit-ai/vertexai';
import {MockUserFlowInputSchema, MockUserFlowOutputSchema, MockUserFlowOutput} from './mockUserFlowTypes'
import { MockUserFlowPrompt } from './prompts';

export const MockUserPrompt = ai.definePrompt(
    {
      name: 'mockUserFlow',
      model: gemini15Flash,
      input: {
        schema: MockUserFlowInputSchema,
      },
      output: {
        format: 'json',
        schema: MockUserFlowOutputSchema,
      },  
    }, 
    MockUserFlowPrompt
)
  export const MockUserFlow = ai.defineFlow(
    {
      name: 'mockUserFlow',
      inputSchema: MockUserFlowInputSchema,
      outputSchema: MockUserFlowOutputSchema
    },
    async (input) => {
      try {
        console.log("Generating response...", input);
        const response = await MockUserPrompt({ input: input });
        const jsonResponse =  JSON.parse(response.text);
        const output: MockUserFlowOutput = {
          "answer":  jsonResponse.answer,
        }
        return output
      } catch (error) {
        console.error("Error generating response:", error, input);
        return { 
          answer: "",
         }; 
      }
    }
  );
  