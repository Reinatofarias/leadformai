import React from 'react'
import { getLeads } from '@/actions/leads'
import { getWorkspaceFunnel } from '@/lib/workspace'
import { PageHeader } from '@/components/layout/page-header'
import { LeadsTable } from '@/components/leads/leads-table'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function FunnelLeadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const funnel = await getWorkspaceFunnel(id)

  const sParams = await searchParams
  const search = typeof sParams.q === 'string' ? sParams.q : undefined
  const classification = typeof sParams.classification === 'string' ? sParams.classification : undefined
  const page = typeof sParams.page === 'string' ? parseInt(sParams.page) : 1

  const leadsData = await getLeads({ 
    funnelId: funnel.id,
    search, 
    classification, 
    page, 
    limit: 20 
  })

  return (
    <>
      <PageHeader
        title={`Leads: ${funnel.name}`}
        description={`Leads capturados especificamente neste funil`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/funnels/${funnel.id}/edit`}>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Editor
              </Button>
            </Link>
            <Link href={`/dashboard/funnels/${funnel.id}/analytics`}>
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        }
      />

      <Card className="p-0 overflow-hidden">
        <LeadsTable 
          data={leadsData.data} 
          total={leadsData.total}
          totalPages={leadsData.totalPages}
          currentPage={leadsData.currentPage}
          hideFunnelColumn={true}
        />
      </Card>
    </>
  )
}
