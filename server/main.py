from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from chatbot import report_chat_with_sarvam 
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
import pandas as pd
import torch
# import faiss
from sentence_transformers import SentenceTransformer, util
import math
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import time
import logging
import numpy as np
from event_detection import analyze_transactions_api
from tax_snapshot import extract_tax_snapshot 
import os
# Define request models
class DetailRequest(BaseModel):
    detail: str

class ChatRequest(BaseModel):
    message: str
    chat_history: list = []

class ChatResponse(BaseModel):
    response: str
app = FastAPI()
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Define request model
class DetailRequest(BaseModel):
    detail: str

# @app.post("/get_similarity/")
# def get_similarity_score(request: DetailRequest):
#     # Load dataset
#     file_path = "/Users/pray/Documents/Dezerv_Hackathon/Dataset/wedding.csv"
#     df = pd.read_csv(file_path)
#     df.columns = df.columns.str.strip()

#     # Extract last field from 'Details & Ref No./Cheque No.'
#     df["Extracted Detail"] = df["Details & Ref No./Cheque No."].str.split("/").str[-1].str.strip().str.lower()

#     # Load BERT model
#     model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

#     # Compute embeddings for all extracted details
#     details_list = df["Extracted Detail"].tolist()
#     detail_embeddings = model.encode(details_list, convert_to_tensor=True)

#     # Initialize FAISS for fast similarity search
#     embedding_dim = detail_embeddings.shape[1]
#     index = faiss.IndexFlatL2(embedding_dim)
#     index.add(detail_embeddings.cpu().numpy())

#     input_detail = request.detail.lower().strip()
#     input_embedding = model.encode([input_detail], convert_to_tensor=True)

#     # Compute similarity scores
#     similarity_scores = util.pytorch_cos_sim(input_embedding, detail_embeddings).squeeze(0)

#     # Get the highest similarity score
#     max_idx = torch.argmax(similarity_scores).item()
#     max_score = similarity_scores[max_idx].item()

#     if max_score >= 0.75:  # Only return matches above 75% confidence
#         return {
#             "best_match": details_list[max_idx],
#             "similarity_score": round(max_score, 2)
#         }
#     else:
#         return {"message": "No similar details found with a confidence of 75% or higher."}


# =============================================================================
# Base Plan Library (Dezerv Plans)
# =============================================================================
# Each base plan includes:
# - plan_name: Name of the plan.
# - default_allocation: Dummy percentages for each asset class.
# - expected_return: Annual expected return (as decimal, e.g., 0.12 for 12%).
# - ideal_holding: Ideal holding period in years (numeric).
base_plans = [
    {
        "plan_name": "Equity Revival",
        "default_allocation": {"equity": 0.65, "debt": 0.25, "gold": 0.05, "liquid": 0.05},
        "expected_return": 0.12,
        "ideal_holding": 3  # Ideal holding: 3+ years
    },
    {
        "plan_name": "Alpha Focused",
        "default_allocation": {"equity": 0.80, "debt": 0.10, "gold": 0.05, "liquid": 0.05},
        "expected_return": 0.15,
        "ideal_holding": 5  # Ideal holding: 5+ years
    },
    {
        "plan_name": "Dynamic Debt +",
        "default_allocation": {"equity": 0.10, "debt": 0.80, "gold": 0.05, "liquid": 0.05},
        "expected_return": 0.11,
        "ideal_holding": 2  # Ideal holding: 2+ years
    },
    {
        "plan_name": "Private Credit AIF",
        "default_allocation": {"equity": 0.0, "debt": 0.95, "gold": 0.0, "liquid": 0.05},
        "expected_return": 0.10,
        "ideal_holding": 4  # Ideal holding: 4+ years
    }
]

# =============================================================================
# Mapping Goal Names to Base Plans
# =============================================================================
def get_base_plan(goal_name, risk_profile):
    """
    Map a goal (by its name) to a base plan.
    For example:
      - If goal name contains "Home Purchase", use Equity Revival.
      - If goal name contains "Emergency Fund", use Dynamic Debt +.
      - If goal name contains "Child Education", then if risk is aggressive use Alpha Focused;
        otherwise use Equity Revival.
      - If goal name contains "Car", use Dynamic Debt +.
      - Else default to Equity Revival.
    """
    goal_lower = goal_name.lower()
    if "home purchase" in goal_lower or "joint savings" in goal_lower:
        return next(plan for plan in base_plans if plan["plan_name"] == "Equity Revival")
    elif "emergency fund" in goal_lower:
        return next(plan for plan in base_plans if plan["plan_name"] == "Dynamic Debt +")
    elif "child education" in goal_lower:
        if risk_profile.lower() == "aggressive":
            return next(plan for plan in base_plans if plan["plan_name"] == "Alpha Focused")
        else:
            return next(plan for plan in base_plans if plan["plan_name"] == "Equity Revival")
    elif "car" in goal_lower:
        return next(plan for plan in base_plans if plan["plan_name"] == "Dynamic Debt +")
    else:
        return next(plan for plan in base_plans if plan["plan_name"] == "Equity Revival")

# =============================================================================
# Utility: Normalize Allocation Dictionary
# =============================================================================
def normalize_allocation(allocation):
    total = sum(allocation.values())
    if total == 0:
        return allocation
    return {k: round(v / total, 2) for k, v in allocation.items()}

# =============================================================================
# Time Horizon Adjustment
# =============================================================================
def adjust_for_time_horizon(allocation, target_years, ideal_holding):
    """
    Adjust allocation based on the difference between the ideal holding period and the user's target horizon.
    
    Rule:
      - If target horizon is shorter than ideal (diff > 0), reduce equity by 5% per year difference,
        and add that percentage to liquid assets.
      - If target horizon is longer than ideal, increase equity by 2% per extra year and reduce debt by same.
    """
    diff = ideal_holding - target_years  # positive if target is shorter
    adjusted = allocation.copy()
    if diff > 0:
        reduction = min(diff * 0.05, adjusted["equity"])  # cap reduction to available equity
        adjusted["equity"] -= reduction
        adjusted["liquid"] += reduction
    elif diff < 0:
        increase = abs(diff) * 0.02  # add 2% per extra year
        reduction_from_debt = min(increase, adjusted["debt"])
        adjusted["equity"] += increase
        adjusted["debt"] -= reduction_from_debt
    return normalize_allocation(adjusted)

# =============================================================================
# Risk Profile Adjustment
# =============================================================================
def adjust_for_risk(allocation, risk_profile):
    """
    Adjust allocation based on risk profile:
      - Aggressive: Increase equity by 5% (reduce debt by 5%).
      - Conservative: Decrease equity by 5% (increase liquid by 5%).
      - Moderate: No change.
    """
    adjusted = allocation.copy()
    if risk_profile.lower() == "aggressive":
        adjustment = 0.05
        if adjusted["debt"] >= adjustment:
            adjusted["equity"] += adjustment
            adjusted["debt"] -= adjustment
    elif risk_profile.lower() == "conservative":
        adjustment = 0.05
        if adjusted["equity"] >= adjustment:
            adjusted["equity"] -= adjustment
            adjusted["liquid"] += adjustment
    return normalize_allocation(adjusted)

# =============================================================================
# SIP Calculation using Future Value of Annuity Formula
# =============================================================================
def compute_sip(target_amount, target_years, expected_return):
    """
    Calculate the required monthly SIP using:
    
      SIP = target_amount / [((1 + r/12)^(n) - 1) / (r/12)]
      
    where r is annual expected return and n is the total number of months.
    """
    monthly_rate = expected_return / 12
    n = target_years * 12
    factor = ( (1 + monthly_rate)**n - 1 ) / monthly_rate
    if factor == 0:
        return 0
    sip = target_amount / factor
    return round(sip, 2)

# =============================================================================
# Generate Personalized Recommendation for a Single Goal
# =============================================================================
def generate_recommendation_for_goal(goal_input, risk_profile):

    target_amount = goal_input.get("target_amount")
    target_years = goal_input.get("target_years")

    # ✅ HARD GUARD
    if target_amount is None or target_years is None:
        return {
            "goal_name": goal_input.get("goal_name", "general"),
            "base_plan": "General Planning",
            "recommendation": "General financial advice based on risk profile",
            "risk_profile": risk_profile,
            "note": "No goal amount or duration provided, skipping goal-based calculations"
        }

    # ---------------- normal logic below ----------------

    base_plan = get_base_plan(goal_input["goal_name"], risk_profile)
    base_alloc = base_plan["default_allocation"]
    expected_return = base_plan["expected_return"]
    ideal_holding_numeric = base_plan["ideal_holding"]

    adjusted_alloc = adjust_for_time_horizon(
        base_alloc,
        target_years,
        ideal_holding_numeric
    )

    final_alloc = adjust_for_risk(adjusted_alloc, risk_profile)
    final_alloc = normalize_allocation(final_alloc)

    recommended_sip = compute_sip(
        target_amount,
        target_years,
        expected_return
    )

    return {
        "goal_name": goal_input["goal_name"],
        "base_plan": base_plan["plan_name"],
        "ideal_holding": f"{ideal_holding_numeric}+ years",
        "adjusted_allocation": final_alloc,
        "target_amount": target_amount,
        "target_horizon_years": target_years,
        "recommended_sip": recommended_sip,
        "expected_return": f"{expected_return*100:.0f}% p.a."
    }
    """
    goal_input: dict with keys:
        - goal_name: e.g., "Joint Savings for Home Purchase" or "Emergency Fund"
        - target_amount: numeric value (e.g., 2000000 for ₹2,000,000)
        - target_years: numeric (e.g., 4)
    risk_profile: overall user's risk profile: "aggressive", "moderate", or "conservative".
    
    Returns a dictionary with:
      - goal_name
      - base_plan (name)
      - ideal_holding (string with '+' notation)
      - adjusted_allocation (asset percentages)
      - target_amount
      - target_horizon_years
      - recommended_sip (monthly contribution)
      - expected_return (string with percentage and "p.a.")
      - rationale (text explaining adjustments)
    """
    # Get base plan using the goal name and risk profile
    base_plan = get_base_plan(goal_input["goal_name"], risk_profile)
    base_alloc = base_plan["default_allocation"]
    expected_return = base_plan["expected_return"]
    ideal_holding_numeric = base_plan["ideal_holding"]
    
    # Map ideal holding to string for output:
    ideal_holding_str = {
        3: "3+ years",
        5: "5+ years",
        2: "2+ years",
        4: "4+ years"
    }.get(ideal_holding_numeric, f"{ideal_holding_numeric}+ years")
    
    rationale_parts = []
    rationale_parts.append(f"Base plan '{base_plan['plan_name']}' with default allocation {base_alloc} and expected return {expected_return*100:.0f}% was selected.")
    
    # Adjust allocation for time horizon
    adjusted_alloc = adjust_for_time_horizon(base_alloc, goal_input["target_years"], ideal_holding_numeric)
    diff = ideal_holding_numeric - goal_input["target_years"]
    if diff > 0:
        rationale_parts.append(f"Target horizon ({goal_input['target_years']} yrs) is shorter than ideal holding period ({ideal_holding_numeric}+ yrs); reduced equity by {diff*5:.0f}% and increased liquid assets accordingly.")
    elif diff < 0:
        rationale_parts.append(f"Target horizon ({goal_input['target_years']} yrs) is longer than ideal; increased equity by {abs(diff)*2:.0f}% for additional growth.")
    
    # Apply risk adjustment
    final_alloc = adjust_for_risk(adjusted_alloc, risk_profile)
    if risk_profile.lower() == "aggressive":
        rationale_parts.append("Aggressive risk profile: increased equity by 5% and reduced debt by 5%.")
    elif risk_profile.lower() == "conservative":
        rationale_parts.append("Conservative risk profile: decreased equity by 5% and increased liquid assets by 5%.")
    else:
        rationale_parts.append("Moderate risk profile: minimal adjustments applied.")
    
    final_alloc = normalize_allocation(final_alloc)
    
    # Calculate SIP using the expected return from the base plan.
    recommended_sip = compute_sip(goal_input["target_amount"], goal_input["target_years"], expected_return)
    
    rationale = " ".join(rationale_parts)
    
    return {
        "goal_name": goal_input["goal_name"],
        "base_plan": base_plan["plan_name"],
        "ideal_holding": ideal_holding_str,
        "adjusted_allocation": final_alloc,
        "target_amount": goal_input["target_amount"],
        "target_horizon_years": goal_input["target_years"],
        "recommended_sip": recommended_sip,
        "expected_return": f"{expected_return*100:.0f}% p.a.",
        "rationale": rationale
    }

# =============================================================================
# Generate Recommendations for Multiple Goals
# =============================================================================
def generate_recommendations(user_input):
    recommendations = []

    # ✅ SAFE access (goals is optional)
    goals = user_input.get("goals")

    risk_profile = user_input.get("risk_profile", "moderate")

    # ✅ If no goals provided → general recommendation
    if not goals:
        rec = generate_recommendation_for_goal(
            {
                "goal_name": "general_financial_planning",
                "target_amount": None,
                "target_years": None
            },
            risk_profile
        )
        recommendations.append(rec)
    else:
        for goal in goals:
            rec = generate_recommendation_for_goal(goal, risk_profile)
            recommendations.append(rec)

    return {
        "user_id": user_input.get("user_id"),
        "goals": recommendations
    }

        
@app.post("/recommendation")
def get_recommendation(user_input: dict):
    try:
        print("Received request at /recommendation endpoint")
        print("Request body:", user_input)
        print("Request type:", type(user_input))
        print("Request keys:", user_input.keys() if isinstance(user_input, dict) else "Not a dictionary")
        
        result = generate_recommendations(user_input)
        print("Generated recommendations:", result)
        return result
    except Exception as e:
        print("Error in recommendation endpoint:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
# Health check endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/service-status")
async def service_status():
    return {"status": "operational", "timestamp": time.time()}

@app.post("/hello")
async def hello_world(file: UploadFile = File(...)):
    try:
        logger.info(f"Receiving file: {file.filename}")
        
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Read file in chunks to avoid memory issues with large files
        file_size = 0
        file_path = f"uploads/data.csv"
        
        with open(file_path, "wb") as buffer:
            # Read and write in chunks of 1MB
            chunk_size = 1024 * 1024  # 1MB
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                buffer.write(chunk)
                file_size += len(chunk)
                
        logger.info(f"File saved successfully: {file.filename}, size: {file_size} bytes at {file_path}")
        
        # Process the uploaded file with analyze_transactions_api function
        logger.info("Starting transaction analysis and life event detection...")
        analysis_result = analyze_transactions_api()
        # Log and print the life event detection results
        if "event_detection" in analysis_result and "eventName" in analysis_result["event_detection"]:
            event_name = analysis_result["event_detection"]["eventName"]
            reasoning = analysis_result["event_detection"]["reasoning"]
            logger.info(f"Life event detected: {event_name}")
            print(f"Life Event Detection: {event_name}")
            print(f"Reasoning: {reasoning}")
        else:
            logger.info("No clear life event detected")
            print("No clear life event detected in the data")
        
        return {
            "message": "File uploaded and analyzed successfully", 
            "filename": file.filename,
            "size": file_size,
            "path": file_path,
            "analysis_result": analysis_result
        }
        
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
from fastapi import Form

import requests

def generate_full_ai_report(analysis_payload: dict, risk_percentage: int):
    """
    Generates a fully AI-written, structured financial report using Sarvam AI
    """

    SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY")
    if not SARVAM_API_KEY:
        raise Exception("SARVAM_API_KEY not set")

    prompt = f"""
You are a senior personal finance analyst for Indian users.

You are given analyzed bank-statement data.
Your task is to write a clear, insightful financial report.

STRICT RULES:
- Use simple, human language
- Mention month-wise income and expenses
- Clearly explain where money is going
- Identify the biggest expense categories
- Highlight changes in spending behavior
- Assess savings capacity
- Give practical advice (NO guarantees)
- Do NOT invent numbers
- Do NOT mention AI or models

Risk preference (0–100): {risk_percentage}

ANALYSIS DATA:
{json.dumps(analysis_payload, indent=2)}

Return STRICT JSON ONLY in this format:

{{
  "sections": [
    {{
      "title": "Monthly Overview",
      "content": "..."
    }},
    {{
      "title": "Spending Breakdown",
      "content": "..."
    }},
    {{
      "title": "Key Observations",
      "content": "..."
    }},
    {{
      "title": "Actionable Advice",
      "content": "..."
    }}
  ]
}}
"""

    response = requests.post(
        "https://api.sarvam.ai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {SARVAM_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "sarvam-m",
            "messages": [
                {"role": "system", "content": "You are a careful financial analyst."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        },
        timeout=60
    )

    if response.status_code != 200:
        raise Exception(f"Sarvam API error: {response.text}")

    raw_text = response.json()["choices"][0]["message"]["content"]

    try:
        return json.loads(raw_text)
    except Exception:
        # HARD SAFETY FALLBACK (frontend will still render)
        return {
            "sections": [
                {
                    "title": "Financial Report",
                    "content": raw_text
                }
            ]
        }


def make_json_safe(obj):
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_safe(v) for v in obj]
    elif isinstance(obj, (np.bool_,)):
        return bool(obj)
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        return float(obj)
    else:
        return obj




@app.post("/analyze")
async def analyze_bank_statement(
    file: UploadFile = File(...),
    risk: int = Form(50),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files supported")

    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        analysis_payload = analyze_transactions_api(
            csv_path=file_path,
            risk=risk
        )

        tax_snapshot = extract_tax_snapshot(file_path)

        life_event = analysis_payload.get("life_event", {
            "event": "Not detected",
            "confidence": "N/A"
        })

        ai_report = generate_full_ai_report(
            analysis_payload=analysis_payload,
            risk_percentage=risk
        )

        sip_recommendation = analysis_payload.get(
            "sip_recommendation",
            {
                "sip_amount": 0,
                "allocation": {"equity": "N/A", "debt": "N/A"}
            }
        )

     # ================= DASHBOARD METRICS =================

        if sip_recommendation["sip_amount"] <= 500:
             investment_readiness = "Low"
        elif sip_recommendation["sip_amount"] < 30000:
             investment_readiness = "Medium"
        else:
             investment_readiness = "High"

        net_savings = analysis_payload.get("cash_flow", {}).get("net_savings", 0)

        if net_savings >= 0:
             cash_flow_health = "Stable"
        else:
            cash_flow_health = "Stressed"


        risk_exposure = (
            "Low" if risk < 35 else
            "Moderate" if risk < 70 else
            "High"
        )

        response = {
    "life_event": life_event,
    "ai_report": ai_report,
    "sip_recommendation": sip_recommendation,
    "tax_snapshot": tax_snapshot,
    "dashboard_metrics": {
        "cash_flow_health": cash_flow_health,
        "risk_exposure": risk_exposure,
        "investment_readiness": investment_readiness
    }
}

        return make_json_safe(response)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
from fastapi import Body

@app.post("/report-chat")
def report_chat(payload: dict = Body(...)):
    question = payload.get("message")
    report = payload.get("report")

    if not question or not report:
        return {"response": "Invalid request."}

    answer = report_chat_with_sarvam(report, question)

    return {"response": answer}

# =============================================================================
# Example Usage & Expected Output
# =============================================================================
if __name__ == "__main__":
    # Sample user input with multiple goals.
    import uvicorn
    logger.info("Starting FastAPI server on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)





