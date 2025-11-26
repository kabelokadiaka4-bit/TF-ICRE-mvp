# ml-pipelines/components/model_deployment.py
from kfp.v2.dsl import component, Input, Model

@component(
    base_image="python:3.9",
    packages_to_install=["google-cloud-aiplatform"]
)
def deploy_model_to_endpoint(
    project_id: str,
    region: str,
    model: Input[Model],
    serving_container_image_uri: str, 
    endpoint_name: str = "credit-scoring-endpoint"
):
    from google.cloud import aiplatform
    
    aiplatform.init(project=project_id, location=region)
    
    # Upload model to Vertex AI Model Registry
    uploaded_model = aiplatform.Model.upload(
        display_name="credit-scoring-xgboost",
        artifact_uri=model.uri,
        serving_container_image_uri=serving_container_image_uri,
    )
    
    # Create or retrieve endpoint
    endpoints = aiplatform.Endpoint.list(filter=f'display_name="{endpoint_name}"')
    if endpoints:
        endpoint = endpoints[0]
    else:
        endpoint = aiplatform.Endpoint.create(display_name=endpoint_name)
        
    # Deploy model to endpoint
    uploaded_model.deploy(
        endpoint=endpoint,
        machine_type="n1-standard-2",
        min_replica_count=1,
        max_replica_count=3
    )
