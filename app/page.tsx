"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { ActiveTicketCard } from "@/components/active-ticket-card"
import { UnitCard } from "@/components/unit-card"
import { useAuth } from "@/lib/auth-context"
import { useTicket } from "@/lib/ticket-context"
import { UNITS } from "@/lib/units-data"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { activeTicket, isLoading: ticketLoading } = useTicket()

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

  const recentUnits = UNITS.filter((u) => u.aberto).slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Painel do Cidadão</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao FilaTech
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas filas virtuais de forma simples e rápida.
          </p>
        </div>

        {/* Active Ticket Section */}
        {!ticketLoading && activeTicket && (
          <section className="mb-12">
            <ActiveTicketCard />
          </section>
        )}

        {/* Recent Units Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Unidades Recentes
              </h2>
              <p className="text-sm text-muted-foreground">
                Pontos de atendimento disponíveis próximos a você
              </p>
            </div>
            <Button variant="ghost" className="gap-2 text-primary" asChild>
              <Link href="/unidades">
                Ver Todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onClick={() => router.push(`/unidades?unit=${unit.id}`)}
              />
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-8 text-primary-foreground">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-bold mb-3">
              Fila digital para todos
            </h2>
            <p className="text-white/90 mb-6">
              Economize tempo e evite filas presenciais. Acompanhe sua posição em
              tempo real de qualquer lugar.
            </p>
            <Button
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 gap-2"
              asChild
            >
              <Link href="/unidades">
                Explorar Unidades
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Decorative illustration placeholder */}
          <div className="absolute right-0 bottom-0 w-80 h-48 opacity-20">
            <svg viewBox="0 0 200 100" fill="currentColor" className="w-full h-full">
              <circle cx="50" cy="80" r="15" />
              <circle cx="80" cy="75" r="18" />
              <circle cx="115" cy="70" r="20" />
              <circle cx="150" cy="75" r="17" />
              <circle cx="180" cy="80" r="14" />
              <rect x="30" y="30" width="140" height="50" rx="5" opacity="0.5" />
            </svg>
          </div>
        </section>
      </main>
    </div>
  )
}
