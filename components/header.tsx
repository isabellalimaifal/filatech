"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const NAV_ITEMS = [
  { href: "/unidades", label: "Início" },
  { href: "/minhas-senhas", label: "Minhas Senhas" },
  { href: "/ajuda", label: "Ajuda" },
]

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/unidades" className="flex items-center gap-2">
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
            <span className="text-lg font-bold text-foreground">FilaTech</span>
            <span className="text-xs font-medium text-primary">Filas virtuais</span>
          </div>
        </Link>

        {/* Navigation — visível em telas pequenas com rolagem horizontal */}
        <nav className="flex max-w-[45%] sm:max-w-none items-center gap-1 overflow-x-auto md:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-1 md:justify-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors md:px-4",
                pathname === item.href
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Profile */}
        {isAuthenticated ? (
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full" asChild>
            <Link
              href="/perfil"
              className={cn(
                pathname === "/perfil" && "bg-primary/10 text-primary"
              )}
            >
              <User className="h-5 w-5" />
            </Link>
          </Button>
        ) : (
          <Button className="shrink-0 gap-2" asChild>
            <Link href="/login">
              <span>Entrar</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
