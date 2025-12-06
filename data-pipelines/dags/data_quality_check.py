"""
### TF-ICRE Data Quality Check DAG

This DAG performs a series of data quality checks on the `loans` table in the `clean_data` BigQuery dataset.

**Checks:**
1.  **No Nulls:** Checks for null values in critical fields (`loan_id`, `customer_id`, `amount`).
2.  **Valid Amounts:** Checks for negative or zero loan amounts.
3.  **Loan ID Uniqueness:** Checks for duplicate `loan_id`s.
4.  **Customer ID Uniqueness:** Checks for duplicate `customer_id`s.
5.  **Valid Currency:** Checks for invalid currency codes.
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.providers.google.cloud.operators.bigquery import BigQueryCheckOperator, BigQueryInsertJobOperator

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

    # Check 1: No Null Values in Critical Fields (Fail if any nulls found)
    check_nulls_critical_fields = BigQueryCheckOperator(
        task_id='check_nulls_critical_fields',
        sql="""
            SELECT COUNT(*)
            FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
            WHERE loan_id IS NULL OR customer_id IS NULL OR amount IS NULL
        """,
        use_legacy_sql=False,
        gcp_conn_id='google_cloud_default',
        location='{{ var.value.gcp_region }}',
    )

    # Check 2: No Negative or Zero Loan Amounts (Fail if any invalid amounts found)
    check_invalid_amounts = BigQueryCheckOperator(
        task_id='check_invalid_loan_amounts',
        sql="""
            SELECT COUNT(*)
            FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
            WHERE amount <= 0
        """,
        use_legacy_sql=False,
        gcp_conn_id='google_cloud_default',
        location='{{ var.value.gcp_region }}',
    )

    # Check 3: Uniqueness of Loan ID (Fail if duplicates found)
    check_loan_id_uniqueness = BigQueryCheckOperator(
        task_id='check_loan_id_uniqueness',
        sql="""
            SELECT COUNT(loan_id) - COUNT(DISTINCT loan_id)
            FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
        """,
        use_legacy_sql=False,
        gcp_conn_id='google_cloud_default',
        location='{{ var.value.gcp_region }}',
    )

    # Check 4: Uniqueness of Customer ID (Fail if duplicates found)
    check_customer_id_uniqueness = BigQueryCheckOperator(
        task_id='check_customer_id_uniqueness',
        sql="""
            SELECT COUNT(customer_id) - COUNT(DISTINCT customer_id)
            FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
        """,
        use_legacy_sql=False,
        gcp_conn_id='google_cloud_default',
        location='{{ var.value.gcp_region }}',
    )

    # Check 5: Valid Currency Codes (Fail if invalid codes found)
    check_valid_currency = BigQueryCheckOperator(
        task_id='check_valid_currency_codes',
        sql="""
            SELECT COUNT(*)
            FROM `{{ var.value.gcp_project_id }}.clean_data.loans`
            WHERE currency NOT IN ('USD', 'EUR', 'ZAR', 'GBP') -- Example valid currencies
        """,
        use_legacy_sql=False,
        gcp_conn_id='google_cloud_default',
        location='{{ var.value.gcp_region }}',
    )

    # Define the task flow
    check_nulls_critical_fields >> check_invalid_amounts >> check_loan_id_uniqueness >> check_customer_id_uniqueness >> check_valid_currency
