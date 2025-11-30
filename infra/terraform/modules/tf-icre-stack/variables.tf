# infra/terraform/modules/tf-icre-stack/variables.tf

variable "project_id" {
  description = "The ID of the GCP project."
  type        = string
}

variable "region" {
  description = "The primary GCP region."
  type        = string
  default     = "africa-south1"
}

variable "environment" {
  description = "The environment name (dev, uat, prod)."
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network."
  type        = string
}

variable "primary_subnet_cidr" {
  description = "The CIDR block for the primary subnet."
  type        = string
}

variable "vpc_connector_cidr" {
  description = "The IP CIDR range for the VPC connector."
  type        = string
}

variable "landing_bucket_lifecycle_days" {
  description = "Number of days before deleting objects in landing bucket."
  type        = number
  default     = 30
}
