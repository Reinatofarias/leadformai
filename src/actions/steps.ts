'use server'

import { prisma } from '@/lib/prisma'
import { getWorkspaceId } from '@/lib/workspace'
import { revalidatePath } from 'next/cache'

export async function createStep(funnelId: string, data: {
  type: string
  title?: string
  description?: string
  config?: unknown
}) {
  const workspaceId = await getWorkspaceId()

  // Verify funnel belongs to workspace
  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
    include: { _count: { select: { steps: true } } },
  })
  if (!funnel) return { success: false, error: 'Funil não encontrado.' }

  const step = await prisma.funnelStep.create({
    data: {
      funnelId,
      order: funnel._count.steps,
      type: data.type as 'WELCOME' | 'MULTIPLE_CHOICE' | 'OPEN_QUESTION' | 'CAPTURE_FORM' | 'LOADING' | 'RESULT' | 'REDIRECT',
      title: data.title || '',
      description: data.description || '',
      config: (data.config as object) || {},
    },
  })

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  return { success: true, step }
}

export async function updateStep(stepId: string, funnelId: string, data: {
  title?: string
  description?: string
  config?: unknown
}) {
  const workspaceId = await getWorkspaceId()

  // Verify ownership
  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
  })
  if (!funnel) return { success: false, error: 'Funil não encontrado.' }

  await prisma.funnelStep.update({
    where: { id: stepId },
    data: {
      title: data.title,
      description: data.description,
      config: data.config as object || undefined,
    },
  })

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  return { success: true }
}

export async function deleteStep(stepId: string, funnelId: string) {
  const workspaceId = await getWorkspaceId()

  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
  })
  if (!funnel) return { success: false, error: 'Funil não encontrado.' }

  const deletedStep = await prisma.funnelStep.delete({
    where: { id: stepId },
  })

  // Reorder remaining steps
  await prisma.funnelStep.updateMany({
    where: { funnelId, order: { gt: deletedStep.order } },
    data: { order: { decrement: 1 } },
  })

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  return { success: true }
}

export async function moveStep(stepId: string, funnelId: string, direction: 'up' | 'down') {
  const workspaceId = await getWorkspaceId()

  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
  })
  if (!funnel) return { success: false, error: 'Funil não encontrado.' }

  const currentStep = await prisma.funnelStep.findUnique({ where: { id: stepId } })
  if (!currentStep) return { success: false, error: 'Etapa não encontrada.' }

  const targetOrder = direction === 'up' ? currentStep.order - 1 : currentStep.order + 1

  const targetStep = await prisma.funnelStep.findFirst({
    where: { funnelId, order: targetOrder },
  })
  if (!targetStep) return { success: false, error: 'Não é possível mover nesta direção.' }

  // Swap orders
  await prisma.$transaction([
    prisma.funnelStep.update({
      where: { id: currentStep.id },
      data: { order: targetOrder },
    }),
    prisma.funnelStep.update({
      where: { id: targetStep.id },
      data: { order: currentStep.order },
    }),
  ])

  revalidatePath(`/dashboard/funnels/${funnelId}/edit`)
  return { success: true }
}
