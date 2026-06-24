'use client'

import React, { useState } from 'react'
import type { FunnelStep } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { resolveVariables, replaceVariables } from '@/lib/variables'

interface Props {
  step: FunnelStep
  goNext: (answer: any, jumpToIndex?: number) => void
  answers: any[]
}

interface Testimonial {
  id: string
  name: string
  role?: string
  text: string
  rating: number
  avatarUrl?: string
}

export function TestimonialsRenderer({ step, goNext, answers }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const testimonialsList: Testimonial[] = (config.testimonials as Testimonial[]) || [
    {
      id: '1',
      name: 'Carlos Oliveira',
      role: 'Diretor de Operações',
      text: 'Excelente atendimento e diagnóstico preciso! Recomendamos a todos.',
      rating: 5,
    },
    {
      id: '2',
      name: 'Mariana Costa',
      role: 'Empreendedora',
      text: 'Superou minhas expectativas, muito rápido e intuitivo.',
      rating: 5,
    }
  ]
  const buttonText = (config.buttonText as string) || 'Continuar'

  const [activeSlide, setActiveSlide] = useState(0)

  // Dynamic variables resolution
  const vars = resolveVariables(answers)
  const title = replaceVariables(step.title || '', vars)
  const description = replaceVariables(step.description || '', vars)

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % testimonialsList.length)
  }

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + testimonialsList.length) % testimonialsList.length)
  }

  const handleContinue = () => {
    goNext({
      stepId: step.id,
      stepType: 'TESTIMONIALS',
      value: 'Depoimentos Visualizados',
      score: typeof config.score === 'number' ? config.score : 0,
    })
  }

  const activeTestimonial = testimonialsList[activeSlide]

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {activeTestimonial && (
        <div className="w-full bg-white border border-slate-200/60 rounded-2xl p-6 shadow-md shadow-slate-100/50 mb-6 flex flex-col relative overflow-hidden">
          {/* Background quote mark */}
          <div className="absolute -top-4 -right-2 text-indigo-50/70 select-none pointer-events-none">
            <MessageSquare className="h-32 w-32 fill-indigo-50/20" />
          </div>

          <div className="flex gap-1.5 mb-4 relative z-10">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star 
                key={idx}
                className={`h-4.5 w-4.5 ${
                  idx < activeTestimonial.rating 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>

          <p className="text-slate-700 italic text-base leading-relaxed mb-6 relative z-10">
            "{activeTestimonial.text}"
          </p>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm border border-indigo-100 shadow-2xs">
                {activeTestimonial.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeTestimonial.avatarUrl} alt={activeTestimonial.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  activeTestimonial.name[0].toUpperCase()
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{activeTestimonial.name}</h4>
                {activeTestimonial.role && <p className="text-3xs font-semibold text-slate-400 uppercase tracking-wider">{activeTestimonial.role}</p>}
              </div>
            </div>

            {/* Slide Navigation */}
            {testimonialsList.length > 1 && (
              <div className="flex gap-1.5">
                <button 
                  onClick={handlePrevSlide}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full mt-2">
        <Button 
          onClick={handleContinue}
          className="w-full font-bold flex items-center justify-center gap-1.5"
        >
          {buttonText}
          <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  )
}
