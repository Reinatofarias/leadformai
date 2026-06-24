import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

const variantStyles = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-md shadow-indigo-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-200 transition-all duration-200 active:scale-[0.98]',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-100 transition-all duration-200 active:scale-[0.98]',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md shadow-red-100 hover:shadow-lg transition-all duration-200 active:scale-[0.98]',
  outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-indigo-500 shadow-sm transition-all duration-200 active:scale-[0.98]',
  premium: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300/30 transition-all duration-200 active:scale-[0.98]',
}

const sizeStyles = {
  sm: 'px-3.5 py-2 text-xs font-semibold tracking-wide uppercase',
  md: 'px-5 py-2.5 text-sm font-semibold',
  lg: 'px-7 py-3 text-base font-semibold',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
