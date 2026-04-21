"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Ticket,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

const MENU_ITEMS = [
  {
    icon: Ticket,
    title: "Minhas Senhas",
    description: "Histórico de atendimentos",
    href: "/minhas-senhas",
  },
  {
    icon: Bell,
    title: "Notificações",
    description: "Gerencie seus alertas",
    href: "#",
  },
  {
    icon: Settings,
    title: "Configurações",
    description: "Gerencie suas preferências",
    href: "#",
  },
]

export default function PerfilPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const handleLogout = () => {
    logout()
    toast.success("Você saiu da sua conta")
    router.push("/login")
  }

  const handleMenuClick = (href: string) => {
    if (href === "#") {
      toast.info("Funcionalidade em desenvolvimento")
    } else {
      router.push(href)
    }
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

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Perfil</h2>
                <p className="text-foreground">{user?.nome || "Cidadão"}</p>
                <p className="text-sm text-muted-foreground">
                  CPF: {user?.cpf || "---"}
                </p>
              </div>
            </div>

            {/* Verified Badge */}
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Cidadão Verificado</span>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-0 divide-y divide-border">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.title}
                onClick={() => handleMenuClick(item.href)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left text-destructive"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <LogOut className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sair</p>
                <p className="text-sm opacity-80">Desconectar da conta</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="font-semibold text-foreground">FilaDigital</span>
            <span className="text-primary text-sm">GOVTECH</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Versão 1.0.0 • Portal Oficial do Governo Digital
          </p>
        </div>
      </main>
    </div>
  )
}
