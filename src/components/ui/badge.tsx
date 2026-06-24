import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'cold' | 'warm' | 'hot' | 'very-hot'
  children: React.ReactNode
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  cold: 'bg-blue-50 text-blue-700 border-blue-200',
  warm: 'bg-amber-50 text-amber-700 border-amber-200',
  hot: 'bg-orange-50 text-orange-700 border-orange-200',
  'very-hot': 'bg-red-50 text-red-700 border-red-200',
}

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function ClassificationBadge({ classification }: { classification: string | null }) {
  if (!classification) return <Badge variant="default">Sem classificação</Badge>

  const config: Record<string, { label: string; variant: BadgeProps['variant']; emoji: string }> = {
    COLD: { label: 'Frio', variant: 'cold', emoji: '🧊' },
    WARM: { label: 'Morno', variant: 'warm', emoji: '🌤️' },
    HOT: { label: 'Quente', variant: 'hot', emoji: '🔥' },
    VERY_HOT: { label: 'Muito Quente', variant: 'very-hot', emoji: '🌋' },
  }

  const c = config[classification] || { label: classification, variant: 'default' as const, emoji: '' }

  return (
    <Badge variant={c.variant}>
      {c.emoji} {c.label}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status === 'PUBLISHED' ? 'success' : 'default'}>
      {status === 'PUBLISHED' ? '● Publicado' : '○ Rascunho'}
    </Badge>
  )
}
