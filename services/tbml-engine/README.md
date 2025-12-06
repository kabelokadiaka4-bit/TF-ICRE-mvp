# TF-ICRE™ TBML Engine

This service provides Trade-Based Money Laundering (TBML) detection and trade integrity analysis for the TF-ICRE™ platform. It is a FastAPI-based application that uses a combination of Document AI, external APIs, and Graph Neural Networks (GNNs) to detect suspicious trade activities.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Service](#running-the-service)
- [API Endpoints](#api-endpoints)

## Features

-   **Document AI Extraction**: Extracts key information from trade documents like invoices and bills of lading.
-   **Invoice Mispricing Detection**: Compares invoice prices to market prices from external APIs (e.g., UN Comtrade) to detect over/under invoicing.
-   **Shipping Verification**: Verifies shipping routes and vessel information using external APIs (e.g., Marine Traffic).
-   **Network Analysis**: Uses a mock Graph Neural Network (GNN) to detect anomalies and circular patterns in trade networks.
-   **TBML Risk Scoring**: Calculates a composite TBML risk score based on multiple risk factors.
-   **Alerting**: Generates alerts for high-risk transactions.
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
    cd your-project/services/tbml-engine
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
    ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
    ENABLE_RATE_LIMITING="false" # set to "true" to enable
    RATE_LIMIT="100/minute"
    ```

## Running the Service

### Locally

To run the service locally for development, use `uvicorn`:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8082
```

### With Docker

To build and run the service with Docker:
```bash
docker build -t tbml-engine .
docker run -p 8082:8082 -e GCP_PROJECT_ID="your-gcp-project-id" ... tbml-engine
```

## API Endpoints

### Health and Status

-   **GET /**: Returns the service name and status.
-   **GET /health**: Health check endpoint.
-   **GET /ready**: Readiness check endpoint. Verifies that all dependencies are initialized.

### TBML

-   **POST /v1/tbml/check**: Analyzes a single trade transaction for TBML risk.
    -   **Request Body**: `TBMLEntity` object.
-   **POST /v1/tbml/network**: Generates a counterparty risk network graph.
    -   **Request Body**: `TBMLEntity` object.
-   **GET /v1/tbml/alerts**: Retrieves high-risk TBML alerts for review.
