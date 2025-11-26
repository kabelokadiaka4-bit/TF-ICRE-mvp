# ml-pipelines/pipelines/training_pipeline.py
from kfp.v2 import dsl
from kfp.v2 import compiler
# Import components
from components.data_extraction import extract_data
from components.model_training import train_xgboost_model
from components.model_evaluation import evaluate_model
from components.model_deployment import deploy_model_to_endpoint

@dsl.pipeline(
    name="credit-scoring-training-pipeline",
    description="End-to-end pipeline for training XGBoost credit scoring model",
    pipeline_root="gs://{{BUCKET_NAME}}/pipeline_root",
)
def training_pipeline(
    project_id: str,
    region: str,
    dataset_id: str,
    table_id: str,
    serving_container_image: str = "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-1:latest"
):
    # Step 1: Extract Data
    extract_op = extract_data(
        project_id=project_id,
        dataset_id=dataset_id,
        table_id=table_id
    )
    
    # Step 2: Train Model
    train_op = train_xgboost_model(
        input_data=extract_op.outputs["output_data"]
    )
    
    # Step 3: Evaluate
    eval_op = evaluate_model(
        input_model=train_op.outputs["model_output"],
        threshold_auc=0.75
    )
    
    # Step 4: Deploy (Conditional)
    with dsl.Condition(eval_op.output == "deploy"):
        deploy_model_to_endpoint(
            project_id=project_id,
            region=region,
            model=train_op.outputs["model_output"],
            serving_container_image_uri=serving_container_image
        )

if __name__ == "__main__":
    compiler.Compiler().compile(
        pipeline_func=training_pipeline,
        package_path="credit_scoring_pipeline.json"
    )
