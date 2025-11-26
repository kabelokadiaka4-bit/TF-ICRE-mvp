# ml-pipelines/components/data_extraction.py
from kfp.v2.dsl import component, Output, Dataset

@component(
    base_image="python:3.9",
    packages_to_install=["google-cloud-bigquery", "pandas", "pyarrow"]
)
def extract_data(
    project_id: str,
    dataset_id: str,
    table_id: str,
    output_data: Output[Dataset]
):
    from google.cloud import bigquery
    import pandas as pd

    client = bigquery.Client(project=project_id)
    
    # Simple query to fetch all data
    # In production, you'd likely filter by date or split
    query = f"SELECT * FROM `{project_id}.{dataset_id}.{table_id}`"
    
    df = client.query(query).to_dataframe()
    
    # Save to the output path as CSV
    df.to_csv(output_data.path, index=False)
