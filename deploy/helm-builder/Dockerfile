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

FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:alpine

ARG HELM_VERSION=v3.15.4
ENV HELM_VERSION=$HELM_VERSION
ENV USE_GKE_GCLOUD_AUTH_PLUGIN=True

COPY helm.bash /builder/helm.bash

RUN chmod +x /builder/helm.bash && \
  mkdir -p /builder/helm && \
  curl -SL https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz | tar zxv --strip-components=1 -C /builder/helm linux-amd64 && \
  gcloud -q components install gke-gcloud-auth-plugin

ENV PATH=/builder/helm/:$PATH

ENTRYPOINT ["/builder/helm.bash"]