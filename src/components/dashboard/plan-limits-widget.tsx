import React from 'react'
import { getWorkspaceId } from '@/lib/workspace'
import { getWorkspacePlanDetails } from '@/lib/limits'
import { Card } from '@/components/ui/card'
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'

export async function PlanLimitsWidget() {
  const workspaceId = await getWorkspaceId()
  const limits = await getWorkspacePlanDetails(workspaceId)

  const funnelPercentage = Math.min((limits.funnelCount / limits.funnelLimit) * 100, 100)
  const leadPercentage = Math.min((limits.leadCount / limits.leadLimit) * 100, 100)

  const isFunnelClose = funnelPercentage >= 80
  const isLeadClose = leadPercentage >= 80

  const hasAnyLimitReached = limits.hasReachedFunnelLimit || limits.hasReachedLeadLimit

  return (
    <div className="space-y-4 mb-8 animate-slide-up">
      {hasAnyLimitReached && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 flex gap-3.5 shadow-sm shadow-red-100/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 border border-red-200/50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-800">Limite de Uso Atingido!</h4>
            <p className="text-xs text-red-700/80 font-medium mt-0.5">
              Seu workspace atingiu a cota limite do plano {limits.planName}. Para continuar criando funis e capturando leads sem interrupções, faça um upgrade hoje mesmo.
            </p>
          </div>
        </div>
      )}

      <Card className="border-slate-200/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assinatura do Workspace</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 border border-indigo-100/50">
                <Zap className="h-3 w-3 fill-indigo-600/10 text-indigo-600" />
                Plano {limits.planName}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1.5">Uso dos Recursos</h3>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:max-w-2xl">
            {/* Funnels Limit Progress */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                <span className="text-slate-400">Funis Criados</span>
                <span className={limits.hasReachedFunnelLimit ? 'text-red-600' : isFunnelClose ? 'text-amber-600' : 'text-slate-700'}>
                  {limits.funnelCount} / {limits.funnelLimit}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    limits.hasReachedFunnelLimit ? 'bg-red-500' : isFunnelClose ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${funnelPercentage}%` }}
                />
              </div>
            </div>

            {/* Leads Limit Progress */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-2">
                <span className="text-slate-400">Leads Capturados</span>
                <span className={limits.hasReachedLeadLimit ? 'text-red-600' : isLeadClose ? 'text-amber-600' : 'text-slate-700'}>
                  {limits.leadCount.toLocaleString()} / {limits.leadLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    limits.hasReachedLeadLimit ? 'bg-red-500' : isLeadClose ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${leadPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
