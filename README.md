# FinAutoBot — AI-Powered Financial Insights from Bank Statements

FinAutoBot is a full-stack application that analyzes real bank statement data to generate
clear financial insights, safe SIP recommendations, and a tax-relevant financial snapshot.

The system combines rule-based financial logic with AI-assisted explanations, ensuring
recommendations are explainable, conservative, and grounded in actual transaction behavior.

---

## Project Overview

FinAutoBot consists of a Next.js frontend and a FastAPI backend.

Users upload a bank statement CSV, select a risk preference, and receive:
- Month-wise financial insights
- A conservative SIP recommendation
- A structured tax snapshot
- An interactive AI-based report explanation

---

## Key Features

- Bank statement CSV parsing
- Monthly income, expense, and savings analysis
- Cash-flow stability detection
- SIP recommendation capped at 30% of disposable income
- Tax-relevant financial summary
- AI-based explanation of financial reports

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- Python
- Pandas
- NumPy

### AI
- Sarvam API  
  *(Used only for explanation, not for financial decision-making)*

---

## CSV Format

The uploaded bank statement must contain the following columns:
date, credit, debit, balance, transaction detail, category, subcategory
---

## Setup Instructions

### Backend

```bash
cd server
pip install -r requirements.txt
python main.py

frontend 
cd client
npm install
npm run dev

Design Principles
	•	Safety-first financial recommendations
	•	Explainable, rule-based logic
	•	No assumptions beyond visible transaction data
	•	AI used strictly for explanation, not financial decisions

Team

Built by:
	•	Aashvath Gupta
	•	Paresh Kumar

(BITS Pilani)

