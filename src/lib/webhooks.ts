/**
 * Helper to dispatch lead events to configured webhook URLs.
 * Runs asynchronously and handles failure gracefully.
 */
export async function dispatchWebhookEvent(url: string, payload: Record<string, unknown>, maxAttempts = 3) {
  if (!url) return

  // Run async retry queue in background
  ;(async () => {
    let attempt = 0
    let success = false

    while (attempt < maxAttempts && !success) {
      attempt++
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000) // 6 seconds timeout

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LeadFlow-AI-Webhook-Dispatcher/1.0',
            'X-LeadFlow-Event': 'lead.captured',
            'X-LeadFlow-Attempt': String(attempt)
          },
          body: JSON.stringify({
            event: 'lead.captured',
            timestamp: new Date().toISOString(),
            attempt,
            data: payload
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          console.warn(`[Webhook] Target URL returned status code: ${response.status} on attempt ${attempt}/${maxAttempts}`)
        } else {
          success = true
          console.log(`[Webhook] Dispatched lead successfully to ${url} on attempt ${attempt}/${maxAttempts}`)
        }
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`[Webhook] Timed out sending lead payload to ${url} on attempt ${attempt}/${maxAttempts}`)
        } else {
          const message = error instanceof Error ? error.message : String(error)
          console.error(`[Webhook] Error sending lead payload to ${url} on attempt ${attempt}/${maxAttempts}:`, message)
        }
      }

      if (!success && attempt < maxAttempts) {
        const backoffDelay = Math.pow(2, attempt) * 1000 // 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))
      }
    }
  })().catch((err) => {
    console.error('[Webhook Queue Exception]:', err)
  })
}
