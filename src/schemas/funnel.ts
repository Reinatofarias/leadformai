import { z } from 'zod'

export const createFunnelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  slug: z.string()
    .min(1, 'Slug é obrigatório')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  whatsappNumber: z.string().optional().default(''),
  whatsappMessage: z.string().optional().default(''),
})

export const updateFunnelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100).optional(),
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .optional(),
  whatsappNumber: z.string().optional(),
  whatsappMessage: z.string().optional(),
  theme: z.any().optional(),
  webhookUrl: z.string().url('URL de Webhook inválida').optional().or(z.literal('')),
  facebookPixelId: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  customDomain: z.string().optional().or(z.literal('')),
})

export const funnelThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1F2937'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  fontFamily: z.enum(['Inter', 'Roboto', 'Outfit', 'Poppins', 'Montserrat']).default('Inter'),
  borderRadius: z.number().min(0).max(24).default(12),
  mode: z.enum(['light', 'dark']).default('light'),
})

export type CreateFunnelInput = z.infer<typeof createFunnelSchema>
export type UpdateFunnelInput = z.infer<typeof updateFunnelSchema>
export type FunnelTheme = z.infer<typeof funnelThemeSchema>
