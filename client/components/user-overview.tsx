"use client"

import { Plus, Menu, X, Upload, TrendingUp, TrendingDown, CreditCard, Wallet } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"

interface UserOverviewProps {
  onAddMember: () => void
  onUploadStatement: () => void
  onToggleMobileMenu: () => void
  isMobileMenuOpen: boolean
  detectedEventInfo?: { eventName: string, reasoning: string }
}

export function UserOverview({
  onAddMember,
  onUploadStatement,
  onToggleMobileMenu,
  isMobileMenuOpen,
  detectedEventInfo
}: UserOverviewProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to get event display name
  const getEventDisplayName = (eventType: string) => {
    switch (eventType) {
      case "newBaby":
        return "New Parent";
      case "jobChange":
        return "Job Transitioning";
      case "wedding":
        return "Planning Wedding";
      case "homePurchase":
        return "Home Buyer";
      default:
        return "Life Event";
    }
  };
  
  // Helper function to get event background style
  const getEventClassName = (eventType: string) => {
    switch (eventType) {
      case "newBaby":
        return "bg-blue-900/40 text-blue-200 border border-blue-700/30";
      case "jobChange":
        return "bg-purple-900/40 text-purple-200 border border-purple-700/30";
      case "wedding":
        return "bg-pink-900/40 text-pink-200 border border-pink-700/30";
      case "homePurchase":
        return "bg-green-900/40 text-green-200 border border-green-700/30";
      default:
        return "bg-yellow-900/40 text-yellow-200 border border-yellow-700/30";
    }
  };

  return (
    <div className="pt-6 pb-4 animate-fade-in">
      <div className="glass-effect shadow-lg rounded-xl p-6 border border-indigo-900/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center">
            <button
              className="mr-4 lg:hidden text-gray-400 hover:text-white transition-colors"
              onClick={onToggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-indigo-900/30 mr-4 border border-indigo-600/30 shadow-lg animate-pulse-slow">
              <Image
                src="/images/indian-profile.png"
                alt="User profile"
                width={64}
                height={64}
                className="object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                Rahul Sharma
              </h1>
              <div className="mt-1 flex flex-wrap gap-2">
                {detectedEventInfo ? (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEventClassName(detectedEventInfo.eventName)} animate-bounce-subtle`}
                  >
                    {getEventDisplayName(detectedEventInfo.eventName)}
                  </span>
                ) : (
                  <>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/40 text-blue-200 border border-blue-700/30 animate-fade-in"
                      style={{ animationDelay: "0.1s" }}
                    >
                      New Parent
                    </span>
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900/40 text-purple-200 border border-purple-700/30 animate-fade-in"
                      style={{ animationDelay: "0.2s" }}
                    >
                      Job Transitioning
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={onUploadStatement}
              className="inline-flex items-center px-4 py-2 border border-indigo-600/30 rounded-lg shadow-sm text-sm font-medium text-indigo-200 bg-indigo-900/30 hover:bg-indigo-900/50 transition-all duration-300 hover:border-indigo-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Statement
            </button>
            <button
              onClick={onAddMember}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Assets</p>
                <p className="text-lg font-semibold text-white">₹24,35,670</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-xs text-green-400">+8.2% this month</span>
            </div>
          </div>

          <div
            className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Investments</p>
                <p className="text-lg font-semibold text-white">₹18,72,450</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-xs text-green-400">+12.5% this month</span>
            </div>
          </div>

          <div
            className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Liabilities</p>
                <p className="text-lg font-semibold text-white">₹8,45,000</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
              <span className="text-xs text-red-400">-2.1% this month</span>
            </div>
          </div>

          <div
            className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-900/30 hover:bg-indigo-900/30 transition-colors animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Net Worth</p>
                <p className="text-lg font-semibold text-white">₹15,90,670</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-purple-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 14.5L12 9.5L16 14.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
              <span className="text-xs text-green-400">+5.7% this month</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-400">Detected Life Events</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-200 border border-yellow-700/30 animate-bounce-subtle">
              Potential Job Change
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-900/40 text-pink-200 border border-pink-700/30 animate-bounce-subtle"
              style={{ animationDelay: "0.5s" }}
            >
              Wedding Detected
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-200 border border-green-700/30 animate-bounce-subtle"
              style={{ animationDelay: "1s" }}
            >
              Home Purchase
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

