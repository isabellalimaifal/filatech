"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"
import { Logo } from "@/components/logo"

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await login(cpf, senha)

    if (!result.success) {
      toast.error(result.error || "CPF ou senha inválidos")
      setIsLoading(false)
      return
    }

    // Verify admin role
    const cpfDigits = cpf.replace(/\D/g, "")
    const { data, error } = await supabase
      .from("usuarios")
      .select("cargo")
      .eq("cpf", cpfDigits)
      .maybeSingle()

    if (error || !data || data.cargo !== "admin") {
      toast.error(
        "Acesso restrito: Esta área é exclusiva para funcionários autorizados."
      )
      setIsLoading(false)
      return
    }

    toast.success("Bem-vindo ao Painel de Controle!")
    router.push("/admin")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="mb-8">
        <Logo size="xl" variant="admin" />
      </div>
      <p className="-mt-4 mb-8 text-sm font-medium text-blue-400">
        Painel do Atendente
      </p>

      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Acesso Administrativo
            </h1>
            <p className="text-slate-400">
              Entre com suas credenciais de funcionário
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="cpf" className="text-slate-300">
                  CPF
                </FieldLabel>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  required
                  className="h-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="senha" className="text-slate-300">
                  Senha
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="h-12 pr-12 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Entrar no Painel
                </>
              )}
            </Button>
          </form>

          {/* Back to citizen login */}
          <p className="mt-8 text-center text-sm text-slate-500">
            É cidadão?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              Voltar ao login comum
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-600">
        FilaTech — Painel administrativo para serviços públicos
      </p>
    </div>
  )
}
