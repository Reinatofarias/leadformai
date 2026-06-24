import React from 'react'
import { prisma } from '@/lib/prisma'
import { getWorkspaceId, getUserId } from '@/lib/workspace'
import { PageHeader } from '@/components/layout/page-header'
import { MembersList } from './members-list'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function MembersPage() {
  const workspaceId = await getWorkspaceId()
  const userId = await getUserId()
  const session = await getSession()
  const isPlatformAdmin = session?.email === 'admin@leadflow.com'

  // Fetch workspace details (with owner)
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!workspace) {
    redirect('/dashboard')
  }

  // Fetch all memberships for this workspace
  const memberships = await prisma.workspaceMembership.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const currentMembership = memberships.find((m) => m.user.id === userId)
  const isOwner = workspace.ownerId === userId
  const isAdmin = currentMembership?.role === 'ADMIN'
  const canManage = isOwner || isAdmin || isPlatformAdmin

  return (
    <>
      <PageHeader
        title="Colaboração de Equipe"
        description="Gerencie os membros do seu workspace e compartilhe o acesso de criação de funis."
      />
      <div className="mt-8 animate-slide-up">
        <MembersList
          memberships={memberships.map((m) => ({
            id: m.id,
            role: m.role,
            createdAt: m.createdAt,
            user: {
              id: m.user.id,
              name: m.user.name,
              email: m.user.email,
            },
          }))}
          owner={{
            id: workspace.owner.id,
            name: workspace.owner.name,
            email: workspace.owner.email,
          }}
          canManage={canManage}
        />
      </div>
    </>
  )
}
