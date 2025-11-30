# /infra/terraform/environments/prod/outputs.tf

output "network_name" {
  value = module.stack.network_name
}

output "subnet_name" {
  value = module.stack.subnet_name
}

output "cmek_key_id" {
  value = module.stack.cmek_key_id
}

output "artifact_registry_url" {
  value = module.stack.artifact_registry_url
}

output "vpc_connector_id" {
  value = module.stack.vpc_connector_id
}

output "service_account_emails" {
  value = module.stack.service_account_emails
}
