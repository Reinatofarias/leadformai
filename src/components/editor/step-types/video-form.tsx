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

export function VideoForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const videoUrl = formData.get('videoUrl') as string
    const buttonText = formData.get('buttonText') as string
    const score = parseInt(formData.get('score') as string) || 0

    const newConfig = {
      title,
      description,
      videoUrl,
      buttonText,
      score,
    }

    onSave(title, description, newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título da Etapa"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Assista ao vídeo abaixo"
        required
      />

      <Input
        label="Descrição (opcional)"
        name="description"
        defaultValue={step.description || config.description || ''}
        placeholder="Informações adicionais sobre o vídeo..."
      />

      <Input
        label="URL do Vídeo (YouTube, Vimeo ou MP4)"
        name="videoUrl"
        defaultValue={config.videoUrl || ''}
        placeholder="https://www.youtube.com/watch?v=..."
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Texto do Botão de Ação"
          name="buttonText"
          defaultValue={config.buttonText || 'Continuar'}
          required
        />
        <Input
          type="number"
          label="Pontuação ao assistir"
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
