variable "gcp_project_prefix" {
  description = "Prefix for GCP project IDs (e.g., 'tf-icre' for tf-icre-dev, tf-icre-prod)."
  type        = string
  default     = "tf-icre" # Default for local testing if not set
}

variable "gcp_region" {
  description = "The primary GCP region for all environments."
  type        = string
  default     = "africa-south1"
}
