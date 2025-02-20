resource "google_compute_router" "router" {
  project = var.project_id
  name    = "nat-router"
  network = google_compute_subnetwork.custom.name
  region  = "us-east4"
}

module "cloud-nat" {
  source                             = "terraform-google-modules/cloud-nat/google"
  version                            = "~> 5.0"
  project_id                         = var.project_id
  region                             = var.region
  router                             = google_compute_router.router.name
  name                               = "nat-config"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

