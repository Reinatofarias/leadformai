# ADR-009: Estratégia de Tracking de Eventos e Analytics

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI precisa rastrear o comportamento de visitantes nos funis para:
- Calcular taxa de conversão por etapa
- Identificar pontos de abandono
- Gerar métricas de desempenho por funil
- Atribuir UTMs aos leads

## Decisão

**Event sourcing simplificado** no banco de dados usando a tabela `FunnelEvent`:

### Tipos de Eventos

| Evento | Quando | Dados |
|---|---|---|
| `FUNNEL_STARTED` | Visitante acessa o funil | `sessionId`, UTMs |
| `STEP_VIEWED` | Visitante vê uma etapa | `sessionId`, `stepId`, `stepOrder` |
| `STEP_COMPLETED` | Visitante completa uma etapa | `sessionId`, `stepId`, resposta |
| `LEAD_CAPTURED` | Dados de contato salvos | `sessionId`, `leadId` |
| `FUNNEL_COMPLETED` | Visitante chega ao final | `sessionId`, `leadId`, score |
| `REDIRECT_CLICKED` | CTA/redirect clicado | `sessionId`, `redirectType`, URL |

### Fluxo de Tracking

```
Visitante acessa /f/slug
    → Gerar sessionId (UUID)
    → Capturar UTMs da URL
    → Registrar FUNNEL_STARTED
    
Visitante vê etapa 1
    → Registrar STEP_VIEWED (stepId, order: 1)
    
Visitante completa etapa 1
    → Registrar STEP_COMPLETED (stepId, resposta)
    → Salvar resposta progressivamente
    
Visitante preenche formulário de captura
    → Criar/atualizar Lead
    → Registrar LEAD_CAPTURED
    
Visitante chega ao resultado
    → Calcular score
    → Atribuir classificação
    → Registrar FUNNEL_COMPLETED
    
Visitante clica em CTA
    → Registrar REDIRECT_CLICKED
    → Redirecionar
```

### Cálculos de Analytics

```typescript
// lib/analytics.ts

// Taxa de conversão do funil
async function getFunnelConversion(funnelId: string) {
  const visitors = await prisma.funnelEvent.groupBy({
    by: ['sessionId'],
    where: { funnelId, eventType: 'FUNNEL_STARTED' },
  })
  
  const leads = await prisma.lead.count({
    where: { funnelId },
  })
  
  return {
    visitors: visitors.length,
    leads,
    conversionRate: visitors.length > 0 
      ? (leads / visitors.length) * 100 
      : 0,
  }
}

// Taxa de abandono por etapa
async function getStepDropoff(funnelId: string) {
  const stepViews = await prisma.funnelEvent.groupBy({
    by: ['stepId'],
    where: { funnelId, eventType: 'STEP_VIEWED' },
    _count: { sessionId: true },
  })
  
  const stepCompletions = await prisma.funnelEvent.groupBy({
    by: ['stepId'],
    where: { funnelId, eventType: 'STEP_COMPLETED' },
    _count: { sessionId: true },
  })
  
  // Merge e calcular taxa
  return mergeStepMetrics(stepViews, stepCompletions)
}

// Leads por classificação
async function getLeadsByClassification(funnelId: string) {
  return prisma.lead.groupBy({
    by: ['classification'],
    where: { funnelId },
    _count: true,
  })
}

// Leads por UTM source
async function getLeadsByUtmSource(funnelId: string) {
  return prisma.lead.groupBy({
    by: ['utmSource'],
    where: { funnelId, utmSource: { not: null } },
    _count: true,
  })
}
```

### SessionId

```typescript
// Gerado no cliente ao iniciar o funil
function generateSessionId(): string {
  return crypto.randomUUID()
}

// Persistido em sessionStorage (não localStorage) para não cruzar sessões
sessionStorage.setItem(`funnel_${slug}_session`, sessionId)
```

## Consequências

### Positivas
- Implementação simples com Prisma
- Dados granulares por etapa
- Cálculos feitos sob demanda (sem pipeline complexo)
- Fácil de evoluir para analytics mais sofisticado

### Negativas
- Queries de analytics podem ficar lentas com muitos eventos
- Sem cache de métricas no MVP (calcular a cada request)
- Não rastreia tempo gasto por etapa (pode ser adicionado depois)

### Mitigação Futura
- Materializar métricas em tabela separada (v1.1)
- Cache de analytics por 5 minutos (v1.1)
- Background jobs para cálculos pesados (v1.2)

## Referências
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Prisma GroupBy](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#groupby)
