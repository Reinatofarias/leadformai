import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function CaptureFormForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}
  
  const defaultFields = [
    { id: 'name', name: 'nome', label: 'Nome Completo', type: 'text', required: true, enabled: true },
    { id: 'email', name: 'email', label: 'E-mail', type: 'email', required: true, enabled: true },
    { id: 'phone', name: 'telefone', label: 'WhatsApp', type: 'phone', required: true, enabled: true },
    { id: 'company', name: 'empresa', label: 'Empresa', type: 'text', required: false, enabled: false },
  ]

  const [fields, setFields] = useState<any[]>(config.fields || defaultFields)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    
    const newConfig = {
      title,
      description,
      buttonText: formData.get('buttonText') as string,
      fields: fields.filter(f => f.enabled),
    }

    onSave(title, description, newConfig)
  }

  const toggleField = (id: string, property: 'enabled' | 'required') => {
    setFields(fields.map(f => f.id === id ? { ...f, [property]: !f[property] } : f))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título do Formulário"
        name="title"
        defaultValue={step.title || config.title || 'Preencha seus dados'}
        required
      />
      
      <Textarea
        label="Descrição (opcional)"
        name="description"
        defaultValue={step.description || config.description || 'Para ver seu resultado, precisamos de algumas informações.'}
      />
      
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <label className="block text-sm font-medium text-gray-700">Campos do Formulário</label>
        
        <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
          {fields.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-3 bg-white">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={field.enabled}
                  onChange={() => toggleField(field.id, 'enabled')}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`text-sm font-medium ${field.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {field.label}
                </span>
              </div>
              
              {field.enabled && (
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => toggleField(field.id, 'required')}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Obrigatório
                </label>
              )}
            </div>
          ))}
        </div>
      </div>

      <Input
        label="Texto do Botão"
        name="buttonText"
        defaultValue={config.buttonText || 'Ver meu resultado'}
        required
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
