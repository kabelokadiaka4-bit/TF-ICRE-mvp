# /infra/terraform/modules/pubsub/variables.tf

variable "project_id" {
  type = string
}

variable "topic_name" {
  type = string
}

variable "region" {
  type    = string
  default = "africa-south1"
}

variable "kms_key_name" {
  description = "The resource name of the Cloud KMS key."
  type        = string
  default     = null
}

variable "subscriptions" {
  description = "Map of subscriptions to create. Key is subscription name."
  type        = map(object({}))
  default     = {}
}
