'use client'

import React from 'react'
import type { FunnelStep } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Volume2 } from 'lucide-react'
import { resolveVariables, replaceVariables } from '@/lib/variables'

interface Props {
  step: FunnelStep
  goNext: (answer: any, jumpToIndex?: number) => void
  answers: any[]
}

export function AudioRenderer({ step, goNext, answers }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const audioUrl = (config.audioUrl as string) || ''
  const buttonText = (config.buttonText as string) || 'Continuar'

  // Dynamic variables resolution
  const vars = resolveVariables(answers)
  const title = replaceVariables(step.title || '', vars)
  const description = replaceVariables(step.description || '', vars)

  const handleContinue = () => {
    goNext({
      stepId: step.id,
      stepType: 'AUDIO',
      value: 'Áudio Ouvido',
      score: typeof config.score === 'number' ? config.score : 0,
    })
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-6 shadow-md shadow-slate-100/50 mb-6 flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
          <Volume2 className="h-6 w-6 animate-pulse" />
        </div>

        {audioUrl ? (
          <audio
            src={audioUrl}
            controls
            preload="metadata"
            className="w-full"
          />
        ) : (
          <p className="text-xs text-red-500 font-semibold">Nenhum link de áudio configurado. Insira um link direto MP3.</p>
        )}
      </div>

      <div className="w-full mt-2">
        <Button 
          onClick={handleContinue}
          className="w-full font-bold flex items-center justify-center gap-1.5"
        >
          {buttonText}
          <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  )
}
