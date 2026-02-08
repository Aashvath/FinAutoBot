import type { LifeEvent, Goal } from "./types"

export const sampleLifeEvents: LifeEvent[] = [
  {
    id: "event-1",
    title: "New Baby",
    type: "newBaby",
    explanation: "Spending on baby products increased 3x last month. Multiple purchases from baby stores detected.",
    detailedExplanation:
      "Our analysis detected a significant increase in spending at baby stores like FirstCry and BabyOye over the past 45 days. Additionally, we noticed multiple searches for baby products and parenting websites in your browsing history. These patterns strongly suggest you've recently welcomed a new baby or are preparing for one soon.",
    detectedDate: "2023-11-15",
    confidence: 85,
    status: "pending",
  },
  {
    id: "event-2",
    title: "Job Change",
    type: "jobChange",
    explanation: "Salary deposit pattern changed. New employer name detected in transactions.",
    detailedExplanation:
      "We noticed your regular salary deposit from ABC Corp stopped in October, and a new deposit from XYZ Technologies appeared in November. We also detected expenses related to new work equipment and professional attire. These changes strongly indicate you've recently changed jobs.",
    detectedDate: "2023-12-01",
    confidence: 92,
    status: "pending",
  },
  {
    id: "event-3",
    title: "Wedding Planning",
    type: "wedding",
    explanation: "Multiple payments to wedding venues and services detected in the last 2 months.",
    detailedExplanation:
      "Over the past 60 days, we've detected multiple payments to wedding venues, caterers, and jewelry stores. Your search history also shows increased activity on wedding planning websites. These patterns strongly suggest you're planning a wedding in the near future.",
    detectedDate: "2023-10-22",
    confidence: 78,
    status: "pending",
  },
  {
    id: "event-4",
    title: "Home Purchase",
    type: "homePurchase",
    explanation: "Large down payment transaction detected. Recurring mortgage payments started.",
    detailedExplanation:
      "We detected a significant outflow of ₹15,00,000 to a property developer on September 5th, followed by the start of monthly payments labeled 'Home Loan EMI' to HDFC Bank. Your browsing history also shows searches for home furnishings and interior design. These patterns strongly indicate you've recently purchased a home.",
    detectedDate: "2023-09-05",
    confidence: 95,
    status: "pending",
  },
]

export const sampleGoals: Goal[] = [
  {
    id: "goal-1",
    name: "Child Education Fund",
    relatedEventTypes: ["newBaby"],
    targetAmount: 2000000,
    timeframe: 15,
    monthlySIP: 5500,
    allocation: {
      equity: 70,
      debt: 20,
      gold: 5,
      liquid: 5,
    },
    rationale:
      "With a 15-year horizon for education expenses, we've allocated more to equity for long-term growth while maintaining some stability through debt and gold.",
  },
  {
    id: "goal-2",
    name: "Emergency Fund for Family",
    relatedEventTypes: ["newBaby", "wedding", "homePurchase"],
    targetAmount: 600000,
    timeframe: 2,
    monthlySIP: 24000,
    allocation: {
      equity: 20,
      debt: 40,
      gold: 10,
      liquid: 30,
    },
    rationale:
      "For your emergency fund with a 2-year timeline, we've focused on stability with higher debt and liquid allocations while maintaining some growth potential.",
  },
  {
    id: "goal-3",
    name: "Home Down Payment",
    relatedEventTypes: ["wedding", "jobChange"],
    targetAmount: 1500000,
    timeframe: 3,
    monthlySIP: 38000,
    allocation: {
      equity: 40,
      debt: 40,
      gold: 10,
      liquid: 10,
    },
    rationale:
      "For your home down payment goal with a 3-year timeline, we've balanced growth and stability with equal equity and debt allocations.",
  },
  {
    id: "goal-4",
    name: "Career Sabbatical Fund",
    relatedEventTypes: ["jobChange"],
    targetAmount: 800000,
    timeframe: 2,
    monthlySIP: 32000,
    allocation: {
      equity: 30,
      debt: 40,
      gold: 10,
      liquid: 20,
    },
    rationale:
      "For your career sabbatical fund with a 2-year timeline, we've prioritized stability with higher debt and liquid allocations to ensure funds are available when needed.",
  },
  {
    id: "goal-5",
    name: "Wedding Expenses",
    relatedEventTypes: ["wedding"],
    targetAmount: 1200000,
    timeframe: 1,
    monthlySIP: 95000,
    allocation: {
      equity: 10,
      debt: 50,
      gold: 10,
      liquid: 30,
    },
    rationale:
      "With a short 1-year timeline for wedding expenses, we've focused heavily on capital preservation with high debt and liquid allocations.",
  },
  {
    id: "goal-6",
    name: "Home Renovation",
    relatedEventTypes: ["homePurchase"],
    targetAmount: 500000,
    timeframe: 1,
    monthlySIP: 40000,
    allocation: {
      equity: 15,
      debt: 45,
      gold: 10,
      liquid: 30,
    },
    rationale:
      "For your home renovation goal with a 1-year timeline, we've prioritized capital preservation with higher debt and liquid allocations.",
  },
]

