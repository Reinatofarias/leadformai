'use client'

import React from 'react'
import type { FunnelStep } from '@prisma/client'
import { VideoEmbed } from './video-embed'
import { CheckCircle2 } from 'lucide-react'

interface ImageOption {
  id: string
  text: string
  imageUrl: string
  score?: number
  priceValue?: number
  goToStep?: number
}

interface Props {
  step: FunnelStep
  goNext: (answer: { stepId: string; stepType: string; value: string; score: number; priceValue: number }, jumpToIndex?: number) => void
}

export function ImageChoiceRenderer({ step, goNext }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const options: ImageOption[] = (config.options as ImageOption[]) || []
  const videoUrl = (config.videoUrl as string) || ''

  const handleSelect = (option: ImageOption) => {
    let jumpToIndex = undefined
    if (option.goToStep !== undefined && option.goToStep > 0) {
      jumpToIndex = option.goToStep - 1 // 1-indexed to 0-indexed conversion
    }

    goNext(
      {
        stepId: step.id,
        stepType: 'IMAGE_CHOICE',
        value: option.text,
        score: option.score || 0,
        priceValue: option.priceValue || 0,
      },
      jumpToIndex
    )
  }

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text,#1F2937)] mb-3 leading-tight">
          {step.title}
        </h2>
        {step.description && (
          <p className="text-[var(--color-text,#1F2937)] opacity-70 text-sm">
            {step.description}
          </p>
        )}
      </div>

      {/* Render optional instruction video */}
      <VideoEmbed url={videoUrl} />

      <div className="grid grid-cols-2 gap-4 mt-2">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className="group relative flex flex-col items-center bg-white rounded-2xl border-2 border-[var(--color-primary)]/10 hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98] w-full text-left"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Image Wrapper */}
            <div className="w-full aspect-video sm:aspect-[4/3] bg-slate-100 overflow-hidden relative border-b border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={option.imageUrl || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80'}
                alt={option.text}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover selection badge */}
              <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-full p-1 shadow-md border border-slate-100">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[var(--color-primary)] fill-[var(--color-primary)]/10" />
                </div>
              </div>
            </div>

            {/* Label and Info */}
            <div className="p-4 w-full flex flex-col justify-between flex-1">
              <span className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                {option.text}
              </span>
              {option.priceValue && option.priceValue > 0 ? (
                <span className="text-2xs font-semibold text-slate-400 mt-1">
                  +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(option.priceValue)}
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
