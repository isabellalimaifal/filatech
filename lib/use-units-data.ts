"use client"

import { useState, useEffect } from "react"
import { UNITS, type Unit, getAllRealQueueCounts } from "./units-data"
import { supabase } from "./supabase-client"

export function useUnitsData() {
  const [units, setUnits] = useState<Unit[]>(UNITS)
  const [isLoading, setIsLoading] = useState(true)

  // Função para atualizar as unidades com os dados reais do Supabase
  const loadRealQueueData = async () => {
    try {
      const queueCounts = await getAllRealQueueCounts()
      
      setUnits((prevUnits) =>
        prevUnits.map((unit) => {
          const realCount = queueCounts[unit.id] || 0
          const tempoEstimado = realCount > 0 ? realCount * 2 : 0
          
          return {
            ...unit,
            pessoasNaFila: realCount,
            tempoEstimado,
          }
        })
      )
    } catch (error) {
      console.error("Erro ao carregar dados reais da fila:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadRealQueueData()
  }, [])

  // Inscrição em tempo real para atualizar quando tickets mudarem
  useEffect(() => {
    const channel = supabase
      .channel("units-queue-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tickets",
        },
        () => {
          loadRealQueueData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { units, isLoading, refreshUnits: loadRealQueueData }
}