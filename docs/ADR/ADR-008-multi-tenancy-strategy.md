# ADR-008: Estratégia de Multi-Tenancy

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI é uma plataforma multi-tenant onde cada usuário/empresa tem um workspace isolado. Os dados (funis, leads, eventos) de um workspace nunca devem ser visíveis ou acessíveis por outro workspace.

## Opções Consideradas

### Opção 1: Isolamento na Camada de Aplicação (Escolhida ✅)
- `workspaceId` em todas as queries Prisma
- Middleware injeta `workspaceId` do token JWT
- Helper functions garantem filtro por workspace

### Opção 2: Row Level Security (PostgreSQL)
- Segurança no nível do banco
- Mais seguro, mas mais complexo de implementar com Prisma
- Pode causar problemas com migrations

### Opção 3: Schema por Tenant
- Isolamento completo por schema PostgreSQL
- Complexo de gerenciar
- Não escala para muitos tenants

## Decisão

**Isolamento na camada de aplicação** com `workspaceId` como filtro em todas as queries, complementado por helper functions que garantem o filtro:

### Implementação

```typescript
// lib/workspace.ts
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getWorkspaceId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) throw new Error('Not authenticated')
  
  const payload = verifyToken(token)
  return payload.workspaceId
}

export async function getWorkspaceFunnels() {
  const workspaceId = await getWorkspaceId()
  return prisma.funnel.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getWorkspaceFunnel(funnelId: string) {
  const workspaceId = await getWorkspaceId()
  const funnel = await prisma.funnel.findFirst({
    where: { id: funnelId, workspaceId },
    include: { steps: { orderBy: { order: 'asc' } } },
  })
  if (!funnel) throw new Error('Funnel not found')
  return funnel
}

export async function getWorkspaceLeads(filters?: LeadFilters) {
  const workspaceId = await getWorkspaceId()
  return prisma.lead.findMany({
    where: {
      funnel: { workspaceId },
      ...filters,
    },
    include: { funnel: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
}
```

### Regras
1. **Toda query** a dados privados DEVE incluir `workspaceId`
2. **Server Actions** sempre extraem `workspaceId` do JWT
3. **API Routes** validam `workspaceId` antes de processar
4. **Funis públicos** (`/f/[slug]`) não precisam de workspace (acessíveis por slug)
5. **Leads de funis públicos** são criados sem validação de workspace (visitante externo)

## Consequências

### Positivas
- Implementação simples e direta
- Fácil de testar e debugar
- Sem configuração extra no banco
- Compatível com Prisma padrão

### Negativas
- Risco de esquecer filtro em novas queries (mitigado por helper functions)
- Sem proteção no nível do banco (mitigado por code review)
- Se comprometer a aplicação, todos os dados ficam expostos

### Mitigação Futura
- RLS no PostgreSQL como camada adicional (v1.1)
- Testes automatizados de isolamento de workspace
- Lint rules para detectar queries sem `workspaceId`

## Referências
- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/considerations/tenancy-models)
- [Prisma Multi-tenancy](https://www.prisma.io/docs/guides/other/multi-tenancy)
