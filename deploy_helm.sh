#!/bin/bash
# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

source set_env_vars.sh
if [[ -z "$PROJECT_ID" ]]; then
    echo -e "\e[91mERROR: PROJECT_ID environment variable is required.\e[0m"
    echo -e "Please set it using: \e[95mexport PROJECT_ID=<your-gcp-project-id>\e[0m"
    exit 1
fi

if [[ -z "$REGION" ]]; then
    echo -e "\e[91mERROR: REGION environment variable is required.\e[0m"
    exit 1
fi

if [[ -z "$DB_HOST" ]]; then
    echo -e "\e[91mERROR: DB_HOST environment variable is required.\e[0m"
    exit 1
fi

if [[ -z "$REDIS_HOST" ]]; then
    echo -e "\e[91mERROR: REDIS_HOST environment variable is required.\e[0m"
    exit 1
fi

helm upgrade --install movieguru ./deploy/app/helm/movieguru --namespace movieguru --create-namespace --set PROJECT_ID=${PROJECT_ID} --set IMAGE.TAG=latest --set REGION=${REGION} --set REDIS_HOST=${REDIS_HOST} --set DB_HOST=${DB_HOST}
