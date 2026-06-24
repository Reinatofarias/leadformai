'use client'

import React, { useActionState } from 'react'
import { createFunnel } from '@/actions/funnels'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { slugify } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewFunnelPage() {
  const [state, formAction, isPending] = useActionState<{ success: boolean; error?: string } | null, FormData>(
    async (_prev, formData) => {
      const result = await createFunnel(formData)
      return result as { success: boolean; error?: string }
    },
    null
  )

  const [name, setName] = React.useState('')
  const [slug, setSlug] = React.useState('')

  return (
    <>
      <PageHeader
        title="Novo Funil"
        description="Configure seu novo funil interativo"
        action={
          <Link href="/dashboard/funnels">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <Card className="max-w-xl">
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <Input
            label="Nome do funil"
            name="name"
            placeholder="Ex: Diagnóstico de Marketing Digital"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSlug(slugify(e.target.value))
            }}
            required
          />

          <Input
            label="Slug (URL pública)"
            name="slug"
            placeholder="diagnostico-marketing-digital"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            hint={slug ? `Seu funil ficará em: /f/${slug}` : undefined}
            required
          />

          <Button type="submit" loading={isPending} className="w-full">
            Criar Funil
          </Button>
        </form>
      </Card>
    </>
  )
}
