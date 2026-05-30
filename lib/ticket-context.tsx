"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"
import { supabase } from "./supabase-client"
import {
  usuarioTemPrioridadeNaFila,
  type PrioridadeAtendimentoTicket,
} from "./prioridade"

export interface Ticket {
  id: string
  codigo: string
  unidade: {
    id: string
    nome: string
    tipo: string
  }
  servico: string
  posicao: number
  pessoasFrente: number
  tempoEstimado: number
  status: "ativo" | "chamado" | "concluido" | "cancelado"
  dataEntrada: string
  dataConclusao?: string
  /** Espelha `tickets.prioridade_atendimento` no Supabase. */
  prioridadeAtendimento: PrioridadeAtendimentoTicket
  guiche?: string
}

export interface CalledTicketInfo {
  codigo: string
  guiche: string
}

export interface TicketHistory extends Ticket {
  dataConclusao: string
}

interface TicketContextType {
  activeTicket: Ticket | null
  ticketHistory: TicketHistory[]
  isLoading: boolean
  calledTicket: CalledTicketInfo | null
  enterQueue: (unidadeId: string, servicoId: string) => Promise<{ success: boolean; error?: string }>
  cancelTicket: () => Promise<boolean>
  refreshTicket: () => Promise<void>
  dismissCalledTicket: () => void
}

const TicketContext = createContext<TicketContextType | undefined>(undefined)

function normalizeCpf(cpf: string) {
  return cpf.replace(/\D/g, "")
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: string }).message || "")
    if (message) return message
  }
  return fallback
}

function normalizePrioridade(
  value: PrioridadeAtendimentoTicket | undefined
): PrioridadeAtendimentoTicket {
  return value === "Prioritário" ? "Prioritário" : "Normal"
}

// Mock data for units
const MOCK_UNITS: Record<string, { nome: string; tipo: string }> = {
  "1": { nome: "Posto de Saúde Central", tipo: "Saúde" },
  "2": { nome: "CRAS Vila Esperança", tipo: "Assistência Social" },
  "3": { nome: "Detran - Unidade Centro", tipo: "Trânsito" },
  "4": { nome: "UBS Jardim América", tipo: "Saúde" },
  "5": { nome: "CRAS Centro", tipo: "Assistência Social" },
  "6": { nome: "Detran - Unidade Sul", tipo: "Trânsito" },
}

export function TicketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [ticketHistory, setTicketHistory] = useState<TicketHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [calledTicket, setCalledTicket] = useState<CalledTicketInfo | null>(null)

  // Load ticket data on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTicketData()
    } else {
      setActiveTicket(null)
      setTicketHistory([])
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Real-time position updates based on actual database queries
  useEffect(() => {
    if (!activeTicket || !user) return

    const refreshPosition = async () => {
      try {
        const cpf = normalizeCpf(user.cpf)
        const { data: currentTicket, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("cpf", cpf)
          .eq("codigo", activeTicket.codigo)
          .eq("status", "ativo")
          .maybeSingle()

        if (error) {
          console.error("Error refreshing ticket position:", error)
          return
        }

        if (currentTicket) {
          let pessoasFrente = 0
          const prioridadeAtendimento = currentTicket.prioridade_atendimento as string

          if (prioridadeAtendimento === "Prioritário") {
            const { data: priorityTickets } = await supabase
              .from("tickets")
              .select("id, data_entrada")
              .eq("unidade_id", String(currentTicket.unidade_id))
              .eq("status", "ativo")
              .eq("prioridade_atendimento", "Prioritário")
              .lt("data_entrada", currentTicket.data_entrada)
            
            if (priorityTickets) {
              pessoasFrente = priorityTickets.length
            }
          } else {
            const { data: allTickets } = await supabase
              .from("tickets")
              .select("id, data_entrada")
              .eq("unidade_id", String(currentTicket.unidade_id))
              .eq("status", "ativo")
              .lt("data_entrada", currentTicket.data_entrada)
            
            if (allTickets) {
              pessoasFrente = allTickets.length
            }
          }

          const posicao = pessoasFrente + 1
          const tempoEstimado = pessoasFrente * 2

          setActiveTicket((prev) => {
            if (!prev) return null
            const updated = {
              ...prev,
              posicao,
              pessoasFrente,
              tempoEstimado,
            }
            localStorage.setItem("filadigital_active_ticket", JSON.stringify(updated))
            return updated
          })
        }
      } catch (error) {
        console.error("Error in position refresh:", error)
      }
    }

    refreshPosition()
    const interval = setInterval(refreshPosition, 30000)

    return () => clearInterval(interval)
  }, [activeTicket?.id, activeTicket?.codigo, user])

  // Real-time subscription: listen for ticket status changes
  useEffect(() => {
    if (!user || !activeTicket) return

    const cpf = normalizeCpf(user.cpf)
    const channel = supabase
      .channel(`citizen-ticket-${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tickets",
          filter: `cpf=eq.${cpf}`,
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown>
          if (
            String(newRow.id) === activeTicket.id &&
            newRow.status === "chamado"
          ) {
            const guiche = (newRow.guiche_atendimento as string) || "Guichê de Atendimento"
            setCalledTicket({ codigo: activeTicket.codigo, guiche })
            setActiveTicket(null)
            localStorage.removeItem("filadigital_active_ticket")
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, activeTicket?.id])

  const dismissCalledTicket = () => {
    setCalledTicket(null)
  }

  const loadTicketData = async () => {
    setIsLoading(true)
    try {
      if (!user) return

      const cpf = normalizeCpf(user.cpf)
      const { data: dbActiveTicket, error: activeError } = await supabase
        .from("tickets")
        .select("*")
        .eq("cpf", cpf)
        .eq("status", "ativo")
        .order("data_entrada", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activeError) {
        console.error("Error loading active ticket from Supabase:", activeError)
      } else if (dbActiveTicket) {
        const unit = MOCK_UNITS[String(dbActiveTicket.unidade_id)] ?? {
          nome: dbActiveTicket.unidade_nome || "Unidade",
          tipo: dbActiveTicket.unidade_tipo || "Serviço Público",
        }

        const prioridadeRaw = dbActiveTicket.prioridade_atendimento as string | undefined
        const prioridadeAtendimento: PrioridadeAtendimentoTicket =
          prioridadeRaw === "Prioritário" ? "Prioritário" : "Normal"

        const formattedTicket: Ticket = {
          id: String(dbActiveTicket.id),
          codigo: dbActiveTicket.codigo,
          unidade: {
            id: String(dbActiveTicket.unidade_id),
            nome: unit.nome,
            tipo: unit.tipo,
          },
          servico: dbActiveTicket.servico,
          posicao: dbActiveTicket.posicao,
          pessoasFrente: dbActiveTicket.pessoas_frente,
          tempoEstimado: dbActiveTicket.tempo_estimado,
          status: dbActiveTicket.status,
          dataEntrada: dbActiveTicket.data_entrada,
          dataConclusao: dbActiveTicket.data_conclusao ?? undefined,
          prioridadeAtendimento,
        }
        setActiveTicket(formattedTicket)
        localStorage.setItem("filadigital_active_ticket", JSON.stringify(formattedTicket))
      }

      const { data: dbHistory, error: historyError } = await supabase
        .from("tickets")
        .select("*")
        .eq("cpf", cpf)
        .in("status", ["concluido", "cancelado"])
        .order("data_entrada", { ascending: false })
        .limit(20)

      if (historyError) {
        console.error("Error loading ticket history from Supabase:", historyError)
      } else if (dbHistory && dbHistory.length > 0) {
        const history: TicketHistory[] = dbHistory
          .filter((item) => item.data_conclusao)
          .map((item) => {
            const unit = MOCK_UNITS[String(item.unidade_id)] ?? {
              nome: item.unidade_nome || "Unidade",
              tipo: item.unidade_tipo || "Serviço Público",
            }
            const pRaw = item.prioridade_atendimento as string | undefined
            const prioridadeAtendimento: PrioridadeAtendimentoTicket =
              pRaw === "Prioritário" ? "Prioritário" : "Normal"

            return {
              id: String(item.id),
              codigo: item.codigo,
              unidade: {
                id: String(item.unidade_id),
                nome: unit.nome,
                tipo: unit.tipo,
              },
              servico: item.servico,
              posicao: item.posicao,
              pessoasFrente: item.pessoas_frente,
              tempoEstimado: item.tempo_estimado,
              status: item.status,
              dataEntrada: item.data_entrada,
              dataConclusao: item.data_conclusao,
              prioridadeAtendimento,
            }
          })

        setTicketHistory(history)
        localStorage.setItem("filadigital_ticket_history", JSON.stringify(history))
        }

      // Fallback cache on localStorage if there is no persisted data
      const storedTicket = localStorage.getItem("filadigital_active_ticket")
      if (storedTicket && !dbActiveTicket) {
        try {
          const parsed = JSON.parse(storedTicket) as Ticket
          setActiveTicket({
            ...parsed,
            prioridadeAtendimento: normalizePrioridade(parsed.prioridadeAtendimento),
          })
        } catch {
          /* ignore */
        }
      }

      const storedHistory = localStorage.getItem("filadigital_ticket_history")
      if (storedHistory && (!dbHistory || dbHistory.length === 0)) {
        try {
          const parsedList = JSON.parse(storedHistory) as TicketHistory[]
          setTicketHistory(
            parsedList.map((h) => ({
              ...h,
              prioridadeAtendimento: normalizePrioridade(h.prioridadeAtendimento),
            }))
          )
        } catch {
          /* ignore */
        }
      } else if (!storedHistory && (!dbHistory || dbHistory.length === 0)) {
        // Mock history data
        const mockHistory: TicketHistory[] = [
          {
            id: "h1",
            codigo: "FD-2024-0812",
            unidade: { id: "3", nome: "Detran - Unidade Centro", tipo: "Trânsito" },
            servico: "Renovação CNH",
            posicao: 0,
            pessoasFrente: 0,
            tempoEstimado: 0,
            status: "concluido",
            dataEntrada: "2026-03-20T10:15:00",
            dataConclusao: "2026-03-20T11:02:00",
            prioridadeAtendimento: "Normal",
          },
          {
            id: "h2",
            codigo: "FD-2024-0798",
            unidade: { id: "2", nome: "CRAS Vila Esperança", tipo: "Assistência Social" },
            servico: "Cadastro Único",
            posicao: 0,
            pessoasFrente: 0,
            tempoEstimado: 0,
            status: "concluido",
            dataEntrada: "2026-03-18T08:45:00",
            dataConclusao: "2026-03-18T09:20:00",
            prioridadeAtendimento: "Normal",
          },
          {
            id: "h3",
            codigo: "FD-2024-0756",
            unidade: { id: "1", nome: "Posto de Saúde Central", tipo: "Saúde" },
            servico: "Vacinação",
            posicao: 0,
            pessoasFrente: 0,
            tempoEstimado: 0,
            status: "concluido",
            dataEntrada: "2026-03-15T14:00:00",
            dataConclusao: "2026-03-15T14:25:00",
            prioridadeAtendimento: "Normal",
          },
        ]
        setTicketHistory(mockHistory)
        localStorage.setItem("filadigital_ticket_history", JSON.stringify(mockHistory))
      }
    } catch (error) {
      console.error("Error loading ticket data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const enterQueue = async (unidadeId: string, servico: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔍 [ENTER-QUEUE] Iniciando entrada na fila")
      console.log("🔍 [ENTER-QUEUE] User:", user)
      console.log("🔍 [ENTER-QUEUE] user.tipoPrioridade:", user?.tipoPrioridade)

      if (!user) return { success: false, error: "Usuário não autenticado." }

      const unit = MOCK_UNITS[unidadeId]
      if (!unit) return { success: false, error: "Unidade inválida." }

      console.log("🔍 [ENTER-QUEUE] usuarioTemPrioridadeNaFila:", usuarioTemPrioridadeNaFila(user.tipoPrioridade))

      const prioridadeAtendimento: PrioridadeAtendimentoTicket =
        usuarioTemPrioridadeNaFila(user.tipoPrioridade) ? "Prioritário" : "Normal"

      console.log("🔍 [ENTER-QUEUE] prioridadeAtendimento determinada:", prioridadeAtendimento)

      const ticketNumber = Math.floor(Math.random() * 9000) + 1000
      // Calculate real position based on actual tickets in database
      let pessoasFrente = 0
      
      if (prioridadeAtendimento === "Prioritário") {
        // For priority users, count only priority tickets ahead
        const { data: priorityTickets, error: priorityError } = await supabase
          .from("tickets")
          .select("id")
          .eq("unidade_id", unidadeId)
          .eq("status", "ativo")
          .eq("prioridade_atendimento", "Prioritário")
        
        if (!priorityError && priorityTickets) {
          pessoasFrente = priorityTickets.length
        }
      } else {
        // For normal users, count all active tickets (priority + normal)
        const { data: allTickets, error: allError } = await supabase
          .from("tickets")
          .select("id")
          .eq("unidade_id", unidadeId)
          .eq("status", "ativo")
        
        if (!allError && allTickets) {
          pessoasFrente = allTickets.length
        }
      }

      const posicao = pessoasFrente + 1

      const newTicket: Ticket = {
        id: `ticket-${Date.now()}`,
        codigo: `FD-2024-${ticketNumber}`,
        unidade: {
          id: unidadeId,
          nome: unit.nome,
          tipo: unit.tipo,
        },
        servico: servico,
        posicao: posicao,
        pessoasFrente: pessoasFrente,
        tempoEstimado: pessoasFrente * 2,
        status: "ativo",
        dataEntrada: new Date().toISOString(),
        prioridadeAtendimento,
      }

      const cpf = normalizeCpf(user.cpf)
      const { data: insertedTicket, error: insertError } = await supabase
        .from("tickets")
        .insert({
          codigo: newTicket.codigo,
          cpf: cpf,
          unidade_id: unidadeId,
          unidade_nome: unit.nome,
          unidade_tipo: unit.tipo,
          servico: servico,
          posicao: posicao,
          pessoas_frente: pessoasFrente,
          tempo_estimado: pessoasFrente * 2,
          status: "ativo",
          data_entrada: newTicket.dataEntrada,
          prioridade_atendimento: prioridadeAtendimento,
        })
        .select()
        .single()

      console.log("🔍 [ENTER-QUEUE] Ticket inserido no banco:", {
        insertedTicket,
        insertError,
        prioridade_atendimento_enviada: prioridadeAtendimento,
      })

      if (insertError) {
        console.error("Error saving ticket on Supabase:", insertError)
        return {
          success: false,
          error: getErrorMessage(insertError, "Erro ao salvar ticket no Supabase."),
        }
      }

      // Atualizar o ticket com o ID real do banco
      const ticketWithRealId = {
        ...newTicket,
        id: String(insertedTicket.id),
      }
      
      setActiveTicket(ticketWithRealId)
      localStorage.setItem("filadigital_active_ticket", JSON.stringify(ticketWithRealId))
      return { success: true }
    } catch (error) {
      console.error("Error entering queue:", error)
      return {
        success: false,
        error: getErrorMessage(error, "Erro inesperado ao entrar na fila."),
      }
    }
  }

  const cancelTicket = async (): Promise<boolean> => {
    try {
      if (activeTicket) {
        if (user) {
          const { error } = await supabase
            .from("tickets")
            .update({
              status: "cancelado",
              data_conclusao: new Date().toISOString(),
            })
            .eq("cpf", normalizeCpf(user.cpf))
            .eq("codigo", activeTicket.codigo)
            .eq("status", "ativo")

          if (error) {
            console.error("Error updating ticket status on Supabase:", error)
            return false
          }
        }

        const completedTicket: TicketHistory = {
          ...activeTicket,
          status: "cancelado",
          dataConclusao: new Date().toISOString(),
        }
        setTicketHistory((prev) => [completedTicket, ...prev])
        localStorage.setItem(
          "filadigital_ticket_history",
          JSON.stringify([completedTicket, ...ticketHistory])
        )
      }
      setActiveTicket(null)
      localStorage.removeItem("filadigital_active_ticket")
      return true
    } catch (error) {
      console.error("Error canceling ticket:", error)
      return false
    }
  }

  const refreshTicket = async (): Promise<void> => {
    await loadTicketData()
  }

  return (
    <TicketContext.Provider
      value={{
        activeTicket,
        ticketHistory,
        isLoading,
        calledTicket,
        enterQueue,
        cancelTicket,
        refreshTicket,
        dismissCalledTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  )
}

export function useTicket() {
  const context = useContext(TicketContext)
  if (context === undefined) {
    throw new Error("useTicket must be used within a TicketProvider")
  }
  return context
}
