"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { TicketProvider } from "@/lib/ticket-context"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <TicketProvider>
        {children}
        <Toaster position="bottom-right" />
      </TicketProvider>
    </AuthProvider>
  )
}
