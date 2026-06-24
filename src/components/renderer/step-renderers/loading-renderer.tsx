import React, { useEffect, useState } from 'react'
import type { FunnelStep } from '@prisma/client'
import { Loader2 } from 'lucide-react'

interface Props {
  step: FunnelStep
  goNext: () => void
}

export function LoadingRenderer({ step, goNext }: Props) {
  const config = (step.config as any) || {}
  const durationMs = (config.duration || 3) * 1000
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Anima a barra de progresso circular simulada
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 2
      })
    }, durationMs / 50)

    // Avança quando termina
    const timeout = setTimeout(() => {
      goNext()
    }, durationMs)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [durationMs, goNext])

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="relative mb-8 flex items-center justify-center">
        {/* Spinner background track */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" style={{ width: '80px', height: '80px' }}></div>
        {/* Spinning icon */}
        <Loader2 className="h-10 w-10 text-[var(--color-primary,#6366F1)] animate-spin" />
      </div>
      
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text,#1F2937)] animate-pulse">
        {config.text || 'Analisando suas respostas...'}
      </h2>
      
      <p className="text-sm text-gray-400 mt-4 font-medium">
        {progress}% concluído
      </p>
    </div>
  )
}
