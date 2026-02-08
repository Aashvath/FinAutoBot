"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MessageCircle, SendIcon, X } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I help explain insights from your uploaded bank statement and generated financial report.\n\nYou can ask about:\n• Spending patterns\n• Month-wise analysis\n• SIP recommendation\n• Risk and cash-flow signals",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Define common prompt with provided data
  const commonPrompt = `
You are a Financial Report Explanation Assistant.

Your ONLY job is to explain and clarify the user's generated financial report
based strictly on the data provided below.

You are NOT a general finance chatbot.
You must NOT give investment advice, product suggestions, or planning tips
beyond what is explicitly present in the report data.
Strict Adherence to Data:

Only answer questions if the relevant data can be found verbatim or deduced directly from the text provided.

Do not use any external knowledge, assumptions, or interpretations that are not explicitly supported by the data in the text.

Answer Conditions:

If the answer to a query is clearly present within the text, provide a concise, accurate response that references the corresponding data.

If the answer is not directly available or cannot be conclusively deduced from the text, respond with:
"This information isn't available."

Do not attempt to guess or infer any additional context beyond what is given.

Data Boundaries:

The data provided includes several tables on monthly aggregates, monthly category/subcategory aggregates, recurring transaction details, month-to-month changes (both increases and decreases), large single transactions, and a summary.

You must use this entire text as the only source of information for answering queries.

Response Guidelines:

Be precise and to the point, avoiding extraneous commentary or interpretation.

Double-check the provided text to confirm the presence or absence of the required answer.

If a question is ambiguous or lacks sufficient context to match the data exactly, ask for clarification or state that the information is not available.

Tone and Style:

Maintain a neutral and professional tone in your responses.

Ensure that your replies are strictly based on the provided text and do not incorporate any additional knowledge or personal insights.

Below is the data you must use to answer all queries:
If the question is a greeting, respond politely and ask how you can help explain the financial report.
=== MONTHLY AGGREGATES (Overall) [Top 5 Rows] ===
+-------------+-----------+-------------+--------------+--------------+---------------+
| MonthYear   |   Balance |   cat_count |   cat_amount |   cat_inflow |   cat_outflow |
|-------------+-----------+-------------+--------------+--------------+---------------+
| 2025-01     |    -45796 |          35 |       235796 |        75000 |        160796 |
| 2025-02     |   -137695 |          28 |       241899 |        75000 |        166899 |
| 2025-03     |   -170493 |          35 |       182798 |        75000 |        107798 |
| 2025-04     |   -414392 |          41 |       393899 |        75000 |        318899 |
| 2025-05     |   -420790 |          36 |       156398 |        75000 |         81398 |
+-------------+-----------+-------------+--------------+--------------+---------------+

=== MONTHLY CATEGORY/SUBCATEGORY AGGREGATES [Top 5 Rows] ===
+-------------+-----------------------+-------------------------------+----------------+-----------------+-----------------+------------------+
| MonthYear   | Category              | Subcategory                   |   subcat_count |   subcat_amount |   subcat_inflow |   subcat_outflow |
|-------------+-----------------------+-------------------------------+----------------+-----------------+-----------------+------------------+
| 2025-01     | Education & Childcare | Books & Stationery            |              4 |           20000 |               0 |            20000 |
| 2025-01     | Education & Childcare | Uniforms & School Supplies    |              1 |            3000 |               0 |             3000 |
| 2025-01     | Food & Grocery        | Grocery Stores & Supermarkets |              1 |            1800 |               0 |             1800 |
| 2025-01     | Food & Grocery        | Online Grocery Services       |              1 |            2200 |               0 |             2200 |
| 2025-01     | Healthcare & Medical  | Diagnostic & Lab Tests        |              2 |            8000 |               0 |             8000 |
+-------------+-----------------------+-------------------------------+----------------+-----------------+-----------------+------------------+

Recurring Transaction Details (Set Notation): {'Myntra Maternity Wear', 'Apollo Hospital Ultrasound Scan', 'Netflix Subscription', 'Ola Cab Rides', 'Zomato Online Food', 'Apollo Pharmacy Medicines', 'PharmEasy Prenatal Vitamins', 'FirstCry Baby Furniture', 'UrbanClap Home Cleaning', 'FirstCry Baby Essentials', 'SALARY CREDIT FROM INFOSYS', 'Apollo Hospital Prenatal Checkup', 'Swiggy Food Order', 'Apollo Hospital Delivery Charges', 'HDFC Home Loan EMI', 'DMart Supermarket', 'BigBasket Groceries'}

=== RECURRING TRANSACTIONS MONTH-TO-MONTH INCREASES (Exact % Change) ===
+----------------------------------+-------------+---------------+-------------------+-------------+---------------+
| Transaction Detail               | MonthYear   |   DetailCount |   PrevDetailCount |   PctChange | ChangeLabel   |
|----------------------------------+-------------+---------------+-------------------+-------------+---------------+
| DMart Supermarket                | 2025-06     |             4 |                 1 |         300 | 300.0% inc    |
| FirstCry Baby Furniture          | 2025-06     |             4 |                 1 |         300 | 300.0% inc    |
| Apollo Hospital Delivery Charges | 2025-04     |             3 |                 1 |         200 | 200.0% inc    |
| UrbanClap Home Cleaning          | 2025-03     |             3 |                 1 |         200 | 200.0% inc    |
| Apollo Pharmacy Medicines        | 2025-05     |             3 |                 1 |         200 | 200.0% inc    |
+----------------------------------+-------------+---------------+-------------------+-------------+---------------+

=== RECURRING TRANSACTIONS MONTH-TO-MONTH DECREASES (Exact % Change) ===
+--------------------------+-------------+---------------+-------------------+-------------+---------------+
| Transaction Detail       | MonthYear   |   DetailCount |   PrevDetailCount |   PctChange | ChangeLabel   |
|--------------------------+-------------+---------------+-------------------+-------------+---------------+
| Netflix Subscription     | 2025-02     |             1 |                 4 |      -75    | 75.0% dec     |
| HDFC Home Loan EMI       | 2025-05     |             1 |                 4 |      -75    | 75.0% dec     |
| UrbanClap Home Cleaning  | 2025-04     |             1 |                 3 |      -66.67 | 66.67% dec    |
| FirstCry Baby Essentials | 2025-06     |             1 |                 3 |      -66.67 | 66.67% dec    |
| FirstCry Baby Furniture  | 2025-05     |             1 |                 3 |      -66.67 | 66.67% dec    |
+--------------------------+-------------+---------------+-------------------+-------------+---------------+

=== LARGE SINGLE TRANSACTIONS (≥50% of Group Total) [Top 5 Rows] ===
+-------------+-----------------------+-------------------------------+-------------------+---------------------+
| MonthYear   | Category              | Subcategory                   |   LargestTxnRatio | HasLargeSingleTxn   |
|-------------+-----------------------+-------------------------------+-------------------+---------------------+
| 2025-01     | Education & Childcare | Books & Stationery            |              0.25 | False               |
| 2025-01     | Education & Childcare | Uniforms & School Supplies    |              1    | True                |
| 2025-01     | Food & Grocery        | Grocery Stores & Supermarkets |              1    | True                |
| 2025-01     | Food & Grocery        | Online Grocery Services       |              1    | True                |
| 2025-01     | Healthcare & Medical  | Diagnostic & Lab Tests        |              0.5  | True                |
+-------------+-----------------------+-------------------------------+-------------------+---------------------+

=== SUMMARY ===
Recurring transactions found for details: {'Myntra Maternity Wear', 'Apollo Hospital Ultrasound Scan', 'Netflix Subscription', 'Ola Cab Rides', 'Zomato Online Food', 'Apollo Pharmacy Medicines', 'PharmEasy Prenatal Vitamins', 'FirstCry Baby Furniture', 'UrbanClap Home Cleaning', 'FirstCry Baby Essentials', 'SALARY CREDIT FROM INFOSYS', 'Apollo Hospital Prenatal Checkup', 'Swiggy Food Order', 'Apollo Hospital Delivery Charges', 'HDFC Home Loan EMI', 'DMart Supermarket', 'BigBasket Groceries'}.
Significant (≥50%) increases for recurring details: {'Myntra Maternity Wear', 'Apollo Hospital Ultrasound Scan', 'Netflix Subscription', 'Zomato Online Food', 'Apollo Pharmacy Medicines', 'PharmEasy Prenatal Vitamins', 'FirstCry Baby Furniture', 'UrbanClap Home Cleaning', 'FirstCry Baby Essentials', 'Apollo Hospital Prenatal Checkup', 'Swiggy Food Order', 'Apollo Hospital Delivery Charges', 'HDFC Home Loan EMI', 'DMart Supermarket', 'BigBasket Groceries'}.
Significant (≥50%) decreases for recurring details: {'Netflix Subscription', 'Apollo Hospital Ultrasound Scan', 'Zomato Online Food', 'Apollo Pharmacy Medicines', 'FirstCry Baby Furniture', 'UrbanClap Home Cleaning', 'FirstCry Baby Essentials', 'Swiggy Food Order', 'Myntra Maternity Wear', 'HDFC Home Loan EMI', 'DMart Supermarket', 'BigBasket Groceries'}.
Large single txn (≥50% of monthly total) found in:
2025-01 - Education & Childcare/Uniforms & School Supplies, 2025-01 - Food & Grocery/Grocery Stores & Supermarkets, 2025-01 - Food & Grocery/Online Grocery Services, 2025-01 - Healthcare & Medical/Diagnostic & Lab Tests, 2025-01 - Healthcare & Medical/Hospitalization & Surgery expenses, 2025-01 - Healthcare & Medical/Maternity-related Expenses, 2025-01 - Home & Housing Expenses/Home Loan EMI, 2025-01 - Home & Housing Expenses/House Renovation Improvement, 2025-01 - Income & Credits/Salary & Wages, 2025-02 - Education & Childcare/Uniforms & School Supplies, 2025-02 - Food & Grocery/Grocery Stores & Supermarkets, 2025-02 - Food & Grocery/Online Grocery Services, 2025-02 - Healthcare & Medical/Diagnostic & Lab Tests, 2025-02 - Healthcare & Medical/Hospitalization & Surgery expenses, 2025-02 - Healthcare & Medical/Maternity-related Expenses, 2025-02 - Healthcare & Medical/Medicines & Pharmacy, 2025-02 - Income & Credits/Salary & Wages, 2025-02 - Lifestyle & Entertainment/Subscription Services, 2025-03 - Food & Grocery/Grocery Stores & Supermarkets, 2025-03 - Food & Grocery/Packaged Snacks & Beverages, 2025-03 - Home & Housing Expenses/Home Loan EMI, 2025-03 - Income & Credits/Salary & Wages, 2025-03 - Lifestyle & Entertainment/Dining & Restaurants, 2025-03 - Lifestyle & Entertainment/Subscription Services, 2025-04 - Food & Grocery/Grocery Stores & Supermarkets, 2025-04 - Food & Grocery/Packaged Snacks & Beverages, 2025-04 - Healthcare & Medical/Diagnostic & Lab Tests, 2025-04 - Healthcare & Medical/Medicines & Pharmacy, 2025-04 - Home & Housing Expenses/House Renovation Improvement, 2025-04 - Income & Credits/Salary & Wages, 2025-04 - Lifestyle & Entertainment/Subscription Services, 2025-05 - Education & Childcare/Books & Stationery, 2025-05 - Food & Grocery/Grocery Stores & Supermarkets, 2025-05 - Food & Grocery/Online Grocery Services, 2025-05 - Food & Grocery/Packaged Snacks & Beverages, 2025-05 - Healthcare & Medical/Maternity-related Expenses, 2025-05 - Home & Housing Expenses/Home Loan EMI, 2025-05 - Home & Housing Expenses/House Renovation Improvement, 2025-05 - Income & Credits/Salary & Wages, 2025-05 - Lifestyle & Entertainment/Subscription Services, 2025-06 - Education & Childcare/Uniforms & School Supplies, 2025-06 - Food & Grocery/Packaged Snacks & Beverages, 2025-06 - Healthcare & Medical/Medicines & Pharmacy, 2025-06 - Home & Housing Expenses/Home Loan EMI, 2025-06 - Income & Credits/Salary & Wages, 2025-06 - Lifestyle & Entertainment/Subscription Services, 2025-06 - Personal Care & Grooming/Clothing & Footwear
`;

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
    };

    // Update messages with user input
    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Construct the payload with a single system prompt and the current user message
      const analysisResult = JSON.parse(
        localStorage.getItem("analysisResult") || "{}"
      );
      
      // ✅ Convert report JSON into readable text
      const reportText = `
      HIGHEST EXPENSE MONTH:
      April had the highest expenses with total outflow of ₹3,18,899.

      LIFE EVENT:
      ${JSON.stringify(analysisResult.life_event, null, 2)}

      AI REPORT:
      ${analysisResult.ai_report?.sections
      ?.map((s: any) => `${s.title}\n${s.content}`)
      .join("\n\n")}

      SIP RECOMMENDATION:
      ${JSON.stringify(analysisResult.sip_recommendation, null, 2)}
      `;
      
      const payload = {
        message: userMessage.content,
        report: reportText,
      };

      // Send message to backend
      const response = await axios.post("http://localhost:8000/report-chat", payload);

      console.log("CHAT RESPONSE:", response.data);

      // Add response to messages
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: response.data?.response ?? "This information isn't available.",
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
             "I’m unable to answer right now. Please ask a question related to your financial report or try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-80 sm:w-96 p-0 h-[500px] flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground font-semibold text-sm">
                  AI
                </div>
              </Avatar>
              <div>
                <h3 className="font-medium text-sm">Financial Report Assistant</h3>
              <p className="text-xs text-muted-foreground">
                 Explains your generated report
             </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
          <div className="flex flex-wrap gap-2 mb-3">
          {[
           "Why is my SIP amount capped?",
            "Which month had the highest expenses?",
            "What affected my savings the most?",
           "Why is my risk profile conservative?"
          ].map((q) => (
           <button
          key={q}
           onClick={() => setInputValue(q)}
          className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80"
         >
        {q}
         </button>
         ))}
          </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask aout your financial report..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || inputValue.trim() === ""}
                size="icon"
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
