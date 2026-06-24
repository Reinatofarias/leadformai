'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function OfferForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const priceLabel = formData.get('priceLabel') as string
    const ctaText = formData.get('ctaText') as string
    const ctaType = formData.get('ctaType') as string
    const ctaUrl = formData.get('ctaUrl') as string
    const score = parseInt(formData.get('score') as string) || 0

    const newConfig = {
      title,
      description,
      imageUrl,
      priceLabel,
      ctaText,
      ctaType,
      ctaUrl,
      score,
    }

    onSave(title, description, newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título da Oferta"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Adquira nossa mentoria exclusiva!"
        required
      />

      <Input
        label="Descrição / Detalhes (Suporta {{nome}}, etc.)"
        name="description"
        defaultValue={step.description || config.description || ''}
        placeholder="Olá {{nome}}, temos uma oferta especial..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="URL da Imagem da Oferta"
          name="imageUrl"
          defaultValue={config.imageUrl || ''}
          placeholder="https://images.unsplash.com/..."
        />
        <Input
          label="Etiqueta de Preço / Desconto"
          name="priceLabel"
          defaultValue={config.priceLabel || ''}
          placeholder="Ex: De R$ 297 por R$ 97"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Texto do Botão CTA"
          name="ctaText"
          defaultValue={config.ctaText || 'Comprar Agora'}
          required
        />
        <Select
          label="Ação do Botão"
          name="ctaType"
          defaultValue={config.ctaType || 'next'}
          options={[
            { value: 'next', label: 'Avançar no Funil' },
            { value: 'url', label: 'Redirecionar para Link Externo' },
          ]}
        />
      </div>

      <Input
        label="URL de Destino (apenas se Redirecionar)"
        name="ctaUrl"
        defaultValue={config.ctaUrl || ''}
        placeholder="https://checkout.pay.com/..."
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
