# /infra/terraform/modules/artifact-registry/main.tf

resource "google_artifact_registry_repository" "repository" {
  location      = var.location
  repository_id = var.repository_id
  description   = var.description
  format        = "DOCKER" # We are storing Docker images
  project       = var.project_id

  labels = {
    env = var.environment
  }

  lifecycle {
    prevent_destroy = true # Protect important repositories
  }
}
