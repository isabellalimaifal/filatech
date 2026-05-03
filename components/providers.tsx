"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { TicketProvider } from "@/lib/ticket-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <TicketProvider>
          {children}
          <Toaster position="bottom-right" />
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
