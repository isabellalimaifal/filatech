"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "./supabase-client"

export interface User {
  id: string
  nome: string
  cpf: string
  telefone?: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (cpf: string, senha: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { nome: string; cpf: string; telefone?: string; senha: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

async function findUserByCpf(cpf: string) {
  const cpfDigits = normalizeCpf(cpf)

  const normalizedLookup = await supabase
    .from("usuarios")
    .select("*")
    .eq("cpf", cpfDigits)
    .maybeSingle()

  if (normalizedLookup.error) {
    return normalizedLookup
  }

  if (normalizedLookup.data) {
    return normalizedLookup
  }

  return supabase
    .from("usuarios")
    .select("*")
    .eq("cpf", cpf)
    .maybeSingle()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("filadigital_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (cpf: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await findUserByCpf(cpf)

      if (error || !data) {
        console.error("Login lookup error:", error)
        return { success: false, error: "Usuário não encontrado para este CPF." }
      }
      const dbPassword = data.senha ?? data.password
      if (!dbPassword || dbPassword !== senha) {
        return { success: false, error: "CPF ou senha inválidos." }
      }

      const dbUser: User = {
        id: String(data.id),
        nome: data.nome ?? "Cidadão",
        cpf: data.cpf,
        telefone: data.telefone ?? undefined,
        email: data.email ?? undefined,
      }

      setUser(dbUser)
      localStorage.setItem("filadigital_user", JSON.stringify(dbUser))
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: getErrorMessage(error, "Erro inesperado no login.") }
    }
  }

  const register = async (data: { nome: string; cpf: string; telefone?: string; senha: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const cpfDigits = normalizeCpf(data.cpf)
      const { data: existingUser, error: existingError } = await findUserByCpf(data.cpf)

      if (existingError) {
        console.error("Register lookup error:", existingError)
        return { success: false, error: getErrorMessage(existingError, "Erro ao verificar CPF.") }
      }
      if (existingUser) {
        return { success: false, error: "Já existe usuário cadastrado com este CPF." }
      }

      const insertPayload = {
        nome: data.nome,
        cpf: cpfDigits,
        telefone: data.telefone || null,
        senha: data.senha,
      }

      const { error: insertError } = await supabase.from("usuarios").insert(insertPayload)
      if (insertError) {
        console.error("Register insert error:", insertError)
        return {
          success: false,
          error: getErrorMessage(insertError, "Falha ao inserir usuário no Supabase."),
        }
      }

      const newUser: User = {
        id: `local-${Date.now()}`,
        nome: data.nome,
        cpf: cpfDigits,
        telefone: data.telefone ?? undefined,
      }

      setUser(newUser)
      localStorage.setItem("filadigital_user", JSON.stringify(newUser))
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: getErrorMessage(error, "Erro inesperado no cadastro.") }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("filadigital_user")
    localStorage.removeItem("filadigital_active_ticket")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
