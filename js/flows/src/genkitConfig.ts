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

import { gemini20FlashExp, gemini15Flash, vertexAI } from '@genkit-ai/vertexai';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { initializeApp } from 'firebase-admin/app';
import { HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';

import { genkit } from 'genkit';


const gemini20 = process.env.USEGEMINIFLASH2 === "true" || false;
const LOCATION = process.env.LOCATION || 'us-central1';
const PROJECT_ID = process.env.PROJECT_ID;

export var model = gemini15Flash
if(gemini20){
  console.log("Using gemini 2.0 flash")
  model = gemini20FlashExp
} 
else{
  console.log("Using gemini 1.5 flash")
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

export const ai = genkit({
  plugins: [vertexAI({ location: LOCATION, projectId: PROJECT_ID })],
  model: model, // set default model
});
