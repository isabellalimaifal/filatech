"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Logo } from "@/components/logo"

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
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Logo href="/unidades" size="md" />

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
