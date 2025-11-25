# /infra/terraform/modules/network/variables.tf

variable "project_id" {
  description = "The ID of the GCP project."
  type        = string
}

variable "region" {
  description = "The GCP region to deploy resources in."
  type        = string
  default     = "africa-south1"
}

variable "network_name" {
  description = "The name of the VPC network."
  type        = string
  default     = "tf-icre-vpc"
}

variable "primary_subnet_cidr" {
  description = "The CIDR block for the primary subnet."
  type        = string
  default     = "10.0.0.0/20"
}
