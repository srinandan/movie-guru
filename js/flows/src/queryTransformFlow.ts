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

import {
  USERINTENT,
  QueryTransformFlowInputSchema,
  QueryTransformFlowOutputSchema,
  QueryTransformFlowOutput
} from './queryTransformTypes';
import { QueryTransformPromptText } from './prompts';
import { ai, safetySettings } from './genkitConfig';
import { GenerationBlockedError } from 'genkit';
import { parseBooleanfromField } from '.';
import { parseJsonResponse } from './responseHandler';

export const QueryTransformPrompt = ai.definePrompt(
  {
    name: 'queryTransformFlowPrompt',
    input: {
      schema: QueryTransformFlowInputSchema,
    },
    output: {
      format: 'json',
    },
    config: {
      safetySettings: safetySettings
    }
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
      console.log("queryTransformFlow");
      const jsonResponse = parseJsonResponse(response.text) //JSON.parse(response.text);
      const qtOutput: QueryTransformFlowOutput = {
        transformedQuery: jsonResponse.transformedQuery || "",
        userIntent: getUserIntent(jsonResponse.userIntent),
        modelOutputMetadata: {
          justification: jsonResponse.justification || "",
          safetyIssue: parseBooleanfromField(jsonResponse.safetyIssue)
        },
      };

      return qtOutput;
    } catch (error) {
      console.error('QTFlow: Error generating response:', {
        error,
        input,
      });
      if (error instanceof GenerationBlockedError) {

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
      else if (error instanceof Error && (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED'))) {
        console.error("QTFlow: There is a quota issue:", error.message);
        return {
          transformedQuery: "",
          userIntent: USERINTENT.parse('UNCLEAR'),
          modelOutputMetadata: {
            justification: "",
            safetyIssue: false,
            quotaIssue: true
          }
        };
      }
      else {
        console.error("QTFlow: Error generating response:", error);
        throw error;
      }

    }
  }
);

function getUserIntent(u: any): any {
  const possibleIntents: string[] = [
    'UNCLEAR',
    'GREET',
    'END_CONVERSATION',
    'REQUEST',
    'RESPONSE',
    'ACKNOWLEDGE',
  ];

  if (possibleIntents.includes(String(u))) {
    return u
  } else {
    return USERINTENT.parse('UNCLEAR')
  }
}