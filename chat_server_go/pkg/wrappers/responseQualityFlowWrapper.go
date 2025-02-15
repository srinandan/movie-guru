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
	"net/http"

	types "github.com/movie-guru/pkg/types"
)

type ResponseQualityFlowClient struct {
	URL string
}

func CreateResponseQualityFlowClient(URL string) (*ResponseQualityFlowClient, error) {
	return &ResponseQualityFlowClient{
		URL: URL + "/responseQualityFlow",
	}, nil
}

func (flowClient *ResponseQualityFlowClient) Run(ctx context.Context, history []*types.SimpleMessage, user string) (*types.ResponseQualityOutput, error) {
	responseQualityFlowInput := types.ResponseQualityFlowInput{MessageHistory: history}
	resp, err := flowClient.runFlow(&responseQualityFlowInput)
	if err != nil {
		return nil, err
	}
	return resp, nil
}

func (flowClient *ResponseQualityFlowClient) runFlow(input *types.ResponseQualityFlowInput) (*types.ResponseQualityOutput, error) {
	// Marshal the input struct to JSON
	inputJSON, err := json.Marshal(input)
	if err != nil {
		return nil, fmt.Errorf("error marshaling input to JSON: %w", err)
	}
	req, err := http.NewRequest("POST", flowClient.URL, bytes.NewBuffer(inputJSON))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil, err
	}

	var result struct {
		Result *types.ResponseQualityOutput `json:"result"`
	}
	defer resp.Body.Close()

	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		fmt.Println("Error decoding JSON response:", err)
		return nil, err
	}

	return result.Result, nil
}
