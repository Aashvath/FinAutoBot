export interface LifeEvent {
  id: string
  title: string
  type: string
  explanation: string
  detailedExplanation?: string
  detectedDate: string
  confidence: number
  status: "pending" | "confirmed" | "rejected"
  isManuallyAdded?: boolean
}

export interface Goal {
  id: string
  name: string
  relatedEventTypes: string[]
  targetAmount: number
  timeframe: number
  monthlySIP: number
  allocation: {
    equity: number
    debt: number
    gold: number
    liquid: number
  }
  rationale: string
}

