import React, { useEffect, useState } from 'react'
import type { FunnelStep } from '@prisma/client'
import type { ScoringResult } from '@/lib/scoring'
import { buildWhatsAppUrlWithData, classificationToPtBr } from '@/lib/whatsapp'
import { Loader2 } from 'lucide-react'

interface Props {
  step: FunnelStep
  funnel: any
  finalScore: ScoringResult | null
  answers: any[]
}

export function RedirectRenderer({ step, funnel, finalScore, answers }: Props) {
  const config = (step.config as any) || {}
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const delayMs = (config.delay || 0) * 1000

    const executeRedirect = () => {
      setRedirecting(true)

      if (config.redirectType === 'whatsapp') {
        const number = config.whatsappNumber || funnel.whatsappNumber
        const template = config.whatsappMessage || funnel.whatsappMessage || ''
        
        if (!number) {
          console.error('WhatsApp number not configured')
          return
        }

        const nameAnswer = answers.find(a => 
          a.stepType === 'CAPTURE_FORM' && a.value && typeof a.value === 'object' && a.value.nome
        )
        
        const url = buildWhatsAppUrlWithData(number, template, {
          nome: nameAnswer?.value?.nome || '',
          pontuacao: finalScore?.normalizedScore,
          classificacao: finalScore ? classificationToPtBr(finalScore.classification) : '',
          funil: funnel.name
        })
        
        window.location.href = url
      } 
      else if (config.redirectType === 'external_url' && config.url) {
        window.location.href = config.url
      }
    }

    const timeout = setTimeout(executeRedirect, delayMs)
    return () => clearTimeout(timeout)
  }, [config, funnel, finalScore, answers])

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <Loader2 className="h-10 w-10 text-[var(--color-primary,#6366F1)] animate-spin mb-6" />
      <h2 className="text-xl font-bold text-[var(--color-text,#1F2937)]">
        {redirecting ? 'Redirecionando...' : 'Aguarde um momento...'}
      </h2>
      <p className="text-sm text-gray-500 mt-2">
        {config.redirectType === 'whatsapp' 
          ? 'Você será redirecionado para o WhatsApp.' 
          : 'Você está sendo redirecionado para a próxima página.'}
      </p>
    </div>
  )
}
