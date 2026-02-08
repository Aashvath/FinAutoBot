"use client"

import type React from "react"

import { useState } from "react"
import type { LifeEvent } from "@/lib/types"
import { X, Calendar, FileText, Type, List, ChevronDown } from "lucide-react"

interface AddEventFormProps {
  onSubmit: (event: Omit<LifeEvent, "id">) => void
  onCancel: () => void
}

export function AddEventForm({ onSubmit, onCancel }: AddEventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "jobChange",
    explanation: "",
    detailedExplanation: "",
    detectedDate: new Date().toISOString().split("T")[0],
    confidence: 0, // Set to 0 to indicate manually added event
    isManuallyAdded: true, // Add flag to indicate manually added event
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "confidence" ? Number.parseInt(value) : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const nextStep = () => {
    setCurrentStep(Math.min(currentStep + 1, totalSteps))
  }

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1))
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "newBaby":
        return (
          <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 12H15M12 9V15M12 3C19.2 3 21 4.8 21 12C21 19.2 19.2 21 12 21C4.8 21 3 19.2 3 12C3 4.8 4.8 3 12 3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "jobChange":
        return (
          <svg className="h-6 w-6 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "wedding":
        return (
          <svg className="h-6 w-6 text-pink-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
              fill="currentColor"
            />
          </svg>
        )
      case "homePurchase":
        return (
          <svg className="h-6 w-6 text-green-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12H15V22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return (
          <svg className="h-6 w-6 text-yellow-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
          Add Life Event
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > index + 1
                    ? "bg-indigo-600 text-white"
                    : currentStep === index + 1
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-600/20"
                      : "bg-gray-800 text-gray-400"
                } transition-all duration-300`}
              >
                {currentStep > index + 1 ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5 12L10 17L19 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    currentStep > index + 1 ? "bg-indigo-600" : "bg-gray-800"
                  } transition-all duration-300`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={`space-y-4 transition-all duration-300 ${currentStep === 1 ? "block" : "hidden"}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900/30 flex items-center justify-center">
              <Type className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Basic Information</h3>
            <p className="text-sm text-gray-400 mt-1">Let's start with the basic details of your life event</p>
          </div>

          <div className="relative">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="block w-full rounded-lg border-gray-700 bg-gray-800/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white text-sm px-4 py-2.5 pl-10"
              placeholder="e.g., New Job at Google"
            />
            <div className="absolute left-3 top-9">
              <Type className="h-4 w-4 text-gray-500" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
              Event Type
            </label>
            <div className="relative">
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-700 bg-gray-800/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white text-sm px-4 py-2.5 pl-10 appearance-none"
              >
                <option value="newBaby">New Baby</option>
                <option value="jobChange">Job Change</option>
                <option value="wedding">Wedding</option>
                <option value="homePurchase">Home Purchase</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute left-3 top-2.5">
                <List className="h-4 w-4 text-gray-500" />
              </div>
              <div className="absolute right-3 top-2.5 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="detectedDate" className="block text-sm font-medium text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              id="detectedDate"
              name="detectedDate"
              value={formData.detectedDate}
              onChange={handleChange}
              className="block w-full rounded-lg border-gray-700 bg-gray-800/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white text-sm px-4 py-2.5 pl-10"
            />
            <div className="absolute left-3 top-9">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        <div className={`space-y-4 transition-all duration-300 ${currentStep === 2 ? "block" : "hidden"}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900/30 flex items-center justify-center">
              <FileText className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Event Details</h3>
            <p className="text-sm text-gray-400 mt-1">Tell us more about this life event</p>
          </div>

          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-300 mb-1">
              Brief Explanation
            </label>
            <textarea
              id="explanation"
              name="explanation"
              rows={2}
              value={formData.explanation}
              onChange={handleChange}
              placeholder="Briefly describe what happened"
              className="block w-full rounded-lg border-gray-700 bg-gray-800/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white text-sm px-4 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="detailedExplanation" className="block text-sm font-medium text-gray-300 mb-1">
              Detailed Explanation
            </label>
            <textarea
              id="detailedExplanation"
              name="detailedExplanation"
              rows={4}
              value={formData.detailedExplanation}
              onChange={handleChange}
              placeholder="Provide more details about this life event and how it might affect your finances"
              className="block w-full rounded-lg border-gray-700 bg-gray-800/50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white text-sm px-4 py-2.5"
            />
          </div>
        </div>

        <div className={`space-y-4 transition-all duration-300 ${currentStep === 3 ? "block" : "hidden"}`}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900/30 flex items-center justify-center">
              {getEventIcon(formData.type)}
            </div>
            <h3 className="text-lg font-medium text-white">Review & Confirm</h3>
            <p className="text-sm text-gray-400 mt-1">Please review your life event details</p>
          </div>

          <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-900/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Event Title</p>
                <p className="text-sm font-medium text-white">{formData.title || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Event Type</p>
                <p className="text-sm font-medium text-white">
                  {formData.type === "newBaby"
                    ? "New Baby"
                    : formData.type === "jobChange"
                      ? "Job Change"
                      : formData.type === "wedding"
                        ? "Wedding"
                        : formData.type === "homePurchase"
                          ? "Home Purchase"
                          : "Other"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-sm font-medium text-white">{formData.detectedDate}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-400">Brief Explanation</p>
              <p className="text-sm text-white">{formData.explanation || "Not provided"}</p>
            </div>

            <div className="mt-4">
              <p className="text-xs text-gray-400">Detailed Explanation</p>
              <p className="text-sm text-white">{formData.detailedExplanation || "Not provided"}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-indigo-900/20 border border-indigo-900/30">
            <p className="text-sm text-gray-300">
              After adding this life event, you'll be able to confirm it and select financial goals related to this
              event.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-all duration-300"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-all duration-300"
            >
              Cancel
            </button>
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300"
            >
              Add Event
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

