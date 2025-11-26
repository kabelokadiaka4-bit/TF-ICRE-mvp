# /infra/terraform/modules/artifact-registry/variables.tf

variable "project_id" {
  description = "The ID of the GCP project."
  type        = string
}

variable "location" {
  description = "The location of the Artifact Registry repository."
  type        = string
}

variable "repository_id" {
  description = "The ID of the Artifact Registry repository (e.g., 'my-docker-repo')."
  type        = string
}

variable "description" {
  description = "A description of the repository."
  type        = string
  default     = "Docker repository for TF-ICRE microservices"
}

variable "environment" {
  description = "The environment (e.g., dev, uat, prod)."
  type        = string
}
