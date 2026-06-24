import type { Answer } from '@/lib/scoring'

export interface ExtendedAnswer extends Answer {
  priceValue?: number
}

/**
 * Calculates the total sum of pricing attributes associated with the user's answers.
 * Checks option.priceValue first, and falls back to option.score.
 */
export function calculatePrice(answers: ExtendedAnswer[]): number {
  let total = 0
  for (const ans of answers) {
    // If the answer is an object value or multiple choice, grab the price from it
    if (ans.priceValue !== undefined && typeof ans.priceValue === 'number') {
      total += ans.priceValue
    } else if (ans.score !== undefined && typeof ans.score === 'number') {
      // Fallback to score if no priceValue is defined
      total += ans.score
    }
  }
  return total
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
