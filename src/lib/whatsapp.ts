export interface WhatsAppData {
  nome?: string
  email?: string
  telefone?: string
  empresa?: string
  cidade?: string
  pontuacao?: number
  classificacao?: string
  funil?: string
}

/**
 * Replaces template variables in a WhatsApp message with actual data.
 */
export function processWhatsAppMessage(template: string, data: WhatsAppData): string {
  const variables: Record<string, string> = {
    '{{nome}}': data.nome || '',
    '{{email}}': data.email || '',
    '{{telefone}}': data.telefone || '',
    '{{empresa}}': data.empresa || '',
    '{{cidade}}': data.cidade || '',
    '{{pontuacao}}': data.pontuacao?.toString() || '0',
    '{{classificacao}}': data.classificacao || '',
    '{{funil}}': data.funil || '',
  }

  let message = template
  for (const [variable, value] of Object.entries(variables)) {
    message = message.replaceAll(variable, value)
  }

  return message
}

/**
 * Builds a complete WhatsApp URL with phone number and message.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove everything that's not a digit
  const cleanNumber = phoneNumber.replace(/\D/g, '')

  // Ensure DDI 55 (Brazil)
  const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`

  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${fullNumber}?text=${encodedMessage}`
}

/**
 * Builds a WhatsApp URL with processed template variables.
 */
export function buildWhatsAppUrlWithData(
  phoneNumber: string,
  messageTemplate: string,
  data: WhatsAppData
): string {
  const processedMessage = processWhatsAppMessage(messageTemplate, data)
  return buildWhatsAppUrl(phoneNumber, processedMessage)
}

/**
 * Maps Classification enum to PT-BR label.
 */
export function classificationToPtBr(classification: string): string {
  const map: Record<string, string> = {
    COLD: 'Frio',
    WARM: 'Morno',
    HOT: 'Quente',
    VERY_HOT: 'Muito Quente',
  }
  return map[classification] || classification
}
