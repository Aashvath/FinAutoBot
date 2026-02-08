"use client"

import { useState, useEffect } from "react"
import { Bell, HelpCircle, Settings, ChevronDown } from "lucide-react"

export function AppHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "glass-effect shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6V18M18 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-300">
                FinanceIQ
              </span>
            </div>

            <nav className="hidden md:flex ml-10 space-x-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 font-medium">
                Dashboard
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200 font-medium">
                Investments
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200 font-medium">
                Goals
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors duration-200 font-medium">
                Analytics
              </a>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-indigo-900/30 transition-colors duration-200 relative">
              <Bell className="h-5 w-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>

            <button className="p-2 rounded-full hover:bg-indigo-900/30 transition-colors duration-200">
              <HelpCircle className="h-5 w-5 text-gray-300" />
            </button>

            <button className="p-2 rounded-full hover:bg-indigo-900/30 transition-colors duration-200">
              <Settings className="h-5 w-5 text-gray-300" />
            </button>

            <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-gray-700">
              <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-white font-medium">
                RS
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-200">Rahul</span>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

