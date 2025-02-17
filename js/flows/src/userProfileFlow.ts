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

import { gemini20FlashExp } from '@genkit-ai/vertexai';
import { UserProfileFlowOutput, UserProfileFlowInputSchema, UserProfileFlowOutputSchema } from './userProfileTypes'
import { UserProfilePromptText } from './prompts';
import { ai } from './genkitConfig'

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
      const jsonResponse = JSON.parse(response.text);
      const output: UserProfileFlowOutput = {
        "profileChangeRecommendations": jsonResponse.profileChangeRecommendations,
        "modelOutputMetadata": {
          "justification": jsonResponse.justification,
          "safetyIssue": jsonResponse.safetyIssue,
        }
      }
      return output
    } catch (error) {
      console.error("Error generating response:", error);
      return {
        profileChangeRecommendations: [],
        modelOutputMetadata: {
          "justification": "",
          "safetyIssue": false,
        }
      };
    }
  }
);

