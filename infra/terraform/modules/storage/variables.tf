# /infra/terraform/modules/storage/variables.tf

variable "project_id" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "location" {
  type    = string
  default = "africa-south1"
}

variable "force_destroy" {
  type    = bool
  default = false
}

variable "versioning" {
  type    = bool
  default = true
}

variable "kms_key_name" {
  type    = string
  default = null
}

variable "lifecycle_age_days" {
  type    = number
  default = 365
}
