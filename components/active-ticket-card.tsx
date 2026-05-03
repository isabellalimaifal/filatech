"use client"

import { Bell, Clock, Users } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTicket } from "@/lib/ticket-context"
import { toast } from "sonner"

export function ActiveTicketCard() {
  const { activeTicket, cancelTicket } = useTicket()
  const [isCanceling, setIsCanceling] = useState(false)

  if (!activeTicket) return null

  const handleRequestNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Notificações ativadas! Você será avisado quando sua vez chegar.")
        } else {
          toast.error("Permissão de notificação negada")
        }
      })
    } else {
      toast.info("Seu navegador não suporta notificações")
    }
  }

  const handleCancelTicket = async () => {
    setIsCanceling(true)
    const success = await cancelTicket()
    if (success) {
      toast.success("Senha cancelada com sucesso.")
    } else {
      toast.error("Não foi possível cancelar a senha.")
    }
    setIsCanceling(false)
  }

  // Calculate progress percentage (inverse - less position = more progress)
  const maxPosition = activeTicket.posicao + activeTicket.pessoasFrente
  const progress = maxPosition > 0 ? ((maxPosition - activeTicket.posicao + 1) / maxPosition) * 100 : 0
  const circumference = 2 * Math.PI * 45

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent p-4 text-primary-foreground">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Ticket Ativo</p>
              <p className="text-base font-bold">{activeTicket.codigo}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {activeTicket.prioridadeAtendimento === "Prioritário" && (
              <Badge
                aria-label="Senha prioritária para atendimento"
                className="border-0 bg-amber-400 px-3 py-1 text-xs font-extrabold tracking-wider text-amber-950 shadow-md ring-2 ring-amber-200/80"
              >
                PRIORIDADE
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 hover:bg-white/30"
            >
              EM ANDAMENTO
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6">
        <div className="flex items-center gap-8">
          {/* Progress Circle */}
          <div className="relative flex-shrink-0">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground uppercase">Sua Posição</span>
              <span className="text-3xl font-bold text-foreground">
                {activeTicket.posicao}º
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {activeTicket.unidade.nome}
              </h3>
              <p className="text-muted-foreground">{activeTicket.servico}</p>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tempo Estimado</p>
                  <p className="font-semibold text-foreground">
                    {activeTicket.tempoEstimado} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pessoas à Frente</p>
                  <p className="font-semibold text-foreground">
                    {activeTicket.pessoasFrente}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRequestNotification} className="gap-2">
                <Bell className="h-4 w-4" />
                Solicitar Notificação
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelTicket}
                disabled={isCanceling}
              >
                {isCanceling ? "Cancelando..." : "Cancelar Senha"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
