"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { TicketProvider } from "@/lib/ticket-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TicketCalledListener } from "@/components/ticket-called-listener"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <TicketProvider>
          {children}
          <TicketCalledListener />
          <Toaster position="bottom-right" />
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
