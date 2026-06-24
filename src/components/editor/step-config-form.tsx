'use client'

import React, { useTransition } from 'react'
import { updateStep } from '@/actions/steps'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import type { FunnelStep } from '@prisma/client'

// Tipos específicos
import { WelcomeForm } from './step-types/welcome-form'
import { MultipleChoiceForm } from './step-types/multiple-choice-form'
import { OpenQuestionForm } from './step-types/open-question-form'
import { CaptureFormForm } from './step-types/capture-form-form'
import { LoadingForm } from './step-types/loading-form'
import { ResultForm } from './step-types/result-form'
import { RedirectForm } from './step-types/redirect-form'

interface StepConfigFormProps {
  step: FunnelStep
  funnelId: string
}

export function StepConfigForm({ step, funnelId }: StepConfigFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Handler genérico passado para os formulários específicos
  const handleSave = async (title: string, description: string, config: unknown) => {
    startTransition(async () => {
      const result = await updateStep(step.id, funnelId, { title, description, config })
      if (result.success) {
        toast('Etapa salva com sucesso')
      } else {
        toast(result.error || 'Erro ao salvar etapa', 'error')
      }
    })
  }

  // Renderiza o formulário específico baseado no tipo
  const renderSpecificForm = () => {
    const props = { step, onSave: handleSave, isPending }
    
    switch (step.type) {
      case 'WELCOME': return <WelcomeForm {...props} />
      case 'MULTIPLE_CHOICE': return <MultipleChoiceForm {...props} />
      case 'OPEN_QUESTION': return <OpenQuestionForm {...props} />
      case 'CAPTURE_FORM': return <CaptureFormForm {...props} />
      case 'LOADING': return <LoadingForm {...props} />
      case 'RESULT': return <ResultForm {...props} />
      case 'REDIRECT': return <RedirectForm {...props} />
      default: return <div>Tipo de etapa desconhecido</div>
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-200">
      {renderSpecificForm()}
    </div>
  )
}
