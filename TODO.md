# TF-ICRE™ Project Plan & TODO

This document outlines the development plan for building the TF-ICRE™ platform, based on the technical specification and our architectural design.

---

## Phase 1: Foundation & Infrastructure (In Progress)

This phase focuses on establishing the cloud infrastructure and CI/CD pipelines.

-   [ ] **Terraform - Core Infrastructure:**
    -   [ ] Define GCP Projects for `dev`, `uat`, and `prod`.
    -   [ ] Configure VPC, subnets, and firewall rules for the `africa-south1` region.
    -   [ ] Define IAM roles and service accounts with least-privilege permissions.
    -   [ ] Set up VPC Service Controls for data perimeter security.
    -   [ ] Provision Cloud KMS for Customer-Managed Encryption Keys (CMEK).
-   [ ] **Terraform - Service Infrastructure:**
    -   [ ] Finalize the reusable `cloud-run-service` module.
    -   [ ] Create a reusable module for BigQuery datasets with appropriate access controls.
    -   [ ] Create a module for Cloud Storage buckets (landing, raw, processed).
    -   [ ] Create a module for Pub/Sub topics.
    -   [ ] Provision the Cloud Composer environment.
    -   [ ] Provision the Firestore database.
-   [ ] **CI/CD - GitHub Actions:**
    -   [ ] Create a workflow to lint and validate Terraform code on pull requests.
    -   [ ] Create a workflow to plan and apply Terraform changes on merge to `main`.
    -   [ ] Set up secrets management for service account keys.

---

## Phase 2: Backend Microservices Development

This phase focuses on building the core logic for the three main backend services.

-   [ ] **Scoring Engine (`scoring-engine`):**
    -   [ ] Implement BigQuery client to fetch historical data for an entity.
    -   [ ] Implement Vertex AI Feature Store client to fetch real-time features.
    -   [ ] Implement client to invoke the deployed PD/LGD models on Vertex AI Endpoints.
    -   [ ] Integrate with Gemini API to generate plain-language summaries from SHAP values.
    -   [ ] Add structured logging for all decisions to be sunk into BigQuery.
    -   [ ] Write unit and integration tests.
-   [ ] **TBML Engine (`tbml-engine`):**
    -   [ ] Implement Document AI client for extracting fields from trade documents.
    -   [ ] Implement clients for external APIs (MarineTraffic, UN Comtrade).
    -   [ ] Build logic to construct a transaction graph for GNN analysis.
    -   [ ] Implement client to invoke the GNN model on Vertex AI Endpoints.
    -   [ ] Write unit and integration tests.
-   [ ] **Governance Engine (`governance-engine`):**
    -   [ ] Implement Firestore client to manage the Model Registry (create/read models).
    -   [ ] Implement logic to log manual overrides to both Firestore (immutable record) and BigQuery (analytics).
    -   [ ] Integrate the OPA client to make policy decisions based on `.rego` files.
    -   [ ] Implement the `/policy/update` endpoint to manage RaC rules.
    -   [ ] Write unit and integration tests.
-   [ ] **CI/CD - Services:**
    -   [ ] Create a GitHub Actions workflow to build and push Docker images for each service to Google Artifact Registry.
    -   [ ] Update the deployment workflow to deploy new service versions to Cloud Run.

---

## Phase 3: Data & ML Pipeline Implementation

This phase focuses on the automated data and machine learning workflows.

-   [ ] **Data Ingestion (Cloud Composer):**
    -   [ ] Develop an Airflow DAG for daily ingestion from source systems (SFTP, APIs) into GCS.
    -   [ ] Create a Dataflow template for validating, cleaning, and transforming raw data.
    -   [ ] Extend the DAG to trigger the Dataflow job and load data into `raw_data` and `clean_data` BigQuery datasets.
    -   [ ] Create a separate DAG for periodic data quality checks on BigQuery tables.
-   [ ] **ML Pipelines (Vertex AI):**
    -   [ ] Develop Kubeflow Pipeline (KFP) components for feature engineering, model training, and evaluation.
    -   [ ] Build the end-to-end training pipeline for the XGBoost PD model.
    -   [ ] Build the end-to-end training pipeline for the GNN-based TBML model.
    -   [ ] Set up a `Vertex-AI-Model-Monitoring` job to detect drift and trigger the training pipeline if performance degrades.
-   [ ] **CI/CD - Pipelines:**
    -   [ ] Create a workflow to sync Airflow DAGs to the Cloud Composer environment.
    -   [ ] Create a workflow to compile and deploy Vertex AI pipelines.

---

## Phase 4: Frontend UI/UX Development

This phase focuses on building out the user-facing application.

-   [ ] **State Management:**
    -   [ ] Choose and implement a state management library (e.g., Zustand, React Query).
    -   [ ] Set up an API client to interact with the backend services.
-   [ ] **Analyst Console:**
    -   [ ] Connect the `ScorecardView` to the `/v1/score` endpoint.
    -   [ ] Connect the `ExplanationPanel` to the `/v1/explain` endpoint.
    -   [ ] Implement the file upload functionality in the `DocumentViewer`.
-   [ ] **Authentication:**
    -   [ ] Integrate Firebase Authentication or Google Identity Platform.
    -   [ ] Create login/logout functionality and protect dashboard routes.
-   [ ] **Other Consoles:**
    -   [ ] Build a read-only view for the Model Registry in the `Governance Console`.
    -   [ ] Build the UI for the Audit Trail query in the `Governance Console`.
    -   [ ] Design the layout for the `Executive Dashboard` and embed Looker Studio reports.
-   [ ] **CI/CD - Frontend:**
    -   [ ] Create a GitHub Actions workflow to deploy the Next.js app to Firebase Hosting on merge to `main`.

---

## Phase 5: Integration, Testing, and Deployment

This phase focuses on ensuring the system is robust, secure, and ready for production.

-   [ ] **Testing:**
    -   [ ] Write end-to-end integration tests for critical user flows (e.g., new loan application -> score).
    -   [ ] Conduct performance testing on the `/v1/score` endpoint to ensure <500ms latency.
    -   [ ] Perform UAT with a select group of beta testers.
-   [ ] **Deployment:**
    -   [ ] Execute the Terraform `prod` environment configuration.
    -   [ ] Deploy all services, pipelines, and the frontend to the production environment.
    -   [ ] Perform the final data migration.
-   [ ] **Documentation:**
    -   [ ] Generate API documentation from OpenAPI specs.
    -   [ ] Write user guides and an admin manual.
    -   [ ] Document the model cards and validation results.

---

## Phase 6: Continental Platform Features (V3.0 Vision)

This phase incorporates the long-term strategic pillars for a pan-African platform.

-   [ ] **Pillar 1: Data & Interoperability:**
    -   [ ] **PADIL:** Design and implement the Pan-African Data Interoperability Layer.
        -   [ ] Define Canonical Data Models (CDM) for `Customer360`, `LoanInstrument`, etc., based on ISO 20022 and FIBO.
        -   [ ] Build a GraphQL Gateway for unified cross-DFI queries.
        -   [ ] Develop a `Translation Engine` service to map proprietary banking formats to the CDM.
        -   [ ] Implement the `Blockchain-Anchored Data Provenance` ledger using Hyperledger Fabric or similar.
    -   [ ] **Synthetic Data Sandbox:**
        -   [ ] Develop a new service (`synthetic-data-engine`) using GANs (e.g., with TensorFlow) to generate privacy-preserved datasets.
        -   [ ] Create a public API for regulators and partner DFIs to request and access synthetic data.
-   [ ] **Pillar 2: LLM Governance & Safety:**
    -   [ ] Create a new shared library (`llm-safety-sdk`) to be used by all services that interact with Generative AI.
    -   [ ] Implement the `Prompt Firewall` to sanitize inputs and prevent injection attacks.
    -   [ ] Implement the `Hallucination Detector` to check AI outputs against source documents.
    -   [ ] Implement the `LLMRouter` to route high-stakes AI outputs for human review based on confidence scores.
    -   [ ] Create a new BigQuery table `llm_audit_log` to immutably record all LLM interactions.
-   [ ] **Pillar 3: Advanced Cybersecurity:**
    -   [ ] **ISAC:** Develop a new microservice (`threat-intel-isac`) to manage the ingestion and federated sharing of threat intelligence in STIX 2.1 format via Pub/Sub.
    -   [ ] **Honeypot Network:** Add Terraform configurations to deploy decoy resources (fake databases, fake API endpoints) to lure and identify attackers.
    -   [ ] Create a `SOC Dashboard` in Looker Studio to visualize threats from the ISAC and honeypot alerts.
-   [ ] **Pillar 4: Post-Quantum Cryptography (PQC):**
    -   [ ] Research and prototype hybrid encryption (e.g., RSA + Kyber) in a shared cryptography library.
    -   [ ] Develop a migration plan to gradually re-encrypt sensitive data at rest.
    -   [ ] Plan the future migration of TLS certificates and code signing to PQC algorithms.