"use client"

import { useState, useEffect } from "react"
import { Providers } from "@/components/providers/session-provider"
import Loader from "@/components/common/Loader"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen bg-whiten">
            {loading ? <Loader /> : children}
          </div>
        </Providers>
      </body>
    </html>
  )
}