"use client"
import { ChatBot } from "@/components/chat-bot";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("analysisResult")
    if (!stored) {
      router.push("/")
      return
    }
    const parsed = JSON.parse(stored)
    console.log("BACKEND RESPONSE:", parsed)
    setData(parsed)
  }, [])
  

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading your financial insights…
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-24">
      <div className="max-w-4xl mx-auto space-y-10">

        <h1 className="text-4xl font-bold">Your Financial Insights</h1>

        <p className="text-sm text-slate-400">
             Insights generated using transaction behavior and AI pattern analysis
        </p>


        {/* ================= AI REPORT ================= */}
        <div className="rounded-xl bg-white/5 p-6 border border-white/10">
          <h2 className="text-xl font-semibold">AI Insight</h2>

          <div className="mt-4 space-y-6 text-slate-300 leading-relaxed">
          {data.ai_report?.sections?.map((section: any, idx: number) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {section.title}
                </h3>
                 <p className="whitespace-pre-line">
                   {section.content
                     .replace(/(\d+\.)/g, "\n$1")
                       .trim()}
                 </p>


              </div>
            ))}
          </div>
        </div>

        {/* ================= SIP RECOMMENDATION ================= */}
<div className="rounded-xl bg-white/5 p-6 border border-white/10 space-y-4">
  <h2 className="text-xl font-semibold">SIP Recommendation</h2>

  {/* Amount */}
  <p className="text-3xl font-bold text-indigo-400">
    ₹ {data.sip_recommendation?.sip_amount ?? "—"} / month
  </p>

  {/* Frequency */}
  <p className="text-sm text-slate-400">
    Frequency: Monthly
  </p>

  {/* Allocation */}
  <div className="text-slate-300 space-y-1">
    <p>
      <span className="font-semibold text-white">Asset Allocation:</span>
    </p>
    <p>• Equity: {data.sip_recommendation?.allocation?.equity}</p>
    <p>• Debt: {data.sip_recommendation?.allocation?.debt}</p>
  </div>

  {/* Risk Profile */}
  {data.sip_recommendation?.risk_profile && (
    <p className="text-slate-300">
      <span className="font-semibold text-white">Risk Profile:</span>{" "}
      {data.sip_recommendation.risk_profile}
    </p>
  )}

  {/* Safety Note */}
  {data.sip_recommendation?.safety_note && (
    <div className="mt-3 rounded-lg bg-white/10 p-3 text-sm text-slate-300">
      <span className="font-semibold text-white">Why this amount?</span>
      <p className="mt-1">{data.sip_recommendation.safety_note}</p>
    </div>
  )}

  {/* Disclaimer */}
  {/* Disclaimer */}
{data.sip_recommendation?.sip_amount === 500 && (
  <div className="mt-3 rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-300">
    This is the minimum SIP amount recommended due to limited disposable income
    or unstable cash flow. Increasing the SIP right now may cause financial
    stress.
  </div>
)}

<p className="text-xs text-slate-500 pt-2">
  SIPs are market-linked investments. This recommendation is based on your
  transaction data and current cash flow patterns, not guaranteed returns.
</p>

</div>




        <button
        onClick={() => router.push("/dashboard")}
        className="text-indigo-400 hover:underline"
        >
        ← Back to Dashboard
        </button>

      </div>
      <ChatBot />
    </main>
  )
}
