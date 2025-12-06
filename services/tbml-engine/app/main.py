from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import logging
from datetime import datetime
import json

# Metrics
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi import Request
from fastapi.responses import JSONResponse
import uuid

# Optional rate limiting
ENABLE_RATE_LIMITING = os.getenv("ENABLE_RATE_LIMITING", "false").lower() == "true"
if ENABLE_RATE_LIMITING:
    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
        from slowapi.middleware import SlowAPIMiddleware
        limiter = Limiter(key_func=get_remote_address, default_limits=[os.getenv("RATE_LIMIT", "100/minute")])
    except Exception:
        limiter = None
else:
    limiter = None

# GCP SDKs
from google.cloud import documentai_v1beta3 as documentai
from google.cloud import aiplatform
from google.cloud import logging as gcp_logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize GCP Clients
# Document AI Client
try:
    docai_client = documentai.DocumentProcessorServiceClient()
    logger.info("Document AI client initialized (mock).")
except Exception as e:
    logger.warning(f"Failed to initialize Document AI client: {e}. Mocking instead.")
    docai_client = None

# Vertex AI Client for Endpoints (for GNN model)
try:
    aiplatform.init(project=os.getenv("GCP_PROJECT_ID"), location=os.getenv("GCP_REGION"))
    logger.info("Vertex AI client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Vertex AI client: {e}")
    aiplatform = None

# Cloud Logging for structured logs
try:
    log_client = gcp_logging.Client()
    log_name = "tbml_engine_logs"
    gcp_logger = log_client.logger(log_name)
    logger.info("Cloud Logging client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Cloud Logging client: {e}")
    gcp_logger = None


# Define the data models for the API requests
class TBMLEntity(BaseModel):
    """Data model for a TBML entity."""
    transaction_id: str
    document_url: str = None # GCS URL to the document (e.g., invoice, B/L)
    commodity_code: str = None
    quantity: float = None
    total_amount: float = None
    currency: str = None
    origin_country: str = None
    destination_country: str = None
    # Add other relevant fields for TBML analysis

class TBMLCheckResponse(BaseModel):
    """Data model for a TBML check response."""
    transaction_id: str
    tbml_risk_score: int
    flags: List[str]
    audit_id: str
    recommendation: str

class NetworkGraphResponse(BaseModel):
    """Data model for a network graph response."""
    transaction_id: str
    graph_status: str
    nodes: int
    edges: int
    graph_url: str = None

class TBMLAlert(BaseModel):
    """Data model for a TBML alert."""
    alert_id: str
    transaction_id: str
    risk_score: int
    reason: str
    timestamp: str
    status: str


# Initialize the FastAPI app
app = FastAPI(
    title="TF-ICRE™ TBML Engine",
    description="Service for Trade-Based Money Laundering detection and trade integrity analysis.",
    version="1.0.0",
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in allowed_origins.split(",")] if allowed_origins else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

# Rate limiting middleware (optional)
if limiter:
    app.state.limiter = limiter
    from slowapi import _rate_limit_exceeded_handler  # type: ignore
    from slowapi.errors import RateLimitExceeded  # type: ignore
    from slowapi.middleware import SlowAPIMiddleware  # type: ignore
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

# Request/response middleware for request ID and timing
@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    """Adds a request ID and timing information to each request.
    Args:
        request: The incoming request.
        call_next: The next middleware to call.
    Returns:
        The response from the next middleware.
    """
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = req_id
    try:
        response = await call_next(request)
    except Exception as e:
        logger.exception(f"Unhandled exception for request_id={req_id}")
        return JSONResponse(status_code=500, content={"error": "Internal Server Error", "request_id": req_id})
    response.headers["X-Request-ID"] = req_id
    return response

# Global exception handler (fallback)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled exceptions.
    Args:
        request: The incoming request.
        exc: The exception that occurred.
    Returns:
        A JSON response with a 500 status code.
    """
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception(f"Unhandled error: {exc} request_id={req_id}")
    return JSONResponse(status_code=500, content={"error": "Internal Server Error", "request_id": req_id})

# --- MOCK DATA/FUNCTIONS for demonstration until real models/data are ready ---
async def mock_document_ai_extraction(document_url: str) -> Dict[str, Any]:
    """Mocks the extraction of fields from a document using Document AI.
    Args:
        document_url: The URL of the document to process.
    Returns:
        A dictionary of extracted fields.
    """
    logger.info(f"Mock Document AI extracting fields from {document_url}")
    # Simulate extraction based on document_url (e.g., parsing a specific invoice ID)
    if "invoice" in document_url:
        return {
            "commodity_code": "HS8501",
            "quantity": 100.0,
            "total_amount": 100000.0,
            "currency": "USD",
            "origin_country": "ZA",
            "destination_country": "NG",
            "document_type": "invoice"
        }
    elif "bill_of_lading" in document_url:
        return {
            "vessel_name": "MV African Star",
            "port_of_loading": "Durban",
            "port_of_discharge": "Lagos",
            "shipment_date": "2024-11-01",
            "document_type": "bill_of_lading"
        }
    return {}

async def mock_external_api_lookup(api_name: str, query: Dict[str, Any]) -> Dict[str, Any]:
    """Mocks a lookup to an external API.
    Args:
        api_name: The name of the API to look up.
        query: The query to send to the API.
    Returns:
        A dictionary of the API response.
    """
    logger.info(f"Mock external API lookup for {api_name} with query: {query}")
    if api_name == "UN_COMTRADE":
        return {"market_price_per_unit": 900.0}
    if api_name == "MARINE_TRAFFIC":
        return {"vessel_history": [{"port": "Durban"}, {"port": "Lagos"}]}
    return {}

async def mock_invoke_gnn_model(graph_data: Dict[str, Any]) -> Dict[str, Any]:
    """Mocks the invocation of a Graph Neural Network (GNN) model.
    Args:
        graph_data: The data for the graph.
    Returns:
        A dictionary of the GNN model's output.
    """
    logger.info("Mock invoking GNN model for network anomaly detection.")
    # Simulate GNN output
    return {"network_anomaly_score": 0.7, "circular_pattern_detected": True}

async def calculate_invoice_mispricing_score(invoice_data: Dict[str, Any]) -> float:
    """Calculates the invoice mispricing score.
    Args:
        invoice_data: The data from the invoice.
    Returns:
        The invoice mispricing score.
    """
    # Pseudocode from deep dive
    invoice_price_per_unit = invoice_data["total_amount"] / invoice_data["quantity"]
    market_price_data = await mock_external_api_lookup("UN_COMTRADE", {"commodity": invoice_data["commodity_code"]})
    market_price_per_unit = market_price_data.get("market_price_per_unit", invoice_price_per_unit * 0.9) # Simulate 10% lower
    
    deviation_pct = ((invoice_price_per_unit - market_price_per_unit) / market_price_per_unit) * 100
    
    risk_score = 0
    if abs(deviation_pct) > 50:
        risk_score = 90 # High risk
    elif abs(deviation_pct) > 20:
        risk_score = 60 # Medium risk
    else:
        risk_score = 10 # Low risk
    return risk_score

async def calculate_shipping_verification_score(entity_data: Dict[str, Any]) -> float:
    """Calculates the shipping verification score.
    Args:
        entity_data: The data for the entity.
    Returns:
        The shipping verification score.
    """
    # Pseudocode from deep dive
    marine_traffic_data = await mock_external_api_lookup("MARINE_TRAFFIC", {"vessel_name": "MV African Star"})
    visited_loading = any(p['port'] == entity_data.get("port_of_loading") for p in marine_traffic_data.get("vessel_history", []))
    visited_discharge = any(p['port'] == entity_data.get("port_of_discharge") for p in marine_traffic_data.get("vessel_history", []))

    if visited_loading and visited_discharge:
        return 10 # Low risk
    return 80 # High risk (phantom shipping)


async def log_tbml_decision_to_cloud_logging(decision_data: Dict[str, Any]):
    """Logs a TBML decision to Cloud Logging.
    Args:
        decision_data: The data for the TBML decision.
    """
    if not gcp_logger:
        logger.error("Cloud Logging client not initialized. Cannot log TBML decision.")
        return

    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": "tbml_check",
        **decision_data
    }
    gcp_logger.log_struct(log_entry, severity="INFO")
    logger.info(f"TBML decision for {decision_data.get('transaction_id')} logged to Cloud Logging.")

# --- FastAPI Endpoints ---

@app.get("/")
def read_root():
    """Root endpoint for the service.
    Returns:
        A dictionary with the service name and status.
    """
    return {"service": "TF-ICRE™ TBML Engine", "status": "running"}

@app.get("/health")
def health():
    """Health check endpoint.
    Returns:
        A dictionary with the service's health status.
    """
    return {"status": "ok"}

@app.get("/ready")
def readiness():
    """Readiness check endpoint.
    Returns:
        A dictionary with the service's readiness status.
    Raises:
        HTTPException: If the service is not ready.
    """
    ready = all([aiplatform is not None, gcp_logger is not None])
    if not ready:
        raise HTTPException(status_code=503, detail="Dependencies not ready")
    return {"status": "ready"}

@app.post("/v1/tbml/check", response_model=TBMLCheckResponse)
async def analyze_transaction(request: TBMLEntity):
    """Analyzes a single trade transaction for TBML risk.
    Args:
        request: The request to analyze.
    Returns:
        A TBMLCheckResponse with the analysis results.
    Raises:
        HTTPException: If the backend services are not initialized.
    """
    if not aiplatform or not gcp_logger: # Document AI is optional for mock
        raise HTTPException(status_code=500, detail="Backend services not initialized.")
    
    # 1. Document AI Extraction (mock)
    extracted_doc_data = await mock_document_ai_extraction(request.document_url)
    transaction_data = {**request.model_dump(), **extracted_doc_data}

    # 2. Invoice Mispricing Detection
    invoice_mispricing_score = await calculate_invoice_mispricing_score(transaction_data)
    
    # 3. Shipping Verification
    shipping_verification_score = await calculate_shipping_verification_score(transaction_data)

    # 4. Network Analysis (GNN mock) - Placeholder for building graph data
    gnn_input_data = {"nodes": [request.transaction_id], "edges": []} 
    gnn_output = await mock_invoke_gnn_model(gnn_input_data)
    network_anomaly_score = gnn_output["network_anomaly_score"] * 100 # Convert to 0-100 scale

    # TBML Risk Score Algorithm (from deep dive)
    tbml_risk_score = (
        0.4 * invoice_mispricing_score +
        0.3 * network_anomaly_score +
        0.2 * shipping_verification_score +
        0.1 * 50 # Customer_Historical_Risk_Score (mock average)
    )
    tbml_risk_score = round(tbml_risk_score)

    flags = []
    if invoice_mispricing_score > 50: flags.append("OVER_UNDER_INVOICING")
    if shipping_verification_score > 50: flags.append("PHANTOM_SHIPPING_SUSPECTED")
    if network_anomaly_score > 60: flags.append("NETWORK_ANOMALY")

    recommendation = "FLAG FOR REVIEW" if tbml_risk_score > 70 else "NO ACTION REQUIRED"

    audit_id = f"TBML-AUDIT-{uuid.uuid4()}"

    response_data = TBMLCheckResponse(
        transaction_id=request.transaction_id,
        tbml_risk_score=tbml_risk_score,
        flags=flags,
        audit_id=audit_id,
        recommendation=recommendation
    )

    await log_tbml_decision_to_cloud_logging({
        **response_data.model_dump(),
        "extracted_doc_data": extracted_doc_data,
        "invoice_mispricing_score": invoice_mispricing_score,
        "shipping_verification_score": shipping_verification_score,
        "network_anomaly_score": network_anomaly_score,
    })

    return response_data

@app.post("/v1/tbml/network", response_model=NetworkGraphResponse)
async def generate_network_graph(request: TBMLEntity):
    """Generates a counterparty risk network graph.
    Args:
        request: The request to generate the graph for.
    Returns:
        A NetworkGraphResponse with the graph generation status.
    """
    # This is a placeholder for building the graph and running GNNs
    # In a real scenario, this would involve:
    # 1. Fetching related transactions from BigQuery
    # 2. Constructing a graph (e.g., NetworkX in Python)
    # 3. Invoking a GNN model on Vertex AI Endpoints
    # 4. Storing the graph visualization or metadata
    audit_id = f"GRAPH-AUDIT-{uuid.uuid4()}"
    await log_tbml_decision_to_cloud_logging({
        "event_type": "network_graph_generation",
        "transaction_id": request.transaction_id,
        "graph_status": "mock_generated",
        "audit_id": audit_id
    })
    return NetworkGraphResponse(
        transaction_id=request.transaction_id,
        graph_status="generated",
        nodes=10,
        edges=15,
        graph_url=f"https://mock-graph-viewer.com/{request.transaction_id}"
    )

@app.get("/v1/tbml/alerts", response_model=List[TBMLAlert])
async def get_tbml_alerts():
    """Retrieves high-risk TBML alerts for review.
    In a real system, this would query BigQuery or Firestore for active alerts.
    Returns:
        A list of TBMLAlert objects.
    """
    alerts = [
        TBMLAlert(
            alert_id="ALERT_001", 
            transaction_id="TXN_98765", 
            risk_score=95, 
            reason="Invoice Mispricing (Deviation >50%)", 
            timestamp=datetime.utcnow().isoformat() + "Z",
            status="OPEN"
        ),
        TBMLAlert(
            alert_id="ALERT_002", 
            transaction_id="TXN_98766", 
            risk_score=88, 
            reason="Phantom Shipping suspected", 
            timestamp=datetime.utcnow().isoformat() + "Z",
            status="OPEN"
        )
    ]
    return alerts
