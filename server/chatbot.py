import requests
import os

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")  # or paste directly for hackathon
SARVAM_URL = "https://api.sarvam.ai/v1/chat/completions"

def report_chat_with_sarvam(report: str, question: str) -> str:
    system_prompt = f"""
You are a Financial Report Assistant.

You must answer ONLY using the report text below.
If the answer is not explicitly present, reply exactly:
"This information isn't available."

REPORT:
{report}
"""

    payload = {
        "model": "sarvam-m",   # ✅ VALID MODEL
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
        "temperature": 0
    }

    headers = {
        "Authorization": f"Bearer {SARVAM_API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(SARVAM_URL, json=payload, headers=headers)
    response.raise_for_status()

    return response.json()["choices"][0]["message"]["content"]