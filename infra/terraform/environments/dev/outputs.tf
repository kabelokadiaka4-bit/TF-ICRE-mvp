# /infra/terraform/environments/dev/outputs.tf

output "network_name" {
  description = "The name of the VPC network created."
  value       = module.network.network_name
}

output "subnet_name" {
  description = "The name of the primary subnet created."
  value       = module.network.subnet_name
}

output "cmek_key_id" {
  description = "The ID of the CMEK key."
  value       = module.security.cmek_key_id
}
