# /infra/terraform/modules/iam/main.tf

# --- Service Accounts ---

# Scoring Engine SA
resource "google_service_account" "scoring_engine_sa" {
  account_id   = "scoring-engine-sa"
  display_name = "Scoring Engine Service Account"
  project      = var.project_id
}

# TBML Engine SA
resource "google_service_account" "tbml_engine_sa" {
  account_id   = "tbml-engine-sa"
  display_name = "TBML Engine Service Account"
  project      = var.project_id
}

# Governance Engine SA
resource "google_service_account" "governance_engine_sa" {
  account_id   = "governance-engine-sa"
  display_name = "Governance Engine Service Account"
  project      = var.project_id
}

# Data Ingestion SA (for Airflow/Composer)
resource "google_service_account" "data_ingestion_sa" {
  account_id   = "data-ingestion-sa"
  display_name = "Data Ingestion Service Account"
  project      = var.project_id
}

# --- IAM Roles ---

# Scoring Engine Permissions (BigQuery Reader, Vertex AI User)
resource "google_project_iam_member" "scoring_bq_reader" {
  project = var.project_id
  role    = "roles/bigquery.dataViewer"
  member  = "serviceAccount:${google_service_account.scoring_engine_sa.email}"
}

resource "google_project_iam_member" "scoring_vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:${google_service_account.scoring_engine_sa.email}"
}

# TBML Engine Permissions (BigQuery Reader, DocAI User)
resource "google_project_iam_member" "tbml_bq_reader" {
  project = var.project_id
  role    = "roles/bigquery.dataViewer"
  member  = "serviceAccount:${google_service_account.tbml_engine_sa.email}"
}

resource "google_project_iam_member" "tbml_docai_user" {
  project = var.project_id
  role    = "roles/documentai.apiUser"
  member  = "serviceAccount:${google_service_account.tbml_engine_sa.email}"
}

# Governance Engine Permissions (Firestore User, BQ User)
resource "google_project_iam_member" "gov_firestore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.governance_engine_sa.email}"
}

# Data Ingestion Permissions (Storage Admin, BQ Admin)
resource "google_project_iam_member" "ingest_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.data_ingestion_sa.email}"
}

resource "google_project_iam_member" "ingest_bq_admin" {
  project = var.project_id
  role    = "roles/bigquery.admin"
  member  = "serviceAccount:${google_service_account.data_ingestion_sa.email}"
}
