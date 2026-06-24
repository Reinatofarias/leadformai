'use client'

import React, { useActionState, useState, useTransition } from 'react'
import { updateFunnel } from '@/actions/funnels'
import { testWebhookUrl } from '@/actions/webhooks'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { slugify } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import type { Funnel } from '@prisma/client'

export function FunnelSettingsForm({ funnel }: { funnel: Funnel }) {
  const { toast } = useToast()
  const [slug, setSlug] = useState(funnel.slug)
  const [webhookUrl, setWebhookUrl] = useState(funnel.webhookUrl || '')
  const [isTesting, startTestTransition] = useTransition()
  const [testResult, setTestResult] = useState<{ success: boolean; statusCode?: number; responseTimeMs?: number; error?: string } | null>(null)

  const handleTestWebhook = () => {
    if (!webhookUrl) {
      toast('Por favor, informe uma URL de webhook para testar.', 'error')
      return
    }
    setTestResult(null)
    startTestTransition(async () => {
      const result = await testWebhookUrl(webhookUrl)
      setTestResult(result)
      if (result.success) {
        toast('Webhook de teste enviado com sucesso!', 'success')
      } else {
        toast(result.error || 'Erro ao testar o webhook.', 'error')
      }
    })
  }
  
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
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Integração WhatsApp</h3>
        
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

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Rastreamento & Webhook (Premium)</h3>
        
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
          <div className="flex-1 w-full">
            <Input
              label="URL de Webhook"
              name="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://sua-api.com/webhook"
              hint="Dispara um POST com os dados do lead em tempo real"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestWebhook}
            loading={isTesting}
            className="w-full sm:w-auto h-[42px] shrink-0 mb-6"
          >
            Testar Conexão
          </Button>
        </div>

        {testResult && (
          <div className={`mb-4 p-3.5 rounded-xl border text-xs leading-relaxed animate-slide-down ${
            testResult.success 
              ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50/50 border-red-100 text-red-800'
          }`}>
            <div className="font-bold flex items-center justify-between">
              <span>{testResult.success ? '✅ Webhook respondendo corretamente' : '❌ Falha na conexão com o Webhook'}</span>
              {testResult.responseTimeMs !== undefined && (
                <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-white/60 shadow-3xs">
                  {testResult.responseTimeMs} ms
                </span>
              )}
            </div>
            {testResult.statusCode && (
              <p className="mt-1 font-medium">Código HTTP: <strong className="font-extrabold">{testResult.statusCode}</strong></p>
            )}
            {testResult.error && (
              <p className="mt-1 font-medium">{testResult.error}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Input
            label="Facebook Pixel ID"
            name="facebookPixelId"
            defaultValue={funnel.facebookPixelId || ''}
            placeholder="1234567890"
            hint="Rastrear eventos no Facebook"
          />

          <Input
            label="Google Tag Manager ID"
            name="googleTagManagerId"
            defaultValue={funnel.googleTagManagerId || ''}
            placeholder="GTM-XXXXXX"
            hint="Rastrear via contêiner GTM"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Domínio Personalizado (Elite)</h3>
        
        <Input
          label="Domínio Próprio"
          name="customDomain"
          defaultValue={funnel.customDomain || ''}
          placeholder="leads.seu-dominio.com"
          hint="Aponte um CNAME para o nosso domínio para usar a URL própria"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" loading={isPending} className="w-full">
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
