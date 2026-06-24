import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Classification } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { funnelId, sessionId, leadData, answers, scoreResult, utms } = body

    if (!funnelId || !sessionId || !leadData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null
    const userAgent = request.headers.get('user-agent') || null

    // Extract basic fields if available (depends on how fields were named in capture form)
    // Common names mapping:
    const nome = leadData.nome || leadData.name || null
    const email = leadData.email || leadData.e_mail || null
    const phone = leadData.telefone || leadData.phone || leadData.whatsapp || null
    const company = leadData.empresa || leadData.company || null

    // Upsert Lead based on funnelId + sessionId to prevent duplicates on double-click
    const lead = await prisma.lead.findFirst({
      where: { funnelId, sessionId },
    })

    if (lead) {
      await prisma.lead.update({
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
        },
      })
    } else {
      await prisma.lead.create({
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
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API /leads error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
