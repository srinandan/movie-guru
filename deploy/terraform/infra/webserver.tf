data "google_storage_bucket" "bucket" {
  project = var.project_id
  name    = "${var.project_id}-posters"
}

module "cloud_run_v2" {
  source                        = "GoogleCloudPlatform/cloud-run/google//modules/v2"
  version                       = "~> 0.14"
  service_name                  = "movie-guru-webserver"
  project_id                    = var.project_id
  location                      = var.region
  cloud_run_deletion_protection = false
  containers = [
    {
      container_image = "${var.region}-docker.pkg.dev/${var.project_id}/movie-guru/static-web-server:2.36"
      container_name  = "movie-guru-webserver"
      container_args  = ["--root=/mnt"]
      ports = {
        container_port = 80
      }
      volume_mounts = [{
        name       = "app-volume"
        mount_path = "/mnt"
      }]
    }
  ]
  vpc_access = {
    egress = "ALL_TRAFFIC"
    network_interfaces = {
      network    = google_compute_network.custom.name
      subnetwork = google_compute_subnetwork.custom.name
    }
  }
  service_account = google_service_account.sa.email
  ingress         = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  volumes = [
    {
      name = "app-volume"
      gcs = {
        read_only = false
        bucket    = data.google_storage_bucket.bucket.name
      }
    }
  ]
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = var.region
  service  = module.cloud_run_v2.service_name

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}
