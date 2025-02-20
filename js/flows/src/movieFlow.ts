/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ai, safetySettings } from './genkitConfig'
import { MovieFlowInputSchema, MovieFlowOutputSchema, MovieFlowOutput } from './movieFlowTypes'
import { MovieFlowPromptText } from './prompts';
import { GenerationBlockedError } from 'genkit';

export const MovieFlowPrompt = ai.definePrompt(
  {
    name: 'movieFlowPrompt',
    input: {
      schema: MovieFlowInputSchema,
    },
    output: {
      format: 'json',
    },  
    config:{
      safetySettings: safetySettings
      }
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
          "safetyIssue": !! jsonResponse.safetyIssue || false,
        }
      }

      if(output.wrongQuery){
        console.log("wrong query found")
      }
      return output
    } catch (error) {
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
        throw error;
      }
    }
  }
);