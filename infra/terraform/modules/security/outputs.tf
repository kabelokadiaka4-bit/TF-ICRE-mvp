# /infra/terraform/modules/security/outputs.tf

output "cmek_key_id" {
  description = "The ID of the CMEK key."
  value       = google_kms_crypto_key.cmek.id
}
