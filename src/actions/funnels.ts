'use server'

import { prisma } from '@/lib/prisma'
import { getWorkspaceId } from '@/lib/workspace'
import { createFunnelSchema, updateFunnelSchema } from '@/schemas/funnel'
import { slugify } from '@/lib/utils'
import { DEFAULT_THEME, DEFAULT_WHATSAPP_MESSAGE } from '@/lib/constants'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getWorkspacePlanDetails } from '@/lib/limits'

export async function createFunnel(formData: FormData) {
  const workspaceId = await getWorkspaceId()

  const limits = await getWorkspacePlanDetails(workspaceId)
  if (limits.hasReachedFunnelLimit) {
    return { success: false, error: `Limite de funis atingido (${limits.funnelLimit}) no plano ${limits.planName}. Faça um upgrade para criar mais.` }
  }
  const name = formData.get('name') as string
  let slug = formData.get('slug') as string

  if (!slug) slug = slugify(name)

  const parsed = createFunnelSchema.safeParse({ name, slug })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Dados inválidos' }
  }

  const existing = await prisma.funnel.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) {
    return { success: false, error: 'Este slug já está em uso. Tente outro.' }
  }

  const funnel = await prisma.funnel.create({
    data: {
      workspaceId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      theme: DEFAULT_THEME,
      whatsappMessage: DEFAULT_WHATSAPP_MESSAGE,
    },
  })

  redirect(`/dashboard/funnels/${funnel.id}/edit`)
}

export async function updateFunnel(funnelId: string, formData: FormData) {
  const workspaceId = await getWorkspaceId()

  const data: Record<string, unknown> = {}
  const name = formData.get('name')
  const slug = formData.get('slug')
  const whatsappNumber = formData.get('whatsappNumber')
  const whatsappMessage = formData.get('whatsappMessage')
  const webhookUrl = formData.get('webhookUrl')
  const facebookPixelId = formData.get('facebookPixelId')
  const googleTagManagerId = formData.get('googleTagManagerId')
  const customDomain = formData.get('customDomain')

  if (name) data.name = name
  if (slug) data.slug = slug
  if (whatsappNumber !== null) data.whatsappNumber = whatsappNumber
  if (whatsappMessage !== null) data.whatsappMessage = whatsappMessage
  if (webhookUrl !== null) data.webhookUrl = webhookUrl
  if (facebookPixelId !== null) data.facebookPixelId = facebookPixelId
  if (googleTagManagerId !== null) data.googleTagManagerId = googleTagManagerId
  if (customDomain !== null) data.customDomain = customDomain

  const parsed = updateFunnelSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Dados inválidos' }
  }

  if (parsed.data.slug) {
    const existing = await prisma.funnel.findFirst({
      where: { slug: parsed.data.slug, id: { not: funnelId } },
    })
    if (existing) {
      return { success: false, error: 'Este slug já está em uso.' }
    }
  }

  if (parsed.data.customDomain) {
    const existingDomain = await prisma.funnel.findFirst({
      where: { customDomain: parsed.data.customDomain, id: { not: funnelId } },
    })
    if (existingDomain) {
      return { success: false, error: 'Este domínio já está associado a outro funil.' }
    }
  }

  await prisma.funnel.updateMany({
    where: { id: funnelId, workspaceId },
    data: parsed.data,
  })

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  return { success: true }
}

export async function updateFunnelTheme(funnelId: string, theme: Record<string, unknown>) {
  const workspaceId = await getWorkspaceId()

  await prisma.funnel.updateMany({
    where: { id: funnelId, workspaceId },
    data: { theme: theme as any },
  })

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  return { success: true }
}

export async function deleteFunnel(funnelId: string) {
  const workspaceId = await getWorkspaceId()

  await prisma.funnel.deleteMany({
    where: { id: funnelId, workspaceId },
  })

  revalidatePath('/dashboard/funnels')
  redirect('/dashboard/funnels')
}

export async function duplicateFunnel(funnelId: string) {
  const workspaceId = await getWorkspaceId()

  const limits = await getWorkspacePlanDetails(workspaceId)
  if (limits.hasReachedFunnelLimit) {
    return { success: false, error: `Limite de funis atingido (${limits.funnelLimit}) no plano ${limits.planName}. Faça um upgrade para duplicar.` }
  }

  const original = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
    include: { steps: { orderBy: { order: 'asc' } } },
  })

  if (!original) {
    return { success: false, error: 'Funil não encontrado.' }
  }

  let newSlug = `${original.slug}-copia`
  let attempt = 0
  while (await prisma.funnel.findUnique({ where: { slug: newSlug } })) {
    attempt++
    newSlug = `${original.slug}-copia-${attempt}`
  }

  const newFunnel = await prisma.funnel.create({
    data: {
      workspaceId,
      name: `${original.name} (cópia)`,
      slug: newSlug,
      status: 'DRAFT',
      theme: original.theme || undefined,
      whatsappNumber: original.whatsappNumber,
      whatsappMessage: original.whatsappMessage,
      steps: {
        create: original.steps.map((step) => ({
          order: step.order,
          type: step.type,
          title: step.title,
          description: step.description,
          config: step.config || undefined,
        })),
      },
    },
  })

  revalidatePath('/dashboard/funnels')
  redirect(`/dashboard/funnels/${newFunnel.id}/edit`)
}

export async function publishFunnel(funnelId: string) {
  const workspaceId = await getWorkspaceId()

  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
    include: { _count: { select: { steps: true } } },
  })

  if (!funnel) return { success: false, error: 'Funil não encontrado.' }
  if (funnel._count.steps === 0) {
    return { success: false, error: 'Adicione pelo menos 1 etapa antes de publicar.' }
  }

  await prisma.funnel.updateMany({
    where: { id: funnelId, workspaceId },
    data: { status: 'PUBLISHED' },
  })

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  revalidatePath('/dashboard/funnels')
  return { success: true }
}

export async function unpublishFunnel(funnelId: string) {
  try {
    const workspaceId = await getWorkspaceId()

    await prisma.funnel.updateMany({
      where: { id: funnelId, workspaceId },
      data: { status: 'DRAFT' },
    })

    revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
    revalidatePath('/dashboard/funnels')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Erro ao despublicar funil.' }
  }
}

import { TEMPLATES } from '@/lib/templates'

export async function createFunnelFromTemplate(templateId: string) {
  const workspaceId = await getWorkspaceId()

  const limits = await getWorkspacePlanDetails(workspaceId)
  if (limits.hasReachedFunnelLimit) {
    redirect('/dashboard?error=limit_reached')
  }

  const template = TEMPLATES.find(t => t.id === templateId)
  if (!template) {
    return { success: false, error: 'Template não encontrado.' }
  }

  const baseSlug = `${template.id}-funil`
  let slug = baseSlug
  let attempt = 0
  while (await prisma.funnel.findUnique({ where: { slug } })) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const funnel = await prisma.funnel.create({
    data: {
      workspaceId,
      name: template.name,
      slug,
      status: 'DRAFT',
      theme: template.theme as any,
      whatsappMessage: template.whatsappMessage,
      steps: {
        create: template.steps.map((step, index) => ({
          order: index,
          type: step.type,
          title: step.title,
          description: step.description || '',
          config: step.config as any,
        })),
      },
    },
  })

  revalidatePath('/dashboard/funnels')
  redirect(`/dashboard/funnels/${funnel.id}/edit`)
}

export async function getFunnelFlowAnalytics(funnelId: string) {
  const workspaceId = await getWorkspaceId()

  const steps = await prisma.funnelStep.findMany({
    where: { funnelId },
    orderBy: { order: 'asc' }
  })

  // Fetch views per step
  const viewsGroup = await prisma.funnelEvent.groupBy({
    by: ['stepId'],
    where: {
      funnelId,
      eventType: 'STEP_VIEWED',
      stepId: { not: null }
    },
    _count: {
      id: true
    }
  })

  // Map to a dictionary for quick lookup
  const viewsMap: Record<string, number> = {}
  viewsGroup.forEach(g => {
    if (g.stepId) viewsMap[g.stepId] = g._count.id
  })

  return steps.map((step, index) => {
    const views = viewsMap[step.id] || 0
    
    // Find next step view count for conversion
    const nextStep = steps[index + 1]
    const nextViews = nextStep ? (viewsMap[nextStep.id] || 0) : 0
    
    const conversionRate = views > 0 ? Math.round((nextViews / views) * 100) : 0
    const dropoutRate = views > 0 ? 100 - conversionRate : 0

    return {
      stepId: step.id,
      title: step.title || 'Sem título',
      type: step.type,
      views,
      conversionRate,
      dropoutRate
    }
  })
}


