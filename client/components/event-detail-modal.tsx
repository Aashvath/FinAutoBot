"use client"

import { useState } from "react"
import type { LifeEvent } from "@/lib/types"
import { X, BabyIcon, Briefcase, Heart, Home, AlertTriangle, Check, ChevronRight } from "lucide-react"

interface EventDetailModalProps {
  event: LifeEvent
  onClose: () => void
  onConfirm: () => void
}

export function EventDetailModal({ event, onClose, onConfirm }: EventDetailModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const getEventIcon = (type: string) => {
    switch (type) {
      case "newBaby":
        return <BabyIcon className="h-8 w-8 text-blue-400" />
      case "jobChange":
        return <Briefcase className="h-8 w-8 text-purple-400" />
      case "wedding":
        return <Heart className="h-8 w-8 text-pink-400" />
      case "homePurchase":
        return <Home className="h-8 w-8 text-green-400" />
      default:
        return <AlertTriangle className="h-8 w-8 text-yellow-400" />
    }
  }

  const getEventBackground = (type: string) => {
    switch (type) {
      case "newBaby":
        return "bg-blue-900/30"
      case "jobChange":
        return "bg-purple-900/30"
      case "wedding":
        return "bg-pink-900/30"
      case "homePurchase":
        return "bg-green-900/30"
      default:
        return "bg-yellow-900/30"
    }
  }

  const handleConfirm = () => {
    setIsConfirming(true)

    // Simulate a short delay for animation
    setTimeout(() => {
      onConfirm()
    }, 800)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
          {event.title}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center mb-6">
        <div className={`p-4 rounded-full ${getEventBackground(event.type)} mr-4 animate-pulse-slow`}>
          {getEventIcon(event.type)}
        </div>
        <div>
          <div className="flex items-center">
            <span className="text-sm text-gray-400">
              {event.isManuallyAdded ? "Added" : "Detected"} {event.detectedDate}
            </span>
            {event.confidence > 0 && !event.isManuallyAdded && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-200 border border-blue-800/30">
                {event.confidence}% confidence
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-indigo-900/20 rounded-lg border border-indigo-900/30 animate-fade-in">
        <h3 className="text-sm font-medium text-indigo-300 mb-2">Detection Details</h3>
        <p className="text-sm text-gray-300">{event.detailedExplanation || event.explanation}</p>
      </div>

      <div
        className="mt-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-900/30 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <h3 className="text-sm font-medium text-indigo-300 mb-2 flex items-center">
          <ChevronRight className="h-4 w-4 mr-1 text-indigo-400" />
          What happens next?
        </h3>
        <p className="text-sm text-gray-300">
          Confirming this life event will help us create a personalized financial plan tailored to your needs. You'll be
          able to select specific goals related to this event and receive customized investment recommendations.
        </p>
      </div>

      <div
        className="mt-6 p-4 bg-indigo-900/20 rounded-lg border border-indigo-900/30 animate-fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <h3 className="text-sm font-medium text-indigo-300 mb-2 flex items-center">
          <ChevronRight className="h-4 w-4 mr-1 text-indigo-400" />
          Financial Impact
        </h3>
        <p className="text-sm text-gray-300">
          This life event may have significant financial implications. By confirming it, our AI will analyze how it
          affects your long-term financial goals and suggest appropriate investment strategies.
        </p>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-all duration-300"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
            isConfirming
              ? "bg-green-600 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600"
          } transition-all duration-300`}
        >
          {isConfirming ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Confirm Event
            </>
          )}
        </button>
      </div>
    </div>
  )
}

