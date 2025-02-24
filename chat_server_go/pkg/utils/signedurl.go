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

package utils

import (
	"context"
	"fmt"
	"os"
	"time"

	"cloud.google.com/go/storage"
)

func GetSignedURL(poster string) (string, error) {
	ctx := context.Background()
	// Use Application Default Credentials.
	client, err := storage.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("storage.NewClient: %w", err)
	}
	defer client.Close()

	bucketName := os.Getenv("PROJECT_ID")
	if bucketName == "" {
		return "", fmt.Errorf("PROJECT_ID environment variable not set")
	}

	bucketName = bucketName + "_posters"

	if poster == "" {
		poster = "notfound.png"
	}

	opts := &storage.SignedURLOptions{
		Method:  "GET",
		Expires: time.Now().Add(48 * time.Hour),
	}

	url, err := client.Bucket(bucketName).SignedURL(poster, opts)
	if err != nil {
		return "", fmt.Errorf("storage.SignedURL: %w", err)
	}

	return url, nil
}
