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

package types

type Result string

const (
	UNDEFINED Result = "UNDEFINED"
	SUCCESS   Result = "SUCCESS"
	BAD_QUERY Result = "BAD_QUERY"
	UNSAFE    Result = "UNSAFE"
	TOO_LONG  Result = "TOO_LONG"
	ERROR     Result = "ERROR"
)

type ModelOutputMetadata struct {
	Justification string `json:"justification,omitempty"`
	SafetyIssue   bool   `json:"safetyIssue,omitempty"`
}

type AgentResponse struct {
	Answer         string          `json:"answer"`
	RelevantMovies []string        `json:"relevant_movies"`
	Context        []*MovieContext `json:"context"`
	ErrorMessage   string          `json:"error_message"`
	Result         Result          `json:"result"`
	Preferences    *UserProfile    `json:"preferences"`
}

func NewAgentResponse() *AgentResponse {
	return &AgentResponse{
		RelevantMovies: make([]string, 0),
		Context:        make([]*MovieContext, 0),
		Preferences:    NewUserProfile(),
		Result:         UNDEFINED,
	}
}

func NewSafetyIssueAgentResponse() *AgentResponse {
	r := NewAgentResponse()
	r.Result = UNSAFE
	return r
}

func NewErrorAgentResponse(errMessage string) *AgentResponse {
	r := NewAgentResponse()
	r.Result = ERROR
	r.ErrorMessage = errMessage
	return r
}
