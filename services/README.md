# Backend Microservices

This directory houses the backend microservices for the TF-ICRE™ platform. Each service is built using Python with the FastAPI framework and is designed to be deployed as a container on Google Cloud Run.

- **/scoring-engine**: Handles core credit risk scoring, model inference, and explainability.
- **/tbml-engine**: Manages Trade-Based Money Laundering detection and document intelligence.
- **/governance-engine**: Powers the model registry, audit logging, and Regulations-as-Code policy enforcement.
