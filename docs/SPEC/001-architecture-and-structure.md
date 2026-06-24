# Spec Driven — Arquitetura e Estrutura do Projeto

> **Versão:** 1.0.0  
> **Data:** 2026-06-24  
> **Status:** Draft  

---

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL (Edge)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js App Router (v14+)                │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────┐  │  │
│  │  │   Middleware │ │  App Routes  │ │ API Routes    │  │  │
│  │  │   (Auth)     │ │  (Pages)     │ │ (REST)        │  │  │
│  │  └──────┬──────┘ └──────┬───────┘ └──────┬────────┘  │  │
│  │         │               │                │            │  │
│  │  ┌──────▼───────────────▼────────────────▼────────┐   │  │
│  │  │            Server Actions / API Layer          │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │  │
│  │  │  │ Zod      │ │ Auth     │ │ Workspace     │   │   │  │
│  │  │  │ Schemas  │ │ Utils    │ │ Guard         │   │   │  │
│  │  │  └──────────┘ └──────────┘ └───────────────┘   │   │  │
│  │  └────────────────────┬───────────────────────────┘   │  │
│  │                       │                               │  │
│  │  ┌────────────────────▼───────────────────────────┐   │  │
│  │  │             Business Logic Layer               │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │  │
│  │  │  │ Scoring  │ │ Classify │ │ WhatsApp      │   │   │  │
│  │  │  │ Engine   │ │ Engine   │ │ Builder       │   │   │  │
│  │  │  └──────────┘ └──────────┘ └───────────────┘   │   │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐   │   │  │
│  │  │  │ Funnel   │ │ Event    │ │ Analytics     │   │   │  │
│  │  │  │ Renderer │ │ Tracker  │ │ Calculator    │   │   │  │
│  │  │  └──────────┘ └──────────┘ └───────────────┘   │   │  │
│  │  └────────────────────┬───────────────────────────┘   │  │
│  │                       │                               │  │
│  │  ┌────────────────────▼───────────────────────────┐   │  │
│  │  │             Prisma ORM (Data Access)            │   │  │
│  │  └────────────────────┬───────────────────────────┘   │  │
│  └───────────────────────┼───────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Supabase PostgreSQL   │
              │  ┌──────────────────┐   │
              │  │  pgBouncer Pool  │   │
              │  └────────┬─────────┘   │
              │  ┌────────▼─────────┐   │
              │  │   PostgreSQL 15  │   │
              │  │  ┌────────────┐  │   │
              │  │  │ User       │  │   │
              │  │  │ Workspace  │  │   │
              │  │  │ Funnel     │  │   │
              │  │  │ FunnelStep │  │   │
              │  │  │ Lead       │  │   │
              │  │  │ FunnelEvent│  │   │
              │  │  └────────────┘  │   │
              │  └──────────────────┘   │
              └─────────────────────────┘
```

---

## 2. Estrutura de Pastas

```
leadflow-ai/
├── .env.example                    # Variáveis de ambiente de exemplo
├── .env.local                      # Variáveis locais (gitignored)
├── .gitignore
├── next.config.js                  # Configuração do Next.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts              # Configuração do Tailwind
├── postcss.config.js
├── middleware.ts                   # Auth middleware (protege /dashboard/*)
├── prisma/
│   ├── schema.prisma              # Schema do banco de dados
│   ├── seed.ts                    # Seed com templates iniciais
│   └── migrations/                # Migrations automáticas
│
├── docs/                          # Documentação do projeto
│   ├── PRD/                       # Product Requirements Documents
│   ├── ADR/                       # Architecture Decision Records
│   └── SPEC/                      # Spec Driven Documents
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png               # Open Graph image
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (fonts, metadata)
│   │   ├── page.tsx               # Landing page pública (/)
│   │   ├── globals.css            # Estilos globais + CSS variables
│   │   │
│   │   ├── (auth)/                # Route group: autenticação
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # /login
│   │   │   └── register/
│   │   │       └── page.tsx       # /register
│   │   │
│   │   ├── (dashboard)/           # Route group: área autenticada
│   │   │   ├── layout.tsx         # Layout com sidebar e header
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       # /dashboard (resumo)
│   │   │   │   ├── funnels/
│   │   │   │   │   ├── page.tsx           # /dashboard/funnels (lista)
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx       # /dashboard/funnels/new
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── edit/
│   │   │   │   │       │   └── page.tsx   # /dashboard/funnels/[id]/edit
│   │   │   │   │       ├── leads/
│   │   │   │   │       │   └── page.tsx   # /dashboard/funnels/[id]/leads
│   │   │   │   │       └── analytics/
│   │   │   │   │           └── page.tsx   # /dashboard/funnels/[id]/analytics
│   │   │   │   ├── leads/
│   │   │   │   │   └── page.tsx           # /dashboard/leads (todos)
│   │   │   │   └── templates/
│   │   │   │       └── page.tsx           # /dashboard/templates
│   │   │
│   │   ├── f/                     # Funis públicos
│   │   │   └── [slug]/
│   │   │       └── page.tsx       # /f/[slug] (renderer público)
│   │   │
│   │   └── api/                   # API Routes (quando necessário)
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   └── logout/route.ts
│   │       ├── funnels/
│   │       │   ├── route.ts               # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts           # GET, PUT, DELETE
│   │       │       ├── duplicate/route.ts # POST (duplicate)
│   │       │       ├── publish/route.ts   # POST (publish/unpublish)
│   │       │       └── steps/
│   │       │           ├── route.ts       # GET, POST
│   │       │           └── [stepId]/
│   │       │               └── route.ts   # PUT, DELETE
│   │       ├── leads/
│   │       │   ├── route.ts               # GET (list with filters)
│   │       │   └── [id]/route.ts          # GET (detail)
│   │       ├── analytics/
│   │       │   └── [funnelId]/route.ts    # GET (funnel analytics)
│   │       └── public/                    # APIs públicas (sem auth)
│   │           ├── funnels/
│   │           │   └── [slug]/route.ts    # GET (funnel by slug)
│   │           ├── events/route.ts        # POST (track event)
│   │           └── leads/route.ts         # POST (capture lead)
│   │
│   ├── components/                # Componentes React
│   │   ├── ui/                    # Componentes UI base (design system)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── color-picker.tsx
│   │   │   └── empty-state.tsx
│   │   │
│   │   ├── layout/                # Componentes de layout
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── page-header.tsx
│   │   │
│   │   ├── auth/                  # Componentes de autenticação
│   │   │   ├── login-form.tsx
│   │   │   └── register-form.tsx
│   │   │
│   │   ├── dashboard/             # Componentes do dashboard
│   │   │   ├── stats-cards.tsx
│   │   │   ├── recent-funnels.tsx
│   │   │   └── leads-chart.tsx
│   │   │
│   │   ├── funnels/               # Componentes de gestão de funis
│   │   │   ├── funnel-card.tsx
│   │   │   ├── funnel-list.tsx
│   │   │   ├── funnel-form.tsx
│   │   │   ├── funnel-settings.tsx
│   │   │   └── theme-editor.tsx
│   │   │
│   │   ├── editor/                # Componentes do editor de etapas
│   │   │   ├── step-list.tsx
│   │   │   ├── step-card.tsx
│   │   │   ├── step-editor.tsx
│   │   │   ├── step-types/
│   │   │   │   ├── welcome-step.tsx
│   │   │   │   ├── multiple-choice-step.tsx
│   │   │   │   ├── open-question-step.tsx
│   │   │   │   ├── capture-form-step.tsx
│   │   │   │   ├── loading-step.tsx
│   │   │   │   ├── result-step.tsx
│   │   │   │   └── redirect-step.tsx
│   │   │   └── add-step-dialog.tsx
│   │   │
│   │   ├── renderer/              # Componentes do funil público
│   │   │   ├── funnel-renderer.tsx
│   │   │   ├── step-renderer.tsx
│   │   │   ├── step-renderers/
│   │   │   │   ├── welcome-renderer.tsx
│   │   │   │   ├── multiple-choice-renderer.tsx
│   │   │   │   ├── open-question-renderer.tsx
│   │   │   │   ├── capture-form-renderer.tsx
│   │   │   │   ├── loading-renderer.tsx
│   │   │   │   ├── result-renderer.tsx
│   │   │   │   └── redirect-renderer.tsx
│   │   │   ├── progress-indicator.tsx
│   │   │   └── funnel-theme-provider.tsx
│   │   │
│   │   ├── leads/                 # Componentes de leads
│   │   │   ├── leads-table.tsx
│   │   │   ├── lead-detail.tsx
│   │   │   ├── lead-filters.tsx
│   │   │   └── lead-classification-badge.tsx
│   │   │
│   │   ├── analytics/             # Componentes de analytics
│   │   │   ├── conversion-chart.tsx
│   │   │   ├── funnel-flow-chart.tsx
│   │   │   ├── classification-pie.tsx
│   │   │   ├── leads-by-day-chart.tsx
│   │   │   └── utm-table.tsx
│   │   │
│   │   └── templates/             # Componentes de templates
│   │       ├── template-grid.tsx
│   │       └── template-card.tsx
│   │
│   ├── lib/                       # Utilitários e lógica de negócio
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth.ts                # JWT sign/verify, bcrypt
│   │   ├── workspace.ts           # Workspace guard helpers
│   │   ├── scoring.ts             # Cálculo de score e classificação
│   │   ├── whatsapp.ts            # Geração de link WhatsApp
│   │   ├── analytics.ts           # Cálculos de métricas
│   │   ├── tracking.ts            # Registro de eventos
│   │   ├── slug.ts                # Geração e validação de slugs
│   │   ├── utm.ts                 # Extração de UTMs
│   │   ├── utils.ts               # Utilities gerais (cn, formatDate, etc)
│   │   └── constants.ts           # Constantes (classificações, tipos, etc)
│   │
│   ├── schemas/                   # Zod schemas
│   │   ├── auth.ts                # Login, register schemas
│   │   ├── funnel.ts              # Funnel CRUD schemas
│   │   ├── step.ts                # Step config schemas
│   │   ├── lead.ts                # Lead capture schemas
│   │   └── common.ts              # Shared schemas
│   │
│   ├── actions/                   # Server Actions
│   │   ├── auth.ts                # Login, register, logout
│   │   ├── funnels.ts             # CRUD de funis
│   │   ├── steps.ts               # CRUD de etapas
│   │   ├── leads.ts               # Captura e listagem de leads
│   │   └── templates.ts           # Usar template
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-funnel-session.ts  # Sessão do funil público
│   │   ├── use-utm.ts             # Captura de UTMs
│   │   ├── use-debounce.ts        # Debounce genérico
│   │   └── use-toast.ts           # Toast notifications
│   │
│   └── types/                     # TypeScript types
│       ├── funnel.ts              # Tipos de funil e etapas
│       ├── lead.ts                # Tipos de lead
│       ├── analytics.ts           # Tipos de analytics
│       └── api.ts                 # Tipos de API (request/response)
│
└── README.md                      # Instruções de setup
```

---

## 3. Fluxo de Dados

### 3.1 Fluxo de Criação de Funil

```
Usuário no Dashboard
    │
    ▼
[/dashboard/funnels/new]
    │ Preenche nome
    ▼
Server Action: createFunnel()
    │ Valida com Zod (createFunnelSchema)
    │ Verifica workspaceId do JWT
    │ Gera slug do nome
    │ Verifica unicidade do slug
    ▼
Prisma: funnel.create({ workspaceId, name, slug, status: DRAFT })
    │
    ▼
Redirect → /dashboard/funnels/[id]/edit
    │
    ▼
[Editor de Etapas]
    │ Adiciona etapas sequencialmente
    ▼
Server Action: createStep() / updateStep() / deleteStep()
    │ Valida config com stepConfigSchema
    │ Garante workspaceId
    ▼
Prisma: funnelStep.create/update/delete
    │
    ▼
Usuário clica "Publicar"
    │
    ▼
Server Action: publishFunnel()
    │ Verifica se tem ≥ 1 etapa
    │ Muda status para PUBLISHED
    ▼
Funil disponível em /f/[slug]
```

### 3.2 Fluxo de Visita ao Funil Público

```
Visitante acessa /f/[slug]?utm_source=google&utm_medium=cpc
    │
    ▼
[Server Component] Carrega funil por slug
    │ Verifica status === PUBLISHED
    │ Retorna 404 se não publicado
    ▼
[Client Component] FunnelRenderer
    │ Gera sessionId (UUID)
    │ Extrai UTMs da URL
    │ Registra evento FUNNEL_STARTED
    ▼
Renderiza etapas sequencialmente
    │
    ├── [WelcomeRenderer] → STEP_VIEWED → click → STEP_COMPLETED → próxima
    ├── [MultipleChoiceRenderer] → STEP_VIEWED → seleciona → STEP_COMPLETED (acumula score) → próxima (ou pulo condicional)
    ├── [OpenQuestionRenderer] → STEP_VIEWED → preenche → STEP_COMPLETED → próxima
    ├── [CaptureFormRenderer] → STEP_VIEWED → preenche → LEAD_CAPTURED (cria/atualiza Lead) → próxima
    ├── [LoadingRenderer] → STEP_VIEWED → aguarda N segundos → STEP_COMPLETED → próxima
    ├── [ResultRenderer] → STEP_VIEWED → calcula score → classifica → exibe resultado condicional
    └── [RedirectRenderer] → REDIRECT_CLICKED → redireciona para WhatsApp/URL
    │
    ▼
Ao finalizar:
    │ calculateScore(answers) → rawScore
    │ normalizeScore(rawScore, maxPossible) → score (0-100)
    │ classifyLead(score) → classification
    │ Atualiza Lead com score + classification
    │ Registra FUNNEL_COMPLETED
    ▼
Redireciona conforme configuração (WhatsApp / URL / página final)
```

### 3.3 Fluxo de Analytics

```
Usuário acessa /dashboard/funnels/[id]/analytics
    │
    ▼
[Server Component] Carrega dados
    │ Verifica workspaceId
    ▼
Queries paralelas:
    ├── getFunnelConversion(funnelId) → visitors, leads, rate
    ├── getStepDropoff(funnelId) → abandono por etapa
    ├── getLeadsByClassification(funnelId) → distribuição
    ├── getLeadsByDay(funnelId, period) → série temporal
    └── getLeadsByUtmSource(funnelId) → origens
    │
    ▼
Renderiza com Recharts:
    ├── [ConversionChart] → gráfico de funil por etapa
    ├── [ClassificationPie] → pizza de classificação
    ├── [LeadsByDayChart] → barras por dia
    └── [UtmTable] → tabela de UTMs
```

---

## 4. Diagrama do Modelo de Dados

```
┌──────────────┐     ┌──────────────┐
│    User      │     │  Workspace   │
├──────────────┤     ├──────────────┤
│ id           │────<│ id           │
│ name         │     │ name         │
│ email        │     │ ownerId (FK) │
│ passwordHash │     │ createdAt    │
│ createdAt    │     │ updatedAt    │
│ updatedAt    │     └──────┬───────┘
└──────────────┘            │
                            │ 1:N
                    ┌───────▼───────┐
                    │    Funnel     │
                    ├───────────────┤
                    │ id            │
                    │ workspaceId   │
                    │ name          │
                    │ slug (unique) │
                    │ status        │
                    │ theme (JSON)  │
                    │ whatsappNumber│
                    │ whatsappMsg   │
                    │ isTemplate    │
                    │ templateCat   │
                    │ templateDesc  │
                    │ createdAt     │
                    │ updatedAt     │
                    └───┬───┬───┬───┘
                        │   │   │
          ┌─────────────┘   │   └─────────────┐
          │ 1:N             │ 1:N             │ 1:N
  ┌───────▼───────┐ ┌──────▼───────┐ ┌───────▼───────┐
  │  FunnelStep   │ │    Lead      │ │ FunnelEvent   │
  ├───────────────┤ ├──────────────┤ ├───────────────┤
  │ id            │ │ id           │ │ id            │
  │ funnelId (FK) │ │ funnelId(FK) │ │ funnelId(FK)  │
  │ order         │ │ name         │ │ leadId (FK?)  │
  │ type (enum)   │ │ email        │ │ sessionId     │
  │ title         │ │ phone        │ │ eventType     │
  │ description   │ │ company      │ │ stepId        │
  │ config (JSON) │ │ city         │ │ metadata(JSON)│
  │ createdAt     │ │ score        │ │ createdAt     │
  │ updatedAt     │ │ classific.   │ └───────────────┘
  └───────────────┘ │ answers(JSON)│
                    │ utmSource    │
                    │ utmMedium    │
                    │ utmCampaign  │
                    │ utmContent   │
                    │ utmTerm      │
                    │ ip           │
                    │ userAgent    │
                    │ createdAt    │
                    │ updatedAt    │
                    └──────────────┘
```

---

## 5. Interfaces e Contratos de API

### 5.1 APIs Autenticadas

#### `POST /api/auth/register`
```typescript
// Request
{
  name: string
  email: string
  password: string
  workspaceName: string
}

// Response 201
{
  user: { id, name, email }
  workspace: { id, name }
}

// Response 400
{ error: string, fields?: Record<string, string> }
```

#### `POST /api/auth/login`
```typescript
// Request
{ email: string, password: string }

// Response 200
{ user: { id, name, email }, workspace: { id, name } }
// Set-Cookie: session=JWT; HttpOnly; Secure; SameSite=Lax; Max-Age=604800

// Response 401
{ error: "Credenciais inválidas" }
```

#### `GET /api/funnels`
```typescript
// Headers: Cookie: session=JWT
// Query: ?status=PUBLISHED&search=solar&page=1&limit=20

// Response 200
{
  funnels: Array<{
    id: string
    name: string
    slug: string
    status: "DRAFT" | "PUBLISHED"
    leadsCount: number
    createdAt: string
  }>
  pagination: { page: number, limit: number, total: number }
}
```

#### `POST /api/funnels`
```typescript
// Request
{
  name: string
  slug?: string  // auto-generated if not provided
  whatsappNumber?: string
  whatsappMessage?: string
  theme?: FunnelTheme
}

// Response 201
{ funnel: Funnel }
```

#### `PUT /api/funnels/[id]`
```typescript
// Request (partial update)
{
  name?: string
  slug?: string
  whatsappNumber?: string
  whatsappMessage?: string
  theme?: FunnelTheme
}

// Response 200
{ funnel: Funnel }
```

#### `POST /api/funnels/[id]/duplicate`
```typescript
// Response 201
{ funnel: Funnel }  // New funnel with " (cópia)" suffix
```

#### `POST /api/funnels/[id]/publish`
```typescript
// Request
{ published: boolean }

// Response 200
{ funnel: Funnel }

// Response 400
{ error: "Funil precisa ter pelo menos 1 etapa para publicar" }
```

#### `GET /api/funnels/[id]/steps`
```typescript
// Response 200
{
  steps: Array<{
    id: string
    order: number
    type: StepType
    title: string
    description?: string
    config: StepConfig
  }>
}
```

#### `POST /api/funnels/[id]/steps`
```typescript
// Request
{
  type: StepType
  title: string
  description?: string
  config: StepConfig
  order?: number  // default: last position
}

// Response 201
{ step: FunnelStep }
```

#### `GET /api/leads?funnelId=xxx&classification=HOT&page=1`
```typescript
// Response 200
{
  leads: Array<{
    id: string
    name?: string
    email?: string
    phone?: string
    score?: number
    classification?: Classification
    funnelName: string
    createdAt: string
  }>
  pagination: { page: number, limit: number, total: number }
}
```

#### `GET /api/analytics/[funnelId]?period=7d`
```typescript
// Response 200
{
  overview: {
    visitors: number
    leads: number
    conversionRate: number
  }
  stepDropoff: Array<{
    stepId: string
    stepTitle: string
    stepOrder: number
    views: number
    completions: number
    dropoffRate: number
  }>
  classification: Array<{
    classification: Classification
    count: number
    percentage: number
  }>
  leadsByDay: Array<{
    date: string
    count: number
  }>
  utmSources: Array<{
    source: string
    count: number
    conversionRate: number
  }>
}
```

### 5.2 APIs Públicas (Sem Autenticação)

#### `GET /api/public/funnels/[slug]`
```typescript
// Response 200
{
  funnel: {
    id: string
    name: string
    slug: string
    theme: FunnelTheme
    whatsappNumber?: string
    whatsappMessage?: string
    steps: Array<{
      id: string
      order: number
      type: StepType
      title: string
      description?: string
      config: StepConfig
    }>
  }
}

// Response 404
{ error: "Funil não encontrado ou não publicado" }
```

#### `POST /api/public/events`
```typescript
// Request
{
  funnelId: string
  sessionId: string
  eventType: EventType
  stepId?: string
  leadId?: string
  metadata?: Record<string, any>
}

// Response 201
{ event: { id: string } }
```

#### `POST /api/public/leads`
```typescript
// Request
{
  funnelId: string
  sessionId: string
  name?: string
  email?: string
  phone?: string
  company?: string
  city?: string
  answers?: Record<string, any>
  score?: number
  classification?: Classification
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

// Response 201
{ lead: { id: string } }

// Response 200 (update existing)
{ lead: { id: string } }
```

---

## 6. Componentes Principais

### 6.1 Hierarquia de Componentes — Dashboard

```
<DashboardLayout>
  ├── <Sidebar>
  │   ├── Logo
  │   ├── NavLinks (Dashboard, Funis, Leads, Templates)
  │   └── UserMenu (nome, logout)
  │
  ├── <Header>
  │   ├── PageTitle
  │   ├── Breadcrumbs
  │   └── ActionButtons
  │
  └── <MainContent>
      ├── [Dashboard Page]
      │   ├── <StatsCards> (4 cards de métricas)
      │   ├── <LeadsChart> (gráfico últimos 7 dias)
      │   └── <RecentFunnels> (lista 5 recentes)
      │
      ├── [Funnels Page]
      │   ├── <PageHeader> (título + botão criar)
      │   ├── <FunnelFilters> (busca + status)
      │   └── <FunnelList>
      │       └── <FunnelCard>* (nome, slug, status, ações)
      │
      ├── [Editor Page]
      │   ├── <FunnelSettings> (nome, slug, WhatsApp, tema)
      │   ├── <StepList>
      │   │   └── <StepCard>* (tipo, título, botões mover/editar/deletar)
      │   ├── <AddStepDialog> (seletor de tipo de etapa)
      │   └── <StepEditor> (formulário por tipo)
      │       ├── <WelcomeStep>
      │       ├── <MultipleChoiceStep>
      │       ├── <OpenQuestionStep>
      │       ├── <CaptureFormStep>
      │       ├── <LoadingStep>
      │       ├── <ResultStep>
      │       └── <RedirectStep>
      │
      ├── [Leads Page]
      │   ├── <LeadFilters> (busca, funil, classificação)
      │   ├── <LeadsTable> (tabela paginada)
      │   └── <LeadDetail> (modal com detalhes)
      │
      ├── [Analytics Page]
      │   ├── <StatsCards> (visitantes, leads, conversão)
      │   ├── <FunnelFlowChart> (abandono por etapa)
      │   ├── <ClassificationPie> (pizza de classificação)
      │   ├── <LeadsByDayChart> (barras por dia)
      │   └── <UtmTable> (tabela de origens)
      │
      └── [Templates Page]
          └── <TemplateGrid>
              └── <TemplateCard>* (nome, nicho, descrição, botão usar)
```

### 6.2 Hierarquia de Componentes — Funil Público

```
<FunnelThemeProvider theme={funnel.theme}>
  └── <FunnelRenderer funnel={funnel}>
      ├── <ProgressIndicator current={step} total={steps.length} />
      │
      └── <StepRenderer step={currentStep}>
          ├── <WelcomeRenderer>
          │   ├── Logo
          │   ├── Título + Subtítulo
          │   ├── Imagem (opcional)
          │   └── Botão "Começar"
          │
          ├── <MultipleChoiceRenderer>
          │   ├── Título da pergunta
          │   ├── Descrição (opcional)
          │   └── Opções (grid de cards clicáveis)
          │
          ├── <OpenQuestionRenderer>
          │   ├── Título da pergunta
          │   └── Input (text/number/phone/email)
          │
          ├── <CaptureFormRenderer>
          │   ├── Campos configurados
          │   └── Botão "Continuar"
          │
          ├── <LoadingRenderer>
          │   ├── Animação de loading
          │   └── Texto dinâmico
          │
          ├── <ResultRenderer>
          │   ├── Título do resultado
          │   ├── Classificação (badge)
          │   ├── Texto personalizado
          │   └── CTA (botão WhatsApp/link)
          │
          └── <RedirectRenderer>
              └── Auto-redirect (WhatsApp/URL/página)
```

---

## 7. Variáveis de Ambiente

```bash
# .env.example

# ===========================================
# DATABASE (Supabase PostgreSQL)
# ===========================================
# URL com pgBouncer (para queries normais)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# URL direta (para migrations)
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# ===========================================
# AUTH
# ===========================================
# Secret para assinar JWT (mínimo 32 caracteres)
JWT_SECRET="sua-chave-secreta-aqui-com-no-minimo-32-caracteres"

# ===========================================
# APP
# ===========================================
# URL base da aplicação
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ===========================================
# OPTIONAL
# ===========================================
# Node environment
NODE_ENV="development"
```

---

## 8. Dependências do Projeto

### Produção
```json
{
  "dependencies": {
    "next": "^14.2",
    "react": "^18.3",
    "react-dom": "^18.3",
    "@prisma/client": "^5.x",
    "bcryptjs": "^2.4",
    "jose": "^5.x",
    "zod": "^3.23",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "recharts": "^2.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  }
}
```

### Desenvolvimento
```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "@types/bcryptjs": "^2.x",
    "prisma": "^5.x",
    "tailwindcss": "^4.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "eslint-config-next": "^14.x",
    "ts-node": "^10.x"
  }
}
```

### Justificativa das Dependências

| Pacote | Propósito |
|---|---|
| `next` | Framework web full-stack |
| `@prisma/client` | ORM para acesso ao banco |
| `bcryptjs` | Hash de senhas (JS puro, sem bindings nativos) |
| `jose` | JWT compatível com Edge Runtime |
| `zod` | Validação de schemas TypeScript-first |
| `react-hook-form` | Formulários performáticos |
| `@hookform/resolvers` | Integração Zod + React Hook Form |
| `recharts` | Gráficos declarativos em React |
| `clsx` + `tailwind-merge` | Utility para classes condicionais |
| `lucide-react` | Ícones consistentes e leves |

---

## 9. Scripts de Desenvolvimento

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "postinstall": "prisma generate"
  }
}
```
