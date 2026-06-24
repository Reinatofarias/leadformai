'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Plus, Trash2, GripVertical, User } from 'lucide-react'
import type { FunnelStep } from '@prisma/client'

interface Props {
  step: FunnelStep
  onSave: (title: string, description: string, config: unknown) => void
  isPending: boolean
}

interface Testimonial {
  id: string
  name: string
  role?: string
  text: string
  rating: number
  avatarUrl?: string
}

export function TestimonialsForm({ step, onSave, isPending }: Props) {
  const config = (step.config as any) || {}

  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    config.testimonials || [
      {
        id: crypto.randomUUID(),
        name: 'Carlos Oliveira',
        role: 'Diretor de Operações',
        text: 'Excelente atendimento e diagnóstico preciso! Recomendamos a todos.',
        rating: 5,
        avatarUrl: '',
      },
      {
        id: crypto.randomUUID(),
        name: 'Mariana Costa',
        role: 'Empreendedora',
        text: 'Superou minhas expectativas, muito rápido e intuitivo.',
        rating: 5,
        avatarUrl: '',
      },
    ]
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const buttonText = formData.get('buttonText') as string
    const score = parseInt(formData.get('score') as string) || 0

    const newConfig = {
      title,
      description,
      buttonText,
      score,
      testimonials,
    }

    onSave(title, description, newConfig)
  }

  const addTestimonial = () => {
    setTestimonials([
      ...testimonials,
      {
        id: crypto.randomUUID(),
        name: 'Novo Cliente',
        role: 'Cliente',
        text: 'Depoimento incrível de satisfação sobre o serviço prestado.',
        rating: 5,
        avatarUrl: '',
      },
    ])
  }

  const removeTestimonial = (id: string) => {
    if (testimonials.length <= 1) return
    setTestimonials(testimonials.filter((t) => t.id !== id))
  }

  const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
    setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Título da Seção de Depoimentos"
        name="title"
        defaultValue={step.title || config.title || ''}
        placeholder="O que nossos clientes dizem"
        required
      />

      <Input
        label="Descrição / Subtítulo"
        name="description"
        defaultValue={step.description || config.description || ''}
        placeholder="Veja as avaliações de quem já passou pelo processo."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Texto do Botão de Avanço"
          name="buttonText"
          defaultValue={config.buttonText || 'Continuar'}
          required
        />
        <Input
          type="number"
          label="Pontuação ao visualizar depoimentos"
          name="score"
          defaultValue={config.score || 0}
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider">Lista de Depoimentos</label>
          <Button type="button" variant="ghost" size="sm" onClick={addTestimonial}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Depoimento
          </Button>
        </div>

        <div className="space-y-4">
          {testimonials.map((t, index) => (
            <div key={t.id} className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="text-gray-300 cursor-move">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <Input
                    value={t.name}
                    onChange={(e) => updateTestimonial(t.id, 'name', e.target.value)}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTestimonial(t.id)}
                  disabled={testimonials.length <= 1}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={t.role || ''}
                  onChange={(e) => updateTestimonial(t.id, 'role', e.target.value)}
                  placeholder="Cargo / Ocupação"
                  label="Cargo"
                />
                <Select
                  label="Classificação (Estrelas)"
                  value={t.rating.toString()}
                  onChange={(e) => updateTestimonial(t.id, 'rating', parseInt(e.target.value))}
                  options={[
                    { value: '5', label: '⭐⭐⭐⭐⭐ (5 estrelas)' },
                    { value: '4', label: '⭐⭐⭐⭐ (4 estrelas)' },
                    { value: '3', label: '⭐⭐⭐ (3 estrelas)' },
                    { value: '2', label: '⭐⭐ (2 estrelas)' },
                    { value: '1', label: '⭐ (1 estrela)' },
                  ]}
                />
              </div>

              <Input
                value={t.avatarUrl || ''}
                onChange={(e) => updateTestimonial(t.id, 'avatarUrl', e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                label="URL do Avatar / Foto (opcional)"
                icon={<User className="h-4 w-4 text-slate-400" />}
              />

              <div>
                <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Texto do depoimento</label>
                <textarea
                  value={t.text}
                  onChange={(e) => updateTestimonial(t.id, 'text', e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-slate-200/80 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  placeholder="Escreva o depoimento aqui..."
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100 mt-4">
        <Button type="submit" loading={isPending}>Salvar Etapa</Button>
      </div>
    </form>
  )
}
