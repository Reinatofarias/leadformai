# Spec Driven — Segurança, Performance e Observabilidade

> **Versão:** 1.0.0  
> **Data:** 2026-06-24  
> **Status:** Draft  

---

## 1. Segurança

### 1.1 Modelo de Ameaças (MVP)

| Ameaça | Vetor | Impacto | Mitigação |
|---|---|---|---|
| Acesso não autorizado | Token JWT forjado/expirado | Alto | JWT com HMAC-SHA256, expiração 7d, httpOnly cookie |
| Brute-force login | Tentativas massivas | Alto | Rate limiting: 5 tentativas/min por IP |
| Injeção SQL | Input malicioso | Crítico | Prisma ORM (parameterized queries) |
| XSS | Input não sanitizado | Alto | React auto-escaping + Zod validation |
| CSRF | Requisição forjada | Médio | SameSite=Lax cookie + Server Actions |
| Data leakage | Acesso cross-workspace | Crítico | workspaceId filter em todas as queries |
| Enumeração de usuários | Mensagens de erro específicas | Baixo | Mensagens genéricas ("Credenciais inválidas") |
| Exposure de slugs | Slugs previsíveis | Baixo | Funil precisa estar PUBLISHED |

### 1.2 Checklist de Segurança

#### Autenticação
- [x] Senhas com bcrypt (salt rounds = 12)
- [x] JWT assinado com HMAC-SHA256
- [x] Cookie httpOnly, secure, sameSite=lax
- [x] Expiração de token (7 dias)
- [ ] Rate limiting em login/register (implementar com IP tracking simples)
- [ ] Invalidação de sessão no logout (limpar cookie)

#### Autorização
- [x] Middleware protege `/dashboard/*`
- [x] workspaceId extraído do JWT (não do cliente)
- [x] Toda query inclui workspaceId
- [ ] Verificar ownership antes de UPDATE/DELETE

#### Input Validation
- [x] Zod schemas em todas as Server Actions
- [x] Prisma parameterized queries (anti-SQL injection)
- [x] React JSX auto-escaping (anti-XSS)
- [ ] Sanitizar HTML em campos de texto livre
- [ ] Validar URLs (slug, imageUrl, redirectUrl)
- [ ] Limitar tamanho de payloads

#### Dados Sensíveis
- [x] passwordHash nunca retornado em responses
- [x] IP e userAgent opcionais
- [ ] Não expor IDs internos em URLs públicas (usar slug)
- [ ] LGPD: consentimento antes de capturar dados

### 1.3 Headers de Segurança

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]
```

---

## 2. Performance

### 2.1 Metas de Performance

| Métrica | Meta | Onde |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Todas as páginas |
| FID (First Input Delay) | < 100ms | Todas as páginas |
| CLS (Cumulative Layout Shift) | < 0.1 | Todas as páginas |
| TTFB (Time to First Byte) | < 500ms | API routes |
| Lighthouse Performance | > 80 | Funil público |
| Bundle JS (funil público) | < 150KB gzip | `/f/[slug]` |

### 2.2 Estratégias de Otimização

#### Server Components (Default)
```
Priorizar Server Components para:
- Dashboard (métricas calculadas no servidor)
- Listagens (funis, leads)
- Páginas estáticas (landing, templates)

Client Components apenas quando necessário:
- FunnelRenderer (interatividade)
- Formulários com React Hook Form
- Componentes com useState/useEffect
- Gráficos (Recharts)
```

#### Data Fetching
```typescript
// Server Component - sem waterfall
async function DashboardPage() {
  // Queries paralelas
  const [stats, recentFunnels, leadsChart] = await Promise.all([
    getDashboardStats(workspaceId),
    getRecentFunnels(workspaceId),
    getLeadsChartData(workspaceId),
  ])
  
  return <Dashboard stats={stats} funnels={recentFunnels} chart={leadsChart} />
}
```

#### Caching do Funil Público
```typescript
// Funil público com revalidação
// src/app/f/[slug]/page.tsx

export const revalidate = 60 // Revalidar a cada 60 segundos

// Ou usar generateStaticParams para SSG dos funis mais populares
```

#### Bundle Optimization
```typescript
// Dynamic imports para componentes pesados
const Recharts = dynamic(() => import('recharts'), { ssr: false })
const ColorPicker = dynamic(() => import('@/components/ui/color-picker'), { ssr: false })
```

### 2.3 Otimização de Banco

#### Connection Pooling
```
Supabase pgBouncer (porta 6543):
- Pool mode: transaction
- Max connections: 15 (free tier)
- Idle timeout: 60s
```

#### Queries Otimizadas
```typescript
// ✅ Bom: selecionar apenas campos necessários
const funnels = await prisma.funnel.findMany({
  where: { workspaceId },
  select: { id: true, name: true, slug: true, status: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
  take: 20,
})

// ❌ Ruim: buscar tudo com includes desnecessários
const funnels = await prisma.funnel.findMany({
  where: { workspaceId },
  include: { steps: true, leads: true, events: true },
})
```

#### Contagem Otimizada
```typescript
// Para métricas do dashboard, usar count ao invés de fetch + length
const [funnelsCount, leadsCount] = await Promise.all([
  prisma.funnel.count({ where: { workspaceId } }),
  prisma.lead.count({ where: { funnel: { workspaceId } } }),
])
```

---

## 3. Observabilidade (MVP)

### 3.1 Logging

No MVP, usar `console.log/warn/error` estruturado. Migrar para solução de logging (Axiom, Datadog) em versões futuras.

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }))
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }))
  },
  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      error: error?.message,
      stack: error?.stack,
      ...meta, 
      timestamp: new Date().toISOString() 
    }))
  },
}
```

### 3.2 Monitoramento de Erros

```typescript
// Para o MVP: Error Boundaries em React

// app/error.tsx (Global error boundary)
'use client'

export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  useEffect(() => {
    logger.error('Unhandled error', error)
  }, [error])

  return (
    <div>
      <h2>Algo deu errado</h2>
      <button onClick={reset}>Tentar novamente</button>
    </div>
  )
}
```

### 3.3 Evolução Futura

| Fase | Ferramenta | Propósito |
|---|---|---|
| MVP | Console logs | Debugging básico |
| v1.1 | Sentry | Error tracking e alertas |
| v1.2 | Vercel Analytics | Web vitals e performance |
| v1.3 | Axiom/Datadog | Logging centralizado |
| v2.0 | Custom dashboard | Métricas de negócio |

---

## 4. LGPD e Privacidade

### 4.1 Considerações para MVP

| Requisito | Status | Implementação |
|---|---|---|
| Captura consentida | Parcial | Formulário implica consentimento |
| Dados mínimos | Sim | Campos opcionais no formulário |
| IP opcional | Sim | Configurável |
| Exclusão de dados | Parcial | Cascade delete ao excluir funil |
| Portabilidade | Não | Futuro (export CSV) |
| Política de privacidade | Não | Adicionar em v1.1 |

### 4.2 Recomendações para v1.1
- Adicionar checkbox de consentimento no formulário de captura
- Criar página de política de privacidade
- Implementar endpoint de exclusão de dados do lead
- Registrar consentimento com timestamp
- Exportação de dados do lead (CSV)

---

## 5. Testes (Recomendações para Post-MVP)

### 5.1 Estratégia de Testes

| Tipo | Ferramenta | Escopo |
|---|---|---|
| Unitário | Vitest | Scoring, classification, WhatsApp builder, slug generator |
| Integração | Vitest + Prisma | Server Actions, API Routes |
| E2E | Playwright | Fluxo completo: criar funil → publicar → responder → ver lead |
| Visual | Storybook | Componentes UI isolados |

### 5.2 Testes Unitários Prioritários

```typescript
// __tests__/scoring.test.ts
describe('calculateScore', () => {
  it('should sum scores from multiple choice answers')
  it('should return 0 for no scored answers')
  it('should ignore non-multiple-choice answers')
})

describe('normalizeScore', () => {
  it('should normalize to 0-100 scale')
  it('should return 0 for maxPossible = 0')
  it('should cap at 100')
})

describe('classifyLead', () => {
  it('should classify 0-30 as COLD')
  it('should classify 31-60 as WARM')
  it('should classify 61-85 as HOT')
  it('should classify 86-100 as VERY_HOT')
  it('should classify boundary values correctly')
})

// __tests__/whatsapp.test.ts
describe('processWhatsAppMessage', () => {
  it('should replace all variables')
  it('should handle missing variables gracefully')
  it('should handle empty template')
})

describe('buildWhatsAppUrl', () => {
  it('should format URL correctly')
  it('should add DDI 55 if missing')
  it('should encode message')
})

// __tests__/slug.test.ts
describe('generateSlug', () => {
  it('should convert to kebab-case')
  it('should remove special characters')
  it('should remove accents')
  it('should handle multiple spaces')
})
```
