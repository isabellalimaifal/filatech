"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Users, PhoneCall, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Logo } from "@/components/logo"

interface QueueTicket {
  id: string
  codigo: string
  cpf: string
  unidade_nome: string
  servico: string
  posicao: number
  pessoas_frente: number
  status: string
  data_entrada: string
  prioridade_atendimento: string
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const [tickets, setTickets] = useState<QueueTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [calling, setCalling] = useState(false)
  const [lastCalled, setLastCalled] = useState<QueueTicket | null>(null)

  // Check if current user has admin role
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated || !user) {
      router.push("/admin/login")
      return
    }

    const checkRole = async () => {
      setCheckingRole(true)
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("cargo")
          .eq("id", user.id)
          .maybeSingle()

        if (error) {
          console.error("Erro ao verificar cargo:", error)
          toast.error("Erro ao verificar permissões de acesso.")
          router.push("/")
          return
        }

        if (!data || data.cargo !== "admin") {
          alert("Acesso restrito: Esta área é exclusiva para funcionários autorizados.")
          router.push("/")
          return
        }

        setIsAuthorized(true)
      } catch (err) {
        console.error("Erro inesperado ao verificar cargo:", err)
        router.push("/")
      } finally {
        setCheckingRole(false)
      }
    }

    checkRole()
  }, [authLoading, isAuthenticated, user, router])

  // Load active tickets
  const loadTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("status", "ativo")
        .order("data_entrada", { ascending: true })

      if (error) {
        console.error("Erro ao carregar tickets:", error)
        toast.error("Erro ao carregar a fila de atendimento.")
        return
      }

      const sorted = sortTicketsByPriority(data ?? [])
      setTickets(sorted)
    } catch (err) {
      console.error("Erro inesperado:", err)
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    loadTickets()
  }, [isAuthorized, loadTickets])

  // Real-time subscription for admin ticket list
  useEffect(() => {
    if (!isAuthorized) return

    const channel = supabase
      .channel("admin-tickets")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets" },
        () => {
          loadTickets()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthorized, loadTickets])

  const sortTicketsByPriority = (list: QueueTicket[]): QueueTicket[] => {
    const prioritarios = list.filter(
      (t) => t.prioridade_atendimento === "Prioritário"
    )
    const comuns = list.filter(
      (t) => t.prioridade_atendimento !== "Prioritário"
    )

    prioritarios.sort(
      (a, b) =>
        new Date(a.data_entrada).getTime() - new Date(b.data_entrada).getTime()
    )
    comuns.sort(
      (a, b) =>
        new Date(a.data_entrada).getTime() - new Date(b.data_entrada).getTime()
    )

    return [...prioritarios, ...comuns]
  }

  const handleChamarProximo = async () => {
    if (tickets.length === 0) {
      toast.info("Não há cidadãos na fila no momento.")
      return
    }

    setCalling(true)
    const nextTicket = tickets[0]

    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          status: "chamado",
          guiche_atendimento: "Guichê Principal",
        })
        .eq("id", nextTicket.id)
        .eq("status", "ativo")

      if (error) {
        console.error("Erro ao chamar próximo:", error)
        toast.error("Erro ao chamar o próximo cidadão.")
        return
      }

      setLastCalled(nextTicket)
      toast.success(
        `Ticket ${nextTicket.codigo} chamado para o Guichê Principal!`
      )
      await loadTickets()

    } catch (err) {
      console.error("Erro inesperado:", err)
      toast.error("Erro inesperado ao chamar próximo cidadão.")
    } finally {
      setCalling(false)
    }
  }

  if (authLoading || checkingRole || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-pulse text-slate-400">
          Verificando permissões...
        </div>
      </div>
    )
  }

  const priorityCount = tickets.filter(
    (t) => t.prioridade_atendimento === "Prioritário"
  ).length
  const normalCount = tickets.length - priorityCount

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="admin" />
            <div>
              <h1 className="text-lg font-bold text-white">
                Painel de Controle
              </h1>
              <p className="text-xs text-slate-400">
                Gerenciamento de Atendimento
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Atendente: {user?.nome}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {tickets.length}
                </p>
                <p className="text-xs text-slate-400">Na fila</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {priorityCount}
                </p>
                <p className="text-xs text-slate-400">Prioritários</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{normalCount}</p>
                <p className="text-xs text-slate-400">Comuns</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call Next Button */}
        <div className="mb-8">
          <Button
            onClick={handleChamarProximo}
            disabled={calling || tickets.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-6 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:shadow-blue-600/40 disabled:opacity-50"
            size="lg"
          >
            <PhoneCall className="h-6 w-6 mr-3" />
            {calling ? "Chamando..." : "Chamar Próximo Cidadão"}
          </Button>
        </div>

        {/* Last Called */}
        {lastCalled && (
          <Card className="mb-6 border-green-700 bg-green-900/30">
            <CardContent className="p-4">
              <p className="text-sm text-green-400 font-medium mb-1">
                Último chamado:
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-white">
                    {lastCalled.codigo}
                  </p>
                  <p className="text-sm text-slate-300">
                    {lastCalled.servico} — {lastCalled.unidade_nome}
                  </p>
                </div>
                <Badge className="bg-green-600 text-white border-0">
                  Guichê Principal
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Queue List */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            Fila de Atendimento
          </h2>

          {loadingTickets ? (
            <div className="text-center py-12 text-slate-500">
              Carregando fila...
            </div>
          ) : tickets.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-lg">
                  Nenhum cidadão na fila no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            tickets.map((ticket, index) => {
              const isPriority =
                ticket.prioridade_atendimento === "Prioritário"
              return (
                <Card
                  key={ticket.id}
                  className={
                    isPriority
                      ? "border-amber-600/50 bg-amber-950/30"
                      : "border-slate-700 bg-slate-800"
                  }
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                          isPriority
                            ? "bg-amber-500 text-amber-950"
                            : "bg-slate-600 text-slate-200"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">
                            {ticket.codigo}
                          </p>
                          {isPriority && (
                            <Badge className="border-0 bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-950 shadow-sm">
                              PRIORITÁRIO
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          {ticket.servico} — {ticket.unidade_nome}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Entrada</p>
                      <p className="text-sm text-slate-300">
                        {new Date(ticket.data_entrada).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
