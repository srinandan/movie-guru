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

import { z } from 'genkit';
import { ModelOutputMetadata, ModelOutputMetadataSchema } from './modelOutputMetadataTypes';

// Enums as Zod Enums
const MovieFeatureCategory = z.enum(['OTHER', 'ACTOR', 'DIRECTOR', 'GENRE']);
const Sentiment = z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']);

// ProfileChangeRecommendation schema
export const ProfileChangeRecommendationSchema = z.object({
  item: z.string(),
  reason: z.string(),
  category: MovieFeatureCategory,
  sentiment: Sentiment,
});

export type ProfileChangeRecommendation = z.infer<typeof ProfileChangeRecommendationSchema>

// UserProfileFlowInput schema
export const UserProfileFlowInputSchema = z.object({
  query: z.string(),
  agentMessage: z.string(),
});

export type UserProfileFlowInput = z.infer<typeof UserProfileFlowInputSchema>

// UserProfileFlowOutput schema
export const UserProfileFlowOutputSchema = z.object({
  profileChangeRecommendations: z.array(ProfileChangeRecommendationSchema),
  modelOutputMetadata: ModelOutputMetadataSchema
});

export type UserProfileFlowOutput = z.infer<typeof UserProfileFlowOutputSchema>
