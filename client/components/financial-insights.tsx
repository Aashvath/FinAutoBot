"use client"

import { useState } from "react"
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Percent } from "lucide-react"

export function FinancialInsights() {
  const [activeTab, setActiveTab] = useState("market")

  return (
    <div className="glass-effect shadow-lg rounded-lg border border-indigo-900/30 overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-indigo-900/30 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-indigo-400" />
          Financial Insights
        </h2>

        <div className="flex text-xs">
          <button
            className={`px-3 py-1 rounded-l-md transition-colors ${
              activeTab === "market"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-900/30 text-gray-300 hover:bg-indigo-900/50"
            }`}
            onClick={() => setActiveTab("market")}
          >
            Market
          </button>
          <button
            className={`px-3 py-1 rounded-r-md transition-colors ${
              activeTab === "news"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-900/30 text-gray-300 hover:bg-indigo-900/50"
            }`}
            onClick={() => setActiveTab("news")}
          >
            News
          </button>
        </div>
      </div>

      {activeTab === "market" && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400">Sensex</p>
                  <p className="text-lg font-semibold text-white">72,643</p>
                </div>
                <div className="flex items-center text-green-400 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  0.82%
                </div>
              </div>
              <div className="mt-2 h-8">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path
                    d="M0,10 L5,12 L10,8 L15,14 L20,11 L25,13 L30,9 L35,12 L40,10 L45,13 L50,7 L55,9 L60,5 L65,8 L70,6 L75,10 L80,7 L85,11 L90,9 L95,12 L100,8"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    className="animate-draw-line"
                  />
                </svg>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400">Nifty 50</p>
                  <p className="text-lg font-semibold text-white">22,055</p>
                </div>
                <div className="flex items-center text-green-400 text-xs font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  0.75%
                </div>
              </div>
              <div className="mt-2 h-8">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path
                    d="M0,12 L5,10 L10,13 L15,9 L20,11 L25,8 L30,10 L35,7 L40,9 L45,6 L50,10 L55,8 L60,11 L65,7 L70,9 L75,5 L80,8 L85,6 L90,9 L95,7 L100,5"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="1.5"
                    className="animate-draw-line"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center mr-3">
                    <DollarSign className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">USD/INR</p>
                    <p className="text-xs text-gray-400">US Dollar</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">₹83.12</p>
                  <p className="text-xs text-red-400 flex items-center justify-end">
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                    0.15%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-900/50 flex items-center justify-center mr-3">
                    <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                      <path
                        d="M15 8.5H9M12 17.5V8.5"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Gold</p>
                    <p className="text-xs text-gray-400">Per 10 grams</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">₹73,450</p>
                  <p className="text-xs text-green-400 flex items-center justify-end">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    1.24%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center mr-3">
                    <Percent className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">RBI Repo Rate</p>
                    <p className="text-xs text-gray-400">Current rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">6.50%</p>
                  <p className="text-xs text-gray-400">Unchanged</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "news" && (
        <div className="p-4 space-y-3">
          <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
            <p className="text-xs text-indigo-400 mb-1">MARKET NEWS</p>
            <h3 className="text-sm font-medium text-white">
              RBI Maintains Repo Rate at 6.50% for Seventh Consecutive Time
            </h3>
            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
            <p className="text-xs text-indigo-400 mb-1">POLICY</p>
            <h3 className="text-sm font-medium text-white">
              Government Announces New Tax Benefits for First-Time Investors
            </h3>
            <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
            <p className="text-xs text-indigo-400 mb-1">CORPORATE</p>
            <h3 className="text-sm font-medium text-white">
              Reliance Industries Announces Major Expansion in Renewable Energy
            </h3>
            <p className="text-xs text-gray-400 mt-1">Yesterday</p>
          </div>

          <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
            <p className="text-xs text-indigo-400 mb-1">GLOBAL</p>
            <h3 className="text-sm font-medium text-white">US Fed Signals Potential Rate Cuts Later This Year</h3>
            <p className="text-xs text-gray-400 mt-1">Yesterday</p>
          </div>
        </div>
      )}
    </div>
  )
}

