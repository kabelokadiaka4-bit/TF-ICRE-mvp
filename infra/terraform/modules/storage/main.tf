# /infra/terraform/modules/storage/main.tf

resource "google_storage_bucket" "bucket" {
  name          = var.bucket_name
  location      = var.location
  project       = var.project_id
  force_destroy = var.force_destroy

  uniform_bucket_level_access = true

  versioning {
    enabled = var.versioning
  }

  encryption {
    default_kms_key_name = var.kms_key_name
  }

  # Lifecycle rule to clean up old versions/objects
  lifecycle_rule {
    condition {
      age = var.lifecycle_age_days
    }
    action {
      type = "Delete"
    }
  }
}
