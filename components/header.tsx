"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const NAV_ITEMS = [
  { href: "/", label: "Início" },
  { href: "/unidades", label: "Ver Unidades" },
  { href: "/minhas-senhas", label: "Minhas Senhas" },
  { href: "/ajuda", label: "Ajuda" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">FilaDigital</span>
            <span className="text-xs font-medium text-primary">GOVTECH</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Profile */}
        {isAuthenticated ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/perfil")}
            className={cn(
              "rounded-full",
              pathname === "/perfil" && "bg-primary/10 text-primary"
            )}
          >
            <User className="h-5 w-5" />
          </Button>
        ) : (
          <Link href="/login">
            <Button className="gap-2">
              <span>Entrar</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
