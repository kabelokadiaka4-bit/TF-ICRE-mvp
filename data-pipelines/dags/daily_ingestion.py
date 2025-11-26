from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.google.cloud.operators.dataflow import DataflowCreatePythonJobOperator
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
    run_dataflow_cleaning = DataflowCreatePythonJobOperator(
        task_id='run_dataflow_cleaning',
        py_file='gs://{{ var.value.composer_bucket }}/dataflow/ingest_transform.py',
        job_name='tf-icre-cleaning-{{ ds_nodash }}',
        options={
            'input': 'gs://{{ var.value.landing_bucket }}/raw/loans/{{ ds_nodash }}/loans_data.csv',
            'output': 'gs://{{ var.value.processed_bucket }}/clean/loans/{{ ds_nodash }}/cleaned_data',
            'project': '{{ var.value.gcp_project_id }}',
            'region': '{{ var.value.gcp_region }}',
            'temp_location': 'gs://{{ var.value.processed_bucket }}/temp',
            'staging_location': 'gs://{{ var.value.processed_bucket }}/staging',
        },
        location='{{ var.value.gcp_region }}',
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
        # Placeholder for logic to move file from 'raw/' to 'archive/'
        print(f"Archiving file for {kwargs['ds']}")

    archive_raw_file = PythonOperator(
        task_id='archive_raw_file',
        python_callable=archive_file,
    )

    # DAG Dependency Flow
    wait_for_file >> run_dataflow_cleaning >> load_to_bigquery >> archive_raw_file
