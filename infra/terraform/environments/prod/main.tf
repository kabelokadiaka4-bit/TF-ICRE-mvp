# /infra/terraform/environments/prod/main.tf

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# --- API Enablement ---
module "gcp_apis" {
  source    = "../../modules/gcp-apis"
  project_id = var.gcp_project_id
}

# Define the provider for this environment
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# --- Main Infrastructure Stack ---
module "stack" {
  source                        = "../../modules/tf-icre-stack"
  project_id                    = var.gcp_project_id
  region                        = var.gcp_region
  environment                   = "prod"
  network_name                  = var.network_name
  primary_subnet_cidr           = var.primary_subnet_cidr
  vpc_connector_cidr            = "10.11.0.0/28"
  landing_bucket_lifecycle_days = 365

  depends_on = [module.gcp_apis]
}