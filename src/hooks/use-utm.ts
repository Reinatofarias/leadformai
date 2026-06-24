'use client'

import { useState, useEffect } from 'react'

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export function useUTM(): UTMParams {
  const [utmParams, setUtmParams] = useState<UTMParams>({})

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const utms: UTMParams = {}

    const source = params.get('utm_source')
    const medium = params.get('utm_medium')
    const campaign = params.get('utm_campaign')
    const content = params.get('utm_content')
    const term = params.get('utm_term')

    if (source) utms.utm_source = source
    if (medium) utms.utm_medium = medium
    if (campaign) utms.utm_campaign = campaign
    if (content) utms.utm_content = content
    if (term) utms.utm_term = term

    // Save to sessionStorage to persist across page reloads/redirects during the funnel
    const storageKey = 'leadflow_utms'
    
    if (Object.keys(utms).length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify(utms))
      setUtmParams(utms)
    } else {
      // Try to load from session storage if not in URL
      const stored = sessionStorage.getItem(storageKey)
      if (stored) {
        try {
          setUtmParams(JSON.parse(stored))
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }, [])

  return utmParams
}
