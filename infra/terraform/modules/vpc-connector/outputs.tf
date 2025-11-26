# /infra/terraform/modules/vpc-connector/outputs.tf

output "connector_id" {
  description = "The fully qualified resource name of the VPC Access Connector."
  value       = google_vpc_access_connector.connector.id
}

output "connector_name" {
  description = "The name of the VPC Access Connector."
  value       = google_vpc_access_connector.connector.name
}
