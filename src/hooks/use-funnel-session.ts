'use client'

import { useState, useEffect } from 'react'
import { generateId } from '@/lib/utils'

export function useFunnelSession(funnelId: string) {
  const [sessionId, setSessionId] = useState<string>('')

  useEffect(() => {
    // Check if we already have a session for this funnel in sessionStorage
    const storageKey = `leadflow_session_${funnelId}`
    const existing = sessionStorage.getItem(storageKey)
    
    if (existing) {
      setSessionId(existing)
    } else {
      const newSession = generateId()
      sessionStorage.setItem(storageKey, newSession)
      setSessionId(newSession)
      
      // Fire FUNNEL_STARTED event asynchronously (will be implemented in tracking API)
      fetch('/api/public/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId,
          sessionId: newSession,
          eventType: 'FUNNEL_STARTED',
        }),
      }).catch(console.error)
    }
  }, [funnelId])

  return sessionId
}
