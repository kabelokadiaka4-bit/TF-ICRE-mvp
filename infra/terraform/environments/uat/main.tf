# /infra/terraform/environments/uat/main.tf

# UAT environment will mirror dev initially, but potentially with more strict settings
# Define the provider for this environment
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# --- Network Module ---
module "network" {
  source                = "../../modules/network"
  project_id            = var.gcp_project_id
  region                = var.gcp_region
  network_name          = var.network_name
  primary_subnet_cidr   = var.primary_subnet_cidr
}

# --- Security Module (KMS, Firewalls) ---
module "security" {
  source                = "../../modules/security"
  project_id            = var.gcp_project_id
  region                = var.gcp_region
  network_name          = module.network.network_name
  primary_subnet_cidr   = var.primary_subnet_cidr
}

# --- IAM Module (Service Accounts) ---
module "iam" {
  source     = "../../modules/iam"
  project_id = var.gcp_project_id
}

# --- Data Layer (BigQuery) ---
module "raw_dataset" {
  source       = "../../modules/bigquery"
  project_id   = var.gcp_project_id
  location     = var.gcp_region
  dataset_id   = "raw_data"
  description  = "Raw data ingested from source systems"
  kms_key_name = module.security.cmek_key_id
}

module "clean_dataset" {
  source       = "../../modules/bigquery"
  project_id   = var.gcp_project_id
  location     = var.gcp_region
  dataset_id   = "clean_data"
  description  = "Validated and cleaned data"
  kms_key_name = module.security.cmek_key_id
}

module "audit_dataset" {
  source       = "../../modules/bigquery"
  project_id   = var.gcp_project_id
  location     = var.gcp_region
  dataset_id   = "audit_logs"
  description  = "Immutable audit logs"
  kms_key_name = module.security.cmek_key_id
}

# --- Data Layer (Cloud Storage) ---
module "landing_bucket" {
  source       = "../../modules/storage"
  project_id   = var.gcp_project_id
  location     = var.gcp_region
  bucket_name  = "${var.gcp_project_id}-landing-zone"
  kms_key_name = module.security.cmek_key_id
  lifecycle_age_days = 30
}

module "processed_bucket" {
  source       = "../../modules/storage"
  project_id   = var.gcp_project_id
  location     = var.gcp_region
  bucket_name  = "${var.gcp_project_id}-processed-data"
  kms_key_name = module.security.cmek_key_id
}

# --- Messaging (Pub/Sub) ---
module "loan_events_topic" {
  source       = "../../modules/pubsub"
  project_id   = var.gcp_project_id
  topic_name   = "loan-application-events"
  region       = var.gcp_region
  kms_key_name = module.security.cmek_key_id
  subscriptions = {
    "scoring-engine-sub" = {}
    "compliance-monitor-sub" = {}
  }
}

# --- Container Registry (Artifact Registry) ---
module "artifact_registry" {
  source        = "../../modules/artifact-registry"
  project_id    = var.gcp_project_id
  location      = var.gcp_region
  repository_id = "tf-icre-images" # Matches the ID used in GitHub Actions workflow
  description   = "Docker images for TF-ICRE microservices in uat environment"
  environment   = "uat"
}

# --- VPC Access Connector for Cloud Run ---
module "vpc_connector" {
  source        = "../../modules/vpc-connector"
  project_id    = var.gcp_project_id
  region        = var.gcp_region
  connector_name = "${var.gcp_project_id}-connector"
  network_name  = module.network.network_name
  ip_cidr_range = "10.9.0.0/28" # Dedicated IP range for connector
}

# --- App Layer (Firestore) ---
resource "google_firestore_database" "database" {
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = var.gcp_region
  type        = "FIRESTORE_NATIVE"
}

# --- Orchestration (Cloud Composer) ---
# Note: Composer takes 20-30 mins to provision. 
# Defined here for completeness of Phase 1.
resource "google_composer_environment" "orchestrator" {
  name    = "tf-icre-composer-uat" # Name includes uat for clarity
  project = var.gcp_project_id
  region  = var.gcp_region

  config {
    software_config {
      image_version = "composer-3-airflow-2.7.3"
    }
    
    node_config {
      service_account = module.iam.data_ingestion_sa_email
      network         = module.network.network_self_link
      subnetwork      = module.network.subnet_name
    }

    encryption_config {
      kms_key_name = module.security.cmek_key_id
    }
  }
}