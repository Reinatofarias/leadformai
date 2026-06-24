import React from 'react'
import type { FunnelStep } from '@prisma/client'
import { ArrowRight } from 'lucide-react'

interface Props {
  step: FunnelStep
  goNext: () => void
}

export function WelcomeRenderer({ step, goNext }: Props) {
  const config = (step.config as any) || {}

  return (
    <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-8 duration-500 fade-in">
      {config.imageUrl && (
        <div className="mb-8 w-full max-w-[280px] overflow-hidden rounded-2xl shadow-lg">
          {/* Using regular img since domains aren't configured in next.config.js for next/image */}
          <img 
            src={config.imageUrl} 
            alt={step.title || 'Imagem de boas-vindas'} 
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text,#1F2937)] tracking-tight mb-4">
        {step.title}
      </h1>

      {step.description && (
        <p className="text-lg text-[var(--color-text,#1F2937)] opacity-70 mb-10 max-w-sm">
          {step.description}
        </p>
      )}

      <button
        onClick={() => goNext()}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--color-primary,#6366F1)] text-white hover:opacity-90 active:scale-95 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md cursor-pointer"
      >
        {config.buttonText || 'Começar Agora'}
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  )
}
