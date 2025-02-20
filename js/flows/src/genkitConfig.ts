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

import { gemini20Flash001, gemini15Flash, vertexAI } from '@genkit-ai/vertexai';
import { ollama } from 'genkitx-ollama';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp } from 'firebase-admin/app';
import { HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';

import { genkit } from 'genkit';


// Read environment variable
const modelType = process.env.MODEL_TYPE || 'gemini15Flash'; // Default to 'gemini20'

const LOCATION = process.env.LOCATION || 'us-central1';
const PROJECT_ID = process.env.PROJECT_ID;

export var ai = genkit({})

switch (modelType) {
  case 'gemini15':
    console.log("Using Gemini 1.5 Flash");
    ai = genkit({
      plugins: [vertexAI({ location: LOCATION, projectId: PROJECT_ID })],
      model: gemini15Flash
    })
    break;
  case 'gemini20':
    console.log("Using Gemini 2.0 Flash");
    ai = genkit({
      plugins: [vertexAI({ location: LOCATION, projectId: PROJECT_ID })],
      model: gemini20Flash001
    })
    break;
  case 'ollama':
    console.log("Using Ollama");
    ai = genkit({
      plugins: [
        ollama({
          models: [
            {
              name: 'gemma:9b',
              type: 'chat', // type: 'chat' | 'generate' | undefined
            },
          ],
          serverAddress: 'http://ollama-service.movieguru.svc.cluster.local:8080', // default local address
        }),
      ],
      model: 'ollama/gemma',
    });

    ai.retrieve
    break;
  default:
    throw new Error(`Unknown model type: ${modelType}`);
}


enableFirebaseTelemetry();


initializeApp({
  projectId: PROJECT_ID,
});


export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

