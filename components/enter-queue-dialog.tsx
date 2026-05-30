"use client"

import { useState } from "react"
import { MapPin, Clock, Users, Check, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { useTicket } from "@/lib/ticket-context"
import { useAuth } from "@/lib/auth-context"
import { usuarioTemPrioridadeNaFila } from "@/lib/prioridade"
import { toast } from "sonner"
import type { Unit } from "@/lib/units-data"

interface EnterQueueDialogProps {
  unit: Unit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EnterQueueDialog({
  unit,
  open,
  onOpenChange,
}: EnterQueueDialogProps) {
  const { enterQueue, activeTicket } = useTicket()
  const { user } = useAuth()
  const [selectedServico, setSelectedServico] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const temPrioridade = user ? usuarioTemPrioridadeNaFila(user.tipoPrioridade) : false

  const handleEnterQueue = async () => {
    if (!unit || !selectedServico) return

    if (activeTicket) {
      toast.error("Você já possui uma senha ativa. Cancele-a antes de entrar em outra fila.")
      return
    }

    setIsLoading(true)

    const result = await enterQueue(unit.id, selectedServico)

    if (result.success) {
      toast.success("Você entrou na fila com sucesso!")
      onOpenChange(false)
      setSelectedServico("")
    } else {
      toast.error(result.error || "Erro ao entrar na fila. Tente novamente.")
    }

    setIsLoading(false)
  }

  if (!unit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Entrar na Fila</DialogTitle>
          <DialogDescription>
            Confirme sua entrada na fila de atendimento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Unit Info */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <h3 className="font-semibold text-foreground">{unit.nome}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{unit.endereco}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{unit.pessoasNaFila}</span>
                <span className="text-muted-foreground">na fila</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  ~{unit.tempoEstimado} min
                </span>
              </div>
            </div>
          </div>

          {/* Priority Notice */}
          {temPrioridade && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-900">Atendimento Prioritário</span>
              </div>
              <p className="text-sm text-amber-800">
                Você será atendido com prioridade especial: {user?.tipoPrioridade}.
              </p>
            </div>
          )}

          {/* Service Selection */}
          <FieldGroup>
            <Field>
              <FieldLabel>Selecione o serviço</FieldLabel>
              <Select value={selectedServico} onValueChange={setSelectedServico}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Escolha o tipo de atendimento" />
                </SelectTrigger>
                <SelectContent>
                  {unit.servicos.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEnterQueue}
            disabled={!selectedServico || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirmar Entrada
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
