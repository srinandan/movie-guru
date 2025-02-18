import { gemini15Flash } from '@genkit-ai/vertexai';
import {UserProfileFlowOutput, UserProfileFlowInputSchema, UserProfileFlowOutputSchema} from './userProfileTypes'
import { UserProfilePromptText } from './prompts';
import { ai } from './genkitConfig'
import { GenerationBlockedError } from 'genkit';

export const UserProfileFlowPrompt = ai.definePrompt(
    {
      name: 'userProfileFlowPrompt',
      model: gemini15Flash,
      input: {
        schema: UserProfileFlowInputSchema,
      },
      output: {
        format: 'json',
      },  
    }, 
    UserProfilePromptText)
  
  export const UserProfileFlow = ai.defineFlow(
    {
      name: 'userProfileFlow',
      inputSchema: UserProfileFlowInputSchema,
      outputSchema: UserProfileFlowOutputSchema
    },
    async (input) => {
      try {
        const response = await UserProfileFlowPrompt({ query: input.query, agentMessage: input.agentMessage });
        const jsonResponse =  JSON.parse(response.text);
        const output: UserProfileFlowOutput = {
          "profileChangeRecommendations":  jsonResponse.profileChangeRecommendations,
          "modelOutputMetadata": {
            "justification": jsonResponse.justification,
            "safetyIssue": jsonResponse.safetyIssue,
          }
        }
        return output
      } catch (error) {
        if(error instanceof GenerationBlockedError){
          console.error("UserProfileFlow: GenerationBlockedError generating response:", error.message);
          return { 
            profileChangeRecommendations: [],
            modelOutputMetadata: {
              "justification": "",
              "safetyIssue": true,
            }
           }; 
        }
        else{
          console.error("UserProfileFlow: Error generating response:", error);
          return { 
            profileChangeRecommendations: [],
            modelOutputMetadata: {
              "justification": "",
              "safetyIssue": false,
            }
           }; 
        }
      }
    }
  );
  