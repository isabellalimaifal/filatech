"use client"

import Image from "next/image"
import { MapPin, Users, ChevronRight, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Unit } from "@/lib/units-data"

interface UnitCardProps {
  unit: Unit
  onClick?: () => void
  showWaitTime?: boolean
}

export function UnitCard({ unit, onClick, showWaitTime = false }: UnitCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-0 shadow-md"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-40 w-full">
        <Image
          src={unit.imagem}
          alt={unit.nome}
          fill
          className="object-cover"
        />
        {/* Type Badge */}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-white/90 text-foreground border-0"
        >
          {unit.tipo}
        </Badge>
        {/* Status Badge */}
        <Badge
          variant={unit.aberto ? "default" : "secondary"}
          className={`absolute top-3 right-3 border-0 ${
            unit.aberto
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gray-500 text-white"
          }`}
        >
          {unit.aberto ? "Aberto" : "Fechado"}
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
          {unit.nome}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{unit.endereco}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {unit.pessoasNaFila}
              </span>
              <span className="text-muted-foreground">na fila</span>
            </div>
            
            {showWaitTime && unit.aberto && (
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  ~{unit.tempoEstimado} min
                </span>
              </div>
            )}
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
