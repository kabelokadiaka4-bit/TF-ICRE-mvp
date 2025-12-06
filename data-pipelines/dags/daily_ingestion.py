"""
### TF-ICRE Daily Data Ingestion DAG

This DAG orchestrates the daily ingestion of loan data from a source system into BigQuery.

**Workflow:**
1.  **Wait for File:** Waits for a CSV file of loan data to be uploaded to a GCS bucket.
2.  **Clean Data:** Triggers a Dataflow Flex Template job to clean and transform the raw CSV data into a JSONL file.
3.  **Load to BigQuery:** Loads the cleaned JSONL data into the `loans` table in the `clean_data` BigQuery dataset.
4.  **Archive File:** Archives the raw CSV file to an `archive` folder in the GCS bucket.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.google.cloud.operators.dataflow import DataflowFlexTemplateOperator
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from airflow.providers.google.cloud.sensors.gcs import GCSObjectExistenceSensor

# Default arguments for the DAG
default_args = {
    'owner': 'tf-icre-data-eng',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Define the DAG
with DAG(
    'daily_data_ingestion',
    default_args=default_args,
    description='Daily ingestion from Source -> GCS -> BigQuery',
    schedule_interval='0 2 * * *', # Run daily at 2 AM
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['tf-icre', 'ingestion'],
) as dag:

    # Task 1: Wait for the file to land in GCS (Simulating SFTP transfer)
    # In reality, a Transfer Service or separate process might land this file
    wait_for_file = GCSObjectExistenceSensor(
        task_id='wait_for_source_file',
        bucket='{{ var.value.landing_bucket }}',
        object='raw/loans/{{ ds_nodash }}/loans_data.csv',
        timeout=600,
        poke_interval=60,
        mode='poke'
    )

    # Task 2: Run Dataflow Job (Validation & Cleaning)
    # This cleans the raw CSV and outputs a JSONL file ready for BQ
    run_dataflow_cleaning = DataflowFlexTemplateOperator(
        task_id='run_dataflow_cleaning',
        project_id='{{ var.value.gcp_project_id }}',
        location='{{ var.value.gcp_region }}',
        body={
            "launchParameter": {
                "jobName": "tf-icre-flex-cleaning-{{ ds_nodash }}",
                "containerSpecGcsPath": "gs://tf-icre-processed-data/dataflow/templates/ingest_transform_template.json",
                "parameters": {
                    "input": "gs://{{ var.value.landing_bucket }}/raw/loans/{{ ds_nodash }}/loans_data.csv",
                    "output": "gs://{{ var.value.processed_bucket }}/clean/loans/{{ ds_nodash }}/cleaned_data"
                }
            }
        },
    )

    # Task 3: Load Cleaned Data into BigQuery
    load_to_bigquery = GCSToBigQueryOperator(
        task_id='load_to_bigquery',
        bucket='{{ var.value.processed_bucket }}',
        source_objects=['clean/loans/{{ ds_nodash }}/cleaned_data*'],
        destination_project_dataset_table='{{ var.value.gcp_project_id }}.clean_data.loans',
        schema_fields=[
            {'name': 'loan_id', 'type': 'STRING', 'mode': 'REQUIRED'},
            {'name': 'customer_id', 'type': 'STRING', 'mode': 'REQUIRED'},
            {'name': 'amount', 'type': 'FLOAT', 'mode': 'REQUIRED'},
            {'name': 'currency', 'type': 'STRING', 'mode': 'NULLABLE'},
            {'name': 'status', 'type': 'STRING', 'mode': 'NULLABLE'},
            {'name': 'ingestion_date', 'type': 'TIMESTAMP', 'mode': 'NULLABLE'},
        ],
        source_format='NEWLINE_DELIMITED_JSON',
        write_disposition='WRITE_APPEND',
    )

    # Task 4: Archive Raw File (Python Operator wrapper)
    def archive_file(**kwargs):
        """
        Archives the raw data file by moving it from the 'raw/' directory to the 'archive/' directory in GCS.

        Args:
            **kwargs: Keyword arguments passed by Airflow, including the execution date ('ds').
        """
        # Placeholder for logic to move file from 'raw/' to 'archive/'
        print(f"Archiving file for {kwargs['ds']}")

    archive_raw_file = PythonOperator(
        task_id='archive_raw_file',
        python_callable=archive_file,
    )

    # DAG Dependency Flow
    wait_for_file >> run_dataflow_cleaning >> load_to_bigquery >> archive_raw_file
