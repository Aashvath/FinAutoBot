"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Clock, Target, ChevronDown, Zap, Shield, BarChart3, Loader } from "lucide-react"
import type { LifeEvent, Goal } from "@/lib/types"

interface PortfolioRecommendationProps {
  goals: Goal[]
  event: LifeEvent | null
  apiRecommendations?: any
  isLoading?: boolean
}

export function PortfolioRecommendation({ goals, event, apiRecommendations, isLoading = false }: PortfolioRecommendationProps) {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [animatedGoals, setAnimatedGoals] = useState<string[]>([])

  useEffect(() => {
    // Animate goals one by one with a delay
    const timer = setTimeout(() => {
      goals.forEach((goal, index) => {
        setTimeout(() => {
          setAnimatedGoals((prev) => [...prev, goal.id])
        }, index * 300)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [goals])

  const toggleExpand = (goalId: string) => {
    if (expandedGoal === goalId) {
      setExpandedGoal(null)
    } else {
      setExpandedGoal(goalId)
    }
  }

  const getGoalGradient = (type: string) => {
    switch (type) {
      case "newBaby":
        return "card-gradient-blue"
      case "jobChange":
        return "card-gradient-purple"
      case "wedding":
        return "card-gradient-gold"
      case "homePurchase":
        return "card-gradient-green"
      default:
        return "card-gradient"
    }
  }

  const getGoalGlow = (type: string) => {
    switch (type) {
      case "newBaby":
        return "glow"
      case "jobChange":
        return "glow-purple"
      case "wedding":
        return "glow-gold"
      case "homePurchase":
        return "glow-green"
      default:
        return "glow"
    }
  }

  // Function to find API recommendation for a goal
  const findApiRecommendation = (goalName: string) => {
    if (!apiRecommendations || !apiRecommendations.goals) return null
    
    return apiRecommendations.goals.find((rec: any) => 
      rec.goal_name.toLowerCase() === goalName.toLowerCase()
    )
  }

  return (
    <div className="glass-effect shadow-lg rounded-xl border border-indigo-900/30 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-indigo-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
              Your Personalized Investment Plan
            </h2>
            {event && <p className="text-sm text-gray-400 mt-1">Based on your confirmed {event.title} event</p>}
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="text-xs text-gray-400">Total Monthly SIP:</div>
            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">
              {isLoading ? (
                <Loader className="h-5 w-5 text-indigo-400 animate-spin" />
              ) : apiRecommendations ? (
                `₹${apiRecommendations.goals.reduce((total: number, goal: any) => total + goal.recommended_sip, 0).toLocaleString()}`
              ) : (
                `₹${goals.reduce((total, goal) => total + goal.monthlySIP, 0).toLocaleString()}`
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center">
          <Loader className="h-12 w-12 text-indigo-400 animate-spin mb-4" />
          <p className="text-indigo-200">Generating your personalized investment plan...</p>
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {goals.map((goal) => {
            // Get API recommendation for this goal if available
            const apiRec = findApiRecommendation(goal.name)
            
            // Extract allocation values
            let allocation = goal.allocation
            let monthlySIP = goal.monthlySIP
            let rationale = goal.rationale
            
            // If API data is available, use it instead
            if (apiRec) {
              allocation = {
                equity: Math.round(apiRec.adjusted_allocation.equity * 100),
                debt: Math.round(apiRec.adjusted_allocation.debt * 100),
                gold: Math.round(apiRec.adjusted_allocation.gold * 100),
                liquid: Math.round(apiRec.adjusted_allocation.liquid * 100),
              }
              monthlySIP = apiRec.recommended_sip
              rationale = apiRec.rationale
            }
            
            return (
              <div
                key={goal.id}
                className={`border border-indigo-900/30 rounded-xl overflow-hidden transition-all duration-500 ${getGoalGradient(event?.type || "")} ${
                  expandedGoal === goal.id ? `${getGoalGlow(event?.type || "")}` : ""
                } ${animatedGoals.includes(goal.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <div className="p-5 cursor-pointer" onClick={() => toggleExpand(goal.id)}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        {goal.name}
                        <ChevronDown
                          className={`ml-2 h-5 w-5 text-indigo-400 transition-transform duration-300 ${
                            expandedGoal === goal.id ? "rotate-180" : ""
                          }`}
                        />
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-2">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-indigo-400 mr-1.5" />
                          <span className="text-sm text-gray-300">
                            ₹{apiRec ? apiRec.target_amount.toLocaleString() : goal.targetAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-indigo-400 mr-1.5" />
                          <span className="text-sm text-gray-300">
                            {apiRec ? apiRec.target_horizon_years : goal.timeframe} years
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                      <div className="text-sm text-gray-400">Recommended Monthly SIP</div>
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">
                        ₹{monthlySIP.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    expandedGoal === goal.id ? "max-h-[800px]" : "max-h-0"
                  }`}
                >
                  <div className="px-5 pb-5 space-y-4">
                    <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-900/30">
                      <h4 className="text-sm font-medium text-indigo-300 mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-1.5 text-yellow-400" />
                        Investment Rationale
                      </h4>
                      <p className="text-sm text-gray-300">{rationale}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-900/50 flex items-center justify-center mr-2">
                            <BarChart3 className="h-3 w-3 text-indigo-400" />
                          </div>
                          <div className="text-xs text-gray-400">Equity</div>
                        </div>
                        <div className="text-sm font-medium text-white">{allocation.equity}%</div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-1.5 rounded-full progress-bar"
                            style={{ width: `${allocation.equity}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-green-900/50 flex items-center justify-center mr-2">
                            <Shield className="h-3 w-3 text-green-400" />
                          </div>
                          <div className="text-xs text-gray-400">Debt</div>
                        </div>
                        <div className="text-sm font-medium text-white">{allocation.debt}%</div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-green-500 h-1.5 rounded-full progress-bar"
                            style={{ width: `${allocation.debt}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-900/50 flex items-center justify-center mr-2">
                            <svg className="h-3 w-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                            </svg>
                          </div>
                          <div className="text-xs text-gray-400">Gold</div>
                        </div>
                        <div className="text-sm font-medium text-white">{allocation.gold}%</div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-1.5 rounded-full progress-bar"
                            style={{ width: `${allocation.gold}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-3 bg-indigo-900/20 rounded-lg border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center mr-2">
                            <svg
                              className="h-3 w-3 text-blue-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 7L10 3L21 7M3 7V17L10 21M3 7L10 11M10 21L21 17V7M10 21V11M21 7L10 11"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="text-xs text-gray-400">Liquid</div>
                        </div>
                        <div className="text-sm font-medium text-white">{allocation.liquid}%</div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full progress-bar"
                            style={{ width: `${allocation.liquid}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-900/30">
                      <h4 className="text-sm font-medium text-indigo-300 mb-3">Projected Growth</h4>
                      <div className="h-32">
                        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                          {/* Base area */}
                          <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.5)" />
                              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,100 L0,80 C10,75 20,85 30,80 C40,75 50,65 60,60 C70,55 80,50 90,45 C100,40 110,35 120,30 C130,25 140,20 150,18 C160,16 170,15 180,12 C190,9 200,7 210,5 C220,3 230,2 240,1 C250,0 260,0 270,0 C280,0 290,0 300,0 L300,100 Z"
                            fill="url(#areaGradient)"
                          />

                          {/* Line */}
                          <path
                            d="M0,80 C10,75 20,85 30,80 C40,75 50,65 60,60 C70,55 80,50 90,45 C100,40 110,35 120,30 C130,25 140,20 150,18 C160,16 170,15 180,12 C190,9 200,7 210,5 C220,3 230,2 240,1 C250,0 260,0 270,0 C280,0 290,0 300,0"
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="1000"
                            strokeDashoffset="1000"
                            style={{
                              animation: "dash 2s ease-in-out forwards",
                            }}
                          />

                          {/* Target point */}
                          <circle cx="300" cy="0" r="4" fill="#6366f1" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <div>Today</div>
                        <div>{apiRec ? apiRec.target_horizon_years : goal.timeframe} years</div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-sm text-gray-300">Projected Value</div>
                        <div className="text-lg font-semibold text-indigo-300">
                          ₹{(apiRec ? apiRec.target_amount * 1.1 : goal.targetAmount * 1.1).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg font-medium shadow-lg hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 hover:shadow-indigo-500/30 flex items-center">
                        Start SIP
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

