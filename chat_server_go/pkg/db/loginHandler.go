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

package db

import (
	"context"
	"time"

	_ "github.com/lib/pq"
)

// create_user creates a new user in the database
func (db *MovieDB) CreateUser(user string) error {
	query := `
        INSERT INTO user_logins (email) VALUES ($1)
        ON CONFLICT (email) DO UPDATE
        SET login_count = user_logins.login_count + 1;
    `
	dbCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	_, err := db.DB.ExecContext(dbCtx, query, user)
	return err
}

// check_user checks if the user exists in the database
func (db *MovieDB) CheckUser(ctx context.Context, user string) bool {
	dbCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	query := `SELECT email FROM user_logins WHERE "email" = $1;`
	var email string
	err := db.DB.QueryRowContext(dbCtx, query, user).Scan(&email)
	return err == nil && email == user
}

// get_invite_codes retrieves valid invite codes from the database
func (db *MovieDB) GetInviteCodes() ([]string, error) {
	dbCtx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	query := `SELECT code FROM invite_codes WHERE valid = true`
	rows, err := db.DB.QueryContext(dbCtx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var inviteCodes []string
	for rows.Next() {
		var code string
		if err := rows.Scan(&code); err != nil {
			return nil, err
		}
		inviteCodes = append(inviteCodes, code)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return inviteCodes, nil
}
