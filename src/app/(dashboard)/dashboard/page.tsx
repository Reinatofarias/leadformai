import React, { Suspense } from 'react'
import Link from 'next/link'
import { getWorkspaceStats, getWorkspaceFunnels } from '@/lib/workspace'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import { Zap, Users, Eye, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { MetricsGridSkeleton } from '@/components/layout/dashboard-skeleton'
import { PlanLimitsWidget } from '@/components/dashboard/plan-limits-widget'

async function DashboardMetrics() {
  const stats = await getWorkspaceStats()

  const statCards = [
    {
      label: 'Total de Funis',
      value: stats.funnelsCount,
      icon: Zap,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/80',
    },
    {
      label: 'Visitantes',
      value: stats.visitorsCount,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50/80',
    },
    {
      label: 'Leads Capturados',
      value: stats.leadsCount,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/80',
    },
    {
      label: 'Taxa de Conversão',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bg: 'bg-amber-50/80',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
      {statCards.map((stat) => (
        <Card key={stat.label} className="border-slate-200/50 hover:border-indigo-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{stat.value}</p>
            </div>
            <div className={`rounded-2xl p-3.5 ${stat.bg} shadow-sm`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

async function RecentFunnelsList() {
  const funnels = await getWorkspaceFunnels()
  const recentFunnels = funnels.slice(0, 5)

  return (
    <Card className="border-slate-200/50 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Funis Recentes</h2>
          <p className="text-xs text-slate-400 font-medium">Os últimos funis criados ou editados no seu workspace</p>
        </div>
        <Link href="/dashboard/funnels" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors">
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {recentFunnels.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-8 w-8 text-slate-300" />}
          title="Nenhum funil criado"
          description="Crie seu primeiro funil interativo para começar a capturar leads qualificados."
          action={
            <Link href="/dashboard/funnels/new">
              <Button variant="premium">
                <Plus className="h-4 w-4" />
                Criar Primeiro Funil
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {recentFunnels.map((funnel) => (
            <div key={funnel.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50/50 group-hover:bg-indigo-50 border border-slate-100 flex-shrink-0 transition-colors">
                  <Zap className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{funnel.name}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {funnel._count.leads} leads · {formatDate(funnel.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <StatusBadge status={funnel.status} />
                <Link href={`/dashboard/funnels/${funnel.id}/edit`}>
                  <Button variant="outline" size="sm" className="hover:border-indigo-200">Editar</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu workspace"
        action={
          <Link href="/dashboard/funnels/new">
            <Button variant="premium">
              <Plus className="h-4 w-4" />
              Criar Funil
            </Button>
          </Link>
        }
      />

      {/* Plan Limits Banner */}
      <Suspense fallback={<div className="h-28 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse mb-8" />}>
        <PlanLimitsWidget />
      </Suspense>

      {/* Stats Cards */}
      <Suspense fallback={<MetricsGridSkeleton />}>
        <DashboardMetrics />
      </Suspense>

      {/* Recent Funnels */}
      <Suspense fallback={<div className="h-64 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 animate-pulse" />}>
        <RecentFunnelsList />
      </Suspense>
    </>
  )
}

