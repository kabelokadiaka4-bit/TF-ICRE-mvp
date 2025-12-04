# ml-pipelines/pipelines/training_pipeline.py
from kfp.v2 import dsl
from kfp.v2 import compiler
# Import components
from components.data_extraction import extract_data
from components.feature_engineering import feature_engineer_data # Added
from components.model_training import train_xgboost_model
from components.model_evaluation import evaluate_model
from components.model_deployment import deploy_model_to_endpoint
from components.train_gnn_model import train_gnn_model # Added for GNN pipeline

# --- XGBoost PD Model Training Pipeline ---
@dsl.pipeline(
    name="credit-scoring-training-pipeline",
    description="End-to-end pipeline for training XGBoost credit scoring model",
    pipeline_root="gs://tf-icre-processed-data/pipeline_root", # Updated pipeline_root
)
def training_pipeline(
    project_id: str,
    region: str,
    dataset_id: str,
    table_id: str,
    serving_container_image: str = "us-docker.pkg.dev/vertex-ai/prediction/xgboost-cpu.1-1:latest",
    target_column: str = "status" # Added target column for feature engineering
):
    # Step 1: Extract Data
    extract_op = extract_data(
        project_id=project_id,
        dataset_id=dataset_id,
        table_id=table_id
    )
    
    # Step 2: Feature Engineering
    feature_engineer_op = feature_engineer_data(
        input_data=extract_op.outputs["output_data"]
    )
    
    # Step 3: Train Model
    train_op = train_xgboost_model(
        input_data=feature_engineer_op.outputs["output_features"] # Connect to feature engineering output
    )
    
    # Step 4: Evaluate
    eval_op = evaluate_model(
        input_model=train_op.outputs["model_output"],
        threshold_auc=0.75
    )
    
    # Step 5: Deploy (Conditional)
    with dsl.Condition(eval_op.output == "deploy"):
        deploy_model_to_endpoint(
            project_id=project_id,
            region=region,
            model=train_op.outputs["model_output"],
            serving_container_image_uri=serving_container_image
        )

# --- GNN-based TBML Model Training Pipeline (Placeholder) ---
@dsl.pipeline(
    name="tbml-gnn-training-pipeline",
    description="End-to-end pipeline for training GNN-based TBML model",
    pipeline_root="gs://tf-icre-processed-data/pipeline_root_tbml",
)
def tbml_gnn_training_pipeline(
    project_id: str,
    region: str,
    transaction_data_table: str,
    serving_container_image: str = "us-docker.pkg.dev/vertex-ai/prediction/pytorch-cpu.1-7:latest" # Example
):
    # Step 1: Extract Transaction Graph Data (Placeholder)
    # This would be a specialized component for graph data extraction
    # For now, we'll directly feed to the GNN training component
    
    # Step 2: Train GNN Model
    train_gnn_op = train_gnn_model(
        input_data=dsl.importer(artifact_uri="gs://tf-icre-processed-data/mock_graph_data", artifact_type="Dataset"),
    )
    
    # Step 3: Evaluate GNN Model (Placeholder)
    # eval_gnn_op = evaluate_gnn_model(input_model=train_gnn_op.outputs["model_output"])
    
    # Step 4: Deploy GNN Model (Placeholder)
    # with dsl.Condition(eval_gnn_op.output == "deploy"):
    #     deploy_gnn_model_to_endpoint(...)

if __name__ == "__main__":
    compiler.Compiler().compile(
        pipeline_func=training_pipeline,
        package_path="credit_scoring_pipeline.json"
    )
    compiler.Compiler().compile(
        pipeline_func=tbml_gnn_training_pipeline,
        package_path="tbml_gnn_pipeline.json"
    )
