# /infra/terraform/modules/bigquery/variables.tf

variable "project_id" {
  type = string
}

variable "dataset_id" {
  type = string
}

variable "friendly_name" {
  type    = string
  default = null
}

variable "description" {
  type    = string
  default = null
}

variable "location" {
  type    = string
  default = "africa-south1"
}

variable "default_table_expiration_ms" {
  type    = number
  default = null
}

variable "kms_key_name" {
  description = "The resource name of the Cloud KMS key to encrypt the dataset."
  type        = string
  default     = null
}
