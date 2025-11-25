# Infrastructure

This directory contains all Infrastructure as Code (IaC) definitions for the TF-ICRE™ platform, managed by Terraform.

- **/modules**: Contains reusable Terraform modules for creating resources like Cloud Run services, BigQuery datasets, etc.
- **/environments**: Contains the environment-specific configurations (`dev`, `uat`, `prod`) that consume the modules. This allows for customized deployments in each environment.
