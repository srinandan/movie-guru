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

import (
	"encoding/json"
	"errors"

	"github.com/firebase/genkit/go/ai"
)

type SimpleMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatHistory struct {
	History []*ai.Message
}

func (ch *ChatHistory) MarshalBinary() ([]byte, error) {
	// Logic to convert your ChatHistory object into a byte slice
	// You can use JSON, Gob, or any other serialization method you prefer

	// Example using JSON:
	data, err := json.Marshal(ch)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (ch *ChatHistory) UnmarshalBinary(data []byte) error {
	// Logic to convert the byte slice back into a ChatHistory object

	// Example using JSON:
	return json.Unmarshal(data, ch)
}

func (ch *ChatHistory) Trim(maxLength int) int {
	startIndex := 0

	if len(ch.History) >= maxLength {
		startIndex = len(ch.History) - maxLength
	}
	recentMessages := ch.History[startIndex:]
	ch.History = recentMessages
	return len(ch.History)
}

func NewChatHistory() *ChatHistory {
	return &ChatHistory{
		History: []*ai.Message{},
	}
}

func ParseRecentHistory(aiMessages []*ai.Message, maxLength int) ([]*SimpleMessage, error) {
	startIndex := 0
	if len(aiMessages) >= maxLength {
		startIndex = len(aiMessages) - maxLength
	}
	recentMessages := aiMessages[startIndex:]
	messages := make([]*SimpleMessage, 0, maxLength)
	for _, aiMessage := range recentMessages {

		role := ""
		if aiMessage.Role == "user" {
			role = "user"
		} else {
			role = "agent"
		}
		if aiMessage.Role == "system" {
			role = "system"
		}
		message := &SimpleMessage{
			Role:    role,
			Content: aiMessage.Content[0].Text,
		}
		messages = append(messages, message)
	}

	return messages, nil
}

func (ch *ChatHistory) GetLastMessage() (string, error) {
	if len(ch.History) > 0 {
		message := ch.History[len(ch.History)-1]
		return message.Content[0].Text, nil
	}
	return "", errors.New("no messages found")
}

func (ch *ChatHistory) AddUserMessage(message string) {
	ch.History = append(ch.History, ai.NewUserTextMessage(message))
}

func (ch *ChatHistory) AddAgentMessage(message string) {
	ch.History = append(ch.History, ai.NewModelTextMessage(message))
}

func (ch *ChatHistory) AddAgentErrorMessage() {
	ch.History = append(ch.History, ai.NewModelTextMessage("Something went wrong. Try again."))
}

func (ch *ChatHistory) AddSafetyIssueErrorMessage() {
	ch.History = append(ch.History, ai.NewModelTextMessage("That was a naughty request. I cannot process it."))
}

func (ch ChatHistory) GetHistory() []*ai.Message {
	return ch.History
}
