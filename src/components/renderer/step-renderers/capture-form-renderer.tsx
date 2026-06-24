import React, { useState } from 'react'
import type { FunnelStep } from '@prisma/client'
import { ArrowRight, Lock } from 'lucide-react'

interface Field {
  name: string
  label: string
  type: string
  placeholder?: string
  required: boolean
}

interface Props {
  step: FunnelStep
  submitLead: (data: any) => void
}

export function CaptureFormRenderer({ step, submitLead }: Props) {
  const config = (step.config as any) || {}
  const fields: Field[] = config.fields || []
  
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [lgpdConsent, setLgpdConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Limpa erro ao digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    fields.forEach(field => {
      const val = formData[field.name]?.trim() || ''
      
      if (field.required && !val) {
        newErrors[field.name] = 'Este campo é obrigatório'
      } else if (val) {
        if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          newErrors[field.name] = 'E-mail inválido'
        }
        if (field.type === 'phone' && val.replace(/\D/g, '').length < 10) {
          newErrors[field.name] = 'Telefone inválido'
        }
      }
    })

    if (!lgpdConsent) {
      newErrors.lgpdConsent = 'Você precisa aceitar os termos de privacidade para continuar'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    // Delay simulado para UX antes de passar para o submit real
    await new Promise(r => setTimeout(r, 400))
    submitLead({
      ...formData,
      lgpdConsent: true
    })
  }

  return (
    <div className="w-full flex flex-col bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-text,#1F2937)] mb-2">
          {step.title}
        </h2>
        {step.description && (
          <p className="text-[var(--color-text,#1F2937)] opacity-70 text-sm">
            {step.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'phone' ? 'tel' : field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ''}
              className={`w-full p-3 rounded-xl border-2 focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white ${
                errors[field.name] 
                  ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                  : 'border-gray-200 focus:border-[var(--color-primary)]'
              }`}
            />
            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1.5 ml-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="mt-2 flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-left">
            <input
              type="checkbox"
              checked={lgpdConsent}
              onChange={(e) => {
                setLgpdConsent(e.target.checked)
                if (errors.lgpdConsent) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.lgpdConsent
                    return newErrors
                  })
                }
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[11px] text-gray-450 leading-relaxed font-semibold">
              Aceito os Termos de Uso e a Política de Privacidade e autorizo o processamento dos meus dados pessoais em conformidade com a LGPD.
            </span>
          </label>
          {errors.lgpdConsent && (
            <p className="text-red-500 text-xs mt-1 ml-1">{errors.lgpdConsent}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary,#6366F1)] text-white hover:opacity-90 active:scale-95 px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-md cursor-pointer mt-2 disabled:opacity-70"
        >
          {isSubmitting ? 'Processando...' : (config.buttonText || 'Ver Resultado')}
          {!isSubmitting && <ArrowRight className="h-5 w-5" />}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
          <Lock className="h-3 w-3" />
          <span>Suas informações estão seguras.</span>
        </div>
      </form>
    </div>
  )
}
