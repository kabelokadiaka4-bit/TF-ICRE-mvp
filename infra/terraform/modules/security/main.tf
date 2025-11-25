# /infra/terraform/modules/security/main.tf

resource "google_compute_firewall" "allow_internal" {
  name    = "${var.network_name}-allow-internal"
  project = var.project_id
  network = var.network_name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }
  allow {
    protocol = "icmp"
  }
  source_ranges = [var.primary_subnet_cidr]
}

resource "google_compute_firewall" "allow_iap_ssh" {
  name    = "${var.network_name}-allow-iap-ssh"
  project = var.project_id
  network = var.network_name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
  # Google's IAP CIDR block for TCP forwarding
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["ssh-iap"]
}

resource "google_compute_firewall" "allow_lb_health_checks" {
  name    = "${var.network_name}-allow-lb-health-checks"
  project = var.project_id
  network = var.network_name

  allow {
    protocol = "tcp"
    ports    = ["80", "443", "8080"]
  }
  # Google's Health Checker CIDR blocks
  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
}

# -- Key Management --
resource "google_kms_key_ring" "keyring" {
  name     = "${var.prefix}-key-ring"
  location = var.region
  project  = var.project_id
}

resource "google_kms_crypto_key" "cmek" {
  name            = "${var.prefix}-cmek"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = "7776000s" # 90 days

  lifecycle {
    prevent_destroy = true
  }
}
