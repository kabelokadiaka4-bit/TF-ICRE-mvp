# /infra/terraform/modules/gcp-apis/main.tf

# List of all required APIs for the TF-ICRE platform
variable "gcp_api_services" {
  description = "List of GCP APIs to enable for the project."
  type        = list(string)
  default = [
    "compute.googleapis.com",             # For VPC, Firewalls, Load Balancers
    "containerregistry.googleapis.com",   # For gcr.io/docker.pkg.dev if used, part of Artifact Registry
    "artifactregistry.googleapis.com",    # For Artifact Registry
    "iam.googleapis.com",                 # For IAM management
    "cloudkms.googleapis.com",            # For KMS keys
    "bigquery.googleapis.com",            # For BigQuery datasets
    "storage.googleapis.com",             # For GCS buckets
    "pubsub.googleapis.com",              # For Pub/Sub topics
    "firestore.googleapis.com",           # For Firestore database
    "run.googleapis.com",                 # For Cloud Run services
    "vpcaccess.googleapis.com",           # For VPC Access Connector
    "composer.googleapis.com",            # For Cloud Composer
    "dataflow.googleapis.com",            # For Dataflow jobs
    "aiplatform.googleapis.com",          # For Vertex AI (Feature Store, Endpoints, Pipelines)
    "logging.googleapis.com",             # For Cloud Logging
    "serviceusage.googleapis.com",        # For enabling/disabling services
    "documentai.googleapis.com",          # For Document AI
    "cloudbuild.googleapis.com",          # For Cloud Build (implicit for some workflows)
    "cloudresourcemanager.googleapis.com",# For Project level operations
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(var.gcp_api_services)

  project = var.project_id
  service = each.value

  disable_on_destroy = false # Keep API enabled even if Terraform is destroyed
}
