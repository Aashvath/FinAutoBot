import pandas as pd
import numpy as np
from tabulate import tabulate  # For pretty printing tables
import json
import os
from fastapi import APIRouter
import re   # REQUIRED before safe_json_from_ai
def safe_json_from_ai(raw: str, fallback: dict):
    """
    Safely extract JSON from AI output.
    Never crash the pipeline.
    """
    try:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            return fallback
        return json.loads(match.group())
    except Exception:
        return fallback


router = APIRouter()

EVENT_TAXONOMY = {
    "relocation": "jobChange",
    "promotion": "jobChange",
    "salary increase": "jobChange",
    "salary decrease": "jobChange",

    "marriage": "wedding",
    "wedding": "wedding",

    "baby": "newBaby",
    "child": "newBaby",
    "maternity": "newBaby",

    "house": "homePurchase",
    "home": "homePurchase",
    "property": "homePurchase"
}

import re
import json
import requests
import os

def detect_life_event_with_sarvam(analysis_data: str):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY not set")

    url = "https://api.sarvam.ai/v1/chat/completions"

    headers = {
        "api-subscription-key": api_key,
        "Content-Type": "application/json"
    }

    payload = {
        "model": "sarvam-m",
        "messages": [
            {
                "role": "system",
                "content": "You are a financial intelligence AI. Always return ONLY valid JSON."
            },
            {
                "role": "user",
                "content": f"""
Detect the MOST LIKELY life event.

Allowed values:
- jobChange
- wedding
- newBaby
- homePurchase
- none

Return STRICT JSON ONLY in this format:
{{
  "eventName": "<value>",
  "reasoning": "<short explanation>"
}}

DATA:
{analysis_data}
"""
            }
        ],
        "temperature": 0.2,
        "max_tokens": 300
    }

    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()

    data = response.json()
    text = data["choices"][0]["message"]["content"]

    # 🔥 Extract JSON from text safely
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return {
            "eventName": "none",
            "reasoning": "Model did not return structured JSON"
        }

    raw_output = json.loads(match.group())

    detected_signal = raw_output.get("eventName", "").lower().strip()
    reasoning = raw_output.get("reasoning", "")

    primary_event = EVENT_TAXONOMY.get(detected_signal, "none")



    return {
   "primaryEvent": primary_event,
   "detectedSignal": detected_signal,
   "reasoning": reasoning
}



import re
import requests




def generate_sip_recommendation(
    monthly_income,
    monthly_expenses,
    final_event,
    risk_percentage
):
    # ---- RISK NORMALIZATION ----
    # Clamp risk between 0 and 100
    risk_percentage = max(0, min(risk_percentage, 100))

    # Convert risk % to multiplier (0.4 → 1.0)
    risk_multiplier = 0.4 + (risk_percentage / 100) * 0.6

   
    """
    Rule-bounded + AI-safe SIP recommendation
    """
    disposable_income = max(monthly_income - monthly_expenses, 0)
    max_safe_sip = int(disposable_income * 0.3)


    # ---- HARD SAFETY RULES (NON-AI) ----
    
    

    disposable_income = max(monthly_income - monthly_expenses, 0)

    # SIP CAP RULE (VERY IMPORTANT)
    max_safe_sip = int(disposable_income * 0.3)

    # ---- EVENT → RISK LOGIC ----
    # ---- SIP AMOUNT CALCULATION ----
    base_sip = int(max_safe_sip * risk_multiplier)

    # Event-based dampening (safety-first)
    if final_event in ["jobChange", "homePurchase", "wedding"]:
        base_sip = int(base_sip * 0.85)

   # ---- ASSET ALLOCATION ----
    equity_pct = int(30 + (risk_percentage * 0.6))
    debt_pct = 100 - equity_pct

    allocation = {
         "equity": f"{equity_pct}%",
         "debt": f"{debt_pct}%"
}

    sip_amount = max(base_sip, 500)  # minimum meaningful SIP


    return {
    "sip_amount": sip_amount,
    "risk_profile": f"{risk_percentage}%",
    "allocation": allocation,
    "safety_note": "SIP capped at 30% of disposable income",

    # 🔥 ADD THIS LINE
    "explanation": (
        "Based on your current income and expenses, your safe investible surplus is limited. "
        "To avoid cash-flow stress, the SIP has been kept at a minimum sustainable level. "
        "As your income stabilizes or surplus increases, this SIP can be safely stepped up."
    )
}






import pandas as pd
import numpy as np
from tabulate import tabulate


def generate_sip_explanation(
    monthly_income,
    monthly_expenses,
    sip_amount,
    risk_percentage,
    final_event
):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        return "SIP recommended based on income, expenses, and selected risk level."

    prompt = f"""
Explain why this SIP was recommended.

Rules:
- No financial guarantees
- No future return promises
- Explain using user data only
- Max 4 sentences

Inputs:
Monthly income: {monthly_income}
Monthly expenses: {monthly_expenses}
Risk preference: {risk_percentage}%
Detected life event: {final_event}
Recommended SIP: {sip_amount}
"""

    payload = {
        "model": "sarvam-m",
        "messages": [
            {"role": "system", "content": "You are a conservative financial assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 150
    }

    r = requests.post(
        "https://api.sarvam.ai/v1/chat/completions",
        headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=30
    )

    return r.json()["choices"][0]["message"]["content"].strip()






def analyze_transactions(csv_path, top_n=5):
    # Always use uploads/data.csv
    output = []

    try:
        # 1. Read CSV data
        df = pd.read_csv(csv_path)
        # Normalize text columns (VERY IMPORTANT)
        df["category"] = df["category"].astype(str).str.lower().str.strip()
        df["subcategory"] = df["subcategory"].astype(str).str.lower().str.strip()
        
        # Normalize column names (strip spaces, lowercase)
        df.columns = [c.strip().lower() for c in df.columns]

        # Validate required columns
        required_columns = {
            "date", "credit", "debit", "balance", 
            "transaction detail", "category", "subcategory"
        }

        missing = required_columns - set(df.columns)
        if missing:
            raise ValueError(
                f"CSV missing required columns: {missing}. "
                f"Found columns: {list(df.columns)}"
            )

        # 2. Parse Date and create monthyear
        df['date'] = pd.to_datetime(df['date'])
        df['monthyear'] = df['date'].dt.to_period('M')
        df['month'] = df['monthyear'].astype(str)
        
        monthly_summary = (
            df.groupby("month")
      .agg(
          income=("credit", "sum"),
          expenses=("debit", "sum")
      )
      .reset_index()
)
        if len(monthly_summary) < 3:
             summary_confidence = "low"
        else:
             summary_confidence = "high"
        

        monthly_summary["savings"] = (
        monthly_summary["income"] - monthly_summary["expenses"]
)
        monthly_summary = monthly_summary[
           (monthly_summary["income"] > 0) &
            (monthly_summary["expenses"] >= 0)
]

        # -------- FORMAT MONTHLY SUMMARY FOR AI (CRITICAL FIX) --------
        formatted_monthly_summary = []

        for row in monthly_summary.to_dict(orient="records"):
            formatted_monthly_summary.append({
        "month": row["month"],  # keep YYYY-MM (AI can reason on it)
        "income": round(float(row["income"]), 2),
        "expenses": round(float(row["expenses"]), 2),
        "savings": round(float(row["savings"]), 2),
        "observation": (
            "Income exceeded expenses"
            if row["savings"] > 0
            else "Expenses exceeded income"
        )
    })


        category_breakdown = (
        df[df["debit"] > 0]
    .groupby(["month", "category"])
    .agg(amount=("debit", "sum"))
    .reset_index()
)

        category_breakdown = (
        category_breakdown
    .groupby("month")
    .apply(lambda x: x.sort_values("amount", ascending=False)
           .to_dict(orient="records"))
    .to_dict()
)
        
        salary_by_month = (
    df[df["subcategory"].str.contains("salary", na=False)]
    .groupby("month")["credit"]
    .sum()
)
        salary_change_pct = None
        if len(salary_by_month) >= 2:
                last, prev = salary_by_month.iloc[-1], salary_by_month.iloc[-2]
                salary_change_pct = round(((last - prev) / prev) * 100, 1)

        behaviour_metrics = {
                "salary_change_pct": salary_change_pct,
                "income_stability": "high" if salary_change_pct and salary_change_pct > 10 else "stable",
                "expense_volatility": "high" if df["debit"].std() > 10000 else "medium"
}
        avg_savings = (
    sum(m["savings"] for m in formatted_monthly_summary)
    / len(formatted_monthly_summary)
    if formatted_monthly_summary
    else 0
)

        sip_capacity = {
                "safe_monthly_sip": int(avg_savings * 0.6),
                "max_possible_sip": int(avg_savings * 0.8)
}




        # 3. Ensure numeric columns
        df['credit'] = pd.to_numeric(df['credit'], errors='coerce').fillna(0)
        df['debit'] = pd.to_numeric(df['debit'], errors='coerce').fillna(0)

        # ---- MONTHLY INCOME & EXPENSE CALCULATION (FOR SIP) ----
        # Robust income & expense detection (bank-agnostic)
        income_mask = (
    (df["credit"] > 0) &
    (df["subcategory"].str.contains("salary|income", na=False))
)

        expense_mask = df["debit"] > 0

        monthly_income = df[income_mask]["credit"].sum()
        monthly_expenses = df[expense_mask]["debit"].sum()

        df['balance'] = pd.to_numeric(df['balance'], errors='coerce').fillna(0)

        # ---- MONTHLY SALARY CALCULATION (Now correctly indented) ----
        salary_by_month = (
          df[
               (df["category"].str.lower() == "income") &
               (df["subcategory"].str.lower() == "salary")
        ]
          .groupby("monthyear")["credit"]
          .sum()
          .sort_index()
)


        salary_change_pct = None
        if len(salary_by_month) >= 2:
            last = salary_by_month.iloc[-1]
            prev = salary_by_month.iloc[-2]
            if prev > 0:
                salary_change_pct = ((last - prev) / prev) * 100

        # 4. Create helper columns
        df['inflow'] = df['credit']
        df['outflow'] = df['debit']
        df['amount'] = df['credit'] - df['debit']

        # A) MONTHLY AGGREGATES
        monthly_agg = (
            df.groupby('monthyear', as_index=False)
              .agg({
                   'balance': 'last',
                   'transaction detail': 'count',
                   'amount': lambda x: x.abs().sum(),
                   'inflow': 'sum',
                   'outflow': 'sum'
              })
              .rename(columns={
                   'transaction detail': 'cat_count',
                   'amount': 'cat_amount',
                   'inflow': 'cat_inflow',
                   'outflow': 'cat_outflow'
              })
        )

        # B) MONTHLY CATEGORY/SUBCATEGORY AGGREGATES
        cat_subcat_agg = (
            df.groupby(['monthyear', 'category', 'subcategory'], as_index=False)
              .agg({
                  'transaction detail': 'count',
                  'amount': lambda x: x.abs().sum(),
                  'inflow': 'sum',
                  'outflow': 'sum'
              })
              .rename(columns={
                  'transaction detail': 'subcat_count',
                  'amount': 'subcat_amount',
                  'inflow': 'subcat_inflow',
                  'outflow': 'subcat_outflow'
              })
        )

        # C) RECURRING TRANSACTIONS
        detail_month_counts = (
            df.groupby('transaction detail')['monthyear']
              .nunique()
              .reset_index(name='DistinctMonthCount')
        )
        recurring_details = detail_month_counts[detail_month_counts['DistinctMonthCount'] > 2]
        recurring_set = set(recurring_details['transaction detail'])

        # D) MONTHLY COUNTS & % CHANGE
        recurring_df = df[df['transaction detail'].isin(recurring_set)]
        monthly_recurring_counts = (
            recurring_df.groupby(['transaction detail', 'monthyear'])
                        .size()
                        .reset_index(name='DetailCount')
        ).sort_values(['transaction detail', 'monthyear'])

        monthly_recurring_counts['PrevDetailCount'] = (
            monthly_recurring_counts.groupby('transaction detail')['DetailCount'].shift(1)
        )

        monthly_recurring_counts['PctChange'] = (
            (monthly_recurring_counts['DetailCount'] - monthly_recurring_counts['PrevDetailCount'])
            / monthly_recurring_counts['PrevDetailCount'].replace(0, np.nan)
        ) * 100

        # E) LARGE SINGLE TRANSACTION CHECK
        def largest_txn_ratio(group):
            total_sum = group['amount'].abs().sum()
            max_txn = group['amount'].abs().max()
            return max_txn / total_sum if total_sum != 0 else 0

        large_txn_df = (
            df.groupby(['monthyear', 'category', 'subcategory'], as_index=False)
              .apply(lambda x: pd.Series({'LargestTxnRatio': largest_txn_ratio(x)}))
        )
        large_txn_df['HasLargeSingleTxn'] = large_txn_df['LargestTxnRatio'] >= 0.5

        # ============== BUILD REPORT STRING ==============
        output.append("=== MONTHLY AGGREGATES (Overall) [Top 5 Rows] ===")
        output.append(tabulate(monthly_agg.head(top_n), headers='keys', tablefmt='psql', showindex=False))

        output.append("\n=== MONTHLY CATEGORY/SUBCATEGORY AGGREGATES [Top 5 Rows] ===")
        output.append(tabulate(cat_subcat_agg.head(top_n), headers='keys', tablefmt='psql', showindex=False))

        # Recurring summary
        inc_changes = monthly_recurring_counts[monthly_recurring_counts['PctChange'] > 0].sort_values('PctChange', ascending=False).head(top_n)
        dec_changes = monthly_recurring_counts[monthly_recurring_counts['PctChange'] < 0].sort_values('PctChange').head(top_n)

        output.append("\n=== RECURRING TRANSACTIONS MONTH-TO-MONTH INCREASES ===")
        output.append(tabulate(inc_changes, headers='keys', tablefmt='psql', showindex=False) if not inc_changes.empty else "No increases.")

        output.append("\n=== LARGE SINGLE TRANSACTIONS (≥50% of Group Total) ===")
        output.append(tabulate(large_txn_df.head(top_n), headers='keys', tablefmt='psql', showindex=False))

        analysis_text = f"""
         Monthly Summary:
           {json.dumps(formatted_monthly_summary, indent=2)}

         Behaviour Metrics:
            {json.dumps(behaviour_metrics, indent=2)}

         SIP Capacity:
{json.dumps(sip_capacity, indent=2)}
"""



        return {
    "monthly_summary": formatted_monthly_summary,
    "category_breakdown": category_breakdown,
    "behaviour_metrics": behaviour_metrics,
    "sip_capacity": sip_capacity,
    "analysis_text": analysis_text,
    "monthly_income": monthly_income,
    "monthly_expenses": monthly_expenses,
    "salary_change_pct": salary_change_pct,
    "summary_confidence": summary_confidence

}




    except Exception as e:
        raise ValueError(f"analyze_transactions failed: {str(e)}")

def generate_financial_facts(monthly_summary):
    """
    Stage 1 AI: Extracts STRICT month-wise financial facts.
    NO advice. NO narrative.
    """

    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY not set")

    prompt = f"""
You are a financial data analyst.

TASK:
Convert the data into STRICT month-wise facts.

RULES:
- DO NOT give advice
- DO NOT summarize
- DO NOT use generic language
- Every month MUST be separate

Return ONLY valid JSON in this format:

{{
  "months": [
    {{
      "month": "Jan",
      "income": number,
      "expenses": number,
      "savings": number,
      "observation": "1 factual sentence"
    }}
  ],
  "overall_patterns": [
    "pattern 1",
    "pattern 2"
  ],
  "risk_flags": [
    "risk 1",
    "risk 2"
  ]
}}

DATA:
{json.dumps(monthly_summary, indent=2)}
"""

    response = requests.post(
        "https://api.sarvam.ai/v1/chat/completions",
        headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        },
        json={
            "model": "sarvam-m",
            "messages": [
                {"role": "system", "content": "Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 800
        },
        timeout=30
    )

    raw = response.json()["choices"][0]["message"]["content"]

    return safe_json_from_ai(
        raw,
        fallback={
            "months": [],
            "overall_patterns": [],
            "risk_flags": ["AI output could not be parsed reliably"]
        }
    )

def generate_advisory_report(facts_json):
    """
    Stage 2 AI: Converts FACTS into deep human explanation.
    """

    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY not set")

    prompt = f"""
You are a senior Indian personal finance advisor.

These facts are VERIFIED and FINAL.
You must explain EACH MONTH separately.

FACTS:
{json.dumps(facts_json, indent=2)}

INSTRUCTIONS:
INSTRUCTIONS:
- Write month-by-month explanation (Jan, Feb, Mar…)
- Explain WHY income or expenses changed
- Call out dangerous months clearly
- Be blunt and practical
- NO generic advice
- NO repetition
- DO NOT include navigation instructions
- DO NOT include UI text (buttons, links, arrows)
- DO NOT say things like "analyze another statement" or "go back"

Return JSON in this format ONLY:

{{
  "summary": "2–3 line blunt financial health summary",
  "sections": [
    {{
      "title": "January Analysis",
      "content": "Detailed explanation"
    }},
    {{
      "title": "February Analysis",
      "content": "Detailed explanation"
    }}
  ],
  "final_advice": [
    "specific action 1",
    "specific action 2"
  ]
}}
"""

    response = requests.post(
        "https://api.sarvam.ai/v1/chat/completions",
        headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        },
        json={
            "model": "sarvam-m",
            "messages": [
                {"role": "system", "content": "Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.25,
            "max_tokens": 1200
        },
        timeout=40
    )

    raw = response.json()["choices"][0]["message"]["content"]

    return safe_json_from_ai(
        raw,
        fallback={
            "summary": "AI explanation unavailable due to complex data patterns.",
            "sections": [],
            "final_advice": []
        }
    )


def analyze_transactions_api(csv_path=None, risk=50):
    # ---- CORE NUMERIC ANALYSIS ----
    analysis_payload = analyze_transactions(csv_path)

    if not isinstance(analysis_payload, dict):
        raise ValueError(
            f"analyze_transactions returned invalid type: {type(analysis_payload)}"
    )

    monthly_summary = analysis_payload["monthly_summary"]
    monthly_income = analysis_payload["monthly_income"]
    monthly_expenses = analysis_payload["monthly_expenses"]
    salary_change_pct = analysis_payload["salary_change_pct"]

    # ---- AI STAGE 1: FACTS (MONTH-WISE, NO OPINION) ----
    facts = generate_financial_facts(monthly_summary)

    # ---- LIFE EVENT (FACT-BASED) ----
    event_result = detect_life_event_with_sarvam(
    analysis_payload["analysis_text"]
)


    final_event = event_result.get("primaryEvent", "none")

    final_decision = {
    "finalEvent": final_event,
    "confidence": "AI-derived",
    "decisionReason": event_result.get("reasoning", "")
}


    # ---- AI STAGE 2: HUMAN EXPLANATION ----
    ai_report = generate_advisory_report(facts)

    # ---- SIP (RULE-BASED, SAFE) ----
    sip_plan = generate_sip_recommendation(
        monthly_income,
        monthly_expenses,
        final_event,
        risk
    )

    # ---- SIP ANALYSIS (EXPLAINABILITY LAYER) ----
    disposable_income = max(monthly_income - monthly_expenses, 0)

    sip_analysis = {
    "amount": sip_plan["sip_amount"],
    "frequency": "Monthly",
    "risk_tag": (
        "Conservative" if risk <= 40 else
        "Moderate" if risk <= 70 else
        "Aggressive"
    ),
    "readiness": {
        "score": (
            "Low" if disposable_income <= 0 else
            "Medium" if disposable_income < monthly_income * 0.2 else
            "High"
        ),
        "reason": (
            "Income volatility and multiple months of negative savings"
            if disposable_income <= 0
            else "Some surplus available but cash flow is inconsistent"
        )
    },
    "safety": {
        "sip_cap_rule": "Max 30% of disposable income",
        "capped": sip_plan["sip_amount"] >= int(disposable_income * 0.3) if disposable_income > 0 else True,
        "reason": (
            "Spending exceeds income in multiple months"
            if disposable_income <= 0
            else "SIP kept within safe disposable income limit"
        )
    }
}


    return {
    "ai_report": ai_report,

    "life_event": {
        "event": final_event,
        "confidence": final_decision["confidence"],
        "reason": final_decision["decisionReason"]
    },

    "sip_recommendation": sip_plan,
    "sip_analysis": sip_analysis
}


def report_chat_with_sarvam(report_json, user_question):
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        raise RuntimeError("SARVAM_API_KEY not set")

    prompt = f"""
You are a financial report explanation assistant.

STRICT RULES:
- Answer ONLY using the report below
- DO NOT give generic finance advice
- DO NOT mention mutual funds, stocks, returns
- If question is outside the report, say:
  "I can only answer questions based on your financial report."

REPORT:
{json.dumps(report_json, indent=2)}

USER QUESTION:
{user_question}

Answer in 2–4 clear sentences.
"""

    response = requests.post(
        "https://api.sarvam.ai/v1/chat/completions",
        headers={
            "api-subscription-key": api_key,
            "Content-Type": "application/json"
        },
        json={
            "model": "sarvam-m",
            "messages": [
                {"role": "system", "content": "You are a cautious financial explainer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 250
        },
        timeout=30
    )

    return response.json()["choices"][0]["message"]["content"].strip()




