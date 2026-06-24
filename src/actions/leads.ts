'use server'

import { prisma } from '@/lib/prisma'
import { getWorkspaceId } from '@/lib/workspace'
import { revalidatePath } from 'next/cache'
import type { Prisma, LeadStatus } from '@prisma/client'

export interface GetLeadsOptions {
  funnelId?: string
  classification?: string
  status?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  search?: string
  page?: number
  limit?: number
}

export async function getLeads(options: GetLeadsOptions = {}) {
  const workspaceId = await getWorkspaceId()
  
  const { 
    funnelId, 
    classification, 
    status, 
    utmSource, 
    utmMedium, 
    utmCampaign, 
    search, 
    page = 1, 
    limit = 20 
  } = options
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

  if (status) {
    where.status = status as LeadStatus
  }

  if (utmSource) {
    where.utmSource = { contains: utmSource, mode: 'insensitive' }
  }

  if (utmMedium) {
    where.utmMedium = { contains: utmMedium, mode: 'insensitive' }
  }

  if (utmCampaign) {
    where.utmCampaign = { contains: utmCampaign, mode: 'insensitive' }
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

  revalidatePath('/dashboard/leads')
  return { success: true }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  try {
    const workspaceId = await getWorkspaceId()
    
    // Verify ownership via funnel
    const lead = await prisma.lead.findFirst({
      where: { 
        id: leadId,
        funnel: { workspaceId }
      }
    })

    if (!lead) {
      return { success: false, error: 'Lead não encontrado ou sem permissão' }
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: { status }
    })

    revalidatePath('/dashboard/leads')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message || 'Erro ao atualizar status comercial' }
  }
}
