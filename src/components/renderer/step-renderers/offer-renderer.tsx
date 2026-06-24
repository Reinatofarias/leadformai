'use client'

import React from 'react'
import type { FunnelStep } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, ShoppingCart } from 'lucide-react'
import { resolveVariables, replaceVariables } from '@/lib/variables'

interface Props {
  step: FunnelStep
  goNext: (answer: any, jumpToIndex?: number) => void
  answers: any[]
}

export function OfferRenderer({ step, goNext, answers }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const imageUrl = (config.imageUrl as string) || ''
  const ctaText = (config.ctaText as string) || 'Aproveitar Oferta'
  const ctaType = (config.ctaType as 'next' | 'url') || 'next'
  const ctaUrl = (config.ctaUrl as string) || ''
  const priceLabel = (config.priceLabel as string) || ''

  // Dynamic variables resolution
  const vars = resolveVariables(answers)
  const title = replaceVariables(step.title || '', vars)
  const description = replaceVariables(step.description || '', vars)

  const handleAction = () => {
    if (ctaType === 'url' && ctaUrl) {
      window.open(ctaUrl, '_blank')
    }
    
    // Proceed to next step
    goNext({
      stepId: step.id,
      stepType: 'OFFER',
      value: 'Oferta Visualizada',
      score: typeof config.score === 'number' ? config.score : 0,
    })
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="w-full bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-md shadow-slate-100/50 mb-6">
        {imageUrl && (
          <div className="w-full aspect-video relative overflow-hidden bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Promoção Especial"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6 flex flex-col items-center">
          {priceLabel && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100 mb-4 animate-bounce">
              <ShoppingCart className="h-4 w-4" />
              {priceLabel}
            </div>
          )}
          <Button 
            onClick={handleAction}
            variant="premium" 
            className="w-full font-bold flex items-center justify-center gap-2"
          >
            {ctaText}
            <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
