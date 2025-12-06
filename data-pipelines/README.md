# Data Pipelines

This directory contains the Airflow DAGs (Directed Acyclic Graphs) that are deployed to Cloud Composer. These DAGs orchestrate the data ingestion, validation, and transformation workflows for the TF-ICRE™ platform.

## DAGs

-   **daily_data_ingestion**: This DAG orchestrates the daily ingestion of loan data from a source system into BigQuery.
    -   **Workflow**:
        1.  **Wait for File**: Waits for a CSV file of loan data to be uploaded to a GCS bucket.
        2.  **Clean Data**: Triggers a Dataflow Flex Template job to clean and transform the raw CSV data into a JSONL file.
        3.  **Load to BigQuery**: Loads the cleaned JSONL data into the `loans` table in the `clean_data` BigQuery dataset.
        4.  **Archive File**: Archives the raw CSV file to an `archive` folder in the GCS bucket.

-   **data_quality_checks**: This DAG performs a series of data quality checks on the `loans` table in the `clean_data` BigQuery dataset.
    -   **Checks**:
        1.  **No Nulls**: Checks for null values in critical fields (`loan_id`, `customer_id`, `amount`).
        2.  **Valid Amounts**: Checks for negative or zero loan amounts.
        3.  **Loan ID Uniqueness**: Checks for duplicate `loan_id`s.
        4.  **Customer ID Uniqueness**: Checks for duplicate `customer_id`s.
        5.  **Valid Currency**: Checks for invalid currency codes.

## Dataflow

This directory contains the source code for the Dataflow jobs that are orchestrated by the Airflow DAGs.

## Deployment

The DAGs in this directory are deployed to a Cloud Composer environment. Any changes to the DAGs will be automatically picked up by the Composer environment.
