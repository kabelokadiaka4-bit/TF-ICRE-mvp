from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import logging
import json
from datetime import datetime

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
    entity_id: str
    loan_amount: float
    currency: str
    years_in_business: int
    revenue_usd: float
    # Add other relevant fields for scoring based on the deep dive

class ScoreResponse(BaseModel):
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
    requests: List[ScoreRequest]

class ExplanationResponse(BaseModel):
    loan_id: str
    explanation: Dict[str, Any]
    plain_language_summary: str

# Initialize the FastAPI app
app = FastAPI(
    title="TF-ICRE™ Scoring Engine",
    description="Service for Core Credit Risk scoring and explainability.",
    version="1.0.0",
)

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
    logger.info(f"Mock fetching historical data for {entity_id}")
    return {"loan_count": 10, "avg_loan_size": 100000, "default_events": 2}

async def mock_fetch_realtime_features(entity_id: str) -> Dict[str, Any]:
    logger.info(f"Mock fetching real-time features for {entity_id}")
    return MOCK_FEATURES_DB.get(entity_id, {})

async def mock_invoke_model_endpoint(features: Dict[str, Any]) -> Dict[str, Any]:
    logger.info("Mock invoking model endpoint for prediction.")
    # Simulate a model prediction
    score = 750 # Example score
    pd_12m = 0.08
    lgd = 0.35
    ead_usd = 450000
    recommendation = "APPROVED" if score > 700 else "DECLINE"
    return {"score": score, "pd_12m": pd_12m, "lgd": lgd, "ead_usd": ead_usd, "recommendation": recommendation}

async def mock_get_shap_explanation(features: Dict[str, Any]) -> Dict[str, Any]:
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

# --- FastAPI Endpoints ---

@app.get("/")
def read_root():
    return {"service": "TF-ICRE™ Scoring Engine", "status": "running"}

@app.post("/v1/score", response_model=ScoreResponse)
async def generate_score(request: ScoreRequest, http_request: Request):
    """
    Endpoint to generate a credit score for a single entity.
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
    audit_id = f"AUDIT-{datetime.utcnow().timestamp()}"

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
        "source_ip": http_request.client.host if http_request.client else "unknown"
    })

    return response_data

@app.post("/v1/score/batch")
async def generate_batch_score(request: BatchScoreRequest):
    """
    Endpoint for batch scoring of a portfolio.
    This is a placeholder and would ideally call the single /v1/score endpoint repeatedly
    or use a batch prediction service.
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
    """
    Endpoint to retrieve SHAP explanations for a historical decision.
    In a real system, this would query BigQuery or a dedicated explanation store.
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