import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export function Input({
  label,
  error,
  hint,
  icon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 border-slate-200/80 shadow-sm shadow-slate-100/50',
            'focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
              : 'hover:border-slate-300',
            icon && 'pl-10.5',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 font-medium">{hint}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 border-slate-200/80 shadow-sm shadow-slate-100/50 resize-y min-h-[90px]',
          'focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500',
          error
            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
            : 'hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 font-medium">{hint}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-800 transition-all duration-200 border-slate-200/80 shadow-sm shadow-slate-100/50 cursor-pointer appearance-none',
          'focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500',
          error
            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
            : 'hover:border-slate-300',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  )
}

