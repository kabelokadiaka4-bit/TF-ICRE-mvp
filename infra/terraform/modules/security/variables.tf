# /infra/terraform/modules/security/variables.tf

variable "project_id" {
  description = "The ID of the GCP project."
  type        = string
}

variable "prefix" {
  description = "A prefix for resource names."
  type        = string
  default     = "tf-icre"
}

variable "region" {
  description = "The GCP region."
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network to apply security rules to."
  type        = string
}

variable "primary_subnet_cidr" {
  description = "The CIDR of the primary subnet, used for internal firewall rules."
  type        = string
}
