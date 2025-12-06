from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import logging
import json
from datetime import datetime
import uuid

# Metrics
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.responses import JSONResponse

# Optional rate limiting (in-memory by default)
ENABLE_RATE_LIMITING = os.getenv("ENABLE_RATE_LIMITING", "false").lower() == "true"
if ENABLE_RATE_LIMITING:
    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler
        from slowapi.util import get_remote_address
        from slowapi.errors import RateLimitExceeded
        from slowapi.middleware import SlowAPIMiddleware
        limiter = Limiter(key_func=get_remote_address, default_limits=[os.getenv("RATE_LIMIT", "100/minute")])
    except Exception:  # Library not installed or misconfigured
        limiter = None
else:
    limiter = None

# GCP SDKs
from google.cloud import bigquery
from google.cloud import aiplatform
from google.cloud import logging as gcp_logging
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize GCP Clients
# BQ Client for fetching historical data and logging decisions
try:
    bq_client = bigquery.Client()
    logger.info("BigQuery client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize BigQuery client: {e}")
    bq_client = None # Handle gracefully if client fails to initialize

# Vertex AI Client for Feature Store and Endpoints
try:
    aiplatform.init(project=os.getenv("GCP_PROJECT_ID"), location=os.getenv("GCP_REGION"))
    logger.info("Vertex AI client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Vertex AI client: {e}")
    aiplatform = None

# Gemini API for explanations
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    gemini_model = genai.GenerativeModel('gemini-pro')
    logger.info("Gemini API configured.")
except Exception as e:
    logger.error(f"Failed to configure Gemini API: {e}")
    gemini_model = None

# Cloud Logging for structured logs to BigQuery
try:
    log_client = gcp_logging.Client()
    log_name = "scoring_engine_logs"
    gcp_logger = log_client.logger(log_name)
    logger.info("Cloud Logging client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Cloud Logging client: {e}")
    gcp_logger = None

# Define the data models for the API requests and responses
class ScoreRequest(BaseModel):
    """Request model for a single scoring request."""
    entity_id: str
    loan_amount: float
    currency: str
    years_in_business: int
    revenue_usd: float
    # Add other relevant fields for scoring based on the deep dive

class ScoreResponse(BaseModel):
    """Response model for a single scoring request."""
    entity_id: str
    composite_rating: str
    score: int
    pd_12m: float
    lgd: float
    ead_usd: float
    recommendation: str
    plain_language_explanation: str
    top_positive_factors: List[Dict[str, Any]]
    top_negative_factors: List[Dict[str, Any]]
    audit_id: str

class BatchScoreRequest(BaseModel):
    """Request model for a batch scoring request."""
    requests: List[ScoreRequest]

class ExplanationResponse(BaseModel):
    """Response model for an explanation request."""
    loan_id: str
    explanation: Dict[str, Any]
    plain_language_summary: str

# Initialize the FastAPI app
app = FastAPI(
    title="TF-ICRE™ Scoring Engine",
    description="Service for Core Credit Risk scoring and explainability.",
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
    from slowapi import _rate_limit_exceeded_handler  # re-import for mypy friendliness
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

# --- MOCK DATA/FUNCTIONS for demonstration until real models/data are ready ---
MOCK_FEATURES_DB = {
    "entity-123": {
        "historical_npl_rate": 0.15,
        "sector_risk_score": 75,
        "mobile_money_consistency": 0.8,
        "payment_history_score": 0.9,
    }
}

async def mock_fetch_historical_data(entity_id: str) -> Dict[str, Any]:
    """Fetches mock historical data for a given entity.
    Args:
        entity_id: The ID of the entity.
    Returns:
        A dictionary of mock historical data.
    """
    logger.info(f"Mock fetching historical data for {entity_id}")
    return {"loan_count": 10, "avg_loan_size": 100000, "default_events": 2}

async def mock_fetch_realtime_features(entity_id: str) -> Dict[str, Any]:
    """Fetches mock real-time features for a given entity.
    Args:
        entity_id: The ID of the entity.
    Returns:
        A dictionary of mock real-time features.
    """
    logger.info(f"Mock fetching real-time features for {entity_id}")
    return MOCK_FEATURES_DB.get(entity_id, {})

async def mock_invoke_model_endpoint(features: Dict[str, Any]) -> Dict[str, Any]:
    """Invokes a mock model endpoint to get a prediction.
    Args:
        features: A dictionary of features.
    Returns:
        A dictionary containing the mock model's prediction.
    """
    logger.info("Mock invoking model endpoint for prediction.")
    # Simulate a model prediction
    score = 750 # Example score
    pd_12m = 0.08
    lgd = 0.35
    ead_usd = 450000
    recommendation = "APPROVED" if score > 700 else "DECLINE"
    return {"score": score, "pd_12m": pd_12m, "lgd": lgd, "ead_usd": ead_usd, "recommendation": recommendation}

async def mock_get_shap_explanation(features: Dict[str, Any]) -> Dict[str, Any]:
    """Gets a mock SHAP explanation.
    Args:
        features: A dictionary of features.
    Returns:
        A dictionary containing the mock SHAP explanation.
    """
    logger.info("Mock getting SHAP explanations.")
    return {
        "top_positive_factors": [
            {"factor": "Revenue Growth", "value": "+18% YoY", "impact": "+45 points"},
            {"factor": "Mobile Money Consistency", "value": "0.8", "impact": "+12 points"},
        ],
        "top_negative_factors": [
            {"factor": "Debt-to-Equity Ratio", "value": "2.8:1", "impact": "-20 points"},
            {"factor": "Credit Bureau Score", "value": "620", "impact": "-31 points"},
        ]
    }

async def generate_plain_language_summary_with_gemini(explanation: Dict[str, Any], recommendation: str) -> str:
    """Generates a plain-language summary of a credit decision using the Gemini API.
    Args:
        explanation: A dictionary containing the explanation of the decision.
        recommendation: The recommendation made by the model.
    Returns:
        A plain-language summary of the credit decision.
    """
    if not gemini_model:
        logger.warning("Gemini model not initialized. Returning fallback explanation.")
        return "A detailed explanation of the credit decision is unavailable due to an issue with the AI explanation service."

    try:
        positive_factors = ", ".join([f"{f['factor']} ({f['impact']})" for f in explanation.get("top_positive_factors", [])])
        negative_factors = ", ".join([f"{f['factor']} ({f['impact']})" for f in explanation.get("top_negative_factors", [])])

        prompt = f"""
        Given a credit application recommendation of '{recommendation}', explain the decision in a concise, plain-language summary for a DFI loan officer.
        Focus on the key contributing factors.
        Positive factors: {positive_factors}.
        Negative factors: {negative_factors}.
        Be professional and clear.
        """
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating Gemini explanation: {e}")
        return "Could not generate a plain-language summary at this time."

async def log_decision_to_bigquery(decision_data: Dict[str, Any]):
    """Logs a credit decision to BigQuery.
    Args:
        decision_data: A dictionary containing the decision data to log.
    """
    if not bq_client or not gcp_logger:
        logger.error("BigQuery or Cloud Logging client not initialized. Cannot log decision.")
        return

    table_id = os.getenv("BQ_AUDIT_LOG_TABLE", "audit_logs.scoring_decisions")
    try:
        # Structured logging to Cloud Logging, which can sink to BigQuery
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event_type": "credit_decision",
            "entity_id": decision_data.get("entity_id"),
            "loan_amount": decision_data.get("loan_amount"),
            "score": decision_data.get("score"),
            "recommendation": decision_data.get("recommendation"),
            "audit_id": decision_data.get("audit_id"),
            "explanation_summary": decision_data.get("plain_language_explanation"),
            "raw_explanation": json.dumps(decision_data.get("raw_explanation")),
            # Add other relevant fields for audit trail
        }
        gcp_logger.log_struct(log_entry, severity="INFO")
        logger.info(f"Decision for {decision_data.get('entity_id')} logged to Cloud Logging.")
    except Exception as e:
        logger.error(f"Failed to log decision to BigQuery/Cloud Logging: {e}")

# Request/response middleware for request ID and timing
@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
    """Middleware to add a request ID and timing information to each request.
    Args:
        request: The incoming request.
        call_next: The next middleware or endpoint to call.
    Returns:
        The response from the next middleware or endpoint.
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
    """A global exception handler to catch unhandled exceptions.
    Args:
        request: The incoming request.
        exc: The exception that was raised.
    Returns:
        A JSON response with a 500 status code.
    """
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception(f"Unhandled error: {exc} request_id={req_id}")
    return JSONResponse(status_code=500, content={"error": "Internal Server Error", "request_id": req_id})

# --- FastAPI Endpoints ---

@app.get("/")
def read_root():
    """Root endpoint for the service.
    Returns:
        A dictionary with the service name and status.
    """
    return {"service": "TF-ICRE™ Scoring Engine", "status": "running"}

@app.get("/health")
def health():
    """Health check endpoint.
    Returns:
        A dictionary with the service status.
    """
    return {"status": "ok"}

@app.get("/ready")
def readiness():
    """Readiness check endpoint.
    Returns:
        A dictionary with the service status.

    Raises:
        HTTPException: If the service is not ready.
    """
    ready = all([bq_client is not None, aiplatform is not None, gemini_model is not None, gcp_logger is not None])
    if not ready:
        raise HTTPException(status_code=503, detail="Dependencies not ready")
    return {"status": "ready"}

@app.post("/v1/score", response_model=ScoreResponse)
async def generate_score(request: ScoreRequest, http_request: Request):
    """Generates a credit score for a single entity.
    Args:
        request: The scoring request.
        http_request: The incoming HTTP request.
    Returns:
        A ScoreResponse object with the scoring results.
    Raises:
        HTTPException: If the backend services are not initialized.
    """
    if not bq_client or not aiplatform or not gemini_model or not gcp_logger:
        raise HTTPException(status_code=500, detail="Backend services not initialized.")

    # 1. Fetch historical data (BigQuery mock)
    historical_data = await mock_fetch_historical_data(request.entity_id)

    # 2. Fetch real-time features (Vertex AI Feature Store mock)
    realtime_features = await mock_fetch_realtime_features(request.entity_id)

    # Combine all features (request, historical, real-time)
    features = {**request.model_dump(), **historical_data, **realtime_features}
    
    # 3. Invoke the deployed model on Vertex AI Endpoints (mock)
    prediction = await mock_invoke_model_endpoint(features)

    # 4. Generate SHAP explanations (mock)
    raw_explanation = await mock_get_shap_explanation(features)

    # 5. Integrate with Gemini API for plain-language summaries
    plain_language_summary = await generate_plain_language_summary_with_gemini(
        raw_explanation, prediction["recommendation"]
    )

    # Generate a unique audit ID
    audit_id = f"AUDIT-{uuid.uuid4()}"

    response_data = ScoreResponse(
        entity_id=request.entity_id,
        composite_rating="B+", # Derived from score, mock for now
        score=prediction["score"],
        pd_12m=prediction["pd_12m"],
        lgd=prediction["lgd"],
        ead_usd=prediction["ead_usd"],
        recommendation=prediction["recommendation"],
        plain_language_explanation=plain_language_summary,
        top_positive_factors=raw_explanation["top_positive_factors"],
        top_negative_factors=raw_explanation["top_negative_factors"],
        audit_id=audit_id
    )

    # 6. Log the decision to BigQuery via Cloud Logging
    await log_decision_to_bigquery({
        **response_data.model_dump(),
        "loan_amount": request.loan_amount,
        "currency": request.currency,
        "raw_explanation": raw_explanation,
        "source_ip": http_request.client.host if http_request.client else "unknown",
        "request_id": getattr(http_request.state, "request_id", None)
    })

    return response_data

@app.post("/v1/score/batch")
async def generate_batch_score(request: BatchScoreRequest):
    """Generates credit scores for a batch of entities.
    Args:
        request: The batch scoring request.
    Returns:
        A dictionary with a list of ScoreResponse objects.
    """
    results = []
    for req in request.requests:
        # In a real scenario, this would call the /v1/score logic or a batch prediction service
        mock_score_result = await mock_invoke_model_endpoint({})
        mock_explanation = await mock_get_shap_explanation({})
        mock_summary = await generate_plain_language_summary_with_gemini(mock_explanation, mock_score_result["recommendation"])
        
        results.append(ScoreResponse(
            entity_id=req.entity_id,
            composite_rating="B+",
            score=mock_score_result["score"],
            pd_12m=mock_score_result["pd_12m"],
            lgd=mock_score_result["lgd"],
            ead_usd=mock_score_result["ead_usd"],
            recommendation=mock_score_result["recommendation"],
            plain_language_explanation=mock_summary,
            top_positive_factors=mock_explanation["top_positive_factors"],
            top_negative_factors=mock_explanation["top_negative_factors"],
            audit_id=f"BATCH-AUDIT-{datetime.utcnow().timestamp()}"
        ))
    return {"results": results}

@app.get("/v1/explain/{loan_id}", response_model=ExplanationResponse)
async def get_explanation(loan_id: str):
    """Retrieves SHAP explanations for a historical decision.
    Args:
        loan_id: The ID of the loan to explain.
    Returns:
        An ExplanationResponse object with the explanation.
    Raises:
        HTTPException: If the Gemini model is not initialized.
    """
    if not gemini_model:
        raise HTTPException(status_code=500, detail="Gemini model not initialized.")

    # Mock retrieval of raw explanation data
    mock_raw_explanation = await mock_get_shap_explanation({})
    mock_recommendation = "APPROVED" # Assume for mock

    plain_language_summary = await generate_plain_language_summary_with_gemini(
        mock_raw_explanation, mock_recommendation
    )

    return ExplanationResponse(
        loan_id=loan_id,
        explanation=mock_raw_explanation,
        plain_language_summary=plain_language_summary
    )
