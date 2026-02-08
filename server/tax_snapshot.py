# server/tax_snapshot.py

import pandas as pd
import re

# ==============================
# CONSTANTS
# ==============================

SECTION_LIMITS = {
    "80C": 150000,
    "80D": 25000
}

SALARY_KEYWORDS = ["salary", "payroll", "wages"]
TDS_KEYWORDS = ["tds", "income tax", "it dept"]
INSURANCE_KEYWORDS = ["insurance", "mediclaim", "health policy"]
MEDICAL_KEYWORDS = ["hospital", "clinic", "medical", "pharmacy"]
INVESTMENT_KEYWORDS = ["elss", "ppf", "mutual fund", "lic", "nps"]
HOME_LOAN_KEYWORDS = ["home loan", "housing loan", "emi"]


# ==============================
# HELPERS
# ==============================

def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [c.strip().lower() for c in df.columns]
    return df


def contains_any(text: str, keywords: list) -> bool:
    if not isinstance(text, str):
        return False
    text = text.lower()
    return any(k in text for k in keywords)


# ==============================
# CORE TAX SNAPSHOT
# ==============================


def compute_old_regime_tax(taxable_income: float) -> float:
    """
    Old regime slab-based tax (India) + 4% cess
    """

    tax = 0

    if taxable_income <= 250000:
        tax = 0

    elif taxable_income <= 500000:
        tax = (taxable_income - 250000) * 0.05

    elif taxable_income <= 1000000:
        tax = (
            (250000 * 0.05) +
            (taxable_income - 500000) * 0.20
        )

    else:
        tax = (
            (250000 * 0.05) +
            (500000 * 0.20) +
            (taxable_income - 1000000) * 0.30
        )

    # Add 4% Health & Education cess
    return round(tax * 1.04, 2)

def compute_new_regime_tax_2025(taxable_income: float) -> float:
    """
    New tax regime (FY 2025–26) + 4% cess
    Assumes ₹50,000 standard deduction already applied if salary.
    """

    tax = 0

    if taxable_income <= 300000:
        tax = 0
    elif taxable_income <= 600000:
        tax = (taxable_income - 300000) * 0.05
    elif taxable_income <= 900000:
        tax = (300000 * 0.05) + (taxable_income - 600000) * 0.10
    elif taxable_income <= 1200000:
        tax = (
            (300000 * 0.05) +
            (300000 * 0.10) +
            (taxable_income - 900000) * 0.15
        )
    elif taxable_income <= 1500000:
        tax = (
            (300000 * 0.05) +
            (300000 * 0.10) +
            (300000 * 0.15) +
            (taxable_income - 1200000) * 0.20
        )
    else:
        tax = (
            (300000 * 0.05) +
            (300000 * 0.10) +
            (300000 * 0.15) +
            (300000 * 0.20) +
            (taxable_income - 1500000) * 0.30
        )

    return round(tax * 1.04, 2)


def extract_tax_snapshot(csv_path: str) -> dict:
    """
    Deterministic tax snapshot from bank statement CSV
    """

    # ------------------------------
    # LOAD CSV
    # ------------------------------
    df = pd.read_csv(csv_path)
    df = normalize_columns(df)

    required_cols = {"credit", "debit", "transaction detail"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Missing required columns: {required_cols - set(df.columns)}")

    df["credit"] = pd.to_numeric(df["credit"], errors="coerce").fillna(0)
    df["debit"] = pd.to_numeric(df["debit"], errors="coerce").fillna(0)

    details = df["transaction detail"].astype(str)

    # ------------------------------
    # 1️⃣ TAX BASE (REAL NUMBERS)
    # ------------------------------

    salary_income = df[
        details.apply(lambda x: contains_any(x, SALARY_KEYWORDS))
    ]["credit"].sum()

    other_income = df[
        (~details.apply(lambda x: contains_any(x, SALARY_KEYWORDS))) &
        (df["credit"] > 0)
    ]["credit"].sum()

    gross_income = salary_income + other_income

    # Standard deduction (only if salary detected)
    standard_deduction = 50000 if salary_income > 0 else 0

    # ------------------------------
    # 2️⃣ DEDUCTIONS (FROM DEBITS)
    # ------------------------------

    deduction_80c = df[
        details.apply(lambda x: contains_any(x, INVESTMENT_KEYWORDS))
    ]["debit"].sum()

    deduction_80d = df[
        details.apply(lambda x: contains_any(x, INSURANCE_KEYWORDS))
    ]["debit"].sum()

    home_loan_interest = (
        df[details.apply(lambda x: contains_any(x, HOME_LOAN_KEYWORDS))]["debit"].sum()
        * 0.7  # conservative interest split
    )

    # ------------------------------
    # 3️⃣ TAX SIGNALS
    # ------------------------------

    tds_detected = details.apply(lambda x: contains_any(x, TDS_KEYWORDS)).any()

    medical_spend = df[
        details.apply(lambda x: contains_any(x, MEDICAL_KEYWORDS))
    ]["debit"].sum()

    investment_activity_detected = deduction_80c > 0

    medical_spend_without_insurance = (
        medical_spend > 0 and deduction_80d == 0
    )

    # ------------------------------
    # 4️⃣ TAX GAPS
    # ------------------------------

    remaining_80c = max(SECTION_LIMITS["80C"] - deduction_80c, 0)
    remaining_80d = max(SECTION_LIMITS["80D"] - deduction_80d, 0)

    sections_not_utilized = []
    sections_partially_utilized = []

    if deduction_80c == 0:
        sections_not_utilized.append("80C")
    elif deduction_80c < SECTION_LIMITS["80C"]:
        sections_partially_utilized.append("80C")

    if deduction_80d == 0:
        sections_not_utilized.append("80D")
    elif deduction_80d < SECTION_LIMITS["80D"]:
        sections_partially_utilized.append("80D")

    # ------------------------------
    # 5️⃣ SAFE TAX ESTIMATE
    # ------------------------------

    # Old regime taxable income (uses deductions)
    taxable_income_old = max(
        gross_income - deduction_80c - deduction_80d - home_loan_interest,
        0
    )

    # New regime taxable income (FY 2025–26)
    taxable_income_new = max(
        gross_income - standard_deduction,
        0
    )  
    old_regime_tax = compute_old_regime_tax(taxable_income_old)
    new_regime_tax = compute_new_regime_tax_2025(taxable_income_new)
    # ------------------------------
    # FINAL STRUCTURED OUTPUT
    # ------------------------------
    standard_deduction = standard_deduction or 0
    return {
        "tax_base": {
            "salary_income": round(float(salary_income), 2),
            "other_income": round(float(other_income), 2),
            "gross_income": round(float(gross_income), 2),
            "deductions_claimed": {
                "80C": round(float(deduction_80c), 2),
                "80D": round(float(deduction_80d), 2),
                "home_loan_interest": round(float(home_loan_interest), 2)
            },
            "confidence": "high" if gross_income > 0 else "low"
        },

        "tax_signals": {
            "salary_detected": salary_income > 0,
            "tds_detected": bool(tds_detected),
            "investment_activity_detected": investment_activity_detected,
            "medical_spend_without_insurance": medical_spend_without_insurance,
            "signal_confidence": "high"
        },

        "tax_gaps": {
            "potential_80C_remaining": round(float(remaining_80c), 2),
            "potential_80D_remaining": round(float(remaining_80d), 2),
            "sections_not_utilized": sections_not_utilized,
            "sections_partially_utilized": sections_partially_utilized,
            "gap_severity": (
                "high" if remaining_80c > 100000 else
                "medium" if remaining_80c > 0 else
                "low"
            )
        },

        "tax_estimate": {
            "old_regime": {
                "taxable_income": round(taxable_income_old, 2),
                "estimated_tax": round(old_regime_tax, 2)
            },
            "new_regime_2025_26": {
                "taxable_income": round(taxable_income_new, 2),
                "estimated_tax": round(new_regime_tax, 2),
                "standard_deduction_applied": standard_deduction > 0
            },
            "recommended_regime": "new" if new_regime_tax < old_regime_tax else "old",
            "confidence": "medium"
        },

        "disclaimer": (
            "This is an estimated tax snapshot derived from your bank statement. "
            "It is not a tax filing or legal advice."
        )
    }