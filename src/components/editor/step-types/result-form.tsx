import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function ResultForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}
  
  // This is a simplified version of Result form. A full one would include
  // conditional results based on scores.
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    
    const newConfig = {
      title,
      description,
      showScore: formData.get('showScore') === 'on',
      showClassification: formData.get('showClassification') === 'on',
      defaultCta: {
        text: formData.get('ctaText') as string,
        type: formData.get('ctaType') as string,
        url: formData.get('ctaUrl') as string,
      }
    }

    onSave(title, description, newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título do Resultado"
        name="title"
        defaultValue={step.title || config.title || 'Seu resultado está pronto!'}
        required
      />
      
      <Textarea
        label="Descrição"
        name="description"
        defaultValue={step.description || config.description || ''}
      />
      
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="showScore"
            defaultChecked={config.showScore === true}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Mostrar Pontuação (0-100)
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            name="showClassification"
            defaultChecked={config.showClassification !== false}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Mostrar Classificação (Frio, Morno, Quente...)
        </label>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Botão de Chamada para Ação (CTA)</h4>
        
        <Select
          label="Ação do Botão"
          name="ctaType"
          defaultValue={config.defaultCta?.type || 'none'}
          options={[
            { value: 'none', label: 'Nenhum botão' },
            { value: 'whatsapp', label: 'Enviar para WhatsApp' },
            { value: 'url', label: 'Abrir URL Externa' },
          ]}
        />
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label="Texto do Botão"
            name="ctaText"
            defaultValue={config.defaultCta?.text || ''}
            placeholder="Falar com especialista"
          />
          
          <Input
            label="URL / Destino"
            name="ctaUrl"
            defaultValue={config.defaultCta?.url || ''}
            placeholder="https://exemplo.com ou 5511999999999"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
