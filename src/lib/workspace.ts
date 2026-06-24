import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function getWorkspaceId(): Promise<string> {
  const session = await getSession()
  if (!session) redirect('/login')

  // Platform admin email gets general access to everything, bypass validation
  if (session.email === 'admin@leadflow.com') {
    return session.workspaceId
  }

  // Verify access: user must be the owner OR have a membership
  const access = await prisma.workspace.findFirst({
    where: {
      id: session.workspaceId,
      OR: [
        { ownerId: session.userId },
        { memberships: { some: { userId: session.userId } } }
      ]
    },
    select: { id: true }
  })

  if (!access) {
    // Look for an alternative workspace the user has access to
    const altWorkspace = await prisma.workspace.findFirst({
      where: {
        OR: [
          { ownerId: session.userId },
          { memberships: { some: { userId: session.userId } } }
        ]
      },
      select: { id: true }
    })

    if (altWorkspace) {
      return altWorkspace.id
    }

    redirect('/login')
  }

  return session.workspaceId
}

export async function getUserId(): Promise<string> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session.userId
}

export async function getSessionOrRedirect() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function getWorkspaceFunnels() {
  const workspaceId = await getWorkspaceId()
  return prisma.funnel.findMany({
    where: { workspaceId, isTemplate: false },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
      _count: { select: { leads: true, steps: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getWorkspaceFunnel(funnelId: string) {
  const workspaceId = await getWorkspaceId()
  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
    include: {
      steps: { orderBy: { order: 'asc' } },
      _count: { select: { leads: true } },
    },
  })
  if (!funnel) redirect('/dashboard/funnels')
  return funnel
}

export async function getWorkspaceStats() {
  const workspaceId = await getWorkspaceId()

  const [funnelsCount, leadsCount, visitorsResult] = await Promise.all([
    prisma.funnel.count({ where: { workspaceId, isTemplate: false } }),
    prisma.lead.count({ where: { funnel: { workspaceId } } }),
    prisma.funnelEvent.groupBy({
      by: ['sessionId'],
      where: {
        funnel: { workspaceId },
        eventType: 'FUNNEL_STARTED',
      },
      _count: {
        sessionId: true,
      },
    }),
  ])

  const visitorsCount = visitorsResult.length
  const conversionRate = visitorsCount > 0 ? ((leadsCount / visitorsCount) * 100) : 0

  return {
    funnelsCount,
    leadsCount,
    visitorsCount,
    conversionRate: Math.round(conversionRate * 10) / 10,
  }
}
