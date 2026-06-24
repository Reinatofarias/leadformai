import { z } from 'zod'

const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Texto da opção é obrigatório'),
  score: z.number().default(0),
  variable: z.string().optional(),
  goToStep: z.number().optional(),
})

export const welcomeConfigSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  buttonText: z.string().default('Começar'),
})

export const multipleChoiceConfigSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().default(''),
  options: z.array(optionSchema).min(2, 'Mínimo de 2 opções'),
})

export const openQuestionConfigSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  fieldType: z.enum(['text', 'number', 'phone', 'email']),
  placeholder: z.string().optional().default(''),
  required: z.boolean().default(true),
  variableName: z.string().optional().default(''),
})

export const captureFormConfigSchema = z.object({
  title: z.string().optional().default('Preencha seus dados'),
  description: z.string().optional().default(''),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'email', 'phone', 'number']),
    placeholder: z.string().optional().default(''),
    required: z.boolean().default(false),
    enabled: z.boolean().default(true),
  })),
  buttonText: z.string().default('Continuar'),
})

export const loadingConfigSchema = z.object({
  text: z.string().default('Analisando suas respostas...'),
  duration: z.number().min(1).max(10).default(3),
})

export const resultConfigSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional().default(''),
  showScore: z.boolean().default(false),
  showClassification: z.boolean().default(true),
  conditionalResults: z.array(z.object({
    id: z.string(),
    minScore: z.number(),
    maxScore: z.number(),
    title: z.string(),
    description: z.string(),
    ctaText: z.string().optional().default(''),
    ctaType: z.enum(['whatsapp', 'url', 'none']).default('none'),
    ctaUrl: z.string().optional().default(''),
  })).optional().default([]),
  defaultCta: z.object({
    text: z.string().default(''),
    type: z.enum(['whatsapp', 'url', 'none']).default('none'),
    url: z.string().default(''),
  }).optional(),
})

export const redirectConfigSchema = z.object({
  redirectType: z.enum(['whatsapp', 'external_url', 'internal_page']),
  url: z.string().optional().default(''),
  whatsappNumber: z.string().optional().default(''),
  whatsappMessage: z.string().optional().default(''),
  delay: z.number().min(0).max(10).default(0),
  message: z.string().optional().default(''),
})

export const createStepSchema = z.object({
  type: z.enum(['WELCOME', 'MULTIPLE_CHOICE', 'OPEN_QUESTION', 'CAPTURE_FORM', 'LOADING', 'RESULT', 'REDIRECT']),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  config: z.any(),
})

export type WelcomeConfig = z.infer<typeof welcomeConfigSchema>
export type MultipleChoiceConfig = z.infer<typeof multipleChoiceConfigSchema>
export type OpenQuestionConfig = z.infer<typeof openQuestionConfigSchema>
export type CaptureFormConfig = z.infer<typeof captureFormConfigSchema>
export type LoadingConfig = z.infer<typeof loadingConfigSchema>
export type ResultConfig = z.infer<typeof resultConfigSchema>
export type RedirectConfig = z.infer<typeof redirectConfigSchema>
export type CreateStepInput = z.infer<typeof createStepSchema>
