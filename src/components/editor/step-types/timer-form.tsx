'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function TimerForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const duration = parseInt(formData.get('duration') as string) || 5
    const score = parseInt(formData.get('score') as string) || 0

    const newConfig = {
      title,
      description,
      duration,
      score,
    }

    onSave(title, description, newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título do Timer"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Analisando suas respostas..."
        required
      />

      <Input
        label="Descrição"
        name="description"
        defaultValue={step.description || config.description || ''}
        placeholder="Aguarde alguns segundos"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Duração (em segundos)"
          name="duration"
          defaultValue={config.duration || 5}
          min={1}
          max={60}
          required
        />
        <Input
          type="number"
          label="Pontuação ao concluir"
          name="score"
          defaultValue={config.score || 0}
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
