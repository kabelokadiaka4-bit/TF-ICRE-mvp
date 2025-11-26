# services/governance-engine/tests/test_main.py
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import os
from datetime import datetime

# Set environment variables for testing
os.environ["GCP_PROJECT_ID"] = "test-project"
os.environ["GCP_REGION"] = "test-region"
os.environ["BQ_AUDIT_LOG_OVERRIDES_TABLE"] = "test_audit_logs.model_overrides"
os.environ["BQ_AUDIT_LOG_TABLE"] = "test_audit_logs.scoring_decisions"


# Mock GCP client initializations globally
with patch('google.cloud.firestore.Client') as MockFirestoreClient, \
     patch('google.cloud.bigquery.Client') as MockBigQueryClient, \
     patch('google.cloud.logging.Client') as MockCloudLoggingClient:

    # Mock Firestore client
    mock_firestore_client_instance = AsyncMock(spec=MockFirestoreClient)
    MockFirestoreClient.return_value = mock_firestore_client_instance
    mock_firestore_client_instance.collection.return_value.document.return_value.set.return_value = None
    mock_firestore_client_instance.collection.return_value.add.return_value = None

    # Mock BigQuery client
    mock_bq_client_instance = AsyncMock(spec=MockBigQueryClient)
    MockBigQueryClient.return_value = mock_bq_client_instance
    mock_bq_client_instance.get_table.return_value = AsyncMock()
    mock_bq_client_instance.insert_rows_json.return_value = []
    # Mock query_job result for audit trail
    mock_query_job_result = AsyncMock()
    mock_query_job_result.result.return_value = []
    mock_bq_client_instance.query.return_value = mock_query_job_result


    # Mock Cloud Logging client
    mock_gcp_logger_instance = AsyncMock()
    MockCloudLoggingClient.return_value.logger.return_value = mock_gcp_logger_instance
    mock_gcp_logger_instance.log_struct.return_value = None

    from services.governance-engine.app.main import app, ModelMetadata, OverrideDecision, PolicyRule, MockOPAClient

# Use pytest-asyncio for asynchronous tests
@pytest.mark.asyncio
async def test_read_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"service": "TF-ICRE™ Governance Engine", "status": "running"}

@pytest.mark.asyncio
async def test_register_model_success():
    test_model = ModelMetadata(
        model_id="test-model-1",
        model_name="Test Model",
        owner="test-owner",
        deployed_date=datetime.utcnow().isoformat(),
        status="PRODUCTION",
        performance={},
        fairness={},
        explainability={}
    )
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/v1/governance/model/register", json=test_model.model_dump())
    
    assert response.status_code == 200
    assert response.json() == {"status": "registered", "model_id": "test-model-1"}
    
    # Verify Firestore client was called
    mock_firestore_client_instance.collection.assert_called_with("model_registry")
    mock_firestore_client_instance.collection.return_value.document.assert_called_with("test-model-1")
    mock_firestore_client_instance.collection.return_value.document.return_value.set.assert_called_once()
    # Verify logging
    mock_gcp_logger_instance.log_struct.assert_called_once()

@pytest.mark.asyncio
async def test_log_override_decision_success():
    test_override = OverrideDecision(
        loan_id="loan-001",
        original_decision="DECLINE",
        override_decision="APPROVE",
        analyst="test-analyst",
        justification="Business case requires override."
    )
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/v1/governance/override", json=test_override.model_dump())
    
    assert response.status_code == 200
    assert "override_logged" in response.json()["status"]
    assert response.json()["loan_id"] == "loan-001"

    # Verify Firestore and BigQuery clients were called
    mock_firestore_client_instance.collection.assert_called_with("override_logs")
    mock_firestore_client_instance.collection.return_value.add.assert_called_once()
    mock_bq_client_instance.insert_rows_json.assert_called_once()
    mock_gcp_logger_instance.log_struct.assert_called_once()


@pytest.mark.asyncio
async def test_query_audit_trail_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/v1/governance/audit?user_id=test-user")
    
    assert response.status_code == 200
    assert "query_filters" in response.json()
    assert response.json()["query_filters"]["user_id"] == "test-user"
    assert response.json()["results"] == [] # Mock returns empty list


@pytest.mark.asyncio
async def test_modify_rac_rule_success():
    test_policy = PolicyRule(
        policy_id="test-policy",
        rule_name="Test Rule",
        rule_code="some opa code",
    )
    # Patch the MockOPAClient instance used in the app
    with patch('services.governance-engine.app.main.mock_opa_client', new_callable=AsyncMock) as mock_opa:
        mock_opa.update_policy.return_value = {"status": "success", "message": "Policy updated."}
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/v1/governance/policy/update", json=test_policy.model_dump())
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        mock_opa.update_policy.assert_called_once_with("test-policy", "some opa code")
        mock_gcp_logger_instance.log_struct.assert_called_once() # For policy_updated event


@pytest.mark.asyncio
async def test_evaluate_policy_success():
    input_data = {"loan": {"dti": 0.3}}
    # Patch the MockOPAClient instance used in the app
    with patch('services.governance-engine.app.main.mock_opa_client', new_callable=AsyncMock) as mock_opa:
        mock_opa.evaluate_policy.return_value = {"result": {"allow": True, "reason": "DTI within limits"}}
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/v1/governance/policy/evaluate?policy_id=nca_affordability", json=input_data)
        
        assert response.status_code == 200
        assert response.json()["result"]["allow"] == True
        mock_opa.evaluate_policy.assert_called_once_with("nca_affordability", {"input": input_data})
