import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FunnelThemeProvider } from '@/components/renderer/funnel-theme-provider'
import { FunnelRenderer } from '@/components/renderer/funnel-renderer'

// Disable caching for preview/dev if needed, but in Vercel we use the vercel.json Cache-Control
export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function PublicFunnelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Buscamos o funil e suas etapas
  const funnel = await prisma.funnel.findUnique({
    where: { slug },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  })

  // Retorna 404 se não existir ou se não estiver publicado
  if (!funnel || funnel.status !== 'PUBLISHED') {
    notFound()
  }

  // O componente FunnelRenderer é um Client Component que gerencia todo o estado
  return (
    <FunnelThemeProvider theme={funnel.theme as any}>
      <FunnelRenderer funnel={funnel} />
    </FunnelThemeProvider>
  )
}
