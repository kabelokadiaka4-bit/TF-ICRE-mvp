from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.google.cloud.operators.bigquery import BigQueryInsertJobOperator

default_args = {
    'owner': 'tf-icre-data-eng',
    'depends_on_past': False,
    'email_on_failure': True, # Alert on data quality failure
    'email_on_retry': False,
    'retries': 0,
}

with DAG(
    'data_quality_checks',
    default_args=default_args,
    description='Periodic data quality checks on BigQuery tables',
    schedule_interval='30 3 * * *', # Run daily at 3:30 AM (after ingestion)
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['tf-icre', 'quality'],
) as dag:

    # Check 1: Null Values in Critical Fields
    check_nulls = BigQueryInsertJobOperator(
        task_id='check_nulls_critical_fields',
        configuration={
            "query": {
                "query": """
                    SELECT COUNT(*) as null_count
                    FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
                    WHERE loan_id IS NULL OR customer_id IS NULL
                """,
                "useLegacySql": False,
            }
        },
    )

    # Check 2: Business Rule Validation (e.g., Loan Amount > 0)
    check_negative_amounts = BigQueryInsertJobOperator(
        task_id='check_negative_loan_amounts',
        configuration={
            "query": {
                "query": """
                    SELECT COUNT(*) as invalid_count
                    FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
                    WHERE amount <= 0
                """,
                "useLegacySql": False,
            }
        },
    )

    # TODO: Add logic to fail the DAG or send alerts if counts > 0
    # Currently, BQ operator succeeds if query runs, we would need a PythonOperator
    # to inspect the query result or use BigQueryCheckOperator.

    check_nulls >> check_negative_amounts
