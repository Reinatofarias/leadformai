import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function LoadingForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const text = formData.get('text') as string
    
    const newConfig = {
      text,
      duration: parseInt(formData.get('duration') as string) || 3,
    }

    onSave('Loading', text, newConfig) // Title is fixed to "Loading", description is the text
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Texto da Animação"
        name="text"
        defaultValue={config.text || 'Analisando suas respostas...'}
        placeholder="Analisando seu perfil..."
        required
      />
      
      <Input
        label="Duração (segundos)"
        name="duration"
        type="number"
        min={1}
        max={10}
        defaultValue={config.duration || 3}
        required
        hint="Tempo que o loading ficará na tela antes de avançar automaticamente."
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
