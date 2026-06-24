'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Eye, Users, TrendingUp } from 'lucide-react'
import { CLASSIFICATION_CONFIG } from '@/lib/constants'

// Dynamic Imports of Heavy Recharts Graphs
const DropoffChart = dynamic(() => import('./dropoff-chart').then(mod => mod.DropoffChart), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-50/50 animate-pulse rounded-2xl border border-slate-100/50 flex items-center justify-center text-xs font-semibold text-slate-400">
      Preparando análise de abandono...
    </div>
  )
})

const ClassificationChart = dynamic(() => import('./classification-chart').then(mod => mod.ClassificationChart), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-slate-50/50 animate-pulse rounded-2xl border border-slate-100/50 flex items-center justify-center text-xs font-semibold text-slate-400">
      Mapeando distribuição de leads...
    </div>
  )
})

interface AnalyticsProps {
  data: {
    metrics: { visitors: number; leads: number; conversionRate: number }
    classifications: { name: string; value: number }[]
    dropoff: { name: string; title: string; views: number }[]
    utms: { source: string | null; leads: number }[]
  }
}

export function FunnelAnalytics({ data }: AnalyticsProps) {
  const { metrics, classifications, dropoff, utms } = data

  const COLORS = {
    VERY_HOT: CLASSIFICATION_CONFIG.VERY_HOT.color,
    HOT: CLASSIFICATION_CONFIG.HOT.color,
    WARM: CLASSIFICATION_CONFIG.WARM.color,
    COLD: CLASSIFICATION_CONFIG.COLD.color,
    'Sem Classificação': '#9CA3AF'
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Visitantes</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{metrics.visitors}</p>
            </div>
            <div className="rounded-2xl p-3.5 bg-blue-50/80 text-blue-600 shadow-sm">
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </Card>
        
        <Card className="border-slate-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leads Capturados</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{metrics.leads}</p>
            </div>
            <div className="rounded-2xl p-3.5 bg-emerald-50/80 text-emerald-600 shadow-sm">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200/50 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Conversão</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{metrics.conversionRate}%</p>
            </div>
            <div className="rounded-2xl p-3.5 bg-amber-50/80 text-amber-600 shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dropoff Chart */}
        <Card className="border-slate-200/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">Abandono por Etapa</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Visualizações e funil de conversão por etapa</p>
          </div>
          <DropoffChart data={dropoff} />
        </Card>

        {/* Classification Pie */}
        <Card className="border-slate-200/50 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800">Classificação de Leads</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Distribuição por temperatura e pontuação</p>
          </div>
          {metrics.leads === 0 ? (
            <div className="h-[300px] w-full flex items-center justify-center text-xs font-medium text-slate-400">
              Nenhum lead com classificação gerado ainda.
            </div>
          ) : (
            <ClassificationChart 
              classifications={classifications} 
              colors={COLORS} 
              leadsCount={metrics.leads} 
            />
          )}
        </Card>
      </div>

      {/* UTMs Table */}
      <Card className="border-slate-200/50 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Top Origens (UTM Source)</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Mapeamento de origens que geraram leads convertidos</p>
        </div>
        {utms.length === 0 ? (
          <p className="text-xs font-semibold text-slate-400 py-4 text-center">Nenhuma origem mapeada até o momento.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-2xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Origem (Source)</th>
                  <th className="px-5 py-3.5 text-right">Leads Gerados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {utms.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800 text-xs">{u.source || 'Tráfego Direto / Orgânico'}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-800 text-xs">{u.leads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

