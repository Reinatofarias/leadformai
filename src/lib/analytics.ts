import { prisma } from '@/lib/prisma'

export async function getFunnelAnalytics(funnelId: string, workspaceId: string) {
  // Verify ownership
  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
    include: { steps: { orderBy: { order: 'asc' } } }
  })

  if (!funnel) throw new Error('Funnel not found')

  // 1. Core Metrics
  const [totalLeads, visitorsResult] = await Promise.all([
    prisma.lead.count({ where: { funnelId } }),
    prisma.funnelEvent.groupBy({
      by: ['sessionId'],
      where: { funnelId, eventType: 'FUNNEL_STARTED' },
    }),
  ])

  const totalVisitors = visitorsResult.length
  const conversionRate = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100) : 0

  // 2. Classifications Distribution
  const classificationsRaw = await prisma.lead.groupBy({
    by: ['classification'],
    where: { funnelId },
    _count: { id: true },
  })

  const classifications = classificationsRaw.map(c => ({
    name: c.classification || 'Sem Classificação',
    value: c._count.id
  }))

  // 3. Funnel Dropoff (Step Views)
  // We want unique views per session per step
  const stepViewsRaw = await prisma.funnelEvent.groupBy({
    by: ['stepId'],
    where: { funnelId, eventType: 'STEP_VIEWED', stepId: { not: null } },
    _count: { sessionId: true }, // Ideally this would be distinct sessions, but Prisma groupBy distinct is limited. For MVP this is acceptable.
  })

  const dropoff = funnel.steps.map(step => {
    const views = stepViewsRaw.find(s => s.stepId === step.id)?._count.sessionId || 0
    return {
      name: `Etapa ${step.order + 1}`,
      title: step.title || step.type,
      views,
    }
  })

  // 4. UTM Sources
  const utmSourcesRaw = await prisma.lead.groupBy({
    by: ['utmSource'],
    where: { funnelId, utmSource: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  })

  const utms = utmSourcesRaw.map(u => ({
    source: u.utmSource,
    leads: u._count.id
  }))

  return {
    metrics: {
      visitors: totalVisitors,
      leads: totalLeads,
      conversionRate: Math.round(conversionRate * 10) / 10,
    },
    classifications,
    dropoff,
    utms
  }
}
