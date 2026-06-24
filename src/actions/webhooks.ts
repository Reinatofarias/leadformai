'use server'

import { getWorkspaceId } from '@/lib/workspace'

export interface TestWebhookResult {
  success: boolean
  statusCode?: number
  responseTimeMs?: number
  error?: string
}

export async function testWebhookUrl(url: string): Promise<TestWebhookResult> {
  try {
    const workspaceId = await getWorkspaceId() // Verify user session
    if (!workspaceId) {
      return { success: false, error: 'Sessão inválida ou não autorizado.' }
    }

    if (!url || !url.startsWith('http')) {
      return { success: false, error: 'URL do webhook inválida. Deve começar com http:// ou https://.' }
    }

    const payload = {
      event: 'lead.test',
      timestamp: new Date().toISOString(),
      data: {
        id: 'mock_lead_test_123',
        name: 'Lead de Teste',
        email: 'teste@voxfunnels.com',
        phone: '+5511999999999',
        score: 85,
        classification: 'HOT',
        answers: [
          { stepId: 'step_welcome', value: 'Começar' },
          { stepId: 'step_budget', value: 'Acima de R$ 50.000' }
        ]
      }
    }

    const start = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VoxFunnels-Webhook-Tester/1.0',
        'X-VoxFunnels-Event': 'lead.test'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    const end = Date.now()
    const responseTimeMs = end - start

    if (!response.ok) {
      return { 
        success: false, 
        statusCode: response.status, 
        responseTimeMs, 
        error: `O webhook respondeu com código de erro HTTP ${response.status}.` 
      }
    }

    return {
      success: true,
      statusCode: response.status,
      responseTimeMs
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Tempo de resposta excedido (Timeout de 8 segundos).' }
    }
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message || 'Não foi possível estabelecer conexão com o servidor de destino.' }
  }
}
