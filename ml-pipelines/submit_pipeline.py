# ml-pipelines/submit_pipeline.py
from google.cloud import aiplatform
import argparse

def submit_pipeline_job(
    project_id: str,
    region: str,
    display_name: str,
    template_path: str,
    pipeline_root: str,
    parameter_values: dict
):
    aiplatform.init(project=project_id, location=region)

    job = aiplatform.PipelineJob(
        display_name=display_name,
        template_path=template_path,
        pipeline_root=pipeline_root,
        parameter_values=parameter_values,
    )

    job.submit()
    print(f"Pipeline job {display_name} submitted. State: {job.state}")
    return job

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Submit Vertex AI Pipeline Job")
    parser.add_argument("--project_id", type=str, required=True)
    parser.add_argument("--region", type=str, required=True)
    parser.add_argument("--display_name", type=str, required=True)
    parser.add_argument("--template_path", type=str, required=True)
    parser.add_argument("--pipeline_root", type=str, required=True)
    # Naive parsing for demonstration; in prod use a more robust way to pass dicts
    parser.add_argument("--dataset_id", type=str, default="clean_data")
    parser.add_argument("--table_id", type=str, default="loans")

    args = parser.parse_args()

    # Construct parameters dict
    params = {
        "project_id": args.project_id,
        "region": args.region,
        "dataset_id": args.dataset_id,
        "table_id": args.table_id
    }

    submit_pipeline_job(
        project_id=args.project_id,
        region=args.region,
        display_name=args.display_name,
        template_path=args.template_path,
        pipeline_root=args.pipeline_root,
        parameter_values=params
    )
