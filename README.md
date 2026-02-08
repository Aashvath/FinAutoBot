FinAutoBot — AI-Powered Financial Insights from Bank Statements

FinAutoBot is a full-stack application that analyzes real bank statement data to generate
clear financial insights, safe SIP recommendations, and a tax-relevant financial snapshot.

The system combines rule-based financial logic with AI-assisted explanations, ensuring
recommendations are explainable, conservative, and grounded in actual transaction behavior.

PROJECT OVERVIEW
FinAutoBot consists of a Next.js frontend and a FastAPI backend.
Users upload a bank statement CSV, select a risk preference, and receive:
- Month-wise financial insights
- A conservative SIP recommendation
- A structured tax snapshot
- An interactive report explanation

KEY FEATURES
- Bank statement parsing
- Monthly income, expense, and savings analysis
- Cash-flow stability detection
- SIP recommendation capped at 30% of disposable income
- Tax-relevant financial summary
- AI-based report explanations

TECH STACK
Frontend: Next.js, TypeScript, Tailwind CSS
Backend: FastAPI, Python, Pandas, NumPy
AI: Sarvam API

CSV FORMAT
Required columns:
date, credit, debit, balance, transaction detail, category, subcategory

SETUP
Backend:
cd server
pip install -r requirements.txt
python main.py

Frontend:
cd client
npm install
npm run dev

DESIGN PRINCIPLES
- Safety-first recommendations
- Explainable logic
- No assumptions beyond visible data
- AI used only for explanation

## Team

Built by:
- Aashvath Gupta
- Paresh Kumar

(BITS Pilani)