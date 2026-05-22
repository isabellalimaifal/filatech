"use client"

import { useTicket } from "@/lib/ticket-context"
import { TicketCalledOverlay } from "@/components/ticket-called-overlay"

export function TicketCalledListener() {
  const { calledTicket, dismissCalledTicket } = useTicket()

  if (!calledTicket) return null

  return (
    <TicketCalledOverlay
      codigo={calledTicket.codigo}
      guiche={calledTicket.guiche}
      onDismiss={dismissCalledTicket}
    />
  )
}
