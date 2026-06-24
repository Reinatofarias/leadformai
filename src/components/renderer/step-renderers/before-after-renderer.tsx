'use client'

import React, { useState, useRef, useEffect } from 'react'
import type { FunnelStep } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { VideoEmbed } from './video-embed'
import { ArrowRight } from 'lucide-react'

interface Props {
  step: FunnelStep
  goNext: (answer: { stepId: string; stepType: string; value: string; score: number }, jumpToIndex?: number) => void
}

export function BeforeAfterRenderer({ step, goNext }: Props) {
  const config = (step.config as Record<string, unknown>) || {}
  const beforeImageUrl = (config.beforeImageUrl as string) || 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&auto=format&fit=crop&q=80'
  const afterImageUrl = (config.afterImageUrl as string) || 'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?w=500&auto=format&fit=crop&q=80'
  const videoUrl = (config.videoUrl as string) || ''
  const beforeLabel = (config.beforeLabel as string) || 'Antes'
  const afterLabel = (config.afterLabel as string) || 'Depois'

  const [sliderPosition, setSliderPosition] = useState(50) // Percentage (0-100)
  const [containerWidth, setContainerWidth] = useState(480)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Track container width for matching overlay dimensions
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100))
    setSliderPosition(percentage)
  }

  // Mouse drag handlers
  const handleMouseDown = () => {
    isDragging.current = true
  }

  // Touch drag handlers
  const handleTouchStart = () => {
    isDragging.current = true
  }

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      handleMove(e.clientX)
    }

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX)
      }
    }

    const handleGlobalEnd = () => {
      isDragging.current = false
    }

    window.addEventListener('mousemove', handleGlobalMove)
    window.addEventListener('mouseup', handleGlobalEnd)
    window.addEventListener('touchmove', handleGlobalTouchMove)
    window.addEventListener('touchend', handleGlobalEnd)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove)
      window.removeEventListener('mouseup', handleGlobalEnd)
      window.removeEventListener('touchmove', handleGlobalTouchMove)
      window.removeEventListener('touchend', handleGlobalEnd)
    }
  }, [])

  const handleContinue = () => {
    goNext({
      stepId: step.id,
      stepType: 'BEFORE_AFTER',
      value: 'Interagido',
      score: typeof config.score === 'number' ? config.score : 0,
    })
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

      {/* Comparison Canvas container */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden select-none border border-slate-200/50 shadow-sm bg-slate-100 cursor-ew-resize touch-none"
        onMouseMove={(e) => { if (e.buttons === 1) handleMove(e.clientX) }}
        onTouchMove={(e) => { if (e.touches[0]) handleMove(e.touches[0].clientX) }}
      >
        {/* Before Image (Background underneath) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={beforeImageUrl} 
          alt="Antes" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <span className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider text-white shadow-sm">
          {beforeLabel}
        </span>

        {/* After Image (Overlay, resized dynamically) */}
        <div 
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={afterImageUrl} 
            alt="Depois" 
            className="absolute inset-y-0 left-0 h-full object-cover pointer-events-none max-w-none"
            style={{ width: containerWidth }}
          />
        </div>
        <span className="absolute bottom-4 right-4 bg-[var(--color-primary)]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-2xs font-bold uppercase tracking-wider text-white shadow-sm">
          {afterLabel}
        </span>

        {/* Slider bar & handle */}
        <div 
          className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center -translate-x-1/2 z-10 group/handle"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="h-10 w-10 rounded-full bg-white text-slate-700 shadow-xl border border-slate-100 flex items-center justify-center font-bold text-lg select-none hover:scale-105 transition-transform active:scale-95 duration-200">
            <span className="text-sm select-none text-slate-400">↔</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button 
          onClick={handleContinue}
          className="w-full font-bold flex items-center justify-center gap-1.5"
        >
          Continuar
          <ArrowRight className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  )
}
