# TF-ICRE™ Governance Engine

This service provides model governance, auditing, and Regulations-as-Code (RaC) capabilities for the TF-ICRE™ platform. It is a FastAPI-based application that integrates with Google Cloud services like Firestore and BigQuery, and uses a mock OPA client for policy evaluation.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)

## Features

-   **Model Registry**: Register and manage machine learning models in a central Pan-African Model Registry (PAMR) built on Firestore.
-   **Immutable Audit Trail**: Log all AI decisions and manual overrides to Firestore and BigQuery for a tamper-proof audit trail.
-   **Regulations-as-Code (RaC)**: Evaluate and modify regulatory policies using a mock Open Policy Agent (OPA) client.
-   **Metrics**: Exposes Prometheus metrics for monitoring.
-   **Rate Limiting**: Optional rate limiting to prevent abuse.

## Prerequisites

-   Python 3.8+
-   Google Cloud SDK
-   Docker (for containerized deployment)

## Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/your-project.git
    cd your-project/services/governance-engine
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure environment variables**:
    Create a `.env` file in this directory and add the following variables:
    ```
    GCP_PROJECT_ID="your-gcp-project-id"
    GCP_REGION="your-gcp-region"
    BQ_AUDIT_LOG_TABLE="your-gcp-project-id.audit_logs.scoring_decisions"
    BQ_AUDIT_LOG_OVERRIDES_TABLE="your-gcp-project-id.audit_logs.model_overrides"
    ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
    ENABLE_RATE_LIMITING="false" # set to "true" to enable
    RATE_LIMIT="100/minute"
    ```

## Running the Service

### Locally

To run the service locally for development, use `uvicorn`:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8081
```

### With Docker

To build and run the service with Docker:
```bash
docker build -t governance-engine .
docker run -p 8081:8081 -e GCP_PROJECT_ID="your-gcp-project-id" ... governance-engine
```

## API Endpoints

### Health and Status

-   **GET /**: Returns the service name and status.
-   **GET /health**: Health check endpoint.
-   **GET /ready**: Readiness check endpoint. Verifies that all dependencies are initialized.

### Governance

-   **POST /v1/governance/register_model**: Registers a new ML model in the Pan-African Model Registry (PAMR).
    -   **Request Body**: `ModelMetadata` object.
-   **POST /v1/governance/override**: Logs a manual override of an AI decision.
    -   **Request Body**: `OverrideDecision` object.
-   **GET /v1/governance/audit**: Queries the immutable audit trail from BigQuery.
    -   **Query Parameters**: `user_id`, `start_date`, `end_date`
-   **POST /v1/governance/policy/update**: Modifies a Regulations-as-Code (RaC) rule.
    -   **Request Body**: `PolicyRule` object.
-   **POST /v1/governance/policy/evaluate**: Evaluates a Regulations-as-Code (RaC) rule against given input data.
    -   **Query Parameter**: `policy_id`
    -   **Request Body**: A JSON object with the input data.
