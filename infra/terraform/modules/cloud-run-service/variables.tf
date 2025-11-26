# /infra/terraform/modules/cloud-run-service/variables.tf

variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "service_name" {
  type = string
}

variable "image_url" {
  description = "Docker image URL (gcr.io/...)"
  type        = string
}

variable "service_account_email" {
  type = string
}

variable "env_vars" {
  description = "Map of environment variables"
  type        = map(string)
  default     = {}
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 10
}

variable "cpu_limit" {
  type    = string
  default = "1000m"
}

variable "memory_limit" {
  type    = string
  default = "512Mi"
}

variable "ingress_type" {
  description = "INGRESS_TRAFFIC_ALL, INGRESS_TRAFFIC_INTERNAL_ONLY, or INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  type        = string
  default     = "INGRESS_TRAFFIC_INTERNAL_AND_CLOUD_LOAD_BALANCING"
}

variable "vpc_connector_id" {
  description = "The fully qualified resource name of the VPC Access Connector for VPC access."
  type        = string
  default     = null # Set to null if no VPC access is needed
}
