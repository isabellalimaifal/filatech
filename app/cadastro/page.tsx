"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OPCOES_NECESSIDADES_ESPECIAIS } from "@/lib/prioridade"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function CadastroPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [nome, setNome] = useState("")
  const [cpf, setCpf] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [necessidadesEspeciais, setNecessidadesEspeciais] = useState<string>("Nenhuma")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await register({
      nome,
      cpf,
      telefone,
      senha,
      tipoPrioridade: necessidadesEspeciais,
    })

    if (result.success) {
      toast.success("Cadastro realizado com sucesso!")
      router.push("/unidades")
    } else {
      toast.error(result.error || "Erro ao realizar cadastro")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg border-0">
        <CardContent className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Bem-vindo ao FilaTech
            </h1>
            <p className="text-muted-foreground">
              Complete seu cadastro para criar sua conta e usar as filas virtuais
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="nome">
                  Nome Completo <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="nome"
                  type="text"
                  placeholder="João da Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="h-12"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="cpf">
                  CPF <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="123.456.789-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  required
                  className="h-12"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
                <Input
                  id="telefone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  className="h-12"
                />
              </Field>

              <Field>
                <FieldLabel id="necessidades-especiais-label" htmlFor="necessidades-especiais">
                  Necessidades Especiais
                </FieldLabel>
                <FieldDescription id="necessidades-especiais-hint">
                  Informação opcional para priorização legal no atendimento presencial. Se não se
                  aplicar, mantenha Nenhuma.
                </FieldDescription>
                <Select
                  value={necessidadesEspeciais}
                  onValueChange={setNecessidadesEspeciais}
                  name="necessidades_especiais"
                >
                  <SelectTrigger
                    id="necessidades-especiais"
                    className="h-12 w-full"
                    aria-labelledby="necessidades-especiais-label"
                    aria-describedby="necessidades-especiais-hint"
                  >
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPCOES_NECESSIDADES_ESPECIAIS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="senha">
                  Senha <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Crie uma senha segura"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Finalizar Cadastro
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        FilaTech — Filas virtuais para serviços públicos
      </p>
    </div>
  )
}
