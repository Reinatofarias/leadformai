'use server'

import { prisma } from '@/lib/prisma'
import { getWorkspaceId } from '@/lib/workspace'
import type { Prisma } from '@prisma/client'

export interface GetLeadsOptions {
  funnelId?: string
  classification?: string
  search?: string
  page?: number
  limit?: number
}

export async function getLeads(options: GetLeadsOptions = {}) {
  const workspaceId = await getWorkspaceId()
  
  const { funnelId, classification, search, page = 1, limit = 20 } = options
  const skip = (page - 1) * limit

  // Build query
  const where: Prisma.LeadWhereInput = {
    funnel: { workspaceId },
  }

  if (funnelId) {
    where.funnelId = funnelId
  }

  if (classification) {
    where.classification = classification as any
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: {
        funnel: {
          select: { name: true, whatsappNumber: true, whatsappMessage: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ])

  return {
    data: leads,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export async function deleteLead(leadId: string) {
  const workspaceId = await getWorkspaceId()
  
  // Verify ownership via funnel
  const lead = await prisma.lead.findFirst({
    where: { 
      id: leadId,
      funnel: { workspaceId }
    }
  })

  if (!lead) {
    return { success: false, error: 'Lead não encontrado' }
  }

  await prisma.lead.delete({
    where: { id: leadId }
  })

  return { success: true }
}
