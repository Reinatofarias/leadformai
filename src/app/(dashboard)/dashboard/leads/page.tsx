import React from 'react'
import { getLeads } from '@/actions/leads'
import { PageHeader } from '@/components/layout/page-header'
import { LeadsTable } from '@/components/leads/leads-table'
import { Card } from '@/components/ui/card'
import { getWorkspaceFunnels } from '@/lib/workspace'

export default async function GlobalLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.q === 'string' ? params.q : undefined
  const funnelId = typeof params.funnel === 'string' ? params.funnel : undefined
  const classification = typeof params.classification === 'string' ? params.classification : undefined
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1

  const [leadsData, funnels] = await Promise.all([
    getLeads({ search, funnelId, classification, page, limit: 20 }),
    getWorkspaceFunnels(),
  ])

  return (
    <>
      <PageHeader
        title="Todos os Leads"
        description="Gerencie todos os leads capturados em seus funis"
      />

      <Card className="p-0 overflow-hidden">
        <LeadsTable 
          data={leadsData.data} 
          total={leadsData.total}
          totalPages={leadsData.totalPages}
          currentPage={leadsData.currentPage}
          funnels={funnels}
        />
      </Card>
    </>
  )
}
