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
import {
  USERINTENT,
  QueryTransformFlowInputSchema,
  QueryTransformFlowOutputSchema,
} from './queryTransformTypes';
import { QueryTransformPromptText } from './prompts';
import { ai } from './genkitConfig';

export const QueryTransformPrompt = ai.definePrompt(
  {
    name: 'queryTransformFlowPrompt',
    model: gemini20FlashExp,
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

      if (typeof response.text !== 'string') {
        throw new Error('Invalid response format: text property is not a string.');
      }

      const jsonResponse = JSON.parse(response.text)
      return {
        transformedQuery: jsonResponse.transformedQuery || "",
        userIntent: jsonResponse.userIntent || 'UNCLEAR',
        modelOutputMetadata: {
          justification: jsonResponse.justification || "",
          safetyIssue: jsonResponse.safetyIssue || false,
        },
      };
    } catch (error) {
      console.error('Error generating response:', {
        error,
        input,
      });

      // Return fallback response
      return {
        transformedQuery: '',
        userIntent: 'UNCLEAR',
        modelOutputMetadata: {
          justification: '',
          safetyIssue: false,
        },
      };
    }
  }
);
