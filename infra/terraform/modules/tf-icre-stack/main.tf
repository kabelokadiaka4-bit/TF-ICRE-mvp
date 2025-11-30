# infra/terraform/modules/tf-icre-stack/main.tf

# --- Network Module ---
module "network" {
  source                = "../network"
  project_id            = var.project_id
  region                = var.region
  network_name          = var.network_name
  primary_subnet_cidr   = var.primary_subnet_cidr
}

# --- Security Module (KMS, Firewalls) ---
module "security" {
  source                = "../security"
  project_id            = var.project_id
  region                = var.region
  network_name          = module.network.network_name
  primary_subnet_cidr   = var.primary_subnet_cidr
  prefix                = "tf-icre-${var.environment}"
}

# --- IAM Module (Service Accounts) ---
module "iam" {
  source     = "../iam"
  project_id = var.project_id
}

# --- Data Layer (BigQuery) ---
module "raw_dataset" {
  source       = "../bigquery"
  project_id   = var.project_id
  location     = var.region
  dataset_id   = "raw_data"
  description  = "Raw data ingested from source systems"
  kms_key_name = module.security.cmek_key_id
}

module "clean_dataset" {
  source       = "../bigquery"
  project_id   = var.project_id
  location     = var.region
  dataset_id   = "clean_data"
  description  = "Validated and cleaned data"
  kms_key_name = module.security.cmek_key_id
}

module "audit_dataset" {
  source       = "../bigquery"
  project_id   = var.project_id
  location     = var.region
  dataset_id   = "audit_logs"
  description  = "Immutable audit logs"
  kms_key_name = module.security.cmek_key_id
}

# --- Data Layer (Cloud Storage) ---
module "landing_bucket" {
  source             = "../storage"
  project_id         = var.project_id
  location           = var.region
  bucket_name        = "${var.project_id}-landing-zone"
  kms_key_name       = module.security.cmek_key_id
  lifecycle_age_days = var.landing_bucket_lifecycle_days
}

module "processed_bucket" {
  source       = "../storage"
  project_id   = var.project_id
  location     = var.region
  bucket_name  = "${var.project_id}-processed-data"
  kms_key_name = module.security.cmek_key_id
}

# --- Messaging (Pub/Sub) ---
module "loan_events_topic" {
  source       = "../pubsub"
  project_id   = var.project_id
  topic_name   = "loan-application-events"
  region       = var.region
  kms_key_name = module.security.cmek_key_id
  subscriptions = {
    "scoring-engine-sub" = {}
    "compliance-monitor-sub" = {}
  }
}

# --- Container Registry (Artifact Registry) ---
module "artifact_registry" {
  source        = "../artifact-registry"
  project_id    = var.project_id
  location      = var.region
  repository_id = "tf-icre-images"
  description   = "Docker images for TF-ICRE microservices in ${var.environment} environment"
  environment   = var.environment
}

# --- VPC Access Connector for Cloud Run ---
module "vpc_connector" {
  source         = "../vpc-connector"
  project_id     = var.project_id
  region         = var.region
  connector_name = "${var.environment}-conn" # Shortened name to avoid length limits
  network_name   = module.network.network_name
  ip_cidr_range  = var.vpc_connector_cidr
}

# --- App Layer (Firestore) ---
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

# --- Orchestration (Cloud Composer) ---
# Note: Composer takes 20-30 mins to provision. 
resource "google_composer_environment" "orchestrator" {
  name    = "tf-icre-composer-${var.environment}"
  project = var.project_id
  region  = var.region

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
