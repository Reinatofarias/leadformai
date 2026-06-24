import React from 'react'
import { getWorkspaceFunnel } from '@/lib/workspace'
import { PageHeader } from '@/components/layout/page-header'
import { FunnelPublishActions } from '@/components/funnels/funnel-publish-actions'
import { EditorLayout } from '@/components/editor/editor-layout'

export default async function EditFunnelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const funnel = await getWorkspaceFunnel(id)

  return (
    <>
      <PageHeader
        title={funnel.name}
        description={`/f/${funnel.slug}`}
        action={<FunnelPublishActions funnel={funnel} />}
      />

      <EditorLayout funnel={funnel} />
    </>
  )
}

