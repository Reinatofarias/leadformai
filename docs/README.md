# LeadFlow AI — Índice de Documentação

> **Plataforma SaaS para criação de funis interativos, quizzes, páginas de captura e qualificação automática de leads.**

---

## 📋 PRD — Product Requirements Documents

Documentos que definem **o que** será construído, para **quem** e **por quê**.

| # | Documento | Descrição |
|---|---|---|
| 001 | [Product Requirements Document](PRD/001-product-requirements-document.md) | PRD completo com funcionalidades, requisitos, personas, critérios de aceitação e cronograma |
| 002 | [User Stories](PRD/002-user-stories.md) | Histórias de usuário organizadas por épico com prioridades e critérios de aceitação |

---

## 🏗️ ADR — Architecture Decision Records

Decisões técnicas documentadas com contexto, opções consideradas e justificativa.

| # | ADR | Decisão | Status |
|---|---|---|---|
| 001 | [Framework](ADR/ADR-001-framework-nextjs-app-router.md) | Next.js com App Router | ✅ Aceito |
| 002 | [Banco de Dados](ADR/ADR-002-database-supabase-postgresql.md) | Supabase (PostgreSQL gerenciado) | ✅ Aceito |
| 003 | [ORM](ADR/ADR-003-orm-prisma.md) | Prisma ORM com schema completo | ✅ Aceito |
| 004 | [Autenticação](ADR/ADR-004-authentication-strategy.md) | JWT custom com httpOnly cookies | ✅ Aceito |
| 005 | [Deploy](ADR/ADR-005-deploy-vercel.md) | Vercel com região São Paulo | ✅ Aceito |
| 006 | [Estilização](ADR/ADR-006-styling-tailwind-css.md) | Tailwind CSS v4 com design tokens | ✅ Aceito |
| 007 | [Validação](ADR/ADR-007-validation-zod.md) | Zod com schemas completos | ✅ Aceito |
| 008 | [Multi-Tenancy](ADR/ADR-008-multi-tenancy-strategy.md) | Isolamento por workspaceId na aplicação | ✅ Aceito |
| 009 | [Tracking/Analytics](ADR/ADR-009-event-tracking-analytics.md) | Event sourcing simplificado no banco | ✅ Aceito |
| 010 | [Scoring](ADR/ADR-010-scoring-classification-logic.md) | Score aditivo normalizado com 4 faixas | ✅ Aceito |

---

## 📐 SPEC — Spec Driven Documents

Especificações técnicas detalhadas que definem **como** será implementado.

| # | Documento | Conteúdo |
|---|---|---|
| 001 | [Arquitetura e Estrutura](SPEC/001-architecture-and-structure.md) | Diagrama de arquitetura, estrutura de pastas, fluxo de dados, hierarquia de componentes, contratos de API, variáveis de ambiente, dependências |
| 002 | [Modelo de Dados e Schema](SPEC/002-data-model-and-schema.md) | Schema Prisma completo, estruturas JSON, índices, regras de integridade, estratégia de seed |
| 003 | [Fluxos de Negócio e Regras](SPEC/003-business-flows-and-rules.md) | Fluxos sequenciais (autenticação, CRUD, funil público, captura), regras de negócio, tratamento de erros, WhatsApp, UTM |
| 004 | [Plano de Implementação](SPEC/004-implementation-tasks.md) | 8 tarefas sequenciais com entregáveis, detalhamento e critérios de aceite |
| 005 | [Segurança, Performance e Observabilidade](SPEC/005-security-performance-observability.md) | Modelo de ameaças, headers de segurança, metas de performance, otimizações, LGPD, estratégia de testes |

---

## 🗂️ Estrutura de Pastas da Documentação

```
docs/
├── README.md                              ← Este arquivo
├── PRD/
│   ├── 001-product-requirements-document.md
│   └── 002-user-stories.md
├── ADR/
│   ├── ADR-001-framework-nextjs-app-router.md
│   ├── ADR-002-database-supabase-postgresql.md
│   ├── ADR-003-orm-prisma.md
│   ├── ADR-004-authentication-strategy.md
│   ├── ADR-005-deploy-vercel.md
│   ├── ADR-006-styling-tailwind-css.md
│   ├── ADR-007-validation-zod.md
│   ├── ADR-008-multi-tenancy-strategy.md
│   ├── ADR-009-event-tracking-analytics.md
│   └── ADR-010-scoring-classification-logic.md
└── SPEC/
    ├── 001-architecture-and-structure.md
    ├── 002-data-model-and-schema.md
    ├── 003-business-flows-and-rules.md
    ├── 004-implementation-tasks.md
    └── 005-security-performance-observability.md
```

---

## 🔧 Stack Técnica Definida

| Camada | Tecnologia | ADR |
|---|---|---|
| Framework | Next.js 14+ (App Router) | ADR-001 |
| Linguagem | TypeScript | ADR-001 |
| Estilização | Tailwind CSS v4 | ADR-006 |
| ORM | Prisma | ADR-003 |
| Banco de Dados | Supabase (PostgreSQL) | ADR-002 |
| Autenticação | JWT custom (jose + bcryptjs) | ADR-004 |
| Validação | Zod + React Hook Form | ADR-007 |
| Gráficos | Recharts | — |
| Ícones | Lucide React | — |
| Deploy | Vercel | ADR-005 |

---

## 📊 Resumo do MVP

- **38 User Stories** organizadas em 9 épicos
- **10 ADRs** documentando decisões técnicas
- **5 Spec Driven documents** com implementação detalhada
- **8 Tarefas** de implementação sequenciais
- **6 Models** no Prisma (User, Workspace, Funnel, FunnelStep, Lead, FunnelEvent)
- **7 Tipos de etapa** (Welcome, Multiple Choice, Open Question, Capture Form, Loading, Result, Redirect)
- **4 Classificações** de lead (Frio, Morno, Quente, Muito Quente)
- **6 Templates** por nicho
- **12 Rotas** no total (4 públicas + 8 autenticadas)
- **Estimativa:** 18-26 dias de desenvolvimento
