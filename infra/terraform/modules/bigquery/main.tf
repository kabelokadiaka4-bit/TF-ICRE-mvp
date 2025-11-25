# /infra/terraform/modules/bigquery/main.tf

resource "google_bigquery_dataset" "dataset" {
  dataset_id                  = var.dataset_id
  friendly_name               = var.friendly_name
  description                 = var.description
  location                    = var.location
  project                     = var.project_id
  default_table_expiration_ms = var.default_table_expiration_ms

  # Using the CMEK key from the security module (passed in)
  default_encryption_configuration {
    kms_key_name = var.kms_key_name
  }

  labels = {
    env = "production" # Default label, can be overridden
  }
}
