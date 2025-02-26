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

import { ResponseQualityFlowInputSchema, ResponseQualityFlowOutputSchema, OUTCOME, USERSENTIMENT, ResponseQualityFlowOutput } from './verifyQualityTypes'
import { ConversationQualityAnalysisPromptText } from './prompts';
import { ai } from './genkitConfig'
import { parseJsonResponse } from './responseHandler';


export const QualityFlowPrompt = ai.definePrompt(
  {
    name: 'qualityFlowPrompt',
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
      const response = await QualityFlowPrompt({ history: input.history });
      console.log("qualityFlow");
      const jsonResponse = parseJsonResponse(response.text) //JSON.parse(response.text);
      console.log("quality response:", jsonResponse)
      const output: ResponseQualityFlowOutput = {
        "outcome": jsonResponse.outcome || OUTCOME.parse('OUTCOMEUNKNOWN'),
        "userSentiment": getSentiment(jsonResponse.sentiment),
      }
      return output;
    } catch (error) {
      console.error("Error generating response:", error);
      return {
        outcome: OUTCOME.parse('OUTCOMEUNKNOWN'),
        userSentiment: USERSENTIMENT.parse('SENTIMENTUNKNOWN'),
      };
    }
  }
);

function getSentiment(s: any): any {
  if (String(s).startsWith("SENTIMENT")) {
    return s
  } else {
    return USERSENTIMENT.parse('SENTIMENTUNKNOWN')
  }
}