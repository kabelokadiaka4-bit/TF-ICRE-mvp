# services/scoring-engine/tests/test_main.py
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import os

# Set environment variables for testing (mocks actual GCP project/region)
os.environ["GCP_PROJECT_ID"] = "test-project"
os.environ["GCP_REGION"] = "test-region"
os.environ["GEMINI_API_KEY"] = "test-gemini-key"

# We need to import the app *after* setting env vars and mocking clients
# to ensure clients are initialized with mock values.
# However, if clients are initialized globally at import time, they might
# still pick up actual values or fail.
# A common pattern is to make client initialization lazy or pass mocks during test setup.
# For simplicity, we'll patch the clients directly before importing the app.

# Mock GCP client initializations globally to prevent actual calls during import
with patch('google.cloud.bigquery.Client') as MockBigQueryClient, \
     patch('google.cloud.aiplatform.init') as MockAIPlatformInit, \
     patch('google.cloud.logging.Client') as MockCloudLoggingClient, \
     patch('google.generativeai.configure') as MockGenAIConfigure, \
     patch('google.generativeai.GenerativeModel') as MockGenerativeModel:

    # Mock BigQuery client
    mock_bq_client_instance = AsyncMock(spec=MockBigQueryClient)
    MockBigQueryClient.return_value = mock_bq_client_instance
    mock_bq_client_instance.get_table.return_value = AsyncMock()
    mock_bq_client_instance.insert_rows_json.return_value = []

    # Mock Vertex AI init (just needs to not fail)
    MockAIPlatformInit.return_value = None

    # Mock Cloud Logging client
    mock_gcp_logger_instance = AsyncMock()
    MockCloudLoggingClient.return_value.logger.return_value = mock_gcp_logger_instance
    mock_gcp_logger_instance.log_struct.return_value = None

    # Mock Gemini API
    MockGenAIConfigure.return_value = None
    mock_gemini_model_instance = AsyncMock(spec=MockGenerativeModel)
    MockGenerativeModel.return_value = mock_gemini_model_instance
    mock_gemini_model_instance.generate_content.return_value.text = "Mock Gemini Explanation"

    from services.scoring-engine.app.main import app, ScoreRequest, ScoreResponse

# Use pytest-asyncio for asynchronous tests
@pytest.mark.asyncio
async def test_read_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"service": "TF-ICRE™ Scoring Engine", "status": "running"}

@pytest.mark.asyncio
async def test_generate_score_success():
    # Patch the mock internal functions
    with patch('services.scoring-engine.app.main.mock_fetch_historical_data', new_callable=AsyncMock) as mock_hist_data, \
         patch('services.scoring-engine.app.main.mock_fetch_realtime_features', new_callable=AsyncMock) as mock_realtime_features, \
         patch('services.scoring-engine.app.main.mock_invoke_model_endpoint', new_callable=AsyncMock) as mock_model_invoke, \
         patch('services.scoring-engine.app.main.mock_get_shap_explanation', new_callable=AsyncMock) as mock_shap_explain, \
         patch('services.scoring-engine.app.main.generate_plain_language_summary_with_gemini', new_callable=AsyncMock) as mock_gemini_summary, \
         patch('services.scoring-engine.app.main.log_decision_to_bigquery', new_callable=AsyncMock) as mock_log_decision:
        
        # Configure mock return values
        mock_hist_data.return_value = {"historical_data_mock": True}
        mock_realtime_features.return_value = {"realtime_features_mock": True}
        mock_model_invoke.return_value = {
            "score": 750, "pd_12m": 0.08, "lgd": 0.35, "ead_usd": 450000, "recommendation": "APPROVED"
        }
        mock_shap_explain.return_value = {
            "top_positive_factors": [{"factor": "Mock Positive", "impact": "10"}],
            "top_negative_factors": [{"factor": "Mock Negative", "impact": "-5"}]
        }
        mock_gemini_summary.return_value = "Mock Gemini Explanation"
        mock_log_decision.return_value = None # logging function doesn't return anything

        test_request = ScoreRequest(
            entity_id="test-entity-1",
            loan_amount=100000.0,
            currency="USD",
            years_in_business=5,
            revenue_usd=500000.0
        )

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/v1/score", json=test_request.model_dump())
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["entity_id"] == "test-entity-1"
        assert response_data["score"] == 750
        assert response_data["recommendation"] == "APPROVED"
        assert response_data["plain_language_explanation"] == "Mock Gemini Explanation"
        assert "AUDIT-" in response_data["audit_id"]

        # Verify mocks were called
        mock_hist_data.assert_called_once_with("test-entity-1")
        mock_realtime_features.assert_called_once_with("test-entity-1")
        mock_model_invoke.assert_called_once()
        mock_shap_explain.assert_called_once()
        mock_gemini_summary.assert_called_once()
        mock_log_decision.assert_called_once()

@pytest.mark.asyncio
async def test_get_explanation_success():
    with patch('services.scoring-engine.app.main.mock_get_shap_explanation', new_callable=AsyncMock) as mock_shap_explain, \
         patch('services.scoring-engine.app.main.generate_plain_language_summary_with_gemini', new_callable=AsyncMock) as mock_gemini_summary:
        
        mock_shap_explain.return_value = {
            "top_positive_factors": [{"factor": "Mock Pos", "impact": "1"}],
            "top_negative_factors": [{"factor": "Mock Neg", "impact": "-1"}]
        }
        mock_gemini_summary.return_value = "Mock Explanation for loan-123"

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/v1/explain/loan-123")
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["loan_id"] == "loan-123"
        assert response_data["plain_language_summary"] == "Mock Explanation for loan-123"
        assert "top_positive_factors" in response_data["explanation"]

        mock_shap_explain.assert_called_once()
        mock_gemini_summary.assert_called_once()
