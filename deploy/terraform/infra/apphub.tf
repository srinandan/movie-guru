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

locals {
  global_location = "global"
}
module "apphub" {
  source             = "GoogleCloudPlatform/apphub/google"
  version            = "~> 0.2.0"
  project_id         = var.project_id
  application_id     = "movie-guru"
  display_name       = "Movie Guru Chat Bot"
  location           = local.global_location
  scope              = { type : "GLOBAL" }
  create_application = true // Create new apphub application
  attributes = {
    environment = {
      type = "STAGING"
    }
    criticality = {
      type = "MISSION_CRITICAL"
    }
    business_owners = {
      display_name = "Alice"
      email        = "alice@google.com"
    }
    developer_owners = {
      display_name = "Bob"
      email        = "bob@google.com"
    }
    operator_owners = {
      display_name = "Charlie"
      email        = "charlie@google.com"
    }
  }
}
