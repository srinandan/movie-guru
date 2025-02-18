import { ai } from './genkitConfig'
import { gemini15Flash } from '@genkit-ai/vertexai';
import {MovieFlowInputSchema, MovieFlowOutputSchema, MovieFlowOutput} from './movieFlowTypes'
import { MovieFlowPromptText } from './prompts';
import { GenerationBlockedError } from 'genkit';

export const MovieFlowPrompt = ai.definePrompt(
    {
      name: 'movieFlowPrompt',
      model: gemini15Flash,
      input: {
        schema: MovieFlowInputSchema,
      },
      output: {
        format: 'json',
      },  
    }, 
   MovieFlowPromptText
)
  export const MovieFlow = ai.defineFlow(
    {
      name: 'movieQAFlow',
      inputSchema: MovieFlowInputSchema,
      outputSchema: MovieFlowOutputSchema
    },
    async (input) => {
      try {
        const response = await MovieFlowPrompt({ history: input.history, userPreferences: input.userPreferences, userMessage: input.userMessage, contextDocuments: input.contextDocuments });
        const jsonResponse =  JSON.parse(response.text);
        const output: MovieFlowOutput = {
          "answer":  jsonResponse.answer || "",
          "relevantMovies": jsonResponse.relevantMovies || [],
          "wrongQuery": jsonResponse.wrongQuery || false,
          "modelOutputMetadata": {
            "justification": jsonResponse.justification || "",
            "safetyIssue": jsonResponse.safetyIssue || false,
          }
        }
        if(output.wrongQuery){
          console.log("wrong query found")
        }
        return output
      } catch (error) {
        console.error("MovieFlow: Error generating response:", error);
        if(error instanceof GenerationBlockedError){
          console.error("MovieFlow: GenerationBlockedError generating response:", error.message);
          return { 
            relevantMovies: [],
            answer: "",
            modelOutputMetadata: {
              "justification": "",
              "safetyIssue": true,
            }
           }; 
        }
        else{
          console.error("MovieFlow: Error generating response:", error);
          return { 
            relevantMovies: [],
            answer: "",
            modelOutputMetadata: {
              "justification": "",
              "safetyIssue": false,
            }
           }; 
        }
       
      }
    }
  );
  