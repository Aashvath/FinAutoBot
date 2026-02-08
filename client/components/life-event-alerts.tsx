"use client"

import { useState, useMemo } from "react"
import { BabyIcon, Briefcase, Heart, Home, Plus, AlertTriangle, Info, ChevronRight } from "lucide-react"
import type { LifeEvent } from "@/lib/types"

interface LifeEventAlertsProps {
  events: LifeEvent[]
  onConfirm: (eventId: string) => void
  onReject: (eventId: string) => void
  onViewDetails: (event: LifeEvent) => void
  onAddEvent: () => void
  detectedEventInfo?: { eventName: string, reasoning: string }
}

export function LifeEventAlerts({ events, onConfirm, onReject, onViewDetails, onAddEvent, detectedEventInfo }: LifeEventAlertsProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const displayEvents = useMemo(() => {
    if (!detectedEventInfo) return events;
    
    const typeMapping: Record<string, string> = {
      "newBaby": "newBaby",
      "jobChange": "jobChange",
      "wedding": "wedding",
      "homePurchase": "homePurchase"
    };
    
    const detectedType = typeMapping[detectedEventInfo.eventName] || detectedEventInfo.eventName;
    
    const eventsOfDetectedType = events.filter(event => event.type === detectedType);
    
    const detectedFromBankStatement = eventsOfDetectedType.find(event => 
      event.detailedExplanation?.includes(detectedEventInfo.reasoning)
    );
    
    if (detectedFromBankStatement) {
      return [detectedFromBankStatement];
    }
    
    const otherEvents = events.filter(event => event.type !== detectedType);
    
    const latestEvent = eventsOfDetectedType
      .filter(event => !event.isManuallyAdded)
      .sort((a, b) => {
        return new Date(b.detectedDate).getTime() - new Date(a.detectedDate).getTime();
      })[0];
    
    return latestEvent ? [...otherEvents, latestEvent] : otherEvents;
  }, [events, detectedEventInfo]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "newBaby":
        return <BabyIcon className="h-6 w-6 text-blue-400" />
      case "jobChange":
        return <Briefcase className="h-6 w-6 text-purple-400" />
      case "wedding":
        return <Heart className="h-6 w-6 text-pink-400" />
      case "homePurchase":
        return <Home className="h-6 w-6 text-green-400" />
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />
    }
  }

  const getEventBackground = (type: string) => {
    switch (type) {
      case "newBaby":
        return "bg-blue-900/20 border-blue-900/30 hover:bg-blue-900/30"
      case "jobChange":
        return "bg-purple-900/20 border-purple-900/30 hover:bg-purple-900/30"
      case "wedding":
        return "bg-pink-900/20 border-pink-900/30 hover:bg-pink-900/30"
      case "homePurchase":
        return "bg-green-900/20 border-green-900/30 hover:bg-green-900/30"
      default:
        return "bg-yellow-900/20 border-yellow-900/30 hover:bg-yellow-900/30"
    }
  }

  const toggleExpand = (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null)
    } else {
      setExpandedEvent(eventId)
    }
  }

  return (
    <div className="glass-effect shadow-lg rounded-xl border border-indigo-900/30 overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-indigo-900/30 flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">
          {detectedEventInfo ? "Detected Event" : "Life Event Alerts"}
        </h2>
        <button
          onClick={onAddEvent}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-indigo-500/30"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </button>
      </div>

      <div className="p-4 space-y-4">
        {displayEvents.map((event, index) => (
          <div
            key={event.id}
            className={`border rounded-lg overflow-hidden transition-all duration-300 ${
              event.status === "confirmed"
                ? "border-green-600/50 bg-green-900/10 shadow-md shadow-green-900/20"
                : event.status === "rejected"
                  ? "border-red-800/30 bg-red-900/10 opacity-60"
                  : `border ${getEventBackground(event.type)}`
            } animate-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-4 cursor-pointer" onClick={() => toggleExpand(event.id)}>
              <div className="flex items-start">
                <div
                  className={`flex-shrink-0 p-2 rounded-full ${
                    event.status === "confirmed"
                      ? "bg-green-900/30"
                      : event.status === "rejected"
                        ? "bg-red-900/30"
                        : "bg-indigo-900/30"
                  }`}
                >
                  {getEventIcon(event.type)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-md font-medium text-white">{event.title}</h3>
                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${expandedEvent === event.id ? "rotate-90" : ""}`}
                    />
                  </div>
                  <div className="mt-1 flex items-center">
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
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedEvent === event.id ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="px-4 pb-4">
                <div className="pl-12 border-l-2 border-indigo-900/30 ml-2">
                  <p className="mt-2 text-sm text-gray-300">{event.explanation}</p>

                  <div className="mt-4 flex space-x-3">
                    {event.status === "pending" && (
                      <>
                        <button
                          onClick={() => onConfirm(event.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 shadow-sm hover:shadow-green-900/30"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => onReject(event.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-700 rounded-md text-xs font-medium text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-all duration-300"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onViewDetails(event)}
                      className="inline-flex items-center px-3 py-1.5 border border-indigo-900/30 rounded-md text-xs font-medium text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 transition-all duration-300"
                    >
                      <Info className="h-3.5 w-3.5 mr-1" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {displayEvents.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-900/30 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-gray-400">
              {detectedEventInfo 
                ? "No matching events detected from your bank statement" 
                : "No life events detected yet"}
            </p>
            <button
              onClick={onAddEvent}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

