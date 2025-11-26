# services/tbml-engine/tests/test_main.py
import pytest
from httpx import AsyncClient
from unittest.mock import patch, AsyncMock
import os

# Set environment variables for testing
os.environ["GCP_PROJECT_ID"] = "test-project"
os.environ["GCP_REGION"] = "test-region"

# Mock GCP client initializations globally
with patch('google.cloud.documentai_v1beta3.DocumentProcessorServiceClient') as MockDocAIClient, \
     patch('google.cloud.aiplatform.init') as MockAIPlatformInit, \
     patch('google.cloud.logging.Client') as MockCloudLoggingClient:

    # Mock Document AI client (instance only)
    MockDocAIClient.return_value = AsyncMock(spec=MockDocAIClient)

    # Mock Vertex AI init
    MockAIPlatformInit.return_value = None

    # Mock Cloud Logging client
    mock_gcp_logger_instance = AsyncMock()
    MockCloudLoggingClient.return_value.logger.return_value = mock_gcp_logger_instance
    mock_gcp_logger_instance.log_struct.return_value = None

    from services.tbml-engine.app.main import app, TBMLEntity, TBMLCheckResponse, NetworkGraphResponse, TBMLAlert

# Use pytest-asyncio for asynchronous tests
@pytest.mark.asyncio
async def test_read_root():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json() == {"service": "TF-ICRE™ TBML Engine", "status": "running"}

@pytest.mark.asyncio
async def test_analyze_transaction_success():
    with patch('services.tbml-engine.app.main.mock_document_ai_extraction', new_callable=AsyncMock) as mock_docai_extract, \
         patch('services.tbml-engine.app.main.mock_external_api_lookup', new_callable=AsyncMock) as mock_external_api, \
         patch('services.tbml-engine.app.main.mock_invoke_gnn_model', new_callable=AsyncMock) as mock_gnn_model, \
         patch('services.tbml-engine.app.main.log_tbml_decision_to_cloud_logging', new_callable=AsyncMock) as mock_log_decision:
        
        # Configure mock return values
        mock_docai_extract.return_value = {
            "commodity_code": "HS8501", "quantity": 100.0, "total_amount": 100000.0,
            "currency": "USD", "origin_country": "ZA", "destination_country": "NG",
        }
        mock_external_api.side_effect = [
            {"market_price_per_unit": 950.0}, # For UN_COMTRADE
            {"vessel_history": [{"port": "Durban"}, {"port": "Lagos"}]} # For MARINE_TRAFFIC
        ]
        mock_gnn_model.return_value = {"network_anomaly_score": 0.5}
        mock_log_decision.return_value = None

        test_request = TBMLEntity(
            transaction_id="TXN-12345",
            document_url="gs://test-bucket/invoice-123.pdf",
            commodity_code="HS8501", # Provided directly for simplicity, or would come from docAI
            quantity=100.0,
            total_amount=100000.0,
            currency="USD",
            origin_country="ZA",
            destination_country="NG",
        )

        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/v1/tbml/check", json=test_request.model_dump())
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["transaction_id"] == "TXN-12345"
        assert "tbml_risk_score" in response_data
        assert "flags" in response_data
        assert "audit_id" in response_data
        assert "recommendation" in response_data

        mock_docai_extract.assert_called_once_with(test_request.document_url)
        assert mock_external_api.call_count == 2
        mock_gnn_model.assert_called_once()
        mock_log_decision.assert_called_once()

@pytest.mark.asyncio
async def test_generate_network_graph_success():
    with patch('services.tbml-engine.app.main.log_tbml_decision_to_cloud_logging', new_callable=AsyncMock) as mock_log_decision:
        mock_log_decision.return_value = None
        test_request = TBMLEntity(transaction_id="TXN-GRAPH-001")
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.post("/v1/tbml/network", json=test_request.model_dump())
        
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["transaction_id"] == "TXN-GRAPH-001"
        assert response_data["graph_status"] == "generated"
        assert "nodes" in response_data
        assert "edges" in response_data
        mock_log_decision.assert_called_once()


@pytest.mark.asyncio
async def test_get_tbml_alerts_success():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/v1/tbml/alerts")
    
    assert response.status_code == 200
    response_data = response.json()
    assert isinstance(response_data, list)
    assert len(response_data) == 2
    assert "alert_id" in response_data[0]
