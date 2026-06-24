import React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TEMPLATES } from '@/lib/templates'
import { createFunnelFromTemplate } from '@/actions/funnels'
import { Zap, ListChecks, ArrowRight, LayoutTemplate } from 'lucide-react'

export default async function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Escolha um modelo pronto para acelerar sua criação"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
        {TEMPLATES.map((template) => {
          // Dynamic handler to create the funnel
          const handleCreate = async () => {
            'use server'
            await createFunnelFromTemplate(template.id)
          }

          return (
            <Card 
              key={template.id} 
              hover 
              className="border-slate-200/50 flex flex-col justify-between min-h-[340px] group transition-all duration-300 relative overflow-hidden"
            >
              {/* Category Tag */}
              <div className="absolute top-4 right-4">
                <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/40">
                  {template.category}
                </span>
              </div>

              <div className="space-y-4">
                {/* Icon & Title */}
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <LayoutTemplate className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-indigo-600 transition-colors pr-16 truncate-2-lines">
                    {template.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed min-h-[60px] line-clamp-3">
                  {template.description}
                </p>

                {/* Steps Details */}
                <div className="border-t border-slate-100/80 pt-4 mt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Estrutura do Funil</p>
                  <div className="flex flex-wrap gap-1.5">
                    {template.steps.map((step, idx) => (
                      <span 
                        key={idx} 
                        className="text-3xs font-medium bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {step.type === 'WELCOME' ? 'Boas-vindas' :
                         step.type === 'MULTIPLE_CHOICE' ? 'Quiz' :
                         step.type === 'OPEN_QUESTION' ? 'Aberta' :
                         step.type === 'CAPTURE_FORM' ? 'Captura' :
                         step.type === 'LOADING' ? 'Carregando' :
                         step.type === 'RESULT' ? 'Resultado' : 'Redirecionar'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Theme Swatch */}
                <div className="flex items-center justify-between border-t border-slate-100/80 pt-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aparência</span>
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-4 w-4 rounded-full border border-slate-200 shadow-2xs" 
                      style={{ backgroundColor: template.theme.primaryColor }}
                      title={`Cor primária: ${template.theme.primaryColor}`}
                    ></span>
                    <span 
                      className="h-4 w-4 rounded-full border border-slate-200 shadow-2xs" 
                      style={{ backgroundColor: template.theme.backgroundColor }}
                      title={`Cor de fundo: ${template.theme.backgroundColor}`}
                    ></span>
                    <span className="text-2xs font-semibold text-slate-500 capitalize">{template.theme.mode}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100/50">
                <form action={handleCreate}>
                  <Button type="submit" variant="premium" className="w-full font-bold group-hover:shadow-md transition-all duration-300">
                    Usar este Template
                    <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
