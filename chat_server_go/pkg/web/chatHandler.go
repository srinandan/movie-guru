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
	"encoding/json"
	"fmt"
	"log/slog"
	"math/rand"
	"net/http"
	"time"

	"github.com/movie-guru/pkg/db"

	m "github.com/movie-guru/pkg/metrics"
	"github.com/movie-guru/pkg/types"
	"golang.org/x/exp/slog"
)

// This memory leak is intentionally created to demonstrate support and troubleshooting
var memoryLeak = [][]byte{}

func memLeak(w http.ResponseWriter, r *http.Request) http.ResponseWriter {
	for i := 0; i < 1000; i++ {
		memoryLeak = append(memoryLeak, make([]byte, 1024*1024*10))
	}
	fmt.Fprintln(w, "Memory allocated")
	return w
}

func thirtyThreePercentChance() bool {
	return rand.Intn(2) == 0 // 50% chance
}

func createChatHandler(deps *Dependencies, meters *m.ChatMeters, metadata *db.Metadata) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var err error
		ctx := r.Context()
		sessionInfo := &SessionInfo{}
		if r.Method != "OPTIONS" {
			var shouldReturn bool
			sessionInfo, shouldReturn = authenticateAndGetSessionInfo(ctx, sessionInfo, err, r, w)
			if shouldReturn {
				return
			}
		}
		if r.Method == "POST" {
			meters.CCounter.Add(ctx, 1)
			startTime := time.Now()
			defer func() {
				meters.CLatencyHistogram.Record(ctx, int64(time.Since(startTime).Milliseconds()))
			}()

			// add mem leak
			if thirtyThreePercentChance() {
				slog.Log(ctx, slog.LevelInfo, "adding memory leak", nil)
				w = memLeak(w, r)
			}

			user := sessionInfo.User
			chatRequest := &ChatRequest{
				Content: "",
			}
			err := json.NewDecoder(r.Body).Decode(chatRequest)
			if err != nil {
				slog.InfoContext(ctx, "Error while decoding request", slog.Any("error", err.Error()))
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if len(chatRequest.Content) > metadata.MaxUserMessageLen {
				slog.InfoContext(ctx, "Input message too long", slog.String("user", user), slog.Any("error", err.Error()))
				http.Error(w, "Message too long", http.StatusBadRequest)
				return
			}
			ch, err := getHistory(ctx, user)
			if err != nil {
				slog.ErrorContext(ctx, "Error while fetching history", slog.String("user", user), slog.Any("error", err.Error()))
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			agentResp := chat(ctx, deps, metadata, ch, user, chatRequest.Content, meters)
			updateSuccessChatMeters(ctx, agentResp, meters)

			saveHistory(ctx, ch, user, metadata)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(agentResp)
			return

		}
	}
}

func updateSuccessChatMeters(ctx context.Context, agentResp *types.AgentResponse, meters *m.ChatMeters) {
	if agentResp.Result == types.UNSAFE {
		meters.CSafetyIssueCounter.Add(ctx, 1)
	}
	if agentResp.Result == types.SUCCESS {
		meters.CSuccessCounter.Add(ctx, 1)
	}
	if agentResp.Result == types.QUOTALIMIT {
		meters.CQuotaLimitCounter.Add(ctx, 1)
	}
}
