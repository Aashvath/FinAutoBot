"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { analyzeStatement } from "@/lib/api"

export default function Home() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [risk, setRisk] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const data = await analyzeStatement(file, risk)
      localStorage.setItem("analysisResult", JSON.stringify(data))
      router.push("/dashboard")
    } catch (err: any) {
      console.error("ANALYZE ERROR:", err)
      setError(err?.message || "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setRisk(50)
    setError(null)
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/30 blur-[160px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/20 blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 space-y-20">

        {/* HERO */}
        <section className="text-center space-y-6">
          <h1 className="text-6xl font-extrabold tracking-tight">
            Fin<span className="text-indigo-400">Auto</span>Bot
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            AI-powered financial intelligence from your real bank data — no assumptions, no promises.
          </p>
        </section>

        {/* UPLOAD PANEL */}
        <section className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">

            <h2 className="text-2xl font-semibold mb-6">
              Upload Bank Statement
            </h2>

            {/* Upload */}
            <label className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/20 rounded-xl p-10 cursor-pointer hover:border-indigo-400 transition">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="text-5xl">⬆️</div>
              <p className="text-slate-300">
                Drag & drop CSV or <span className="text-indigo-400">browse</span>
              </p>

              {file && (
                <p className="text-sm text-green-400 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </label>

            {/* Risk Slider */}
            <div className="mt-10">
              <div className="flex justify-between mb-2 text-sm text-slate-400">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={risk}
                onChange={(e) => setRisk(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="mt-2 text-center text-slate-300">
                Risk Preference: <span className="text-indigo-400">{risk}%</span>
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="mt-10 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-lg font-semibold hover:scale-[1.02] transition disabled:opacity-40"
            >
              {loading ? "Analyzing…" : "Generate Insights"}
            </button>

            {error && (
              <p className="mt-4 text-red-400 text-sm text-center">
                {error}
              </p>
            )}
          </div>
        </section>

      </div>
    </main>
  )
}