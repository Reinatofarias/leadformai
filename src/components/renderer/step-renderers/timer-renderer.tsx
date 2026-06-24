'use client'

import React, { useState, useEffect } from 'react'
import type { FunnelStep } from '@prisma/client'
import { resolveVariables, replaceVariables } from '@/lib/variables'
import { Timer } from 'lucide-react'

interface Props {
  step: FunnelStep
  goNext: (answer: any, jumpToIndex?: number) => void
  answers: any[]
}

export function TimerRenderer({ step, goNext, answers }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const duration = typeof config.duration === 'number' ? config.duration : 5 // Default to 5 seconds
  const [secondsLeft, setSecondsLeft] = useState(duration)

  // Dynamic variables resolution
  const vars = resolveVariables(answers)
  const title = replaceVariables(step.title || 'Seu resultado está quase pronto...', vars)
  const description = replaceVariables(step.description || 'Aguarde alguns instantes', vars)

  useEffect(() => {
    if (secondsLeft <= 0) {
      // Auto-progress
      goNext({
        stepId: step.id,
        stepType: 'TIMER',
        value: 'Timer Concluído',
        score: typeof config.score === 'number' ? config.score : 0,
      })
      return
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft, step.id, goNext, config.score]) // eslint-disable-line

  const progressPercentage = ((duration - secondsLeft) / duration) * 100

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-6 shadow-sm shadow-indigo-100/50">
        <Timer className="h-8 w-8 animate-pulse" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mt-2.5">
          {description}
        </p>
      )}

      {/* Numerical Countdown */}
      <div className="text-6xl font-black text-indigo-600 mt-6 tracking-tighter">
        {secondsLeft}s
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden mt-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
