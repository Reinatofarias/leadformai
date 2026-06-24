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

export function BeforeAfterForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const beforeImageUrl = formData.get('beforeImageUrl') as string
    const afterImageUrl = formData.get('afterImageUrl') as string
    const beforeLabel = formData.get('beforeLabel') as string
    const afterLabel = formData.get('afterLabel') as string
    const videoUrl = formData.get('videoUrl') as string
    const score = parseInt(formData.get('score') as string) || 0

    const newConfig = {
      title,
      description,
      beforeImageUrl,
      afterImageUrl,
      beforeLabel,
      afterLabel,
      videoUrl,
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
        placeholder="Compare os resultados antes e depois"
        required
      />

      <Input
        label="Descrição (opcional)"
        name="description"
        defaultValue={step.description || config.description || ''}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="URL da Imagem Antes"
          name="beforeImageUrl"
          defaultValue={config.beforeImageUrl || ''}
          placeholder="https://images.unsplash.com/..."
          required
        />

        <Input
          label="URL da Imagem Depois"
          name="afterImageUrl"
          defaultValue={config.afterImageUrl || ''}
          placeholder="https://images.unsplash.com/..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Legenda Antes (opcional)"
          name="beforeLabel"
          defaultValue={config.beforeLabel || 'Antes'}
          placeholder="Antes"
        />

        <Input
          label="Legenda Depois (opcional)"
          name="afterLabel"
          defaultValue={config.afterLabel || 'Depois'}
          placeholder="Depois"
        />
      </div>

      <Input
        label="URL de Vídeo de Instrução (opcional)"
        name="videoUrl"
        defaultValue={config.videoUrl || ''}
        placeholder="https://www.youtube.com/watch?v=..."
        hint="YouTube, Vimeo ou link MP4"
      />

      <Input
        type="number"
        label="Pontuação ao interagir"
        name="score"
        defaultValue={config.score || 0}
      />

      <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
