# TF-ICRE™ Scoring Engine

This service provides credit risk scoring and explainability for the TF-ICRE™ platform. It is a FastAPI-based application that integrates with Google Cloud services like BigQuery, Vertex AI, and the Gemini API.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)

## Features

-   **Credit Scoring**: Provides a composite credit score, probability of default (PD), loss given default (LGD), and exposure at default (EAD).
-   **Explainability**: Generates plain-language explanations for credit decisions using the Gemini API.
-   **Auditing**: Logs all scoring decisions to BigQuery for auditing and regulatory compliance.
-   **Batch Scoring**: Supports batch scoring of portfolios.
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
    cd your-project/services/scoring-engine
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
    GEMINI_API_KEY="your-gemini-api-key"
    BQ_AUDIT_LOG_TABLE="your-gcp-project-id.audit_logs.scoring_decisions"
    ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
    ENABLE_RATE_LIMITING="false" # set to "true" to enable
    RATE_LIMIT="100/minute"
    ```

## Running the Service

### Locally

To run the service locally for development, use `uvicorn`:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

### With Docker

To build and run the service with Docker:
```bash
docker build -t scoring-engine .
docker run -p 8080:8080 -e GCP_PROJECT_ID="your-gcp-project-id" ... scoring-engine
```

## API Endpoints

### Health and Status

-   **GET /**: Returns the service name and status.
-   **GET /health**: Health check endpoint.
-   **GET /ready**: Readiness check endpoint. Verifies that all dependencies are initialized.

### Scoring

-   **POST /v1/score**: Generates a credit score for a single entity.
    -   **Request Body**:
        ```json
        {
          "entity_id": "string",
          "loan_amount": 0,
          "currency": "string",
          "years_in_business": 0,
          "revenue_usd": 0
        }
        ```
    -   **Response Body**: `ScoreResponse` object.

-   **POST /v1/score/batch**: Generates credit scores for a batch of entities.
    -   **Request Body**:
        ```json
        {
          "requests": [
            {
              "entity_id": "string",
              "loan_amount": 0,
              "currency": "string",
              "years_in_business": 0,
              "revenue_usd": 0
            }
          ]
        }
        ```
    -   **Response Body**: A list of `ScoreResponse` objects.

### Explainability

-   **GET /v1/explain/{loan_id}**: Retrieves SHAP explanations for a historical decision.
    -   **Path Parameter**: `loan_id` (string)
    -   **Response Body**: `ExplanationResponse` object.
