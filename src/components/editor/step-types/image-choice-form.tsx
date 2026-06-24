'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical, Image } from 'lucide-react'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

interface ImageOption {
  id: string
  text: string
  imageUrl: string
  score: number
  priceValue?: number
}

export function ImageChoiceForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const [options, setOptions] = useState<ImageOption[]>(
    config.options || [
      { id: crypto.randomUUID(), text: 'Opção 1', imageUrl: '', score: 10, priceValue: 0 },
      { id: crypto.randomUUID(), text: 'Opção 2', imageUrl: '', score: 0, priceValue: 0 },
    ]
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const videoUrl = formData.get('videoUrl') as string

    const newConfig = {
      title,
      description,
      videoUrl,
      options,
    }

    onSave(title, description, newConfig)
  }

  const addOption = () => {
    setOptions([
      ...options,
      { id: crypto.randomUUID(), text: `Opção ${options.length + 1}`, imageUrl: '', score: 0, priceValue: 0 },
    ])
  }

  const removeOption = (id: string) => {
    if (options.length <= 2) return
    setOptions(options.filter((o) => o.id !== id))
  }

  const updateOption = (id: string, field: keyof ImageOption, value: any) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Pergunta"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Qual é a sua escolha?"
        required
      />

      <Input
        label="Descrição (opcional)"
        name="description"
        defaultValue={step.description || config.description || ''}
      />

      <Input
        label="URL de Vídeo de Instrução (opcional)"
        name="videoUrl"
        defaultValue={config.videoUrl || ''}
        placeholder="https://www.youtube.com/watch?v=..."
        hint="YouTube, Vimeo ou link MP4"
      />

      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider">Opções com Imagem</label>
          <Button type="button" variant="ghost" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Opção
          </Button>
        </div>

        <div className="space-y-4">
          {options.map((opt, index) => (
            <div key={opt.id} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="text-gray-300 cursor-move">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOption(opt.id, 'text', e.target.value)}
                    placeholder="Nome da opção"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(opt.id)}
                  disabled={options.length <= 2}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    value={opt.imageUrl}
                    onChange={(e) => updateOption(opt.id, 'imageUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    label="URL da Imagem"
                    icon={<Image className="h-4 w-4 text-slate-400" />}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    value={opt.score}
                    onChange={(e) => updateOption(opt.id, 'score', parseInt(e.target.value) || 0)}
                    label="Pontos"
                  />
                  <Input
                    type="number"
                    value={opt.priceValue || 0}
                    onChange={(e) => updateOption(opt.id, 'priceValue', parseInt(e.target.value) || 0)}
                    label="Preço (+R$)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
