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

import { UserProfileFlowOutput, UserProfileFlowInputSchema, UserProfileFlowOutputSchema } from './userProfileTypes'
import { UserProfilePromptText } from './prompts';
import { ai, safetySettings } from './genkitConfig'
import { GenerationBlockedError } from 'genkit';
import { parseBooleanfromField } from '.';
import { parseJsonResponse } from './responseHandler';

export const UserProfileFlowPrompt = ai.definePrompt(
  {
    name: 'userProfileFlowPrompt',
    input: {
      schema: UserProfileFlowInputSchema,
    },
    output: {
      format: 'json',
    },
    config: {
      safetySettings: safetySettings
    }
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
      console.log("userProfileFlow");
      const jsonResponse = parseJsonResponse(response.text) //JSON.parse(response.text);

      const output: UserProfileFlowOutput = {
        profileChangeRecommendations: jsonResponse.profileChangeRecommendations,
        modelOutputMetadata: {
          justification: jsonResponse.justification,
          safetyIssue: parseBooleanfromField(jsonResponse.safetyIssue)
        }
      }
      return output
    } catch (error) {
      if (error instanceof GenerationBlockedError) {
        console.error("UserProfileFlow: GenerationBlockedError generating response:", error.message);
        return {
          profileChangeRecommendations: [],
          modelOutputMetadata: {
            justification: "",
            safetyIssue: true,
          }
        };
      }
      else if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
        console.error("UserProfileFlow: There is a quota issue:", error.message);
        return {
          profileChangeRecommendations: [],
          modelOutputMetadata: {
            justification: "",
            safetyIssue: false,
            quotaIssue: true
          }
        };
      }
      else {
        console.error("UserProfileFlow: Error generating response:", error);
        throw error;
      }
    }
  }
);

