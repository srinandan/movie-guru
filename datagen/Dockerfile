# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM python:3.12-slim
ARG PROJECT
ARG REGION

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends gettext \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /code
COPY requirements.txt /code/requirements.txt
COPY ddl.sql /code/ddl.sql
COPY fictional_movies.csv /code/fictional_movies.csv
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY embeddings.py /code/embeddings.py
CMD ["python", "embeddings.py"]