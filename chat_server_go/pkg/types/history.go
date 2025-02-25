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

func (m *ChatHistory) Trim(maxLength int) int {
	startIndex := 0

	if len(m.History) >= maxLength {
		startIndex = len(m.History) - maxLength
	}
	recentMessages := m.History[startIndex:]
	m.History = recentMessages
	return len(m.History)
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

func (m *ChatHistory) GetLastMessage() (string, error) {
	if len(m.History) > 0 {
		message := m.History[len(m.History)-1]
		return message.Content[0].Text, nil
	}
	return "", errors.New("No messages found")
}

func (m *ChatHistory) AddUserMessage(message string) {
	m.History = append(m.History, ai.NewUserTextMessage(message))
}

func (m *ChatHistory) RemoveLastMessage() {
	if len(m.History) > 0 {
		// m.History[len(m.History)-1] = ai.NewUserTextMessage("REDACTED")
		m.History = m.History[:len(m.History)-1]
	}
}

func (m *ChatHistory) AddAgentMessage(message string) {
	m.History = append(m.History, ai.NewModelTextMessage(message))
}

func (m *ChatHistory) AddAgentErrorMessage() {
	m.History = append(m.History, ai.NewModelTextMessage("Something went wrong. Try again."))
}

func (m *ChatHistory) AddSafetyIssueErrorMessage() {
	m.History = append(m.History, ai.NewModelTextMessage("That was a naughty request. I cannot process it."))
}

func (m ChatHistory) GetHistory() []*ai.Message {
	return m.History
}
