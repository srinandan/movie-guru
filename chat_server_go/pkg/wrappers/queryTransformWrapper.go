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

	db "github.com/movie-guru/pkg/db"
	types "github.com/movie-guru/pkg/types"
)

type QueryTransformFlowClient struct {
	MovieDB *db.MovieDB
	URL     string
}

func CreateQueryTransformFlowClient(db *db.MovieDB, URL string) (*QueryTransformFlowClient, error) {
	return &QueryTransformFlowClient{
		MovieDB: db,
		URL:     URL + "/queryTransformFlow",
	}, nil
}

func (flowClient *QueryTransformFlowClient) Run(history []*types.SimpleMessage, preferences *types.UserProfile) (*types.QueryTransformFlowOutput, error) {
	queryTransformInput := types.QueryTransformFlowInput{Profile: preferences, History: history, UserMessage: history[len(history)-1].Content}
	resp, err := flowClient.runFlow(&queryTransformInput)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (flowClient *QueryTransformFlowClient) runFlow(input *types.QueryTransformFlowInput) (*types.QueryTransformFlowOutput, error) {
	// Marshal the input struct to JSON
	dataInput := DataInput{
		Data: input,
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
	ctx := context.Background()
	resp, err := client.Do(req)
	if err != nil {
		slog.ErrorContext(ctx, "QualityFlow: Error sending request to Flows", err.Error(), err)
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		slog.ErrorContext(ctx, "QualityFlow: Genkit returned an Error", "errorCode", resp.StatusCode)
		return nil, fmt.Errorf("genkit server returned error: %s (%d)", http.StatusText(resp.StatusCode), resp.StatusCode)
	}
	var result struct {
		Result *types.QueryTransformFlowOutput `json:"result"`
	}
	defer resp.Body.Close()

	b, _ := io.ReadAll(resp.Body)

	err = json.Unmarshal(b, &result)
	if err != nil {
		slog.Log(context.Background(), slog.LevelError, "Error unmarshaling JSON response", "error", err)
		return nil, err
	}

	return result.Result, nil
}
