'use client'

import React, { useState, useEffect } from 'react'
import { createStep, deleteStep, moveStep } from '@/actions/steps'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { STEP_TYPE_CONFIG } from '@/lib/constants'
import { useToast } from '@/components/ui/toast'
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  ListChecks,
  MessageSquare,
  ClipboardList,
  Loader2,
  Trophy,
  ExternalLink
} from 'lucide-react'
import { StepConfigForm } from './step-config-form'
import type { Funnel, FunnelStep } from '@prisma/client'

type FunnelWithSteps = Funnel & { steps: FunnelStep[] }

const STEP_ICONS = {
  WELCOME: Sparkles,
  MULTIPLE_CHOICE: ListChecks,
  OPEN_QUESTION: MessageSquare,
  CAPTURE_FORM: ClipboardList,
  LOADING: Loader2,
  RESULT: Trophy,
  REDIRECT: ExternalLink,
} as const

interface FunnelStepsEditorProps {
  funnel: FunnelWithSteps
  onActiveStepChange?: (step: FunnelStep | null) => void
}

export function FunnelStepsEditor({ funnel, onActiveStepChange }: FunnelStepsEditorProps) {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)
  
  // Modals
  const [stepToDelete, setStepToDelete] = useState<FunnelStep | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState<string | null>(null)

  // Notify parent of active step change
  useEffect(() => {
    if (onActiveStepChange) {
      const activeStep = funnel.steps.find(s => s.id === expandedStepId) || null
      onActiveStepChange(activeStep)
    }
  }, [expandedStepId, funnel.steps, onActiveStepChange])

  const handleCreateStep = async (type: string) => {
    setIsAdding(true)
    const result = await createStep(funnel.id, { type })
    setIsAdding(false)
    
    if (result.success && result.step) {
      toast('Etapa adicionada com sucesso')
      setExpandedStepId(result.step.id)
    } else {
      toast(result.error || 'Erro ao adicionar etapa', 'error')
    }
  }

  const handleDeleteStep = async () => {
    if (!stepToDelete) return
    setIsDeleting(true)
    const result = await deleteStep(stepToDelete.id, funnel.id)
    setIsDeleting(false)
    
    if (result.success) {
      toast('Etapa excluída com sucesso')
      setStepToDelete(null)
      if (expandedStepId === stepToDelete.id) setExpandedStepId(null)
    } else {
      toast(result.error || 'Erro ao excluir etapa', 'error')
    }
  }

  const handleMoveStep = async (stepId: string, direction: 'up' | 'down') => {
    setIsMoving(stepId)
    const result = await moveStep(stepId, funnel.id, direction)
    setIsMoving(null)
    
    if (!result.success) {
      toast(result.error || 'Erro ao mover etapa', 'error')
    }
  }

  const toggleExpand = (stepId: string) => {
    setExpandedStepId(prev => prev === stepId ? null : stepId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-4">
        {funnel.steps.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Nenhuma etapa</h3>
            <p className="text-xs text-slate-400">Comece adicionando a primeira etapa do seu funil.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {funnel.steps.map((step, index) => {
              const isExpanded = expandedStepId === step.id
              const configType = STEP_TYPE_CONFIG[step.type as keyof typeof STEP_TYPE_CONFIG]
              const Icon = STEP_ICONS[step.type as keyof typeof STEP_ICONS] || Settings

              return (
                <div 
                  key={step.id} 
                  className={`rounded-xl border bg-white transition-all duration-300 ${
                    isExpanded 
                      ? 'border-indigo-400/80 shadow-md shadow-indigo-100/50' 
                      : 'border-slate-200/80 shadow-sm shadow-slate-100/50 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Step Header */}
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => toggleExpand(step.id)}
                  >
                    <div className="flex items-center text-slate-400">
                      <GripVertical className="h-5 w-5 shrink-0" />
                      <div className="flex flex-col gap-0.5 ml-1">
                        <button
                          disabled={index === 0 || isMoving !== null}
                          onClick={(e) => { e.stopPropagation(); handleMoveStep(step.id, 'up') }}
                          className="hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          disabled={index === funnel.steps.length - 1 || isMoving !== null}
                          onClick={(e) => { e.stopPropagation(); handleMoveStep(step.id, 'down') }}
                          className="hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div 
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300"
                      style={{ backgroundColor: `${configType?.color}15`, color: configType?.color }}
                    >
                      <Icon className="h-5.5 w-5.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider">ETAPA {index + 1}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/30">
                          {configType?.label || step.type}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 truncate mt-1">
                        {step.title || 'Sem título'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setStepToDelete(step)
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      <div className="text-slate-400 p-1.5 transition-transform duration-300">
                        {isExpanded ? <ChevronDown className="h-5.5 w-5.5" /> : <ChevronRight className="h-5.5 w-5.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Step Configuration Form (Expanded) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50 rounded-b-xl">
                      <StepConfigForm step={step} funnelId={funnel.id} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Step Action Bar */}
      <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Adicionar Etapa</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STEP_TYPE_CONFIG).map(([type, config]) => {
            const Icon = STEP_ICONS[type as keyof typeof STEP_ICONS] || Settings
            return (
              <button
                key={type}
                onClick={() => handleCreateStep(type)}
                disabled={isAdding}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/80 hover:text-indigo-700 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Icon className="h-4 w-4" style={{ color: config.color }} />
                {config.label}
              </button>
            )
          })}
        </div>
      </div>

      <ConfirmModal
        open={!!stepToDelete}
        onClose={() => setStepToDelete(null)}
        onConfirm={handleDeleteStep}
        title="Excluir etapa"
        description={`Tem certeza que deseja excluir a etapa "${stepToDelete?.title || 'Sem título'}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir etapa"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  )
}

