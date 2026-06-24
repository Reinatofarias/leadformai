'use client'

import React, { useTransition } from 'react'
import { updateFunnelTheme } from '@/actions/funnels'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { FONT_OPTIONS } from '@/lib/constants'
import { useToast } from '@/components/ui/toast'
import type { Funnel } from '@prisma/client'

export function FunnelThemeForm({ funnel }: { funnel: Funnel }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const theme = (funnel.theme as any) || {}

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newTheme = {
      ...theme,
      primaryColor: formData.get('primaryColor'),
      backgroundColor: formData.get('backgroundColor'),
      textColor: formData.get('textColor'),
      fontFamily: formData.get('fontFamily'),
      mode: formData.get('mode'),
    }

    startTransition(async () => {
      const result = await updateFunnelTheme(funnel.id, newTheme)
      if (result.success) {
        toast('Aparência salva com sucesso')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor Principal</label>
          <div className="flex gap-2">
            <input
              type="color"
              name="primaryColor"
              defaultValue={theme.primaryColor || '#6366F1'}
              className="h-9 w-9 cursor-pointer rounded border border-gray-200 p-0.5 bg-white"
            />
            <Input
              name="primaryColorHex"
              defaultValue={theme.primaryColor || '#6366F1'}
              className="flex-1 font-mono text-xs uppercase"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Fundo</label>
          <div className="flex gap-2">
            <input
              type="color"
              name="backgroundColor"
              defaultValue={theme.backgroundColor || '#FFFFFF'}
              className="h-9 w-9 cursor-pointer rounded border border-gray-200 p-0.5 bg-white"
            />
            <Input
              name="backgroundColorHex"
              defaultValue={theme.backgroundColor || '#FFFFFF'}
              className="flex-1 font-mono text-xs uppercase"
              readOnly
            />
          </div>
        </div>
      </div>

      <Select
        label="Fonte"
        name="fontFamily"
        defaultValue={theme.fontFamily || 'Inter'}
        options={FONT_OPTIONS.map(f => ({ value: f.value, label: f.label }))}
      />

      <Select
        label="Modo"
        name="mode"
        defaultValue={theme.mode || 'light'}
        options={[
          { value: 'light', label: 'Claro' },
          { value: 'dark', label: 'Escuro' },
        ]}
      />

      <div className="pt-2">
        <Button type="submit" loading={isPending} className="w-full">
          Salvar Aparência
        </Button>
      </div>
    </form>
  )
}
