# TF-ICRE™ (Trade Finance Integrated Credit Risk Engine)

This repository contains the source code and infrastructure for the TF-ICRE™ platform, a comprehensive risk intelligence ecosystem for African Development Finance Institutions (DFIs).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)

## Overview

TF-ICRE™ is a cloud-native platform designed to address the unique challenges of trade finance in Africa. It provides a suite of services for credit risk scoring, trade-based money laundering (TBML) detection, and model governance.

## Architecture

The TF-ICRE™ platform is built on a microservices architecture and is deployed on Google Cloud Platform (GCP). The key components are:

-   **Frontend**: A Next.js web application that provides the user interface for the platform.
-   **Services**: A set of FastAPI-based microservices that provide the core functionality of the platform:
    -   **Scoring Engine**: Provides credit risk scoring and explainability.
    -   **Governance Engine**: Provides model governance, auditing, and Regulations-as-Code (RaC) capabilities.
    -   **TBML Engine**: Provides Trade-Based Money Laundering (TBML) detection and trade integrity analysis.
-   **Data Pipelines**: A set of Airflow DAGs and Dataflow jobs for orchestrating data ingestion, validation, and transformation.
-   **ML Pipelines**: A set of Vertex AI pipelines for training and deploying machine learning models.
-   **Infrastructure**: Infrastructure as Code (IaC) definitions for the platform, managed by Terraform.

## Getting Started

### Prerequisites

-   Google Cloud SDK
-   Terraform 1.0+
-   Docker
-   Node.js 18+
-   Python 3.8+

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/your-project.git
    cd your-project
    ```

2.  **Set up the infrastructure**:
    Navigate to the `infra/terraform/environments/dev` directory and follow the instructions in the `infra/README.md` to deploy the infrastructure.

3.  **Deploy the services**:
    Navigate to each service directory (`services/scoring-engine`, `services/governance-engine`, `services/tbml-engine`) and follow the instructions in the respective `README.md` files to deploy the services.

4.  **Run the frontend**:
    Navigate to the `frontend/web-app` directory and follow the instructions in the `frontend/README.md` to run the frontend.

## Repository Structure

-   **`data-pipelines/`**: Contains the Airflow DAGs and Dataflow jobs for orchestrating data ingestion, validation, and transformation.
-   **`frontend/`**: Contains the source code for the TF-ICRE™ web user interfaces.
-   **`genkit-examples/`**: Contains example Genkit flows.
-   **`infra/`**: Contains all Infrastructure as Code (IaC) definitions for the TF-ICRE™ platform, managed by Terraform.
-   **`ml-pipelines/`**: Contains all components related to the MLOps lifecycle, managed by Vertex AI Pipelines.
-   **`services/`**: Contains the backend microservices for the TF-ICRE™ platform.
