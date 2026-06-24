'use client'

import React, { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createFunnel } from '@/actions/funnels'
import { generateFunnelWithAI } from '@/actions/ai'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { slugify } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import { ArrowLeft, Sparkles, Plus, Settings, Check } from 'lucide-react'
import Link from 'next/link'

export default function NewFunnelPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')
  
  // Manual creation state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [state, formAction, isPending] = useActionState<{ success: boolean; error?: string } | null, FormData>(
    async (_prev, formData) => {
      const result = await createFunnel(formData)
      return result as { success: boolean; error?: string }
    },
    null
  )

  // AI Generation state
  const [niche, setNiche] = useState('solar')
  const [goal, setGoal] = useState('Qualificar Leads')
  const [isAiPending, startAiTransition] = useTransition()

  const handleAiGenerate = () => {
    startAiTransition(async () => {
      const result = await generateFunnelWithAI(niche, goal)
      if (result.success && result.funnelId) {
        toast('Funil gerado pela inteligência artificial!', 'success')
        router.push(`/dashboard/funnels/${result.funnelId}/edit`)
      } else {
        toast(result.error || 'Erro ao gerar funil com IA.', 'error')
      }
    })
  }

  return (
    <>
      <PageHeader
        title="Novo Funil"
        description="Escolha entre configurar manualmente ou gerar instantaneamente usando nossa Inteligência Artificial"
        action={
          <Link href="/dashboard/funnels">
            <Button variant="ghost" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        }
      />

      <div className="mt-8 max-w-xl space-y-6">
        {/* Toggle Mode Tabs */}
        <div className="flex rounded-2xl border border-slate-200/60 bg-white p-1.5 shadow-sm shadow-slate-100/50">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'manual'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="h-4 w-4" />
            Configurar Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/10'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 fill-white/10" />
            Gerador com IA ⚡
          </button>
        </div>

        {mode === 'manual' ? (
          <Card className="animate-in fade-in duration-250 p-6 rounded-2xl border border-slate-200/60 bg-white shadow-md shadow-slate-100/50">
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="rounded-xl bg-red-50 border border-red-150 p-4 text-xs font-semibold text-red-700">
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

              <Button type="submit" loading={isPending} className="w-full h-[46px] rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-850 mt-4">
                Criar Funil em Branco
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="animate-in fade-in duration-250 p-6 rounded-2xl border border-slate-200/60 bg-white shadow-md shadow-slate-100/50">
            <div className="space-y-4">
              <Select
                label="Nicho do Negócio / Modelo de Funil"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                options={[
                  { value: 'solar', label: '☀️ Energia Solar (Simulador de Economia)' },
                  { value: 'imoveis', label: '🏠 Mercado Imobiliário (Ficha de Interesse)' },
                  { value: 'marketing', label: '📈 Marketing & Vendas (Auditoria de Maturidade)' },
                  { value: 'fitness', label: '💪 Fitness & Personal Trainer (Ficha de Treino)' },
                ]}
              />

              <Select
                label="Objetivo Comercial do Funil"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                options={[
                  { value: 'Qualificar Leads', label: '🎯 Qualificar Leads (Pontuação Inteligente)' },
                  { value: 'Agendar Reunião', label: '📅 Agendar Reunião de Consultoria' },
                  { value: 'Vender Serviço', label: '💰 Apresentar Oferta / Vender Serviço' },
                ]}
              />

              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 text-xs text-indigo-700 leading-relaxed font-medium space-y-1.5">
                <span className="font-extrabold uppercase text-[10px] tracking-wide text-indigo-500 block mb-1">O que a IA criará para você:</span>
                <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-500" /> Cópia persuasiva otimizada para o nicho escolhido</p>
                <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-500" /> Fluxo completo de perguntas com pontuação configurada</p>
                <p className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-indigo-500" /> Componentes avançados (Antes/Depois, Vídeo, Prova Social)</p>
              </div>

              <Button
                type="button"
                onClick={handleAiGenerate}
                loading={isAiPending}
                className="w-full h-[46px] rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-md shadow-indigo-500/10 mt-4"
              >
                Gerar Funil com IA ⚡
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
