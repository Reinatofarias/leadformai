import { Classification } from '@prisma/client'

export interface Answer {
  stepId: string
  stepType: string
  value: unknown
  score?: number
}

export interface ScoringResult {
  totalScore: number
  normalizedScore: number
  classification: Classification
  answers: Answer[]
}

/**
 * Calculates the total raw score from answers.
 * Only MULTIPLE_CHOICE answers with a score are counted.
 */
export function calculateScore(answers: Answer[]): number {
  return answers
    .filter((a) => a.stepType === 'MULTIPLE_CHOICE' && typeof a.score === 'number')
    .reduce((total, answer) => total + (answer.score || 0), 0)
}

/**
 * Normalizes a raw score to a 0-100 scale.
 */
export function normalizeScore(rawScore: number, maxPossibleScore: number): number {
  if (maxPossibleScore <= 0) return 0
  const normalized = (rawScore / maxPossibleScore) * 100
  return Math.min(Math.round(normalized), 100)
}

/**
 * Classifies a lead based on normalized score.
 */
export function classifyLead(normalizedScore: number): Classification {
  if (normalizedScore >= 86) return 'VERY_HOT'
  if (normalizedScore >= 61) return 'HOT'
  if (normalizedScore >= 31) return 'WARM'
  return 'COLD'
}

/**
 * Calculates the maximum possible score for a funnel.
 * For each MULTIPLE_CHOICE step, takes the highest option score.
 */
export function calculateMaxPossibleScore(steps: { type: string; config: unknown }[]): number {
  return steps
    .filter((step) => step.type === 'MULTIPLE_CHOICE')
    .reduce((total, step) => {
      const config = step.config as { options?: { score?: number }[] }
      if (!config?.options?.length) return total
      const maxOptionScore = Math.max(...config.options.map((o) => o.score || 0))
      return total + maxOptionScore
    }, 0)
}

/**
 * Full scoring pipeline: calculate, normalize, and classify.
 */
export function scoreLead(
  answers: Answer[],
  maxPossibleScore: number
): ScoringResult {
  const totalScore = calculateScore(answers)
  const normalizedScore = normalizeScore(totalScore, maxPossibleScore)
  const classification = classifyLead(normalizedScore)

  return { totalScore, normalizedScore, classification, answers }
}

/**
 * Returns display info for a classification.
 */
export function getClassificationDisplay(classification: Classification) {
  const map: Record<Classification, { label: string; color: string; bgColor: string; emoji: string }> = {
    COLD: { label: 'Frio', color: '#93C5FD', bgColor: '#DBEAFE', emoji: '🧊' },
    WARM: { label: 'Morno', color: '#FBBF24', bgColor: '#FEF3C7', emoji: '🌤️' },
    HOT: { label: 'Quente', color: '#FB923C', bgColor: '#FFEDD5', emoji: '🔥' },
    VERY_HOT: { label: 'Muito Quente', color: '#EF4444', bgColor: '#FEE2E2', emoji: '🌋' },
  }
  return map[classification]
}
