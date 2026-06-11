import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import logoImage from "@/img/logofilatech.png"

const sizeClasses = {
  sm: "h-14",
  md: "h-20",
  lg: "h-24",
  xl: "h-28",
} as const

interface LogoProps {
  size?: keyof typeof sizeClasses
  className?: string
  href?: string
}

export function Logo({ size = "md", className, href }: LogoProps) {
  const image = (
    <Image
      src={logoImage}
      alt="FilaTech — Sistemas de Filas Virtuais Inteligentes"
      className={cn("w-auto object-contain", sizeClasses[size], className)}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {image}
      </Link>
    )
  }

  return image
}
