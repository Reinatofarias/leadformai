import React from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function OpenQuestionForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get('title') as string
    
    const newConfig = {
      title,
      fieldType: formData.get('fieldType') as string,
      placeholder: formData.get('placeholder') as string,
      required: formData.get('required') === 'on',
      variableName: formData.get('variableName') as string,
    }

    onSave(title, '', newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Pergunta"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="Qual é a sua maior dificuldade hoje?"
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tipo do Campo"
          name="fieldType"
          defaultValue={config.fieldType || 'text'}
          options={[
            { value: 'text', label: 'Texto (curto)' },
            { value: 'email', label: 'E-mail' },
            { value: 'phone', label: 'Telefone' },
            { value: 'number', label: 'Número' },
          ]}
        />

        <Input
          label="Placeholder"
          name="placeholder"
          defaultValue={config.placeholder || ''}
          placeholder="Ex: Falta de tempo"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nome da Variável (Opcional)"
          name="variableName"
          defaultValue={config.variableName || ''}
          placeholder="Ex: dificuldade_principal"
          hint="Usado para substituir em mensagens"
        />

        <div className="flex items-center pt-8">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              name="required"
              defaultChecked={config.required !== false}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Resposta Obrigatória
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
