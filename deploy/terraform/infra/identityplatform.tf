
# The following resources create the identity platform config required. This is a bit fragile and can often complain.
# If so, comment this out and create it manually.
resource "google_identity_platform_config" "auth" {
  project  = var.project_id
  provider = google

  # Auto-deletes anonymous users
  autodelete_anonymous_users = true

  # Configures authorized domains.
  authorized_domains = [
    "localhost",
    "${var.project_id}.firebaseapp.com",
    "${var.project_id}.web.app",
    google_compute_address.external_ip.address
  ]

  depends_on = [google_project_service.enable_apis]
  lifecycle {
    ignore_changes = all
  }
}

resource "google_iap_brand" "default" {
  project           = var.project_id
  support_email     = var.support_email // Has to be the identity of the thing that is running the tf
  application_title = "movieguru"
  depends_on        = [google_project_service.enable_apis]
    lifecycle {
    ignore_changes = all
  }
}

resource "google_iap_client" "google_oauth" {
  display_name = "Google Sign-In OAuth"
  brand        = google_iap_brand.default.name
  depends_on   = [google_project_service.enable_apis]
    lifecycle {
    ignore_changes = all
  }
}

data "google_iap_client" "google_oauth" {
  client_id  = google_iap_client.google_oauth.client_id
  brand      = google_iap_brand.default.name
  depends_on = [google_project_service.enable_apis]
    
}

resource "google_identity_platform_default_supported_idp_config" "google_signin" {
  project       = var.project_id
  idp_id        = "google.com"
  enabled       = true
  client_id     = google_iap_client.google_oauth.client_id
  client_secret = google_iap_client.google_oauth.secret
  depends_on    = [google_project_service.enable_apis]
  lifecycle {
    ignore_changes = all
  }
}