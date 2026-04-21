"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./auth-context"
import { supabase } from "./supabase-client"

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
}

export interface TicketHistory extends Ticket {
  dataConclusao: string
}

interface TicketContextType {
  activeTicket: Ticket | null
  ticketHistory: TicketHistory[]
  isLoading: boolean
  enterQueue: (unidadeId: string, servicoId: string) => Promise<{ success: boolean; error?: string }>
  cancelTicket: () => Promise<boolean>
  refreshTicket: () => Promise<void>
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

  // Simulate real-time updates
  useEffect(() => {
    if (!activeTicket) return

    const interval = setInterval(() => {
      setActiveTicket((prev) => {
        if (!prev || prev.posicao <= 1) return prev
        const newPosicao = Math.max(1, prev.posicao - 1)
        const newPessoasFrente = Math.max(0, prev.pessoasFrente - 1)
        const newTempoEstimado = Math.max(2, newPessoasFrente * 2)
        
        const updated = {
          ...prev,
          posicao: newPosicao,
          pessoasFrente: newPessoasFrente,
          tempoEstimado: newTempoEstimado,
        }
        
        localStorage.setItem("filadigital_active_ticket", JSON.stringify(updated))
        return updated
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [activeTicket?.id])

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
            }
          })

        setTicketHistory(history)
        localStorage.setItem("filadigital_ticket_history", JSON.stringify(history))
        }

      // Fallback cache on localStorage if there is no persisted data
      const storedTicket = localStorage.getItem("filadigital_active_ticket")
      if (storedTicket && !dbActiveTicket) {
        setActiveTicket(JSON.parse(storedTicket))
      }

      const storedHistory = localStorage.getItem("filadigital_ticket_history")
      if (storedHistory && (!dbHistory || dbHistory.length === 0)) {
        setTicketHistory(JSON.parse(storedHistory))
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
      if (!user) return { success: false, error: "Usuário não autenticado." }

      const unit = MOCK_UNITS[unidadeId]
      if (!unit) return { success: false, error: "Unidade inválida." }

      const ticketNumber = Math.floor(Math.random() * 9000) + 1000
      const posicao = Math.floor(Math.random() * 20) + 5
      const pessoasFrente = posicao - 1

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
      }

      const cpf = normalizeCpf(user.cpf)
      const { error: insertError } = await supabase.from("tickets").insert({
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
      })

      if (insertError) {
        console.error("Error saving ticket on Supabase:", insertError)
        return {
          success: false,
          error: getErrorMessage(insertError, "Erro ao salvar ticket no Supabase."),
        }
      }

      setActiveTicket(newTicket)
      localStorage.setItem("filadigital_active_ticket", JSON.stringify(newTicket))
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
        enterQueue,
        cancelTicket,
        refreshTicket,
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
