"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Building2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { UnitCard } from "@/components/unit-card"
import { EnterQueueDialog } from "@/components/enter-queue-dialog"
import { ActiveTicketCard } from "@/components/active-ticket-card"
import { useAuth } from "@/lib/auth-context"
import { useTicket } from "@/lib/ticket-context"
import { useUnitsData } from "@/lib/use-units-data"
import { getUnitsByType, searchUnits, type Unit } from "@/lib/units-data"

const FILTER_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "Saúde", label: "Saúde" },
  { value: "Assistência Social", label: "Assistência Social" },
  { value: "Trânsito", label: "Trânsito" },
]

function UnidadesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { activeTicket } = useTicket()
  const { units, isLoading: unitsLoading } = useUnitsData()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("Todos")
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Check for unit parameter in URL
  useEffect(() => {
    const unitId = searchParams.get("unit")
    if (unitId) {
      const unit = units.find((u) => u.id === unitId)
      if (unit && unit.aberto) {
        setSelectedUnit(unit)
        setDialogOpen(true)
      }
    }
  }, [searchParams, units])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const filteredUnits = useMemo(() => {
    let result = getUnitsByType(selectedFilter, units)
    if (searchQuery) {
      result = searchUnits(searchQuery, result)
    }
    return result
  }, [selectedFilter, searchQuery, units])

  const handleUnitClick = (unit: Unit) => {
    if (!unit.aberto) return
    setSelectedUnit(unit)
    setDialogOpen(true)
  }

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

      {/* Active Ticket Card - shown when user has an active ticket */}
      {activeTicket && (
        <div className="container mx-auto px-4 py-4">
          <ActiveTicketCard />
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Building2 className="h-5 w-5" />
            <span className="text-sm font-medium">Unidades de Atendimento</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Lista de Unidades
          </h1>
          <p className="text-muted-foreground">
            Encontre o ponto de atendimento mais próximo e entre na fila virtual.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome, endereço ou tipo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 text-base"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <Filter className="h-5 w-5 text-muted-foreground" />
          {FILTER_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(option.value)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onClick={() => handleUnitClick(unit)}
              showWaitTime
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma unidade encontrada
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou a busca para encontrar unidades
              disponíveis.
            </p>
          </div>
        )}
      </main>

      {/* Enter Queue Dialog */}
      <EnterQueueDialog
        unit={selectedUnit}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            // Clean URL parameter when closing
            router.replace("/unidades")
          }
        }}
      />
    </div>
  )
}

export default function UnidadesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    }>
      <UnidadesContent />
    </Suspense>
  )
}
