import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { EventType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { funnelId, sessionId, eventType, stepId, metadata } = body

    if (!funnelId || !sessionId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fire and forget, we don't want to block the client
    // In a high traffic scenario, this would be pushed to a queue (like SQS/Redis)
    prisma.funnelEvent.create({
      data: {
        funnelId,
        sessionId,
        eventType: eventType as EventType,
        stepId: stepId || null,
        metadata: metadata || null,
      },
    }).catch(console.error)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API /events error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
