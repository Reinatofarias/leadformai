import React from 'react'
import { getFunnelAnalytics } from '@/lib/analytics'
import { getWorkspaceFunnel, getWorkspaceId } from '@/lib/workspace'
import { PageHeader } from '@/components/layout/page-header'
import { FunnelAnalytics } from '@/components/analytics/funnel-analytics'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function FunnelAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workspaceId = await getWorkspaceId()
  
  const [funnel, analyticsData] = await Promise.all([
    getWorkspaceFunnel(id),
    getFunnelAnalytics(id, workspaceId)
  ])

  return (
    <>
      <PageHeader
        title={`Analytics: ${funnel.name}`}
        description="Métricas de conversão, abandono e origem"
        action={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/funnels/${funnel.id}/edit`}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Editor
              </Button>
            </Link>
            <Link href={`/dashboard/funnels/${funnel.id}/leads`}>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Ver Leads
              </Button>
            </Link>
          </div>
        }
      />

      <FunnelAnalytics data={analyticsData} />
    </>
  )
}
