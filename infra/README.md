# Infrastructure

This directory contains all Infrastructure as Code (IaC) definitions for the TF-ICRE™ platform, managed by Terraform.

## Structure

-   **/terraform/modules**: Contains reusable Terraform modules for creating resources like Cloud Run services, BigQuery datasets, etc.
-   **/terraform/environments**: Contains the environment-specific configurations (`dev`, `uat`, `prod`) that consume the modules. This allows for customized deployments in each environment.

## Modules

-   **artifact-registry**: Manages Artifact Registry repositories for storing Docker images.
-   **bigquery**: Manages BigQuery datasets and tables.
-   **cloud-run-service**: Deploys a Cloud Run service.
-   **gcp-apis**: Enables the necessary GCP APIs for the project.
-   **iam**: Manages IAM policies and service accounts.
-   **network**: Manages the VPC network and firewall rules.
-   **pubsub**: Manages Pub/Sub topics and subscriptions.
-   **security**: Manages security-related resources like KMS keys and secret manager.
-   **storage**: Manages Cloud Storage buckets.
-   **tf-icre-stack**: A root module that combines all the other modules to deploy the entire TF-ICRE™ stack.
-   **vpc-connector**: Manages VPC connectors for serverless services.

## Getting Started

### Prerequisites

-   Terraform 1.0+
-   Google Cloud SDK

### Usage

1.  Navigate to the desired environment directory:
    ```bash
    cd infra/terraform/environments/dev
    ```

2.  Initialize Terraform:
    ```bash
    terraform init
    ```

3.  Plan the infrastructure changes:
    ```bash
    terraform plan
    ```

4.  Apply the infrastructure changes:
    ```bash
    terraform apply
    ```
