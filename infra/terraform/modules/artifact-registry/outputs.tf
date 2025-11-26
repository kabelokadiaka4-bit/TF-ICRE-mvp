# /infra/terraform/modules/artifact-registry/outputs.tf

output "repository_url" {
  description = "The URL of the Artifact Registry repository."
  value       = google_artifact_registry_repository.repository.id
}

output "repository_name" {
  description = "The full resource name of the repository."
  value       = google_artifact_registry_repository.repository.name
}
