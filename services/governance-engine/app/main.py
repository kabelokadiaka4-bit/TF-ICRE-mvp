from fastapi import FastAPI, HTTPException, Body
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
from google.cloud import firestore
from google.cloud import bigquery
from google.cloud import logging as gcp_logging
# from opa_python_client.opa import OPAClient # Mocking OPA for now

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize GCP Clients
# Firestore Client for Model Registry and immutable records
try:
    db = firestore.Client()
    logger.info("Firestore client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Firestore client: {e}")
    db = None

# BigQuery Client for audit logs and analytics
try:
    bq_client = bigquery.Client()
    logger.info("BigQuery client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize BigQuery client: {e}")
    bq_client = None

# Cloud Logging for structured logs
try:
    log_client = gcp_logging.Client()
    log_name = "governance_engine_logs"
    gcp_logger = log_client.logger(log_name)
    logger.info("Cloud Logging client initialized.")
except Exception as e:
    logger.error(f"Failed to initialize Cloud Logging client: {e}")
    gcp_logger = None

# Define data models
class ModelMetadata(BaseModel):
    model_id: str
    model_name: str
    owner: str
    deployed_date: str
    status: str
    performance: Dict[str, Any]
    fairness: Dict[str, Any]
    explainability: Dict[str, Any]
    # Add other fields as per deep dive (e.g., training_data, monitoring, regulatory_compliance)

class OverrideDecision(BaseModel):
    loan_id: str
    original_decision: str
    override_decision: str
    analyst: str
    justification: str
    approver: str = None
    loan_amount_usd: float = None

class PolicyRule(BaseModel):
    policy_id: str
    rule_name: str
    rule_code: str # e.g., Rego policy code snippet
    status: str = "active"
    version: str = "1.0"

# Initialize FastAPI app
app = FastAPI(
    title="TF-ICRE™ Governance Engine",
    description="Service for Model Registry, Audit, and Regulations-as-Code.",
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

# --- MOCK OPA Client ---
class MockOPAClient:
    def __init__(self):
        self.policies = {
            "nca_affordability": "data.loan.dti < 0.45",
            "popia_data_sovereignty": "data.resource.location == 'africa-south1'",
        }

    async def evaluate_policy(self, policy_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Mock OPA evaluating policy: {policy_id} with input: {input_data}")
        # Simple mock evaluation
        if policy_id == "nca_affordability":
            dti = input_data.get("loan", {}).get("dti", 0.0)
            if dti < 0.45:
                return {"result": {"allow": True, "reason": "DTI within limits"}}
            else:
                return {"result": {"allow": False, "reason": "DTI exceeds limit"}}
        elif policy_id == "popia_data_sovereignty":
            location = input_data.get("resource", {}).get("location")
            if location == "africa-south1":
                return {"result": {"allow": True, "reason": "Data stored in SA"}}
            else:
                return {"result": {"allow": False, "reason": "Data not in SA"}}
        return {"result": {"allow": True, "reason": "Policy not found, default allow"}}

    async def update_policy(self, policy_id: str, new_rule_code: str):
        logger.info(f"Mock OPA updating policy: {policy_id} with new rule code.")
        self.policies[policy_id] = new_rule_code
        return {"status": "success", "message": f"Policy {policy_id} updated."}

mock_opa_client = MockOPAClient()


async def log_governance_event_to_cloud_logging(event_type: str, event_data: Dict[str, Any]):
    if not gcp_logger:
        logger.error("Cloud Logging client not initialized. Cannot log governance event.")
        return
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": event_type,
        **event_data
    }
    gcp_logger.log_struct(log_entry, severity="INFO")
    logger.info(f"Governance event '{event_type}' logged to Cloud Logging.")

async def log_to_bigquery_table(table_id: str, data: Dict[str, Any]):
    if not bq_client:
        logger.error("BigQuery client not initialized. Cannot log to BigQuery.")
        return
    try:
        table = bq_client.get_table(table_id) # API request
        errors = bq_client.insert_rows_json(table, [data])
        if errors:
            logger.error(f"BigQuery insert errors for {table_id}: {errors}")
        else:
            logger.info(f"Successfully inserted row into BigQuery table: {table_id}")
    except Exception as e:
        logger.error(f"Failed to insert into BigQuery table {table_id}: {e}")


# Request/response middleware for request ID and timing
@app.middleware("http")
async def add_request_id_and_timing(request: Request, call_next):
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
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.exception(f"Unhandled error: {exc} request_id={req_id}")
    return JSONResponse(status_code=500, content={"error": "Internal Server Error", "request_id": req_id})

# --- FastAPI Endpoints ---

@app.get("/")
def read_root():
    return {"service": "TF-ICRE™ Governance Engine", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def readiness():
    ready = all([db is not None, bq_client is not None, gcp_logger is not None])
    if not ready:
        raise HTTPException(status_code=503, detail="Dependencies not ready")
    return {"status": "ready"}

@app.post("/v1/governance/register_model")
async def register_model(model_data: ModelMetadata):
    """
    Endpoint to register a new ML model in the Pan-African Model Registry (PAMR) in Firestore.
    """
    if not db:
        raise HTTPException(status_code=500, detail="Firestore client not initialized.")
    try:
        doc_ref = db.collection("model_registry").document(model_data.model_id)
        doc_ref.set(model_data.model_dump())
        await log_governance_event_to_cloud_logging("model_registered", model_data.model_dump())
        return {"status": "registered", "model_id": model_data.model_id}
    except Exception as e:
        logger.error(f"Error registering model: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to register model: {e}")

@app.post("/v1/governance/override")
async def log_override_decision(override_data: OverrideDecision):
    """
    Endpoint to log a manual override of an AI decision to Firestore (immutable) and BigQuery (analytics).
    """
    if not db or not bq_client:
        raise HTTPException(status_code=500, detail="Firestore or BigQuery client not initialized.")
    
    override_record = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        **override_data.model_dump()
    }
    try:
        # Log to Firestore (immutable)
        db.collection("override_logs").add(override_record)
        
        # Log to BigQuery for analytics
        bq_table_id = os.getenv("BQ_AUDIT_LOG_OVERRIDES_TABLE", "audit_logs.model_overrides")
        await log_to_bigquery_table(bq_table_id, override_record)

        await log_governance_event_to_cloud_logging("override_logged", override_record)
        return {"status": "override_logged", "loan_id": override_data.loan_id, "timestamp": override_record["timestamp"]}
    except Exception as e:
        logger.error(f"Error logging override decision: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to log override decision: {e}")

@app.get("/v1/governance/audit")
async def query_audit_trail(user_id: str = None, start_date: str = None, end_date: str = None):
    """
    Endpoint to query the immutable audit trail from BigQuery.
    """
    if not bq_client:
        raise HTTPException(status_code=500, detail="BigQuery client not initialized.")
    
    query = f"SELECT * FROM `{os.getenv('BQ_AUDIT_LOG_TABLE', 'audit_logs.scoring_decisions')}` WHERE 1=1"
    if user_id:
        query += f" AND user_id = '{user_id}'"
    if start_date:
        query += f" AND timestamp >= '{start_date}'"
    if end_date:
        query += f" AND timestamp <= '{end_date}'"
    
    try:
        query_job = bq_client.query(query)
        results = [dict(row) for row in query_job.result()]
        return {"query_filters": {"user_id": user_id, "start_date": start_date, "end_date": end_date}, "results": results}
    except Exception as e:
        logger.error(f"Error querying audit trail: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to query audit trail: {e}")

@app.post("/v1/governance/policy/update")
async def modify_rac_rule(policy_update: PolicyRule):
    """
    Endpoint to modify a Regulations-as-Code (RaC) rule.
    In a real scenario, this would involve updating the OPA policy store and reloading.
    """
    try:
        result = await mock_opa_client.update_policy(policy_update.policy_id, policy_update.rule_code)
        await log_governance_event_to_cloud_logging("policy_updated", policy_update.model_dump())
        return result
    except Exception as e:
        logger.error(f"Error updating policy: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update policy: {e}")

@app.post("/v1/governance/policy/evaluate")
async def evaluate_policy(policy_id: str, input_data: Dict[str, Any] = Body(...)):
    """
    Endpoint to evaluate a Regulations-as-Code (RaC) rule against given input data.
    """
    try:
        result = await mock_opa_client.evaluate_policy(policy_id, {"input": input_data})
        return result
    except Exception as e:
        logger.error(f"Error evaluating policy: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to evaluate policy: {e}")