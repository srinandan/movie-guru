package flows

import (
	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/plugins/vertexai"
)

func GetEmbedder(embeddingModelName string) ai.Embedder {
	embedder := vertexai.Embedder(embeddingModelName)
	return embedder
}
