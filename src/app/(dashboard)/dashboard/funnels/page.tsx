import React from 'react'
import Link from 'next/link'
import { getWorkspaceFunnels } from '@/lib/workspace'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/spinner'
import { formatDate } from '@/lib/utils'
import { Plus, Zap, ExternalLink, Copy } from 'lucide-react'

export default async function FunnelsPage() {
  const funnels = await getWorkspaceFunnels()

  return (
    <>
      <PageHeader
        title="Funis"
        description="Gerencie seus funis interativos"
        action={
          <Link href="/dashboard/funnels/new">
            <Button variant="premium">
              <Plus className="h-4 w-4" />
              Novo Funil
            </Button>
          </Link>
        }
      />

      {funnels.length === 0 ? (
        <Card className="border-slate-200/50">
          <EmptyState
            icon={<Zap className="h-8 w-8 text-slate-300" />}
            title="Nenhum funil criado"
            description="Crie seu primeiro funil interativo para começar a capturar e qualificar leads."
            action={
              <Link href="/dashboard/funnels/new">
                <Button variant="premium">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Funil
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-slide-up">
          {funnels.map((funnel) => (
            <Card key={funnel.id} hover className="border-slate-200/50 flex flex-col justify-between min-h-[190px] group transition-all duration-300">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50/50 group-hover:bg-indigo-50 border border-slate-100 flex-shrink-0 transition-colors">
                      <Zap className="h-4.5 w-4.5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{funnel.name}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">/f/{funnel.slug}</p>
                    </div>
                  </div>
                  <StatusBadge status={funnel.status} />
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-6 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> {funnel._count.steps} etapas</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> {funnel._count.leads} leads</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span> {formatDate(funnel.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/dashboard/funnels/${funnel.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full font-semibold hover:border-indigo-200">
                    Editar
                  </Button>
                </Link>
                {funnel.status === 'PUBLISHED' && (
                  <Link href={`/f/${funnel.slug}`} target="_blank" title="Abrir página pública">
                    <Button variant="ghost" size="sm" className="hover:text-indigo-600 hover:border-indigo-100">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
