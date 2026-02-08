import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "FinanceIQ - Smart Portfolio Recommendations",
  description: "AI-powered financial planning based on your life events",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${poppins.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
          
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'