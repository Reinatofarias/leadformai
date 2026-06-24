'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { PhonePreview } from './phone-preview'
import type { Funnel, FunnelStep } from '@prisma/client'

// Dynamic Imports with elegant loading placeholders to make editing pages feel fast
const FunnelStepsEditor = dynamic(() => import('./funnel-steps-editor').then(mod => mod.FunnelStepsEditor), {
  ssr: false,
  loading: () => <div className="h-96 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse flex items-center justify-center text-sm text-slate-400">Carregando editor de etapas...</div>
})

const FunnelSettingsForm = dynamic(() => import('@/components/funnels/funnel-settings-form').then(mod => mod.FunnelSettingsForm), {
  ssr: false,
  loading: () => <div className="h-48 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse flex items-center justify-center text-sm text-slate-400">Carregando configurações...</div>
})

const FunnelThemeForm = dynamic(() => import('@/components/funnels/funnel-theme-form').then(mod => mod.FunnelThemeForm), {
  ssr: false,
  loading: () => <div className="h-48 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse flex items-center justify-center text-sm text-slate-400">Carregando aparência...</div>
})

type FunnelWithSteps = Funnel & { steps: FunnelStep[] }

interface EditorLayoutProps {
  funnel: FunnelWithSteps
}

export function EditorLayout({ funnel }: EditorLayoutProps) {
  const [activeStep, setActiveStep] = useState<FunnelStep | null>(null)

  const themeConfig = (funnel.theme as any) || {
    primaryColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    mode: 'light',
    fontFamily: 'Inter',
    borderRadius: 12
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
      {/* Editor Panel (2/3 screen) */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-slate-200/50 p-0 overflow-hidden shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Jornada do Funil</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Adicione, ordene e edite cada etapa da experiência do lead.</p>
          </div>
          <FunnelStepsEditor 
            funnel={funnel} 
            onActiveStepChange={(step) => setActiveStep(step)} 
          />
        </Card>
      </div>

      {/* Preview and Theme Panel (1/3 screen) */}
      <div className="space-y-6">
        {/* Phone Preview Mockup */}
        <Card className="border-slate-200/50 bg-slate-50/40 py-6 px-4 flex justify-center">
          <PhonePreview 
            step={activeStep} 
            theme={themeConfig} 
            funnelName={funnel.name} 
          />
        </Card>

        {/* General Settings Form */}
        <Card className="border-slate-200/50">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-base font-bold text-slate-800">Configurações Gerais</h2>
            <p className="text-2xs text-slate-400 font-medium mt-0.5">Definição de links e WhatsApp de destino</p>
          </div>
          <FunnelSettingsForm funnel={funnel} />
        </Card>

        {/* Theme Settings Form */}
        <Card className="border-slate-200/50">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h2 className="text-base font-bold text-slate-800">Estilo & Aparência</h2>
            <p className="text-2xs text-slate-400 font-medium mt-0.5">Cores, fontes e formato dos botões</p>
          </div>
          <FunnelThemeForm funnel={funnel} />
        </Card>
      </div>
    </div>
  )
}
