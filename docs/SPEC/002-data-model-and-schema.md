# Spec Driven — Modelo de Dados e Schema Prisma

> **Versão:** 1.0.0  
> **Data:** 2026-06-24  
> **Status:** Draft  

---

## 1. Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// AUTHENTICATION & MULTI-TENANCY
// ============================================

model User {
  id           String      @id @default(cuid())
  name         String
  email        String      @unique
  passwordHash String      @map("password_hash")
  workspaces   Workspace[]
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")

  @@map("users")
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  ownerId   String   @map("owner_id")
  funnels   Funnel[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([ownerId])
  @@map("workspaces")
}

// ============================================
// FUNNELS
// ============================================

model Funnel {
  id                  String       @id @default(cuid())
  workspace           Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId         String       @map("workspace_id")
  name                String
  slug                String       @unique
  status              FunnelStatus @default(DRAFT)
  theme               Json?        @db.JsonB
  whatsappNumber      String?      @map("whatsapp_number")
  whatsappMessage     String?      @map("whatsapp_message")
  isTemplate          Boolean      @default(false) @map("is_template")
  templateCategory    String?      @map("template_category")
  templateDescription String?      @map("template_description")
  steps               FunnelStep[]
  leads               Lead[]
  events              FunnelEvent[]
  createdAt           DateTime     @default(now()) @map("created_at")
  updatedAt           DateTime     @updatedAt @map("updated_at")

  @@index([workspaceId])
  @@index([slug])
  @@index([isTemplate])
  @@map("funnels")
}

enum FunnelStatus {
  DRAFT
  PUBLISHED
}

// ============================================
// FUNNEL STEPS
// ============================================

model FunnelStep {
  id          String   @id @default(cuid())
  funnel      Funnel   @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  funnelId    String   @map("funnel_id")
  order       Int
  type        StepType
  title       String?
  description String?
  config      Json?    @db.JsonB
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([funnelId])
  @@index([funnelId, order])
  @@map("funnel_steps")
}

enum StepType {
  WELCOME
  MULTIPLE_CHOICE
  OPEN_QUESTION
  CAPTURE_FORM
  LOADING
  RESULT
  REDIRECT
}

// ============================================
// LEADS
// ============================================

model Lead {
  id             String          @id @default(cuid())
  funnel         Funnel          @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  funnelId       String          @map("funnel_id")
  sessionId      String?         @map("session_id")
  name           String?
  email          String?
  phone          String?
  company        String?
  city           String?
  score          Int?
  classification Classification?
  answers        Json?           @db.JsonB
  utmSource      String?         @map("utm_source")
  utmMedium      String?         @map("utm_medium")
  utmCampaign    String?         @map("utm_campaign")
  utmContent     String?         @map("utm_content")
  utmTerm        String?         @map("utm_term")
  ip             String?
  userAgent      String?         @map("user_agent")
  events         FunnelEvent[]
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  @@index([funnelId])
  @@index([funnelId, classification])
  @@index([email])
  @@index([sessionId])
  @@map("leads")
}

enum Classification {
  COLD
  WARM
  HOT
  VERY_HOT
}

// ============================================
// EVENTS (Tracking)
// ============================================

model FunnelEvent {
  id        String    @id @default(cuid())
  funnel    Funnel    @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  funnelId  String    @map("funnel_id")
  lead      Lead?     @relation(fields: [leadId], references: [id], onDelete: SetNull)
  leadId    String?   @map("lead_id")
  sessionId String    @map("session_id")
  eventType EventType @map("event_type")
  stepId    String?   @map("step_id")
  metadata  Json?     @db.JsonB
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([funnelId])
  @@index([sessionId])
  @@index([funnelId, eventType])
  @@index([createdAt])
  @@map("funnel_events")
}

enum EventType {
  FUNNEL_STARTED
  STEP_VIEWED
  STEP_COMPLETED
  LEAD_CAPTURED
  FUNNEL_COMPLETED
  REDIRECT_CLICKED
}
```

---

## 2. Estruturas JSON dos Campos Flexíveis

### 2.1 Funnel.theme (JSON)

```typescript
interface FunnelTheme {
  primaryColor: string      // hex, ex: "#6366F1"
  backgroundColor: string   // hex, ex: "#FFFFFF"
  textColor: string         // hex, ex: "#1F2937"
  logoUrl?: string           // URL da logo
  fontFamily: 'Inter' | 'Roboto' | 'Outfit' | 'Poppins' | 'Montserrat'
  borderRadius: number       // px, ex: 12
  mode: 'light' | 'dark'
}
```

**Valor padrão:**
```json
{
  "primaryColor": "#6366F1",
  "backgroundColor": "#FFFFFF",
  "textColor": "#1F2937",
  "fontFamily": "Inter",
  "borderRadius": 12,
  "mode": "light"
}
```

### 2.2 FunnelStep.config (JSON)

Estrutura varia por `type` da etapa:

#### WELCOME
```typescript
interface WelcomeConfig {
  title: string
  subtitle?: string
  imageUrl?: string
  buttonText: string  // default: "Começar"
}
```

#### MULTIPLE_CHOICE
```typescript
interface MultipleChoiceConfig {
  title: string
  description?: string
  options: Array<{
    id: string         // UUID gerado no frontend
    text: string
    score: number      // default: 0
    variable?: string  // nome da variável para salvar
    goToStep?: number  // order da etapa destino (pulo condicional)
  }>
}
```

#### OPEN_QUESTION
```typescript
interface OpenQuestionConfig {
  title: string
  fieldType: 'text' | 'number' | 'phone' | 'email'
  placeholder?: string
  required: boolean  // default: true
  variableName?: string  // nome para salvar a resposta
}
```

#### CAPTURE_FORM
```typescript
interface CaptureFormConfig {
  title?: string
  description?: string
  fields: Array<{
    name: string          // ex: "name", "email", "phone", "company", "city", "custom_1"
    label: string         // ex: "Nome completo"
    type: 'text' | 'email' | 'phone' | 'number'
    placeholder?: string
    required: boolean
    enabled: boolean
  }>
  buttonText?: string  // default: "Continuar"
}
```

#### LOADING
```typescript
interface LoadingConfig {
  text: string     // default: "Analisando suas respostas..."
  duration: number // seconds, default: 3
}
```

#### RESULT
```typescript
interface ResultConfig {
  title: string
  description?: string
  showScore: boolean          // default: false
  showClassification: boolean // default: true
  conditionalResults?: Array<{
    id: string
    minScore: number
    maxScore: number
    title: string
    description: string
    ctaText?: string
    ctaType?: 'whatsapp' | 'url' | 'none'
    ctaUrl?: string
  }>
  defaultCta?: {
    text: string
    type: 'whatsapp' | 'url' | 'none'
    url?: string
  }
}
```

#### REDIRECT
```typescript
interface RedirectConfig {
  redirectType: 'whatsapp' | 'external_url' | 'internal_page'
  url?: string              // para external_url
  whatsappNumber?: string   // para whatsapp
  whatsappMessage?: string  // para whatsapp (com variáveis)
  delay?: number            // seconds before redirect, default: 0
  message?: string          // texto exibido antes do redirect
}
```

### 2.3 Lead.answers (JSON)

```typescript
interface LeadAnswers {
  [stepId: string]: {
    stepTitle: string
    stepType: StepType
    value: any              // texto, opção selecionada, etc.
    score?: number          // pontuação da resposta (se múltipla escolha)
    timestamp: string       // ISO 8601
  }
}
```

**Exemplo:**
```json
{
  "clxyz123": {
    "stepTitle": "Quanto investe em marketing?",
    "stepType": "MULTIPLE_CHOICE",
    "value": "R$ 5.000 a R$ 20.000/mês",
    "score": 25,
    "timestamp": "2026-06-24T10:30:00Z"
  },
  "clxyz456": {
    "stepTitle": "Qual seu nome?",
    "stepType": "OPEN_QUESTION",
    "value": "João Silva",
    "timestamp": "2026-06-24T10:30:15Z"
  }
}
```

### 2.4 FunnelEvent.metadata (JSON)

```typescript
interface EventMetadata {
  // Para FUNNEL_STARTED
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  userAgent?: string
  
  // Para STEP_VIEWED / STEP_COMPLETED
  stepOrder?: number
  stepType?: StepType
  
  // Para STEP_COMPLETED
  answer?: any
  score?: number
  
  // Para LEAD_CAPTURED
  leadFields?: string[]  // campos preenchidos
  
  // Para FUNNEL_COMPLETED
  totalScore?: number
  normalizedScore?: number
  classification?: Classification
  
  // Para REDIRECT_CLICKED
  redirectType?: string
  redirectUrl?: string
}
```

---

## 3. Índices e Performance

### 3.1 Índices Definidos no Schema

| Tabela | Índice | Propósito |
|---|---|---|
| `workspaces` | `ownerId` | Buscar workspaces do usuário |
| `funnels` | `workspaceId` | Listar funis por workspace |
| `funnels` | `slug` (unique) | Buscar funil público por slug |
| `funnels` | `isTemplate` | Listar templates |
| `funnel_steps` | `funnelId` | Listar etapas do funil |
| `funnel_steps` | `funnelId, order` | Buscar etapa por posição |
| `leads` | `funnelId` | Listar leads por funil |
| `leads` | `funnelId, classification` | Filtrar leads por classificação |
| `leads` | `email` | Buscar lead por email |
| `leads` | `sessionId` | Vincular sessão ao lead |
| `funnel_events` | `funnelId` | Listar eventos por funil |
| `funnel_events` | `sessionId` | Rastrear sessão |
| `funnel_events` | `funnelId, eventType` | Analytics por tipo |
| `funnel_events` | `createdAt` | Queries temporais |

### 3.2 Queries Frequentes e Otimização

| Query | Frequência | Índice | Complexidade Esperada |
|---|---|---|---|
| Listar funis do workspace | Alta | `workspaceId` | O(log n) |
| Buscar funil por slug | Alta | `slug` (unique) | O(1) |
| Listar leads por funil | Alta | `funnelId` | O(log n) |
| Contar visitantes únicos | Média | `sessionId` + `funnelId` | O(n) parcial |
| Calcular analytics | Média | `funnelId, eventType` | O(n) parcial |
| Buscar etapas ordenadas | Alta | `funnelId, order` | O(log n) |

---

## 4. Regras de Integridade

### 4.1 Cascading Deletes
```
User deletado → Workspaces deletados → Funis deletados → Steps, Leads, Events deletados
```

| Relação | On Delete |
|---|---|
| User → Workspace | Cascade |
| Workspace → Funnel | Cascade |
| Funnel → FunnelStep | Cascade |
| Funnel → Lead | Cascade |
| Funnel → FunnelEvent | Cascade |
| Lead → FunnelEvent | SetNull (leadId vira null) |

### 4.2 Constraints
| Constraint | Tabela | Campo |
|---|---|---|
| Unique | `users` | `email` |
| Unique | `funnels` | `slug` |
| Not Null | `funnel_steps` | `funnelId`, `order`, `type` |
| Not Null | `leads` | `funnelId` |
| Not Null | `funnel_events` | `funnelId`, `sessionId`, `eventType` |

### 4.3 Regras de Negócio no Banco

1. **Slug único:** Validado pelo constraint unique no banco + validação na aplicação antes de inserir
2. **Order sequencial:** Mantido pela aplicação ao criar/reordenar etapas
3. **Score 0-100:** Validado pela aplicação (Zod) antes de salvar
4. **Classification válida:** Enum no Prisma garante valores válidos
5. **Status válido:** Enum no Prisma garante DRAFT ou PUBLISHED

---

## 5. Seed de Templates

### Estrutura do Seed

```typescript
// prisma/seed.ts

const templates = [
  {
    name: 'Diagnóstico de Marketing Digital',
    slug: 'template-diagnostico-marketing',
    templateCategory: 'Agência de Marketing',
    templateDescription: 'Funil de diagnóstico para agências qualificarem leads de marketing digital.',
    theme: defaultTheme,
    steps: [
      {
        order: 0,
        type: 'WELCOME',
        title: 'Diagnóstico de Marketing Digital',
        config: {
          title: 'Descubra o nível do seu marketing digital',
          subtitle: 'Responda algumas perguntas rápidas e receba um diagnóstico personalizado.',
          buttonText: 'Começar Diagnóstico',
        },
      },
      {
        order: 1,
        type: 'MULTIPLE_CHOICE',
        title: 'Investimento atual',
        config: {
          title: 'Quanto sua empresa investe em marketing digital por mês?',
          options: [
            { id: '1', text: 'Menos de R$ 1.000', score: 5 },
            { id: '2', text: 'R$ 1.000 a R$ 5.000', score: 15 },
            { id: '3', text: 'R$ 5.000 a R$ 20.000', score: 25 },
            { id: '4', text: 'Mais de R$ 20.000', score: 30 },
          ],
        },
      },
      // ... mais etapas
    ],
  },
  // ... mais templates
]
```

### Templates Disponíveis

| # | Template | Categoria | Etapas |
|---|---|---|---|
| 1 | Diagnóstico de Marketing Digital | Agência | 8 |
| 2 | Simulador de Economia Solar | Energia Solar | 7 |
| 3 | Qualificação de Projeto HVAC | Climatização | 6 |
| 4 | Encontre seu Imóvel Ideal | Corretor de Imóveis | 7 |
| 5 | Diagnóstico Empresarial | Consultoria | 8 |
| 6 | Quiz de Lançamento | Infoproduto | 6 |

---

## 6. Migrations

### Ordem de Migrations

```
001_init
  ├── Create users table
  ├── Create workspaces table
  ├── Create funnels table
  ├── Create funnel_steps table
  ├── Create leads table
  ├── Create funnel_events table
  ├── Create enums (FunnelStatus, StepType, Classification, EventType)
  └── Create indexes
```

### Comando para Criar Migration
```bash
# Desenvolvimento
npx prisma migrate dev --name init

# Produção
npx prisma migrate deploy
```

### Comando para Rodar Seed
```bash
npx prisma db seed
```

**package.json:**
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```
