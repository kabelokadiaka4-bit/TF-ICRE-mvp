# /infra/terraform/modules/gcp-apis/variables.tf

variable "project_id" {
  description = "The ID of the GCP project to enable APIs on."
  type        = string
}

variable "gcp_api_services" {
  description = "List of GCP APIs to enable for the project."
  type        = list(string)
  default = [
    "compute.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com",
    "iam.googleapis.com",
    "cloudkms.googleapis.com",
    "bigquery.googleapis.com",
    "storage.googleapis.com",
    "pubsub.googleapis.com",
    "firestore.googleapis.com",
    "run.googleapis.com",
    "vpcaccess.googleapis.com",
    "composer.googleapis.com",
    "dataflow.googleapis.com",
    "aiplatform.googleapis.com",
    "logging.googleapis.com",
    "serviceusage.googleapis.com",
    "documentai.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ]
}
