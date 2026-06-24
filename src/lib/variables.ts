/**
 * Resolves a flat key-value dictionary of variables based on answers, lead details, and final scores.
 */
export function resolveVariables(
  answers: any[],
  leadData?: Record<string, any>,
  scoreResult?: { normalizedScore?: number; classification?: string } | null
): Record<string, string> {
  const vars: Record<string, string> = {
    nome: leadData?.nome || leadData?.name || '',
    email: leadData?.email || '',
    telefone: leadData?.phone || leadData?.telefone || leadData?.whatsapp || '',
    empresa: leadData?.empresa || '',
    cidade: leadData?.cidade || '',
    score: scoreResult?.normalizedScore !== undefined ? String(scoreResult.normalizedScore) : '0',
    classificacao: scoreResult?.classification || '',
    servico_interesse: '',
    orcamento: '',
    urgencia: '',
  }

  // Map dynamic answers to specific variables if matching labels are found
  for (const ans of answers) {
    if (ans.variableName) {
      vars[ans.variableName] = String(ans.value)
    }

    // Try to map interest and budget heuristically
    const valLower = String(ans.value).toLowerCase()
    if (valLower.includes('interesse') || valLower.includes('serviço') || valLower.includes('quere')) {
      vars.servico_interesse = String(ans.value)
    }
    
    if (ans.priceValue && ans.priceValue > 0) {
      vars.orcamento = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        maximumFractionDigits: 0 
      }).format(ans.priceValue)
    }
  }

  return vars
}

/**
 * Replaces placeholder templates in text (e.g. {{nome}}) with the resolved values.
 */
export function replaceVariables(text: string, vars: Record<string, string>): string {
  if (!text) return ''
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
    result = result.replace(regex, value || '')
  }
  return result
}
