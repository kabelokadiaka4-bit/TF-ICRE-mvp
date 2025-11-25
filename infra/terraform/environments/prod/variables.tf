# /infra/terraform/environments/prod/variables.tf

variable "gcp_project_id" {
  description = "The ID of the GCP project for the prod environment."
  type        = string
}

variable "gcp_region" {
  description = "The primary GCP region for the environment."
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network."
  type        = string
  default     = "tf-icre-vpc-prod"
}

variable "primary_subnet_cidr" {
  description = "The CIDR block for the primary subnet."
  type        = string
  default     = "10.30.0.0/20"
}
