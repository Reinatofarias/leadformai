import React from 'react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FunnelThemeProvider } from '@/components/renderer/funnel-theme-provider'
import { FunnelRenderer } from '@/components/renderer/funnel-renderer'
import Script from 'next/script'

// Disable caching for preview/dev if needed, but in Vercel we use the vercel.json Cache-Control
export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function PublicFunnelPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Buscamos o funil e suas etapas
  const isCustomDomain = slug.startsWith('domain-')
  const lookupWhere = isCustomDomain ? { customDomain: slug.replace('domain-', '') } : { slug }

  const funnel = await prisma.funnel.findFirst({
    where: lookupWhere,
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
      {funnel.facebookPixelId && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${funnel.facebookPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${funnel.facebookPixelId}&ev=PageView&noscript=1`}
              alt="fb-pixel-noscript"
            />
          </noscript>
        </>
      )}

      {funnel.googleTagManagerId && (
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${funnel.googleTagManagerId}');
          `}
        </Script>
      )}
      
      <FunnelRenderer funnel={funnel} />
    </FunnelThemeProvider>
  )
}
