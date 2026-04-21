"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Ticket, Clock, CheckCircle, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { useTicket, type Ticket as TicketType, type TicketHistory } from "@/lib/ticket-context"

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ActiveTicketItem({ ticket }: { ticket: TicketType }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-primary"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {ticket.unidade.nome}
                </h3>
                <p className="text-sm text-muted-foreground">{ticket.servico}</p>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <Clock className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{ticket.codigo}</span>
              <span>•</span>
              <span>Posição: {ticket.posicao}º</span>
              <span>•</span>
              <span>~{ticket.tempoEstimado} min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryTicketItem({ ticket }: { ticket: TicketHistory }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-muted-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {ticket.unidade.nome}
                </h3>
                <p className="text-sm text-muted-foreground">{ticket.servico}</p>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Concluído
              </Badge>
            </div>
            
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{ticket.codigo}</span>
              <span>•</span>
              <span>{formatDate(ticket.dataEntrada)}</span>
              <span>→</span>
              <span>{formatDate(ticket.dataConclusao)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MinhasSenhasPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { activeTicket, ticketHistory, isLoading: ticketLoading } = useTicket()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Ticket className="h-5 w-5" />
            <span className="text-sm font-medium">Histórico de Atendimentos</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Minhas Senhas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seus atendimentos ativos e histórico completo.
          </p>
        </div>

        {/* Active Tickets Section */}
        {!ticketLoading && activeTicket && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Senhas Ativas
              </h2>
            </div>
            <ActiveTicketItem ticket={activeTicket} />
          </section>
        )}

        {/* History Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Histórico</h2>
          </div>

          {ticketLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-muted-foreground">
                Carregando histórico...
              </div>
            </div>
          ) : ticketHistory.length > 0 ? (
            <div className="space-y-3">
              {ticketHistory.map((ticket) => (
                <HistoryTicketItem key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum histórico
                </h3>
                <p className="text-muted-foreground">
                  Seu histórico de atendimentos aparecerá aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
