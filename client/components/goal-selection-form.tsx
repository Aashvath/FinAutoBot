"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { LifeEvent, Goal } from "@/lib/types"
import { X, Plus, Minus, Info, ChevronRight, Target, Clock, DollarSign, Percent, Type, AlertCircle } from "lucide-react"
import { getRecommendations } from "@/lib/api"

interface GoalSelectionFormProps {
  event: LifeEvent
  availableGoals: Goal[]
  onSubmit: (goals: Goal[]) => void
  onCancel: () => void
  userId: string
  riskProfile: "aggressive" | "moderate" | "conservative"
  monthlySurplus: number
  detectedEventInfo?: { eventName: string, reasoning: string }
}

export function GoalSelectionForm({ event, availableGoals, onSubmit, onCancel, userId, riskProfile, monthlySurplus, detectedEventInfo }: GoalSelectionFormProps) {
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
  const [customGoals, setCustomGoals] = useState<Omit<Goal, "id">[]>([])
  const [adjustedGoals, setAdjustedGoals] = useState<Record<string, { targetAmount: number; timeframe: number }>>({})
  const [animatedGoals, setAnimatedGoals] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Interest rate used for SIP calculations (12% annual)
  const annualInterestRate = 12
  const monthlyRate = annualInterestRate / 100 / 12

  const filteredGoals = availableGoals.filter((goal) => goal.relatedEventTypes.includes(event.type))

  useEffect(() => {
    // Animate goals one by one with a delay
    filteredGoals.forEach((goal, index) => {
      setTimeout(() => {
        setAnimatedGoals((prev) => [...prev, goal.id])
      }, index * 200)
    })
  }, [filteredGoals])

  const handleGoalToggle = (goalId: string) => {
    if (selectedGoalIds.includes(goalId)) {
      setSelectedGoalIds(selectedGoalIds.filter((id) => id !== goalId))

      // Remove adjustments when goal is deselected
      const newAdjustedGoals = { ...adjustedGoals }
      delete newAdjustedGoals[goalId]
      setAdjustedGoals(newAdjustedGoals)
    } else {
      setSelectedGoalIds([...selectedGoalIds, goalId])

      // Initialize adjustments with default values
      const goal = availableGoals.find((g) => g.id === goalId)
      if (goal) {
        setAdjustedGoals({
          ...adjustedGoals,
          [goalId]: {
            targetAmount: goal.targetAmount,
            timeframe: goal.timeframe,
          },
        })
      }
    }
  }

  const handleGoalAdjustment = (goalId: string, field: "targetAmount" | "timeframe", value: number) => {
    setAdjustedGoals({
      ...adjustedGoals,
      [goalId]: {
        ...adjustedGoals[goalId],
        [field]: value,
      },
    })
  }

  // Calculate SIP amount based on target amount, timeframe and interest rate
  const calculateSIP = (targetAmount: number, timeframeYears: number) => {
    const months = timeframeYears * 12
    // Formula: P = A / [(1 + r)^n - 1] * (1 + r)^(1/12) / r
    // Simplified for our use case
    const monthlySIP = Math.round(targetAmount / (months * (1 + monthlyRate)))
    return monthlySIP
  }

  const handleAddCustomGoal = () => {
    setCustomGoals([
      ...customGoals,
      {
        name: "",
        relatedEventTypes: [event.type],
        targetAmount: 100000,
        timeframe: 3,
        monthlySIP: calculateSIP(100000, 3),
        allocation: { equity: 60, debt: 30, gold: 5, liquid: 5 },
        rationale: "Personalized allocation based on your risk profile and timeline.",
      },
    ])
  }

  const handleCustomGoalChange = (index: number, field: string, value: any) => {
    const updatedGoals = [...customGoals]
    updatedGoals[index] = {
      ...updatedGoals[index],
      [field]:
        field === "targetAmount" || field === "timeframe" || field === "monthlySIP" ? Number.parseInt(value) : value,
    }

    // Recalculate SIP amount when target amount or timeframe changes
    if (field === "targetAmount" || field === "timeframe") {
      const targetAmount = field === "targetAmount" ? Number.parseInt(value) : updatedGoals[index].targetAmount
      const timeframe = field === "timeframe" ? Number.parseInt(value) : updatedGoals[index].timeframe

      updatedGoals[index].monthlySIP = calculateSIP(targetAmount, timeframe)
    }

    setCustomGoals(updatedGoals)
  }

  const handleRemoveCustomGoal = (index: number) => {
    const updatedGoals = [...customGoals]
    updatedGoals.splice(index, 1)
    setCustomGoals(updatedGoals)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Apply adjustments to selected goals
      const selectedGoals = availableGoals
        .filter((goal) => selectedGoalIds.includes(goal.id))
        .map((goal) => {
          if (adjustedGoals[goal.id]) {
            const { targetAmount, timeframe } = adjustedGoals[goal.id]
            return {
              ...goal,
              targetAmount,
              timeframe,
              monthlySIP: calculateSIP(targetAmount, timeframe),
            }
          }
          return goal
        })

      const finalCustomGoals = customGoals.map((goal, index) => ({
        ...goal,
        id: `custom-goal-${index}`,
      }))

      const allGoals = [...selectedGoals, ...finalCustomGoals]

      // Call recommendation API
      await getRecommendations({
        user_id: userId,
        risk_profile: riskProfile,
        monthly_surplus: monthlySurplus,
        goals: allGoals.map(goal => ({
          goal_name: goal.name,
          target_amount: goal.targetAmount,
          target_years: goal.timeframe
        }))
      });

      onSubmit(allGoals)
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to get recommendations. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEventBackground = (type: string) => {
    switch (type) {
      case "newBaby":
        return "bg-blue-900/20 border-blue-800/30"
      case "jobChange":
        return "bg-purple-900/20 border-purple-800/30"
      case "wedding":
        return "bg-pink-900/20 border-pink-800/30"
      case "homePurchase":
        return "bg-green-900/20 border-green-800/30"
      default:
        return "bg-indigo-900/20 border-indigo-800/30"
    }
  }

  // Get a human-readable event name
  const getEventName = (type: string) => {
    switch (type) {
      case "newBaby":
        return "new baby";
      case "jobChange":
        return "job change";
      case "wedding":
        return "wedding";
      case "homePurchase":
        return "home purchase";
      default:
        return "life event";
    }
  };

  // Get a formatted event title
  const getEventTitle = (type: string) => {
    switch (type) {
      case "newBaby":
        return "New Baby";
      case "jobChange":
        return "Job Change";
      case "wedding":
        return "Wedding";
      case "homePurchase":
        return "Home Purchase";
      default:
        return "Life Event";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onCancel}
        className="absolute top-0 right-0 text-gray-400 hover:text-white"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 mb-2">
          {getEventTitle(event.type)} - Goal Selection
        </h2>
        
        {detectedEventInfo && detectedEventInfo.eventName && (
          <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-800/50 mt-3 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-indigo-300 mb-1">Detection Details</h3>
                <p className="text-sm text-gray-300">{detectedEventInfo.reasoning}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-gray-400 text-sm">
          Select financial goals related to your {getEventName(event.type)} and adjust them as needed.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getEventBackground(event.type)} animate-fade-in`}>
            <p className="text-sm text-gray-300 flex items-center">
              <ChevronRight className="h-4 w-4 mr-1 text-indigo-400 flex-shrink-0" />
              Select one or more financial goals related to this life event
            </p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedGoalIds.includes(goal.id)
                    ? "border-indigo-500 bg-indigo-900/20 shadow-md shadow-indigo-900/30"
                    : "border-gray-700 hover:border-indigo-600/50 bg-gray-800/30"
                } ${animatedGoals.includes(goal.id) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                <div className="flex items-center" onClick={() => handleGoalToggle(goal.id)}>
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                      selectedGoalIds.includes(goal.id) ? "bg-indigo-600 border-indigo-600" : "border-gray-500"
                    }`}
                  >
                    {selectedGoalIds.includes(goal.id) && (
                      <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-white">{goal.name}</span>
                </div>

                {selectedGoalIds.includes(goal.id) && (
                  <div className="mt-4 pt-3 border-t border-gray-700 animate-fade-in">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-400 flex items-center">
                          <Target className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                          Target Amount: ₹
                          {adjustedGoals[goal.id]?.targetAmount.toLocaleString() || goal.targetAmount.toLocaleString()}
                        </label>
                      </div>
                      <input
                        type="range"
                        min={Math.round(goal.targetAmount * 0.5)}
                        max={Math.round(goal.targetAmount * 2)}
                        step={10000}
                        value={adjustedGoals[goal.id]?.targetAmount || goal.targetAmount}
                        onChange={(e) => handleGoalAdjustment(goal.id, "targetAmount", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-400 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                          Timeframe: {adjustedGoals[goal.id]?.timeframe || goal.timeframe} years
                        </label>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={adjustedGoals[goal.id]?.timeframe || goal.timeframe}
                        onChange={(e) => handleGoalAdjustment(goal.id, "timeframe", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="p-3 bg-indigo-900/30 rounded-lg border border-indigo-800/30">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <DollarSign className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                          <span className="text-xs text-gray-300">Estimated Monthly SIP:</span>
                        </div>
                        <span className="text-sm font-medium text-indigo-300">
                          ₹
                          {calculateSIP(
                            adjustedGoals[goal.id]?.targetAmount || goal.targetAmount,
                            adjustedGoals[goal.id]?.timeframe || goal.timeframe,
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedGoalIds.includes(goal.id) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                    <span className="flex items-center">
                      <Target className="h-3 w-3 mr-1 text-indigo-400" />₹{goal.targetAmount.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-indigo-400" />
                      {goal.timeframe} years
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-4 mt-4">
            <button
              type="button"
              onClick={handleAddCustomGoal}
              className="inline-flex items-center px-3 py-1.5 border border-indigo-900/30 rounded-lg text-sm font-medium text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Custom Goal
            </button>
          </div>

          {customGoals.length > 0 && (
            <div className="space-y-4 mt-4">
              <h3 className="text-sm font-medium text-white flex items-center">
                <ChevronRight className="h-4 w-4 mr-1 text-indigo-400" />
                Custom Goals
              </h3>

              {customGoals.map((goal, index) => (
                <div
                  key={index}
                  className="p-4 border border-indigo-900/30 rounded-lg bg-indigo-900/20 animate-fade-in"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="mb-3">
                        <label
                          htmlFor={`goal-name-${index}`}
                          className="block text-xs font-medium text-gray-400 flex items-center"
                        >
                          <Type className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                          Goal Name
                        </label>
                        <input
                          type="text"
                          id={`goal-name-${index}`}
                          value={goal.name}
                          onChange={(e) => handleCustomGoalChange(index, "name", e.target.value)}
                          placeholder="e.g., Home Down Payment"
                          className="mt-1 block w-full rounded-lg border-gray-700 bg-gray-800/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white text-sm px-3 py-1.5"
                        />
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-gray-400 flex items-center">
                            <Target className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                            Target Amount: ₹{goal.targetAmount.toLocaleString()}
                          </label>
                        </div>
                        <input
                          type="range"
                          min={50000}
                          max={5000000}
                          step={10000}
                          value={goal.targetAmount}
                          onChange={(e) => handleCustomGoalChange(index, "targetAmount", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-medium text-gray-400 flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                            Timeframe: {goal.timeframe} years
                          </label>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={30}
                          value={goal.timeframe}
                          onChange={(e) => handleCustomGoalChange(index, "timeframe", e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <label className="block text-xs font-medium text-gray-400 flex items-center">
                              <Percent className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                              Estimated Monthly SIP
                            </label>
                            <div className="relative ml-1 group">
                              <Info className="h-3 w-3 text-gray-500 cursor-help" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 rounded text-xs text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                                Calculated using {annualInterestRate}% annual interest rate
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-indigo-300">
                            ₹{goal.monthlySIP.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCustomGoal(index)}
                      className="ml-2 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={selectedGoalIds.length === 0 && customGoals.length === 0 || isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              (selectedGoalIds.length > 0 || customGoals.length > 0) && !isSubmitting
                ? "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300"
                : "bg-indigo-600/50 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Getting Recommendations..." : "Continue"}
          </button>
        </div>
      </form>
    </div>
  )
}

