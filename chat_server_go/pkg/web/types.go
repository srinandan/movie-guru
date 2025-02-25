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
	"github.com/movie-guru/pkg/db"
	"github.com/movie-guru/pkg/types"
	wrappers "github.com/movie-guru/pkg/wrappers"
)

type SessionInfo struct {
	ID            string
	User          string
	Authenticated bool
}

type LoginBody struct {
	InviteCode string `json:"inviteCode" omitempty`
}

type PrefBody struct {
	Content *types.UserProfile `json:"content"`
}

type ChatRequest struct {
	Content string `json:"content"`
}

type Dependencies struct {
	QueryTransformFlowClient  *wrappers.QueryTransformFlowClient
	UserProfileFlowClient     *wrappers.UserProfileFlowClient
	MovieFlowClient           *wrappers.MovieFlowClient
	MovieRetrieverFlowClient  *wrappers.MovieRetrieverFlowClient
	ResponseQualityFlowClient *wrappers.ResponseQualityFlowClient
	DB                        *db.MovieDB
}
