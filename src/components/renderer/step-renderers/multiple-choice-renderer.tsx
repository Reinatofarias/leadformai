import React from 'react'
import type { FunnelStep } from '@prisma/client'

interface Option {
  id: string
  text: string
  score?: number
  variable?: string
  goToStep?: number
}

interface Props {
  step: FunnelStep
  goNext: (answer: any, jumpToIndex?: number) => void
}

export function MultipleChoiceRenderer({ step, goNext }: Props) {
  const config = (step.config as any) || {}
  const options: Option[] = config.options || []

  const handleSelect = (option: Option) => {
    // Pulo condicional
    let jumpToIndex = undefined
    if (option.goToStep !== undefined && option.goToStep > 0) {
      jumpToIndex = option.goToStep - 1 // Arrays are 0-indexed, config is 1-indexed
    }

    goNext(
      {
        stepId: step.id,
        stepType: 'MULTIPLE_CHOICE',
        value: option.text,
        score: option.score || 0,
      },
      jumpToIndex
    )
  }

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text,#1F2937)] mb-3 leading-tight">
          {step.title}
        </h2>
        {step.description && (
          <p className="text-[var(--color-text,#1F2937)] opacity-70">
            {step.description}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className="w-full text-left p-4 sm:p-5 rounded-2xl border-2 border-[var(--color-primary)]/15 bg-white hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-200 group active:scale-[0.98] cursor-pointer shadow-sm"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] font-medium text-gray-400 transition-colors">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="text-lg font-medium text-[var(--color-text,#1F2937)] group-hover:text-[var(--color-primary)] transition-colors">
                {option.text}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
