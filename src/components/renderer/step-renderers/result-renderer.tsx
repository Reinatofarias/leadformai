import React from 'react'
import type { FunnelStep } from '@prisma/client'
import type { ScoringResult } from '@/lib/scoring'
import { buildWhatsAppUrlWithData, classificationToPtBr } from '@/lib/whatsapp'
import { CheckCircle2, MessageCircle, ExternalLink } from 'lucide-react'

interface Props {
  step: FunnelStep
  funnel: any
  finalScore: ScoringResult | null
  answers: any[]
}

export function ResultRenderer({ step, funnel, finalScore, answers }: Props) {
  const config = (step.config as any) || {}
  
  // Find lead name if captured
  const nameAnswer = answers.find(a => 
    a.stepType === 'CAPTURE_FORM' && a.value && typeof a.value === 'object' && a.value.nome
  )
  const leadName = nameAnswer?.value?.nome || ''
  
  // Find conditional result if any matches the score
  let currentResult = {
    title: config.title || 'Seu resultado está pronto!',
    description: config.description || '',
    cta: config.defaultCta
  }

  if (config.conditionalResults && config.conditionalResults.length > 0 && finalScore) {
    const matched = config.conditionalResults.find((r: any) => 
      finalScore.normalizedScore >= r.minScore && finalScore.normalizedScore <= r.maxScore
    )
    if (matched) {
      currentResult = {
        title: matched.title,
        description: matched.description,
        cta: {
          text: matched.ctaText || config.defaultCta?.text,
          type: matched.ctaType || config.defaultCta?.type,
          url: matched.ctaUrl || config.defaultCta?.url,
        }
      }
    }
  }

  // Handle CTA Click
  const handleCtaClick = () => {
    if (!currentResult.cta) return
    
    if (currentResult.cta.type === 'whatsapp') {
      const number = funnel.whatsappNumber
      const template = funnel.whatsappMessage
      
      if (!number) return alert('WhatsApp não configurado pelo criador do funil.')
      
      const url = buildWhatsAppUrlWithData(number, template || '', {
        nome: leadName,
        pontuacao: finalScore?.normalizedScore,
        classificacao: finalScore ? classificationToPtBr(finalScore.classification) : '',
        funil: funnel.name
      })
      
      window.open(url, '_blank')
    } 
    else if (currentResult.cta.type === 'url' && currentResult.cta.url) {
      window.location.href = currentResult.cta.url
    }
  }

  return (
    <div className="w-full flex flex-col items-center text-center bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 animate-in zoom-in-95 duration-500">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-inner">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <h1 className="text-3xl font-extrabold text-[var(--color-text,#1F2937)] mb-4">
        {currentResult.title}
      </h1>
      
      {currentResult.description && (
        <p className="text-lg text-[var(--color-text,#1F2937)] opacity-80 mb-8 max-w-sm">
          {currentResult.description}
        </p>
      )}

      {/* Score Cards */}
      {(config.showScore || config.showClassification) && finalScore && (
        <div className="flex gap-4 mb-8 w-full">
          {config.showScore && (
            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pontuação</p>
              <p className="text-2xl font-bold text-[var(--color-primary,#6366F1)]">
                {finalScore.normalizedScore}<span className="text-sm text-gray-400 font-normal">/100</span>
              </p>
            </div>
          )}
          
          {config.showClassification && (
            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Classificação</p>
              <p className="text-lg font-bold text-gray-900 mt-1.5">
                {classificationToPtBr(finalScore.classification)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      {currentResult.cta && currentResult.cta.type !== 'none' && (
        <button
          onClick={handleCtaClick}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary,#6366F1)] text-white hover:opacity-90 active:scale-95 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-md cursor-pointer"
        >
          {currentResult.cta.type === 'whatsapp' && <MessageCircle className="h-5 w-5" />}
          {currentResult.cta.type === 'url' && <ExternalLink className="h-5 w-5" />}
          {currentResult.cta.text || 'Continuar'}
        </button>
      )}
    </div>
  )
}
