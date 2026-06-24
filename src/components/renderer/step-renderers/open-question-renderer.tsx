import React, { useState } from 'react'
import type { FunnelStep } from '@prisma/client'
import { ArrowRight } from 'lucide-react'

interface Props {
  step: FunnelStep
  goNext: (answer: any) => void
  answers: any[] // to populate default value if going back
}

export function OpenQuestionRenderer({ step, goNext, answers }: Props) {
  const config = (step.config as any) || {}
  
  // Find previous answer if exists
  const previousAnswer = answers.find(a => a.stepId === step.id)
  const [value, setValue] = useState(previousAnswer?.value || '')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (config.required !== false && !value.trim()) {
      setError('Por favor, preencha este campo.')
      return
    }

    if (config.fieldType === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Por favor, insira um e-mail válido.')
      return
    }

    setError('')
    goNext({
      stepId: step.id,
      stepType: 'OPEN_QUESTION',
      value: value.trim(),
    })
  }

  // Determine input type
  let inputType = 'text'
  if (config.fieldType === 'email') inputType = 'email'
  if (config.fieldType === 'number') inputType = 'number'
  if (config.fieldType === 'phone') inputType = 'tel'

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text,#1F2937)] mb-3 leading-tight">
          {step.title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          {config.fieldType === 'text' && (!config.maxLength || config.maxLength > 100) ? (
            <textarea
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              placeholder={config.placeholder || 'Sua resposta...'}
              className="w-full min-h-[120px] p-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-0 text-lg bg-white resize-y transition-colors outline-none"
            />
          ) : (
            <input
              type={inputType}
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              placeholder={config.placeholder || 'Sua resposta...'}
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-0 text-lg bg-white transition-colors outline-none"
            />
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary,#6366F1)] text-white hover:opacity-90 active:scale-95 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-md cursor-pointer mt-4"
        >
          Continuar
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </div>
  )
}
