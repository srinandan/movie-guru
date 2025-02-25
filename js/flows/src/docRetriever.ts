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

import { Document } from '@genkit-ai/ai/retriever';
import { textEmbedding004 } from '@genkit-ai/vertexai';
import { toSql } from 'pgvector';
import { openDB } from './db';
import { ai, safetySettings, embedder } from './genkitConfig'
import { z } from 'genkit';
import { MovieContextSchema, MovieContext } from './movieFlowTypes';
import { DocSearchFlowPromptText } from './prompts';
import { ModelOutputMetadata, ModelOutputMetadataSchema } from './modelOutputMetadataTypes';
import { parseBooleanfromField } from '.';
import { parseJsonResponse } from './responseHandler';


const SearchTypeCategory = z.enum(['KEYWORD', 'VECTOR', 'MIXED', 'NONE']);


export const RetrieverOptionsSchema = z.object({
  k: z.number().optional().default(10),
  searchCategory: SearchTypeCategory.optional().default("VECTOR"),
  keywordQuery: z.string().default(""),
  vectorQuery: z.string().default(""),

});

export const QuerySchema = z.object({
  query: z.string(),
});

export const SearchFlowOutputSchema = z.object({
  keywordQuery: z.string().optional(),
  vectorQuery: z.string().optional(),
  searchCategory: SearchTypeCategory,
  modelOutputMetadata: ModelOutputMetadataSchema,
});

export const SearchFlowPrompt = ai.definePrompt(
  {
    name: 'MixedSearchFlowPrompt',
    input: {
      schema: QuerySchema,
    },
    output: {
      format: 'json',
      schema: SearchFlowOutputSchema,
    },
    config: {
      safetySettings: safetySettings
    }
  },
  DocSearchFlowPromptText
)

export const MovieDocFlow = ai.defineFlow(
  {
    name: 'movieDocFlow',
    inputSchema: QuerySchema,
    outputSchema: z.array(MovieContextSchema),
  },
  async (input) => {
    let searchFlowOutput = {
      searchCategory: SearchTypeCategory.parse("NONE"), // Initialize with "NONE"
      keywordQuery: "",
      vectorQuery: "",
      modelOutputMetadata: {
        justification: "",
        safetyIssue: false
      }
    };
    const movieContexts: MovieContext[] = [];

    try {
      const response = await SearchFlowPrompt({
        query: input.query
      })
      console.log("movieDocFlow");
      const jsonResponse = parseJsonResponse(response.text);

      searchFlowOutput = {
        vectorQuery: jsonResponse.vectorQuery || "",
        keywordQuery: jsonResponse.keywordQuery || "",
        searchCategory: jsonResponse.searchCategory || SearchTypeCategory.parse("NONE"),
        modelOutputMetadata: {
          justification: jsonResponse.justification || "",
          safetyIssue: parseBooleanfromField(jsonResponse.safetyIssue),
        },
      }
    }
    catch (error) {
      console.error('MovieDocFlow: Error generating response:', {
        error,
        input,
      });
    }
    try {
      if (searchFlowOutput.searchCategory == "NONE") {
        return movieContexts;
      }
      const docs = await ai.retrieve({
        retriever: sqlRetriever,
        query: {
          content: [{ text: "" }],
        },
        options: {
          k: 10,
          searchCategory: searchFlowOutput.searchCategory,
          keywordQuery: searchFlowOutput.keywordQuery,
          vectorQuery: searchFlowOutput.vectorQuery
        },
      });

      for (const doc of docs) {
        if (doc.metadata) {
          const movieContext: MovieContext = {
            title: doc.metadata.title,
            runtime_minutes: doc.metadata.runtime_mins,
            genres: doc.metadata.genres.split(","),
            rating: parseFloat(parseFloat(doc.metadata.rating).toFixed(1)),
            plot: doc.metadata.plot,
            released: parseInt(doc.metadata.released, 10),
            director: doc.metadata.director,
            actors: doc.metadata.actors.split(","),
            poster: doc.metadata.poster,
            tconst: doc.metadata.tconst,
          };
          movieContexts.push(movieContext);
        } else {
          console.warn('Movie metadata is missing for a document.');
        }
      }
      return movieContexts;
    }
    catch (e) {
      console.error(`Retriever: Unable to get documents: ${e instanceof Error ? e.message : e}`)
      return movieContexts;
    }
  }
);

export const sqlRetriever = ai.defineRetriever(
  {
    name: 'movies',
    configSchema: RetrieverOptionsSchema,
  },
  async (query, options) => {
    const db = await openDB();
    if (!db) {
      throw new Error('Database connection failed');
    }

    let results;
    if (options.searchCategory == "KEYWORD") {
      results = await db`SELECT content, title, poster, released, runtime_mins, rating, genres, director, actors, plot, tconst
      FROM movies
      WHERE ${db.unsafe(options.keywordQuery)}
      LIMIT ${options.k ?? 10}`
    }

    //Vector Query
    if (options.searchCategory == "VECTOR") {
      const embedding = await ai.embed({
        embedder: embedder,
        content: options.vectorQuery,
      });
      results = await db`
        SELECT content, title, poster, released, runtime_mins, rating, genres, director, actors, plot, tconst
       FROM movies
          ORDER BY embedding <#> ${toSql(embedding[0].embedding)}
          LIMIT ${options.k ?? 10}
        ;`
    }

    //Mixed Query
    if (options.searchCategory === "MIXED") {
      // Generate the vector embedding for the vector query
      const embedding = await ai.embed({
        embedder: embedder,
        content: options.vectorQuery,
      });

      // Execute the database query with both keyword and vector search components
      results = await db`
        SELECT
          content,
          title,
          poster,
          released,
          runtime_mins,
          rating,
          genres,
          director,
          actors,
          plot,
          tconst
        FROM
          movies
        WHERE
        ${db.unsafe(options.keywordQuery)}
        ORDER BY
          embedding <#> ${toSql(embedding)}
        LIMIT
          ${options.k ?? 10}
      ;`;
    }

    if (!results) {
      throw new Error('No results found.');
    }
    return {
      documents: results.map((row) => {
        const { content, ...metadata } = row;
        return Document.fromText(content, metadata);
      }),
    };
  }
);