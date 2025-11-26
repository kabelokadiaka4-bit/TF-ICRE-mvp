# /infra/terraform/modules/vpc-connector/variables.tf

variable "project_id" {
  description = "The ID of the GCP project."
  type        = string
}

variable "region" {
  description = "The GCP region to deploy the connector in."
  type        = string
}

variable "connector_name" {
  description = "The name of the VPC Access Connector."
  type        = string
}

variable "network_name" {
  description = "The name of the VPC network to connect to."
  type        = string
}

variable "ip_cidr_range" {
  description = "The IP CIDR range for the connector (e.g., '10.8.0.0/28')."
  type        = string
}

variable "min_throughput" {
  description = "Minimum throughput of the connector in Mbps."
  type        = number
  default     = 200
}

variable "max_throughput" {
  description = "Maximum throughput of the connector in Mbps."
  type        = number
  default     = 1000
}
