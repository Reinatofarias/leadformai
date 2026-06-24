import React from 'react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function WelcomeForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    
    const newConfig = {
      title,
      subtitle: description, // description matches subtitle in this context
      imageUrl: formData.get('imageUrl') as string,
      buttonText: formData.get('buttonText') as string,
    }

    onSave(title, description, newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título Principal"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Descubra o funil perfeito para você"
        required
      />
      
      <Textarea
        label="Subtítulo / Descrição"
        name="description"
        defaultValue={step.description || config.subtitle || ''}
        placeholder="Responda a algumas perguntas para iniciarmos..."
      />
      
      <Input
        label="URL da Imagem (opcional)"
        name="imageUrl"
        type="url"
        defaultValue={config.imageUrl || ''}
        placeholder="https://exemplo.com/imagem.png"
      />
      
      <Input
        label="Texto do Botão"
        name="buttonText"
        defaultValue={config.buttonText || 'Começar Agora'}
        required
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
