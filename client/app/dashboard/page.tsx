"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();

  const [metrics, setMetrics] = useState<{
    cash_flow_health: string;
    risk_exposure: string;
    investment_readiness: string;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("analysisResult");
    if (!stored) {
      router.replace("/");
      return;
    }
    const parsed = JSON.parse(stored);
    setMetrics(parsed.dashboard_metrics);
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-indigo-600/20 blur-[180px]" />
        <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-purple-600/20 blur-[180px]" />
        <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-cyan-500/10 blur-[180px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 space-y-20">

        {/* HERO */}
        <section className="text-center space-y-6">
          <h1 className="text-6xl font-extrabold tracking-tight">
            Your <span className="text-indigo-400">Financial Control Center</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            AI-powered insights extracted from your real bank transactions —
            built for clarity, safety, and real-world decisions.
          </p>
        </section>

        {/* METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl p-6 backdrop-blur-xl border bg-green-500/10 border-green-400/30">
            <p className="text-sm text-slate-400">Cash Flow Health</p>
            <p className="text-3xl font-bold mt-2">
              {metrics?.cash_flow_health ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur-xl border bg-yellow-500/10 border-yellow-400/30">
            <p className="text-sm text-slate-400">Risk Exposure</p>
            <p className="text-3xl font-bold mt-2">
              {metrics?.risk_exposure ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur-xl border bg-indigo-500/10 border-indigo-400/30">
            <p className="text-sm text-slate-400">Investment Readiness</p>
            <p className="text-3xl font-bold mt-2 text-indigo-400">
              {metrics?.investment_readiness ?? "—"}
            </p>
          </div>
        </section>

        {/* ACTION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Financial Insights Card */}
          <div>
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 p-10 space-y-6">
              <h2 className="text-3xl font-bold">📊 Financial Insights & SIP</h2>

              <p className="text-slate-300 leading-relaxed">
                Deep month-by-month analysis of your income, expenses, savings,
                and risk behavior — translated into a safe, explainable SIP
                recommendation.
              </p>

              <ul className="text-slate-400 space-y-2 text-sm">
                <li>• Income & expense trend analysis</li>
                <li>• Cash-flow stress detection</li>
                <li>• Conservative, rule-based SIP planning</li>
              </ul>

              <button
                onClick={() => router.push("/results")}
                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-lg font-semibold hover:scale-[1.03] transition"
              >
                View Financial Insights →
              </button>
            </div>

            {/* ✅ BACK BUTTON — CORRECT PLACE */}
            <button
              onClick={() => router.push("/")}
              className="mt-4 text-sm text-indigo-400 hover:underline"
            >
              ← Upload another statement
            </button>
          </div>

          {/* Tax Snapshot Card */}
          <div className="rounded-3xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-white/10 p-10 space-y-6">
            <h2 className="text-3xl font-bold">🧾 Tax Snapshot</h2>

            <p className="text-slate-300 leading-relaxed">
              A clean, structured breakdown of your taxable income, deductions,
              and tax-relevant transactions — generated directly from your bank data.
            </p>

            <ul className="text-slate-400 space-y-2 text-sm">
              <li>• Salary & income classification</li>
              <li>• Section-wise deductions (80C, 80D)</li>
              <li>• Ready-to-file tax summary</li>
            </ul>

            <button
              onClick={() => router.push("/tax")}
              className="mt-6 w-full py-4 rounded-xl border border-green-400/40 text-lg font-semibold hover:bg-green-400/10 transition"
            >
              View Tax Snapshot →
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <section className="text-center pt-12">
          <p className="text-sm text-slate-500">
            Built from real transaction behavior • No fake projections • No generic advice
          </p>
        </section>

      </div>
    </main>
  );
}