'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { getFunnelFlowAnalytics } from '@/actions/funnels'
import { STEP_TYPE_CONFIG } from '@/lib/constants'
import { Card } from '@/components/ui/card'
import { Eye, TrendingUp, ArrowDownRight, Users, Play, Sparkles, HelpCircle } from 'lucide-react'
import type { FunnelStep } from '@prisma/client'

interface Props {
  funnelId: string
  steps: FunnelStep[]
}

interface StepAnalytics {
  stepId: string
  title: string
  type: string
  views: number
  conversionRate: number
  dropoutRate: number
}

export function FlowCanvas({ funnelId, steps }: Props) {
  const [analytics, setAnalytics] = useState<StepAnalytics[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getFunnelFlowAnalytics(funnelId)
        setAnalytics(data)
      } catch (err) {
        console.error('Erro ao buscar analíticos de fluxo:', err)
      }
    })
  }, [funnelId, steps])

  return (
    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
      {isPending && analytics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mb-4" />
          <p className="text-sm font-medium">Carregando fluxo de jornada...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          {steps.map((step, index) => {
            const stepAnalytic = analytics.find((a) => a.stepId === step.id)
            const views = stepAnalytic?.views ?? 0
            const conversionRate = stepAnalytic?.conversionRate ?? 100
            const dropoutRate = stepAnalytic?.dropoutRate ?? 0

            const configType = STEP_TYPE_CONFIG[step.type as keyof typeof STEP_TYPE_CONFIG]
            const typeColor = configType?.color || '#6366F1'

            return (
              <React.Fragment key={step.id}>
                {/* Step Node Block */}
                <div 
                  className="w-full max-w-md bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all duration-300 rounded-2xl p-5 shadow-sm shadow-slate-100 flex gap-4 items-center group relative overflow-hidden"
                >
                  {/* Color Left Border Strip */}
                  <div 
                    className="absolute top-0 bottom-0 left-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: typeColor }}
                  />

                  {/* Step Order Circle */}
                  <div 
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/50"
                  >
                    #{index + 1}
                  </div>

                  {/* Title & Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/30 uppercase tracking-wider">
                        {configType?.label || step.type}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 truncate mt-1 group-hover:text-indigo-600 transition-colors">
                      {step.title || 'Sem título'}
                    </h4>
                    
                    {/* View Metrics */}
                    <div className="flex items-center gap-3.5 mt-2.5 text-slate-400 font-semibold text-2xs uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <Eye className="h-3.5 w-3.5 text-slate-300" />
                        {views.toLocaleString()} visualizações
                      </span>
                    </div>
                  </div>
                </div>

                {/* SVG Dotted Line Arrow + Analytics Overlay Badge */}
                {index < steps.length - 1 && (
                  <div className="relative w-full flex flex-col items-center">
                    {/* SVG Connector Path */}
                    <svg className="w-12 h-20 text-slate-300/80" fill="none" viewBox="0 0 48 80">
                      <path 
                        d="M24 0v80" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeDasharray="5 5" 
                        className="animate-[dash_2s_linear_infinite]" 
                      />
                      <polygon points="24,80 18,68 30,68" fill="currentColor" />
                    </svg>

                    {/* Overlay Analytics Badge */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur border border-slate-200/60 rounded-2xl px-4 py-2 shadow-md shadow-slate-100/50 flex flex-col items-center gap-0.5 min-w-[130px]"
                    >
                      <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Conversão</span>
                      <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" />
                        {conversionRate}%
                      </span>
                      {dropoutRate > 0 && (
                        <span className="text-4xs font-bold text-red-500 uppercase tracking-widest mt-0.5">
                          {dropoutRate}% abandono
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
