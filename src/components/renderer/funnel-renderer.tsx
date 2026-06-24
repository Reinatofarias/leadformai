'use client'

import React, { useState, useEffect } from 'react'
import { useFunnelSession } from '@/hooks/use-funnel-session'
import { useUTM } from '@/hooks/use-utm'
import { ProgressIndicator } from './progress-indicator'
import type { Funnel, FunnelStep } from '@prisma/client'
import type { Answer, ScoringResult } from '@/lib/scoring'
import { scoreLead, calculateMaxPossibleScore } from '@/lib/scoring'
import { ArrowLeft } from 'lucide-react'

// Step Renderers
import { WelcomeRenderer } from './step-renderers/welcome-renderer'
import { MultipleChoiceRenderer } from './step-renderers/multiple-choice-renderer'
import { OpenQuestionRenderer } from './step-renderers/open-question-renderer'
import { CaptureFormRenderer } from './step-renderers/capture-form-renderer'
import { LoadingRenderer } from './step-renderers/loading-renderer'
import { ResultRenderer } from './step-renderers/result-renderer'
import { RedirectRenderer } from './step-renderers/redirect-renderer'

type FunnelWithSteps = Funnel & { steps: FunnelStep[] }

interface Props {
  funnel: FunnelWithSteps
}

export function FunnelRenderer({ funnel }: Props) {
  // Hooks
  const sessionId = useFunnelSession(funnel.id)
  const utms = useUTM()

  // State Machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [history, setHistory] = useState<number[]>([0]) // Rastreia o caminho (para botão voltar funcionar com pulos)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [finalScore, setFinalScore] = useState<ScoringResult | null>(null)

  const maxScore = calculateMaxPossibleScore(funnel.steps)
  const currentStep = funnel.steps[currentStepIndex]

  // Event Tracking Helper
  const trackEvent = (eventType: string, stepId?: string, metadata?: any) => {
    if (!sessionId) return
    fetch('/api/public/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        funnelId: funnel.id,
        sessionId,
        eventType,
        stepId,
        metadata,
      }),
    }).catch(() => {})
  }

  // Avançar
  const goNext = (answer?: Answer, jumpToIndex?: number) => {
    if (isTransitioning) return

    // Salvar resposta
    if (answer) {
      setAnswers(prev => {
        // Atualiza se já existir resposta para esta etapa
        const existing = prev.findIndex(a => a.stepId === answer.stepId)
        if (existing >= 0) {
          const newAnswers = [...prev]
          newAnswers[existing] = answer
          return newAnswers
        }
        return [...prev, answer]
      })

      trackEvent('STEP_COMPLETED', currentStep.id, { answer })
    }

    // Calcular próximo índice
    let nextIndex = currentStepIndex + 1
    
    // Se a opção tiver goToStep configurado
    if (jumpToIndex !== undefined && jumpToIndex >= 0 && jumpToIndex < funnel.steps.length) {
      nextIndex = jumpToIndex
    }

    if (nextIndex < funnel.steps.length) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStepIndex(nextIndex)
        setHistory(prev => [...prev, nextIndex])
        setIsTransitioning(false)
        trackEvent('STEP_VIEWED', funnel.steps[nextIndex].id)
      }, 300) // Delay para animação
    }
  }

  // Voltar
  const goBack = () => {
    if (history.length <= 1 || isTransitioning) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      const newHistory = [...history]
      newHistory.pop() // Remove o atual
      const prevIndex = newHistory[newHistory.length - 1]
      
      setCurrentStepIndex(prevIndex)
      setHistory(newHistory)
      setIsTransitioning(false)
    }, 300)
  }

  // Salvar Lead (Chamado pelo CaptureFormRenderer)
  const submitLead = async (leadData: any) => {
    // Calcula score final antes de salvar
    const result = scoreLead(answers, maxScore)
    setFinalScore(result)

    try {
      await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          funnelId: funnel.id,
          sessionId,
          leadData,
          answers,
          scoreResult: result,
          utms,
        }),
      })
      trackEvent('LEAD_CAPTURED', currentStep.id)
    } catch (e) {
      console.error('Erro ao salvar lead', e)
    }

    goNext() // Avança para Loading ou Resultado
  }

  // Tracking inicial
  useEffect(() => {
    if (sessionId && currentStepIndex === 0 && history.length === 1) {
      trackEvent('STEP_VIEWED', currentStep.id)
    }
  }, [sessionId, currentStepIndex, history.length]) // eslint-disable-line

  // Renderização condicional por tipo de etapa
  const renderCurrentStep = () => {
    if (!currentStep) return null

    const props = {
      step: currentStep,
      funnel,
      goNext,
      goBack,
      answers,
    }

    switch (currentStep.type) {
      case 'WELCOME': return <WelcomeRenderer {...props} />
      case 'MULTIPLE_CHOICE': return <MultipleChoiceRenderer {...props} />
      case 'OPEN_QUESTION': return <OpenQuestionRenderer {...props} />
      case 'CAPTURE_FORM': return <CaptureFormRenderer {...props} submitLead={submitLead} />
      case 'LOADING': return <LoadingRenderer {...props} />
      case 'RESULT': return <ResultRenderer {...props} finalScore={finalScore} />
      case 'REDIRECT': return <RedirectRenderer {...props} finalScore={finalScore} />
      default: return <div>Tipo de etapa desconhecido</div>
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] overflow-hidden">
      {/* Barra de Progresso Superior */}
      {currentStep.type !== 'WELCOME' && currentStep.type !== 'RESULT' && currentStep.type !== 'REDIRECT' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <ProgressIndicator 
            currentStep={currentStepIndex} 
            totalSteps={funnel.steps.length} 
          />
        </div>
      )}

      {/* Botão Voltar */}
      {history.length > 1 && currentStep.type !== 'LOADING' && currentStep.type !== 'RESULT' && currentStep.type !== 'REDIRECT' && (
        <button
          onClick={goBack}
          disabled={isTransitioning}
          className="fixed top-4 left-4 sm:top-8 sm:left-8 z-40 flex items-center justify-center h-10 w-10 rounded-full bg-white/50 backdrop-blur border border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      {/* Container Principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-lg mx-auto">
        <div 
          className={`w-full transition-all duration-300 transform ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0 funnel-step-enter'
          }`}
        >
          {renderCurrentStep()}
        </div>
      </main>

      {/* Footer Branding Opcional */}
      <div className="py-4 text-center">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] text-gray-400 font-medium hover:text-gray-600 transition-colors"
        >
          ⚡ Desenvolvido com LeadFlow AI
        </a>
      </div>
    </div>
  )
}
