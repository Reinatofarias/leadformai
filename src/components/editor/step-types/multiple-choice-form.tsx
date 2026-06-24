import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function MultipleChoiceForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}
  
  const [options, setOptions] = useState<{ id: string; text: string; score: number }[]>(
    config.options || [
      { id: crypto.randomUUID(), text: 'Opção 1', score: 10 },
      { id: crypto.randomUUID(), text: 'Opção 2', score: 0 },
    ]
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    
    const newConfig = {
      title,
      description,
      options,
    }

    onSave(title, description, newConfig)
  }

  const addOption = () => {
    setOptions([...options, { id: crypto.randomUUID(), text: `Opção ${options.length + 1}`, score: 0 }])
  }

  const removeOption = (id: string) => {
    if (options.length <= 2) return // Mínimo 2
    setOptions(options.filter(o => o.id !== id))
  }

  const updateOption = (id: string, field: 'text' | 'score', value: string | number) => {
    setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Pergunta"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Qual é o seu principal objetivo?"
        required
      />
      
      <Input
        label="Descrição (opcional)"
        name="description"
        defaultValue={step.description || config.description || ''}
      />
      
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Opções de Resposta</label>
          <Button type="button" variant="ghost" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Opção
          </Button>
        </div>

        <div className="space-y-2">
          {options.map((opt, index) => (
            <div key={opt.id} className="flex items-center gap-2">
              <div className="text-gray-300 cursor-move">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Input
                  value={opt.text}
                  onChange={(e) => updateOption(opt.id, 'text', e.target.value)}
                  placeholder="Texto da opção"
                  required
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={opt.score}
                  onChange={(e) => updateOption(opt.id, 'score', parseInt(e.target.value) || 0)}
                  placeholder="Pts"
                  title="Pontuação"
                />
              </div>
              <button
                type="button"
                onClick={() => removeOption(opt.id)}
                disabled={options.length <= 2}
                className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
