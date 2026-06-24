'use client'

import React from 'react'
import type { FunnelStep } from '@prisma/client'
import { VideoEmbed } from './video-embed'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { resolveVariables, replaceVariables } from '@/lib/variables'

interface Props {
  step: FunnelStep
  goNext: (answer: any, jumpToIndex?: number) => void
  answers: any[]
}

export function VideoStepRenderer({ step, goNext, answers }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const videoUrl = (config.videoUrl as string) || ''
  const buttonText = (config.buttonText as string) || 'Continuar'

  // Dynamic variables resolution
  const vars = resolveVariables(answers)
  const title = replaceVariables(step.title || '', vars)
  const description = replaceVariables(step.description || '', vars)

  const handleContinue = () => {
    goNext({
      stepId: step.id,
      stepType: 'VIDEO',
      value: 'Vídeo Assistido',
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

      <VideoEmbed url={videoUrl} />

      <div className="w-full mt-4">
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
