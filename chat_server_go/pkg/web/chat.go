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

	"github.com/movie-guru/pkg/db"
	"github.com/movie-guru/pkg/types"
)

func chat(ctx context.Context, deps *Dependencies, metadata *db.Metadata,
	h *types.ChatHistory, user string, userMessage string,
) (*types.AgentResponse, *types.ResponseQualityOutput) {
	h.AddUserMessage(userMessage)
	simpleHistory, _ := types.ParseRecentHistory(h.GetHistory(), metadata.HistoryLength)

	respQuality := &types.ResponseQualityOutput{
		Outcome:       types.OutcomeUnknown,
		UserSentiment: types.SentimentUnknown,
	}

	pResp, err := deps.UserProfileFlowClient.Run(ctx, h, user)
	if agentResp, shouldReturn := processFlowOutput(pResp.ModelOutputMetadata, err, h); shouldReturn {
		return agentResp, respQuality
	}

	qResp, err := deps.QueryTransformFlowClient.Run(simpleHistory, pResp.UserProfile)
	if agentResp, shouldReturn := processFlowOutput(qResp.ModelOutputMetadata, err, h); shouldReturn {
		return agentResp, respQuality
	}

	movieContext := []*types.MovieContext{}
	if qResp.Intent == types.UserIntent(types.REQUEST) || qResp.Intent == types.UserIntent(types.RESPONSE) {
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

	return mAgentResp, respQuality
}

func processFlowOutput(metadata *types.ModelOutputMetadata, err error,
	h *types.ChatHistory,
) (*types.AgentResponse, bool) {
	if err != nil {
		h.AddAgentErrorMessage()
		return types.NewErrorAgentResponse(err.Error()), true
	}
	if metadata != nil && metadata.SafetyIssue {
		h.AddSafetyIssueErrorMessage()
		return types.NewSafetyIssueAgentResponse(), true
	}
	return types.NewAgentResponse(), false
}
