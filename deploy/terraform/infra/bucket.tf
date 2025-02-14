resource "google_storage_bucket" "public_bucket" {
  name          = "${var.project_id}_posters"
  location      = var.region
  force_destroy = true 

  uniform_bucket_level_access = true
}