"use client"

import { useEffect, useRef } from "react"
import { PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TicketCalledOverlayProps {
  codigo: string
  guiche: string
  onDismiss: () => void
}

export function TicketCalledOverlay({
  codigo,
  guiche,
  onDismiss,
}: TicketCalledOverlayProps) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const playBeep = () => {
      try {
        const ctx = new AudioContext()
        audioContextRef.current = ctx

        const playTone = (freq: number, startTime: number, duration: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = freq
          osc.type = "sine"
          gain.gain.setValueAtTime(0.4, startTime)
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
          osc.start(startTime)
          osc.stop(startTime + duration)
        }

        const now = ctx.currentTime
        playTone(880, now, 0.2)
        playTone(1100, now + 0.25, 0.2)
        playTone(880, now + 0.5, 0.2)
        playTone(1100, now + 0.75, 0.2)
        playTone(1320, now + 1.0, 0.4)
      } catch {
        // Audio not supported
      }
    }

    playBeep()

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-blue-900/95 backdrop-blur-sm">
      <div className="mx-4 max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/50">
            <PhoneCall className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
          Sua vez chegou!
        </h1>

        <p className="mb-2 text-xl text-blue-200">
          Ticket: <span className="font-bold text-white">{codigo}</span>
        </p>

        <p className="mb-8 text-2xl font-semibold text-green-300">
          Por favor, dirija-se ao {guiche}.
        </p>

        <Button
          onClick={onDismiss}
          className="bg-white px-8 py-3 text-lg font-bold text-blue-900 hover:bg-blue-50"
          size="lg"
        >
          Entendido
        </Button>
      </div>
    </div>
  )
}
