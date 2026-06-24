import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'
import { getSession } from '@/lib/auth'

export const PLAN_LIMITS = {
  [PlanType.BASIC]: {
    name: 'Básico',
    funnels: 2,
    leads: 5000,
  },
  [PlanType.PRO]: {
    name: 'Pro',
    funnels: 5,
    leads: 10000,
  },
  [PlanType.ELITE]: {
    name: 'Elite',
    funnels: 10,
    leads: 25000,
  },
  [PlanType.STARTER]: {
    name: 'Starter',
    funnels: 3,
    leads: 7000,
  },
  [PlanType.AGENCY]: {
    name: 'Agência',
    funnels: 20,
    leads: 50000,
  },
  [PlanType.ENTERPRISE]: {
    name: 'Enterprise',
    funnels: 100,
    leads: 500000,
  },
}

export async function getWorkspacePlanDetails(workspaceId: string) {
  const session = await getSession().catch(() => null)
  const isPlatformAdmin = session?.email === 'admin@leadflow.com'

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { 
      plan: true,
      owner: {
        select: { email: true }
      }
    }
  })

  const plan = workspace?.plan || PlanType.BASIC
  const isOwnerAdmin = workspace?.owner?.email === 'admin@leadflow.com'
  const isLimitBypassed = isPlatformAdmin || isOwnerAdmin
  const limits = PLAN_LIMITS[plan]

  // Count active funnels and leads
  const [funnelCount, leadCount] = await Promise.all([
    prisma.funnel.count({ where: { workspaceId, isTemplate: false } }),
    prisma.lead.count({ where: { funnel: { workspaceId } } }),
  ])

  return {
    plan,
    planName: isLimitBypassed ? 'Administrador Plataforma' : limits.name,
    funnelCount,
    leadCount,
    funnelLimit: isLimitBypassed ? 999999 : limits.funnels,
    leadLimit: isLimitBypassed ? 99999999 : limits.leads,
    hasReachedFunnelLimit: isLimitBypassed ? false : funnelCount >= limits.funnels,
    hasReachedLeadLimit: isLimitBypassed ? false : leadCount >= limits.leads,
  }
}
