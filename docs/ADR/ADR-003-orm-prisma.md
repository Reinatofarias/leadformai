# ADR-003: ORM — Prisma

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O projeto precisa de uma camada de acesso a dados que ofereça:
- Tipagem forte com TypeScript
- Migrations automáticas
- Facilidade de modelagem de entidades complexas
- Compatibilidade com PostgreSQL e Supabase
- Suporte a campos JSON
- Seeding do banco
- Bom suporte a ambientes serverless

## Opções Consideradas

### Opção 1: Prisma ORM (Escolhida ✅)
- Type-safe queries geradas automaticamente
- Migrations automáticas (`prisma migrate`)
- Schema declarativo e legível
- Prisma Studio para debug visual
- Excelente documentação
- Suporte a JSON types
- Seeding nativo

### Opção 2: Drizzle ORM
- Mais leve e "SQL-like"
- Migrations manuais
- Performance potencialmente melhor
- Ecossistema menor
- Menos features out-of-the-box

### Opção 3: Knex.js + Objection.js
- Mais flexível para queries complexas
- Menos type-safe
- Mais boilerplate
- Comunidade menos ativa

### Opção 4: Supabase JS Client
- Integrado com Supabase
- Sem migrations formais
- Lock-in total com Supabase
- Menos controle sobre queries

## Decisão

**Prisma** é a escolha porque:

1. **Type Safety:** Queries tipadas geradas do schema, eliminando erros em runtime
2. **Developer Experience:** Schema legível, auto-completion, Prisma Studio
3. **Migrations:** Sistema de migrations robusto e rastreável
4. **Supabase Compatibility:** Documentação oficial e pattern bem estabelecido
5. **JSON Support:** `Json` type nativo para campos flexíveis (theme, config, answers)
6. **Seeding:** Script de seed para templates iniciais
7. **Serverless:** Prisma Client com connection pooling via Supabase pgBouncer

## Schema Proposto

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  passwordHash String
  workspaces   Workspace[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  owner     User     @relation(fields: [ownerId], references: [id])
  ownerId   String
  funnels   Funnel[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Funnel {
  id              String       @id @default(cuid())
  workspace       Workspace    @relation(fields: [workspaceId], references: [id])
  workspaceId     String
  name            String
  slug            String       @unique
  status          FunnelStatus @default(DRAFT)
  theme           Json?
  whatsappNumber  String?
  whatsappMessage String?
  steps           FunnelStep[]
  leads           Lead[]
  events          FunnelEvent[]
  isTemplate      Boolean      @default(false)
  templateCategory String?
  templateDescription String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([workspaceId])
  @@index([slug])
}

enum FunnelStatus {
  DRAFT
  PUBLISHED
}

model FunnelStep {
  id          String   @id @default(cuid())
  funnel      Funnel   @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  funnelId    String
  order       Int
  type        StepType
  title       String?
  description String?
  config      Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([funnelId])
  @@index([funnelId, order])
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

model Lead {
  id             String          @id @default(cuid())
  funnel         Funnel          @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  funnelId       String
  name           String?
  email          String?
  phone          String?
  company        String?
  city           String?
  score          Int?
  classification Classification?
  answers        Json?
  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  utmContent     String?
  utmTerm        String?
  ip             String?
  userAgent      String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  events         FunnelEvent[]

  @@index([funnelId])
  @@index([funnelId, classification])
  @@index([email])
}

enum Classification {
  COLD
  WARM
  HOT
  VERY_HOT
}

model FunnelEvent {
  id        String   @id @default(cuid())
  funnel    Funnel   @relation(fields: [funnelId], references: [id], onDelete: Cascade)
  funnelId  String
  lead      Lead?    @relation(fields: [leadId], references: [id])
  leadId    String?
  sessionId String
  eventType EventType
  stepId    String?
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([funnelId])
  @@index([sessionId])
  @@index([funnelId, eventType])
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

## Consequências

### Positivas
- Schema como fonte de verdade para o modelo de dados
- Queries type-safe eliminam bugs de runtime
- Migrations versionadas e rastreáveis
- Excelente developer experience
- Seeding simples para templates

### Negativas
- Prisma Client adiciona ao bundle size (~2MB)
- Queries muito complexas podem precisar de `$queryRaw`
- Prisma Migrate pode conflitar com alterações manuais no banco
- Cold start do Prisma Client em serverless (~200-500ms na primeira query)

### Mitigações
- Usar Prisma Accelerate ou pgBouncer para connection pooling
- Manter queries simples; usar `$queryRaw` apenas para analytics complexos
- Nunca alterar banco manualmente; sempre via migrations
- Instanciar Prisma Client como singleton

## Referências
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma + Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [Prisma Best Practices for Serverless](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
