'use client'

import React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ClassificationBadge } from '@/components/ui/badge'
import { buildWhatsAppUrlWithData, classificationToPtBr } from '@/lib/whatsapp'
import { formatDateTime } from '@/lib/utils'
import { MessageCircle, Mail, Phone, MapPin, Building2, User, Globe2, Check } from 'lucide-react'

interface LeadDetailsModalProps {
  lead: any
  onClose: () => void
}

interface LeadAnswer {
  stepId: string
  stepType: string
  value: string | number | Record<string, unknown>
  score?: number
}

export function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
  const handleWhatsApp = () => {
    if (!lead.phone) return
    
    const number = lead.funnel.whatsappNumber || lead.phone // fallback to lead's phone to just open chat
    const template = lead.funnel.whatsappMessage || 'Olá {{nome}}!'
    
    const url = buildWhatsAppUrlWithData(number, template, {
      nome: lead.name || '',
      email: lead.email || '',
      telefone: lead.phone || '',
      empresa: lead.company || '',
      pontuacao: lead.score,
      classificacao: lead.classification ? classificationToPtBr(lead.classification) : '',
      funil: lead.funnel.name,
    })
    
    window.open(url, '_blank')
  }

  // Helper to format answers nicely
  const answersList = lead.answers && Array.isArray(lead.answers) 
    ? (lead.answers as unknown as LeadAnswer[]).filter((a) => a.stepType !== 'CAPTURE_FORM') // Esconde campos que já são os principais
    : []

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Detalhes do Lead"
      footer={
        <Button variant="ghost" onClick={onClose}>Fechar</Button>
      }
    >
      <div className="space-y-6">
        {/* Header / Main Info */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-xl">
              {lead.name ? lead.name[0].toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{lead.name || 'Sem nome'}</h3>
              <p className="text-sm text-gray-500">Capturado em {formatDateTime(lead.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ClassificationBadge classification={lead.classification} />
            {lead.score !== null && (
              <span className="text-sm font-semibold text-gray-750">Score: {lead.score}/100</span>
            )}
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                lead.status === 'WON' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                lead.status === 'LOST' ? 'border-red-200 bg-red-50 text-red-600' :
                lead.status === 'QUALIFIED' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' :
                lead.status === 'IN_PROGRESS' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                'border-slate-200 bg-slate-50 text-slate-655'
              }`}>
                {lead.status === 'NEW' || !lead.status ? '🆕 Novo' :
                 lead.status === 'IN_PROGRESS' ? '⏳ Em atendimento' :
                 lead.status === 'QUALIFIED' ? '✅ Qualificado' :
                 lead.status === 'PROPOSAL_SENT' ? '📄 Proposta enviada' :
                 lead.status === 'WON' ? '🎉 Ganho' : '❌ Perdido'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {lead.email && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-50">
                <Mail className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">E-mail</p>
                <p className="text-sm font-medium text-gray-900 truncate">{lead.email}</p>
              </div>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-50">
                <Phone className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Telefone / WhatsApp</p>
                <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
              </div>
            </div>
          )}
          {lead.company && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-50">
                <Building2 className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Empresa</p>
                <p className="text-sm font-medium text-gray-900">{lead.company}</p>
              </div>
            </div>
          )}
          {lead.utmSource && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50/50">
                <Globe2 className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">UTM Source (Origem)</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{lead.utmSource}</p>
              </div>
            </div>
          )}
          {lead.utmMedium && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50/50">
                <Globe2 className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">UTM Medium (Mídia)</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{lead.utmMedium}</p>
              </div>
            </div>
          )}
          {lead.utmCampaign && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-50/50">
                <Globe2 className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">UTM Campaign (Campanha)</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{lead.utmCampaign}</p>
              </div>
            </div>
          )}
          {lead.lgpdConsent && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-50/60">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">LGPD (Consentimento)</p>
                <p className="text-sm font-semibold text-emerald-700 truncate" title={lead.lgpdConsentAt ? formatDateTime(lead.lgpdConsentAt) : ''}>
                  Aceito em {lead.lgpdConsentAt ? new Date(lead.lgpdConsentAt).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Action */}
        {lead.phone && (
          <Button 
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white border-none"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Iniciar conversa no WhatsApp
          </Button>
        )}

        {/* Funnel Data (Answers) */}
        {answersList.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Respostas do Funil</h4>
            <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {answersList.map((answer: LeadAnswer, i: number) => (
                <div key={i} className="p-3">
                  {/* Since we don't save the question text, just the stepId, we show step info conceptually */}
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Passo {answer.stepType.replace('_', ' ')}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {typeof answer.value === 'object' ? JSON.stringify(answer.value) : answer.value}
                  </p>
                  {answer.score !== undefined && answer.score > 0 && (
                    <p className="text-xs text-indigo-600 font-semibold mt-1">+{answer.score} pts</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
