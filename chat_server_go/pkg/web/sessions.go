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
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"

	redis "github.com/redis/go-redis/v9"
)

var redisStore *redis.ClusterClient

func TestRedis() {
	ctx := context.Background()
	redisHost := os.Getenv("REDIS_HOST")
	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisPort := os.Getenv("REDIS_PORT")

	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password: redisPassword,
		DB:       0,
	})
	if err := client.Ping(ctx).Err(); err != nil {
		slog.ErrorContext(ctx, "error connecting to redis", slog.Any("error", err))
		return
	}
}

func setupSessionStore(ctx context.Context) {
	redisHost := os.Getenv("REDIS_HOST")
	// REDIS_PASSWORD := os.Getenv("REDIS_PASSWORD")
	// REDIS_PORT := os.Getenv("REDIS_PORT")

	/*redisStore = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", REDIS_HOST, REDIS_PORT),
		Password: REDIS_PASSWORD,
		DB:       0,
	})*/
	redisStore = redis.NewClusterClient(&redis.ClusterOptions{
		Addrs: []string{fmt.Sprintf("%s:%s", redisHost, "6379")},
	})
	if err := redisStore.Ping(ctx).Err(); err != nil {
		slog.ErrorContext(ctx, "error connecting to redis", slog.Any("error", err))
		os.Exit(1)
	}
}

func getSessionID(r *http.Request) (string, error) {
	if r.Header.Get("Cookie") == "" {
		return "", errors.New("no cookie found")
	}
	sessionID := strings.Split(r.Header.Get("Cookie"), "movie-guru-sid=")[1]
	return sessionID, nil
}

func authenticateAndGetSessionInfo(ctx context.Context, _ *SessionInfo,
	r *http.Request, w http.ResponseWriter,
) (*SessionInfo, bool) {
	sessionInfo, err := getSessionInfo(ctx, r)
	if err != nil {
		if err, ok := err.(*AuthorizationError); ok {
			slog.InfoContext(ctx, "Unauthorized", slog.Any("error", err.Error()))
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return nil, true
		}
		slog.ErrorContext(ctx, "Error while getting session info", slog.Any("error", err.Error()))
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return nil, true
	}
	if !sessionInfo.Authenticated {
		slog.InfoContext(ctx, "Forbidden")
		http.Error(w, "Forbidden", http.StatusForbidden)
		return nil, true
	}
	return sessionInfo, false
}

func getSessionInfo(ctx context.Context, r *http.Request) (*SessionInfo, error) {
	session := &SessionInfo{}
	sessionID, err := getSessionID(r)
	if err != nil {
		return session, &AuthorizationError{err.Error()}
	}
	s, err := redisStore.Get(ctx, sessionID).Result()
	if err != nil {
		return nil, fmt.Errorf("unable to fetch from redis: %v", err)
	}
	err = json.Unmarshal([]byte(s), session)
	if err != nil {
		return nil, err
	}
	return session, err
}

func deleteSessionInfo(ctx context.Context, sessionID string) error {
	_, err := redisStore.Del(ctx, sessionID).Result()
	if err != nil {
		return err
	}
	return nil
}
