# /infra/terraform/modules/iam/outputs.tf

output "scoring_engine_sa_email" {
  value = google_service_account.scoring_engine_sa.email
}

output "tbml_engine_sa_email" {
  value = google_service_account.tbml_engine_sa.email
}

output "governance_engine_sa_email" {
  value = google_service_account.governance_engine_sa.email
}

output "data_ingestion_sa_email" {
  value = google_service_account.data_ingestion_sa.email
}
