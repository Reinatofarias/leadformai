'use client'

import React, { useActionState, useEffect } from 'react'
import { updateFunnel } from '@/actions/funnels'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { slugify } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import type { Funnel } from '@prisma/client'

export function FunnelSettingsForm({ funnel }: { funnel: Funnel }) {
  const { toast } = useToast()
  const [slug, setSlug] = React.useState(funnel.slug)
  
  const [state, formAction, isPending] = useActionState<{ success: boolean; error?: string } | null, FormData>(
    async (_prev, formData) => {
      const result = await updateFunnel(funnel.id, formData)
      if (result.success) {
        toast('Configurações salvas com sucesso')
      }
      return result as { success: boolean; error?: string }
    },
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Input
        label="Nome"
        name="name"
        defaultValue={funnel.name}
        required
      />

      <Input
        label="Slug (URL pública)"
        name="slug"
        value={slug}
        onChange={(e) => setSlug(slugify(e.target.value))}
        hint={`URL: /f/${slug}`}
        required
      />

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Integração WhatsApp</h3>
        
        <Input
          label="Número do WhatsApp"
          name="whatsappNumber"
          defaultValue={funnel.whatsappNumber || ''}
          placeholder="5511999999999"
          hint="Apenas números, com DDI"
        />

        <div className="mt-4">
          <Textarea
            label="Mensagem padrão"
            name="whatsappMessage"
            defaultValue={funnel.whatsappMessage || ''}
            placeholder="Olá! Quero saber mais."
            hint="Variáveis: {{nome}}, {{classificacao}}, {{pontuacao}}"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isPending} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
