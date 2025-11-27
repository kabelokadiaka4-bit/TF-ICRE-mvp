# /infra/terraform/modules/gcp-apis/main.tf



resource "google_project_service" "apis" {
  for_each = toset(var.gcp_api_services)

  project = var.project_id
  service = each.value

  disable_on_destroy = false # Keep API enabled even if Terraform is destroyed
}

