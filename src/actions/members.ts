'use server'

import { prisma } from '@/lib/prisma'
import { getWorkspaceId, getUserId } from '@/lib/workspace'
import { revalidatePath } from 'next/cache'
import type { MemberRole } from '@prisma/client'
import { getSession } from '@/lib/auth'

export async function addMemberByEmail(email: string, role: MemberRole) {
  try {
    const workspaceId = await getWorkspaceId()
    const currentUserId = await getUserId()
    const session = await getSession()
    const isPlatformAdmin = session?.email === 'admin@leadflow.com'

    // Verify if workspace exists and the active user is the workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true }
    })

    if (!workspace) {
      return { success: false, error: 'Workspace não encontrado.' }
    }

    // Check if user is owner or admin membership
    const currentMembership = await prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId
        }
      },
      select: { role: true }
    })

    const isOwner = workspace.ownerId === currentUserId
    const isAdmin = currentMembership?.role === 'ADMIN'

    if (!isOwner && !isAdmin && !isPlatformAdmin) {
      return { success: false, error: 'Apenas o proprietário ou administradores do Workspace podem gerenciar membros.' }
    }

    // Find the user to invite
    const userToInvite = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (!userToInvite) {
      return { success: false, error: 'Nenhum usuário cadastrado com este e-mail.' }
    }

    // Check if user is already the owner
    if (workspace.ownerId === userToInvite.id) {
      return { success: false, error: 'Este usuário já é o proprietário do Workspace.' }
    }

    // Check if user is already a member
    const existingMembership = await prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userToInvite.id
        }
      }
    })

    if (existingMembership) {
      return { success: false, error: 'Este usuário já faz parte do Workspace.' }
    }

    // Create the membership
    await prisma.workspaceMembership.create({
      data: {
        workspaceId,
        userId: userToInvite.id,
        role
      }
    })

    revalidatePath('/dashboard/settings/members')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message || 'Erro ao convidar membro.' }
  }
}

export async function removeMember(membershipId: string) {
  try {
    const workspaceId = await getWorkspaceId()
    const currentUserId = await getUserId()
    const session = await getSession()
    const isPlatformAdmin = session?.email === 'admin@leadflow.com'

    // Verify workspace owner
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true }
    })

    if (!workspace) {
      return { success: false, error: 'Workspace não encontrado.' }
    }

    const currentMembership = await prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: currentUserId
        }
      },
      select: { role: true }
    })

    const isOwner = workspace.ownerId === currentUserId
    const isAdmin = currentMembership?.role === 'ADMIN'

    if (!isOwner && !isAdmin && !isPlatformAdmin) {
      return { success: false, error: 'Apenas o proprietário ou administradores do Workspace podem gerenciar membros.' }
    }

    // Remove membership
    await prisma.workspaceMembership.delete({
      where: {
        id: membershipId,
        workspaceId // Ensure they belong to this workspace
      }
    })

    revalidatePath('/dashboard/settings/members')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message || 'Erro ao remover membro.' }
  }
}
