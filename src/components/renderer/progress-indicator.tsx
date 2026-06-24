import React from 'react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  // Avoid division by zero and don't show progress if there's only 1 step
  if (totalSteps <= 1) return null

  // Calculate percentage (0 to 100)
  const percentage = Math.min(100, Math.max(0, (currentStep / (totalSteps - 1)) * 100))

  return (
    <div className="w-full bg-slate-100 h-2 overflow-hidden shadow-2xs">
      <div 
        className="h-full bg-[var(--color-primary)] progress-bar-fill progress-bar-glow rounded-r-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
