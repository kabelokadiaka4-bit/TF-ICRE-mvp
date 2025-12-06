# Machine Learning Pipelines

This directory contains all components related to the MLOps lifecycle, managed by Vertex AI Pipelines.

## Structure

-   **/components**: Reusable Kubeflow Pipeline (KFP) components for tasks like data validation, feature engineering, model training, and evaluation.
-   **/pipelines**: End-to-end pipeline definitions that orchestrate the components to train and deploy the various ML models used across the TF-ICRE™ platform.
-   **submit_pipeline.py**: A script for submitting and running the Vertex AI pipelines.

## Pipelines

-   **credit-scoring-training-pipeline**: Trains and deploys an XGBoost credit scoring model.
-   **tbml-gnn-training-pipeline**: Trains and deploys a GNN-based TBML model.

## Getting Started

### Prerequisites

-   Python 3.8+
-   Google Cloud SDK
-   Vertex AI Pipelines enabled

### Submitting a Pipeline

To submit a pipeline run, use the `submit_pipeline.py` script:

```bash
python submit_pipeline.py --pipeline credit_scoring_pipeline.json --project_id your-gcp-project-id --region your-gcp-region
```
