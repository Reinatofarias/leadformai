# ADR-007: Validação de Dados — Zod

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

A aplicação precisa validar dados em múltiplas camadas:
- Formulários do lado do cliente (UX)
- Server Actions e API Routes (segurança)
- Inputs de visitantes nos funis públicos
- Dados de configuração de etapas (JSON complexo)

## Decisão

**Zod** como biblioteca de validação e tipagem:

1. **TypeScript-first:** Inferência de tipos a partir do schema
2. **Runtime validation:** Validação em tempo de execução no servidor
3. **Composable:** Schemas compostos e reutilizáveis
4. **Next.js integration:** Server Actions, React Hook Form
5. **Error messages:** Mensagens customizáveis em português

## Schemas Principais

```typescript
// schemas/auth.ts
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos 1 letra maiúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos 1 número'),
  workspaceName: z.string().min(2, 'Nome do workspace deve ter pelo menos 2 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

// schemas/funnel.ts
export const createFunnelSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  slug: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  whatsappNumber: z.string().optional(),
  whatsappMessage: z.string().optional(),
  theme: funnelThemeSchema.optional(),
})

export const funnelThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1F2937'),
  logoUrl: z.string().url().optional(),
  fontFamily: z.enum(['Inter', 'Roboto', 'Outfit', 'Poppins', 'Montserrat']).default('Inter'),
  borderRadius: z.number().min(0).max(24).default(12),
  mode: z.enum(['light', 'dark']).default('light'),
})

// schemas/step.ts
export const stepConfigSchema = z.discriminatedUnion('type', [
  // WELCOME
  z.object({
    type: z.literal('WELCOME'),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    imageUrl: z.string().url().optional(),
    buttonText: z.string().default('Começar'),
  }),
  // MULTIPLE_CHOICE
  z.object({
    type: z.literal('MULTIPLE_CHOICE'),
    title: z.string().min(1),
    description: z.string().optional(),
    options: z.array(z.object({
      text: z.string().min(1),
      score: z.number().default(0),
      variable: z.string().optional(),
      goToStep: z.number().optional(),
    })).min(2, 'Mínimo de 2 opções'),
  }),
  // OPEN_QUESTION
  z.object({
    type: z.literal('OPEN_QUESTION'),
    title: z.string().min(1),
    fieldType: z.enum(['text', 'number', 'phone', 'email']),
    placeholder: z.string().optional(),
    required: z.boolean().default(true),
  }),
  // CAPTURE_FORM
  z.object({
    type: z.literal('CAPTURE_FORM'),
    fields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'email', 'phone', 'number']),
      required: z.boolean().default(false),
      enabled: z.boolean().default(true),
    })),
  }),
  // LOADING
  z.object({
    type: z.literal('LOADING'),
    text: z.string().default('Analisando suas respostas...'),
    duration: z.number().min(1).max(10).default(3),
  }),
  // RESULT
  z.object({
    type: z.literal('RESULT'),
    title: z.string().min(1),
    description: z.string().optional(),
    showScore: z.boolean().default(false),
    showClassification: z.boolean().default(true),
    conditionalResults: z.array(z.object({
      minScore: z.number(),
      maxScore: z.number(),
      title: z.string(),
      description: z.string(),
      ctaText: z.string().optional(),
      ctaUrl: z.string().optional(),
    })).optional(),
  }),
  // REDIRECT
  z.object({
    type: z.literal('REDIRECT'),
    redirectType: z.enum(['whatsapp', 'external_url', 'internal_page']),
    url: z.string().optional(),
    whatsappNumber: z.string().optional(),
    whatsappMessage: z.string().optional(),
  }),
])

// schemas/lead.ts
export const captureLeadSchema = z.object({
  funnelId: z.string().cuid(),
  sessionId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  answers: z.record(z.any()).optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
})
```

## Integração com React Hook Form

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm<z.infer<typeof createFunnelSchema>>({
  resolver: zodResolver(createFunnelSchema),
})
```

## Consequências

### Positivas
- Single source of truth para tipos e validação
- Mensagens de erro em português customizáveis
- Schemas compostos para configurações complexas
- Integração perfeita com React Hook Form

### Negativas
- Dependência adicional no projeto
- Schemas discriminados podem ser verbosos
- Performance em schemas muito complexos (mitigável)

## Referências
- [Zod Documentation](https://zod.dev)
- [Zod + React Hook Form](https://react-hook-form.com/get-started#SchemaValidation)
