export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dispatchWebhookEvent } from '@/lib/webhooks'
import { getWorkspacePlanDetails } from '@/lib/limits'
import type { Classification } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { funnelId, sessionId, leadData, answers, scoreResult, utms } = body

    if (!funnelId || !sessionId || !leadData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check workspace lead limits
    const funnelObj = await prisma.funnel.findUnique({
      where: { id: funnelId },
      select: { workspaceId: true }
    })
    
    if (funnelObj) {
      const limits = await getWorkspacePlanDetails(funnelObj.workspaceId)
      if (limits.hasReachedLeadLimit) {
        return NextResponse.json({ error: 'Cota de leads excedida para este plano.' }, { status: 403 })
      }
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const userAgent = request.headers.get('user-agent') || null

    // Extract basic fields if available (depends on how fields were named in capture form)
    const nome = leadData.nome || leadData.name || null
    const email = leadData.email || leadData.e_mail || null
    const phone = leadData.telefone || leadData.phone || leadData.whatsapp || null
    const company = leadData.empresa || leadData.company || null

    // Upsert Lead based on funnelId + sessionId to prevent duplicates on double-click
    const lead = await prisma.lead.findFirst({
      where: { funnelId, sessionId },
    })

    const lgpdConsent = leadData.lgpdConsent === true
    const lgpdConsentAt = lgpdConsent ? new Date() : null

    let savedLead;

    if (lead) {
      savedLead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: nome,
          email,
          phone,
          company,
          score: scoreResult?.normalizedScore || null,
          classification: scoreResult?.classification as Classification | null,
          answers: answers || [],
          utmSource: utms?.utm_source || null,
          utmMedium: utms?.utm_medium || null,
          utmCampaign: utms?.utm_campaign || null,
          utmContent: utms?.utm_content || null,
          utmTerm: utms?.utm_term || null,
          ip,
          userAgent,
          lgpdConsent,
          lgpdConsentAt,
        },
      })
    } else {
      savedLead = await prisma.lead.create({
        data: {
          funnelId,
          sessionId,
          name: nome,
          email,
          phone,
          company,
          score: scoreResult?.normalizedScore || null,
          classification: scoreResult?.classification as Classification | null,
          answers: answers || [],
          utmSource: utms?.utm_source || null,
          utmMedium: utms?.utm_medium || null,
          utmCampaign: utms?.utm_campaign || null,
          utmContent: utms?.utm_content || null,
          utmTerm: utms?.utm_term || null,
          ip,
          userAgent,
          lgpdConsent,
          lgpdConsentAt,
        },
      })
    }

    // Fire Webhook event asynchronously (non-blocking)
    try {
      const funnel = await prisma.funnel.findUnique({
        where: { id: funnelId },
        select: {
          webhookUrl: true,
          workspace: {
            select: { plan: true }
          }
        }
      })

      if (funnel?.webhookUrl && (funnel.workspace.plan === 'PRO' || funnel.workspace.plan === 'ELITE')) {
        // Run in background
        dispatchWebhookEvent(funnel.webhookUrl, {
          leadId: savedLead.id,
          name: savedLead.name,
          email: savedLead.email,
          phone: savedLead.phone,
          company: savedLead.company,
          score: savedLead.score,
          classification: savedLead.classification,
          answers: savedLead.answers,
          utmSource: savedLead.utmSource,
          utmMedium: savedLead.utmMedium,
          utmCampaign: savedLead.utmCampaign,
          utmContent: savedLead.utmContent,
          utmTerm: savedLead.utmTerm,
          createdAt: savedLead.createdAt
        })
      }
    } catch (webhookErr) {
      console.error('[Leads API] Failed to trigger webhook flow:', webhookErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API /leads error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
