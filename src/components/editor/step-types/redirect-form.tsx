import React from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

export function RedirectForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const redirectType = formData.get('redirectType') as string
    
    const newConfig = {
      redirectType,
      url: formData.get('url') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
      whatsappMessage: formData.get('whatsappMessage') as string,
      delay: parseInt(formData.get('delay') as string) || 0,
      message: formData.get('message') as string,
    }

    onSave('Redirecionamento', 'Redirecionamento Automático', newConfig)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Tipo de Redirecionamento"
        name="redirectType"
        defaultValue={config.redirectType || 'whatsapp'}
        options={[
          { value: 'whatsapp', label: 'Para WhatsApp' },
          { value: 'external_url', label: 'URL Externa' },
        ]}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="URL Externa (se aplicável)"
          name="url"
          type="url"
          defaultValue={config.url || ''}
          placeholder="https://exemplo.com"
        />

        <Input
          label="Atraso (segundos)"
          name="delay"
          type="number"
          min={0}
          max={10}
          defaultValue={config.delay || 0}
          hint="0 = imediato"
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">WhatsApp Específico desta Etapa</h4>
        <p className="text-xs text-gray-500 mb-4">Se deixado em branco, usará o WhatsApp configurado nas opções gerais do funil.</p>
        
        <Input
          label="Número do WhatsApp (opcional)"
          name="whatsappNumber"
          defaultValue={config.whatsappNumber || ''}
          placeholder="5511999999999"
        />
        
        <div className="mt-4">
          <Textarea
            label="Mensagem Específica (opcional)"
            name="whatsappMessage"
            defaultValue={config.whatsappMessage || ''}
            placeholder="Vim pelo funil com a classificação {{classificacao}}!"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
