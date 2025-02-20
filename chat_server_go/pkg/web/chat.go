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

package web

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/movie-guru/pkg/db"
	"github.com/movie-guru/pkg/types"
)

func chat(ctx context.Context, deps *Dependencies, metadata *db.Metadata, h *types.ChatHistory, user string, userMessage string) (*types.AgentResponse, *types.ResponseQualityOutput) {
	h.AddUserMessage(userMessage)

	respQuality := &types.ResponseQualityOutput{
		Outcome:       types.OutcomeUnknown,
		UserSentiment: types.SentimentUnknown,
	}
	simpleHistory, err := types.ParseRecentHistory(h.GetHistory(), metadata.HistoryLength)
	if err != nil {
		return types.NewErrorAgentResponse(fmt.Sprintf("Error getting user history %w", &err)), respQuality
	}

	respQualityChan := make(chan *types.ResponseQualityOutput)
	errChan := make(chan error)

	// Launch the goroutine
	go func() {
		qualityResp, err := deps.ResponseQualityFlowClient.Run(ctx, simpleHistory, user)
		if err != nil {
			errChan <- err
		} else {
			respQualityChan <- qualityResp
		}
	}()

	pResp, err := deps.UserProfileFlowClient.Run(ctx, h, user)
	if agentResp, shouldReturn := processFlowOutput(pResp.ModelOutputMetadata, err, h); shouldReturn {
		return agentResp, respQuality
	}

	qResp, err := deps.QueryTransformFlowClient.Run(simpleHistory, pResp.UserProfile)
	if agentResp, shouldReturn := processFlowOutput(qResp.ModelOutputMetadata, err, h); shouldReturn {
		return agentResp, respQuality
	}

	movieContext := []*types.MovieContext{}
	if qResp.Intent == types.USERINTENT(types.REQUEST) || qResp.Intent == types.USERINTENT(types.RESPONSE) {
		movieContext, err = deps.MovieRetrieverFlowClient.RetriveDocuments(ctx, qResp.TransformedQuery)
		if agentResp, shouldReturn := processFlowOutput(nil, err, h); shouldReturn {
			return agentResp, respQuality
		}
	}

	mAgentResp, err := deps.MovieFlowClient.Run(movieContext, simpleHistory, pResp.UserProfile)
	if agentResp, shouldReturn := processFlowOutput(nil, err, h); shouldReturn {
		return agentResp, respQuality
	}
	h.AddAgentMessage(mAgentResp.Answer)
	select {
	case respQuality = <-respQualityChan:
		// do nothing
	case err := <-errChan:
		slog.ErrorContext(ctx, "Error while executing response quality flow", slog.Any("error", err.Error()))
	}

	return mAgentResp, respQuality
}

func processFlowOutput(metadata *types.ModelOutputMetadata, err error, h *types.ChatHistory) (*types.AgentResponse, bool) {
	if err != nil {
		h.RemoveLastMessage()
		slog.ErrorContext(context.Background(), err.Error(), err)
		return types.NewErrorAgentResponse(err.Error()), true
	}
	if metadata != nil && metadata.SafetyIssue {
		h.RemoveLastMessage()
		return types.NewSafetyIssueAgentResponse(), true
	}
	if metadata != nil && metadata.QuotaIssue {
		h.RemoveLastMessage()
		return types.NewQuotaIssueAgentResponse(), true
	}
	return nil, false
}
