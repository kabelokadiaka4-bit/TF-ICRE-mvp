# infra/terraform/modules/tf-icre-stack/outputs.tf

output "network_name" {
  value = module.network.network_name
}

output "subnet_name" {
  value = module.network.subnet_name
}

output "cmek_key_id" {
  value = module.security.cmek_key_id
}

output "artifact_registry_url" {
  value = module.artifact_registry.repository_url
}

output "vpc_connector_id" {
  value = module.vpc_connector.connector_id
}

output "service_account_emails" {
  value = {
    scoring    = module.iam.scoring_engine_sa_email
    tbml       = module.iam.tbml_engine_sa_email
    governance = module.iam.governance_engine_sa_email
    ingestion  = module.iam.data_ingestion_sa_email
  }
}
