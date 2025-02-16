// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package wrappers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"

	_ "github.com/lib/pq"
	types "github.com/movie-guru/pkg/types"
)

type MovieRetrieverFlowClient struct {
	RetrieverLength int
	URL             string
}

func CreateMovieRetrieverFlowClient(retrieverLength int, url string) *MovieRetrieverFlowClient {
	return &MovieRetrieverFlowClient{
		RetrieverLength: retrieverLength,
		URL:             url + "/movieDocFlow",
	}
}

func (flowClient *MovieRetrieverFlowClient) RetriveDocuments(ctx context.Context, query string) ([]*types.MovieContext, error) {
	rResp, err := flowClient.runFlow(query)
	if err != nil {
		return nil, err
	}
	return rResp, nil
}

type QueryData struct {
	Query string `json:"query"`
}

func (flowClient *MovieRetrieverFlowClient) runFlow(input string) ([]*types.MovieContext, error) {
	// Marshal the input struct to JSON
	dataInput := DataInput{
		Data: &QueryData{
			Query: input, // Assuming input is a string
		},
	}
	inputJSON, err := json.Marshal(dataInput)
	if err != nil {
		return nil, fmt.Errorf("error marshaling input to JSON: %w", err)
	}
	req, err := http.NewRequest("POST", flowClient.URL, bytes.NewBuffer(inputJSON))
	if err != nil {
		slog.Log(context.Background(), slog.LevelError, "Error creating request", "error", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		slog.Log(context.Background(), slog.LevelError, "Error sending request", "error", err)
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		fmt.Printf("Server returned error: %s\n", string(bodyBytes))
		return nil, fmt.Errorf("server returned error: %s (%d)", http.StatusText(resp.StatusCode), resp.StatusCode)
	}

	var result struct {
		Result []*types.MovieContext `json:"result"`
	}
	defer resp.Body.Close()

	b, _ := io.ReadAll(resp.Body)
	slog.Log(context.Background(), slog.LevelInfo, string(b))

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		slog.Log(context.Background(), slog.LevelError, "Error decoding JSON response", "error", err)
		return nil, err
	}

	return result.Result, nil
}
