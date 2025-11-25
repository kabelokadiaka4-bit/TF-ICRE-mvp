terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Dynamically load the environment configuration based on the workspace
# Make sure to run `terraform workspace select <env>` before `terraform plan/apply`
module "environment" {
  source = "./environments/${terraform.workspace}"

  # Pass common variables if needed, here we derive project ID based on prefix and workspace
  gcp_project_id = "${var.gcp_project_prefix}-${terraform.workspace}"
  region         = var.gcp_region
}