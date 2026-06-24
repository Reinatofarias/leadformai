'use client'

import React from 'react'
import { Sparkles, ArrowRight, Smartphone, AlertCircle, RefreshCw } from 'lucide-react'
import type { FunnelStep } from '@prisma/client'

interface PhonePreviewProps {
  step: FunnelStep | null
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    mode: 'light' | 'dark'
    fontFamily: string
    borderRadius: number
  }
  funnelName: string
}

export function PhonePreview({ step, theme, funnelName }: PhonePreviewProps) {
  // Styles for the preview inner window based on theme
  const borderRad = theme.borderRadius || 12
  const isDark = theme.mode === 'dark'
  
  const innerBg = theme.backgroundColor || (isDark ? '#0f172a' : '#ffffff')
  const innerText = theme.textColor || (isDark ? '#f8fafc' : '#1e293b')
  const primaryCol = theme.primaryColor || '#6366F1'

  // Render mock elements inside the preview screen
  const renderStepPreview = () => {
    if (!step) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 animate-bounce">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Simulador LeadFlow</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              Expanda ou edite uma etapa à esquerda para ver a simulação em tempo real.
            </p>
          </div>
        </div>
      )
    }

    const config = (step.config as any) || {}

    switch (step.type) {
      case 'WELCOME':
        return (
          <div className="flex flex-col justify-between h-full p-5 text-center">
            <div className="my-auto space-y-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 animate-float">
                <Sparkles className="h-4 w-4" style={{ color: primaryCol }} />
              </span>
              <h2 className="text-xl font-extrabold leading-snug" style={{ color: innerText }}>
                {step.title || 'Título de Boas-vindas'}
              </h2>
              {step.description && (
                <p className="text-xs opacity-75 leading-relaxed" style={{ color: innerText }}>
                  {step.description}
                </p>
              )}
            </div>
            <button
              className="w-full py-2.5 px-4 text-xs font-bold text-white transition-all shadow-md active:scale-[0.98]"
              style={{ backgroundColor: primaryCol, borderRadius: `${borderRad}px` }}
            >
              {config.buttonText || 'Começar'}
            </button>
          </div>
        )

      case 'MULTIPLE_CHOICE':
        const options = config.options || []
        return (
          <div className="flex flex-col justify-between h-full p-5">
            <div className="my-auto space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-extrabold leading-snug" style={{ color: innerText }}>
                  {step.title || 'Pergunta de Múltipla Escolha?'}
                </h2>
                {step.description && (
                  <p className="text-[10px] opacity-75 mt-1" style={{ color: innerText }}>
                    {step.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {options.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg text-2xs text-slate-400">
                    Nenhuma opção configurada
                  </div>
                ) : (
                  options.map((opt: any, i: number) => (
                    <div
                      key={opt.id || i}
                      className="flex items-center gap-2.5 p-3 border border-slate-100 bg-white shadow-3xs cursor-pointer text-xs font-semibold hover:border-slate-300"
                      style={{ borderRadius: `${borderRad}px` }}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-3xs text-slate-400 bg-slate-50 font-bold">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ color: innerText }}>{opt.text || `Opção ${i+1}`}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )

      case 'OPEN_QUESTION':
        return (
          <div className="flex flex-col justify-between h-full p-5">
            <div className="my-auto space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-extrabold leading-snug" style={{ color: innerText }}>
                  {step.title || 'Pergunta Aberta?'}
                </h2>
                {step.description && (
                  <p className="text-[10px] opacity-75 mt-1" style={{ color: innerText }}>
                    {step.description}
                  </p>
                )}
              </div>
              <input
                type={config.fieldType === 'number' ? 'number' : 'text'}
                placeholder={config.placeholder || 'Digite sua resposta...'}
                className="w-full bg-white border border-slate-200 text-xs px-3.5 py-2.5 pointer-events-none"
                style={{ borderRadius: `${borderRad}px` }}
                disabled
              />
            </div>
            <button
              className="w-full py-2.5 px-4 text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-1"
              style={{ backgroundColor: primaryCol, borderRadius: `${borderRad}px` }}
            >
              Avançar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )

      case 'CAPTURE_FORM':
        const fields = config.fields || []
        return (
          <div className="flex flex-col justify-between h-full p-5">
            <div className="my-auto space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-extrabold leading-snug" style={{ color: innerText }}>
                  {step.title || 'Preencha seus dados'}
                </h2>
                {step.description && (
                  <p className="text-[10px] opacity-75 mt-1" style={{ color: innerText }}>
                    {step.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {fields.length === 0 ? (
                  <div className="space-y-2">
                    <div className="h-9 bg-slate-50 border border-slate-200 rounded-md"></div>
                    <div className="h-9 bg-slate-50 border border-slate-200 rounded-md"></div>
                  </div>
                ) : (
                  fields.filter((f: any) => f.enabled).map((field: any) => (
                    <div key={field.name} className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{field.label}</span>
                      <input
                        type={field.type === 'phone' ? 'tel' : 'text'}
                        placeholder={`Digite seu ${field.label.toLowerCase()}`}
                        className="w-full bg-white border border-slate-200 text-2xs px-3 py-2 pointer-events-none"
                        style={{ borderRadius: `${borderRad}px` }}
                        disabled
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            <button
              className="w-full py-2.5 px-4 text-xs font-bold text-white transition-all shadow-md"
              style={{ backgroundColor: primaryCol, borderRadius: `${borderRad}px` }}
            >
              {config.buttonText || 'Enviar Dados'}
            </button>
          </div>
        )

      case 'LOADING':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <RefreshCw className="h-9 w-9 text-indigo-600 animate-spin" style={{ color: primaryCol }} />
            <div>
              <h2 className="text-base font-bold" style={{ color: innerText }}>
                {step.title || 'Carregando...'}
              </h2>
              {config.text && (
                <p className="text-[10px] opacity-75 mt-1" style={{ color: innerText }}>
                  {config.text}
                </p>
              )}
            </div>
          </div>
        )

      case 'RESULT':
        return (
          <div className="flex flex-col justify-between h-full p-5 text-center">
            <div className="my-auto space-y-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                🎉
              </div>
              <h2 className="text-xl font-extrabold leading-snug" style={{ color: innerText }}>
                {step.title || 'Parabéns pelos Resultados!'}
              </h2>
              <div className="bg-slate-50/60 p-3.5 border border-slate-100 rounded-xl max-w-[200px] mx-auto text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Métrica de Qualificação</span>
                <p className="text-2xs text-slate-600 mt-1">Score Calculado: 75/100</p>
                <p className="text-2xs text-slate-600 font-bold mt-0.5">Temperatura: Quente 🔥</p>
              </div>
            </div>
            <button
              className="w-full py-2.5 px-4 text-xs font-bold text-white transition-all shadow-md bg-emerald-600 hover:bg-emerald-700"
              style={{ borderRadius: `${borderRad}px` }}
            >
              {config.defaultCta?.text || 'Falar no WhatsApp'}
            </button>
          </div>
        )

      case 'REDIRECT':
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
            <AlertCircle className="h-9 w-9 text-amber-500 animate-pulse" />
            <div>
              <h2 className="text-base font-bold" style={{ color: innerText }}>
                Redirecionando...
              </h2>
              <p className="text-[10px] opacity-75 mt-1 leading-relaxed" style={{ color: innerText }}>
                Você está sendo levado para outra página de forma segura.
              </p>
            </div>
          </div>
        )

      default:
        return <div className="text-xs text-slate-400 p-4 text-center my-auto">Etapa não suportada</div>
    }
  }

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Preview (Mobile)</span>
      
      {/* Smartphone frame container */}
      <div className="relative mx-auto border-[10px] border-slate-900 bg-slate-900 rounded-[40px] shadow-2xl h-[520px] w-[260px] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-900 rounded-b-xl z-20"></div>

        {/* Screen Window */}
        <div 
          className="absolute inset-0 z-10 overflow-hidden flex flex-col justify-between pt-5 pb-4 transition-all duration-300"
          style={{ backgroundColor: innerBg }}
        >
          {/* Header Mock */}
          <div className="px-4 py-1.5 border-b border-slate-100 flex items-center justify-between text-2xs font-semibold text-slate-400 bg-white/40 backdrop-blur-xs">
            <span className="truncate max-w-[120px]">{funnelName}</span>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">preview</span>
          </div>

          {/* Render Mock Screen */}
          <div className="flex-1 h-full overflow-y-auto">
            {renderStepPreview()}
          </div>
        </div>
      </div>
    </div>
  )
}
