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

resource "google_container_cluster" "primary" {
  name                = "movie-guru-cluster"
  project             = var.project_id
  location            = var.region
  network             = "projects/${var.project_id}/global/networks/${google_compute_network.custom.name}"
  deletion_protection = false
  subnetwork          = "projects/${var.project_id}/regions/${var.region}/subnetworks/${google_compute_subnetwork.custom.name}"

  private_cluster_config {
    enable_private_nodes = true
  }

  cluster_autoscaling {
    auto_provisioning_defaults {
      service_account = google_service_account.sa.email
    }
  }

  cost_management_config {
    enabled = true
  }

  gateway_api_config {
    channel = "CHANNEL_STANDARD"
  }

  binary_authorization {
    evaluation_mode = "PROJECT_SINGLETON_POLICY_ENFORCE"
  }

  enable_autopilot = false

  remove_default_node_pool = true
  initial_node_count       = 1


  addons_config {
    http_load_balancing {
      disabled = false
    }

    horizontal_pod_autoscaling {
      disabled = false
    }

    gcp_filestore_csi_driver_config {
      enabled = false
    }

    gke_backup_agent_config {
      enabled = true
    }

    gcs_fuse_csi_driver_config {
      enabled = true
    }

  }

  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  networking_mode = "VPC_NATIVE"

  security_posture_config {
    mode               = "DISABLED"
    vulnerability_mode = "VULNERABILITY_DISABLED"
  }
  ip_allocation_policy {
    cluster_secondary_range_name  = "pod-ranges"
    services_secondary_range_name = "services-range"

    stack_type = "IPV4"
  }

  timeouts {
    create = "30m"
    update = "60m"
    delete = "30m"
  }

  node_pool_defaults {
  }

  secret_manager_config {
    enabled = true
  }

  maintenance_policy {
    daily_maintenance_window {
      start_time = "02:00"
    }
  }

  monitoring_config {
    enable_components = ["POD", "DEPLOYMENT", "APISERVER", "KUBELET", "HPA", "SYSTEM_COMPONENTS", "SCHEDULER", "CONTROLLER_MANAGER", "STORAGE", "STATEFULSET", "CADVISOR"]
    advanced_datapath_observability_config {
      enable_metrics = true
      enable_relay   = false
    }
  }

  depends_on = [google_project_service.enable_apis]

}

resource "google_container_node_pool" "cpu_nodes" {
  name       = "cpu-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = 2

  autoscaling {
    total_min_node_count = "1"
    total_max_node_count = "5"
  }

  management {
    auto_repair  = "true"
    auto_upgrade = "true"
  }

  node_config {
    preemptible  = false
    machine_type = "e4-standard-8"
    image_type   = "cos_containerd"

    service_account = google_service_account.sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

resource "google_container_node_pool" "gpu_nodes" {
  name       = "gpu-pool"
  location   = var.region
  cluster    = google_container_cluster.primary.name
  node_count = 1

  autoscaling {
    total_min_node_count = "1"
    total_max_node_count = "5"
  }

  management {
    auto_repair  = "true"
    auto_upgrade = "true"
  }

  node_config {
    preemptible  = false
    machine_type = "e4-standard-8"
    image_type   = "cos_containerd"

    guest_accelerator {
      type = "nvidia-tesla-k80"
      gpu_driver_installation_config {
        gpu_driver_version = "DEFAULT"
      }
      count = 2
    }

    service_account = google_service_account.sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

resource "google_gke_backup_backup_plan" "primary" {
  name     = "movie-guru-cluster-plan"
  cluster  = google_container_cluster.primary.id
  location = var.region

  retention_policy {
    backup_delete_lock_days = 30
    backup_retain_days      = 180
  }

  backup_schedule {
    cron_schedule = "0 0 * * *"
  }

  backup_config {
    include_volume_data = true
    include_secrets     = true
    all_namespaces      = true
  }
}
