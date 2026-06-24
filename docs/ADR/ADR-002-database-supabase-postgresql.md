# ADR-002: Banco de Dados — Supabase (PostgreSQL)

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI precisa de um banco de dados relacional que suporte:
- Modelagem de entidades complexas (funis, etapas, leads, eventos)
- JSON fields para configurações flexíveis (theme, config, answers)
- Queries eficientes com índices compostos
- Isolamento de dados por workspace (multi-tenancy)
- Escalabilidade para crescimento
- Disponibilidade e backups automáticos
- Compatibilidade com Prisma ORM
- Custo acessível no início

## Opções Consideradas

### Opção 1: Supabase (PostgreSQL Gerenciado) (Escolhida ✅)
- PostgreSQL gerenciado com connection pooling (pgBouncer)
- Free tier generoso (500MB, 2 projetos)
- Dashboard para visualização de dados
- Row Level Security (RLS) nativo
- Auth integrado (opcional)
- Realtime subscriptions (futuro)
- Edge Functions (futuro)
- Storage para arquivos (futuro)

### Opção 2: Neon (Serverless PostgreSQL)
- Branching de banco (ótimo para dev/staging)
- Escala para zero (econômico)
- Menos features integradas que Supabase
- Comunidade menor

### Opção 3: PlanetScale (MySQL)
- Não é PostgreSQL (Prisma suporta, mas perde features do Postgres)
- Branching nativo
- Excelente para escalabilidade
- Removeu free tier recentemente

### Opção 4: PostgreSQL self-hosted (Railway/Render)
- Controle total
- Mais responsabilidade operacional
- Sem features extras (auth, storage, realtime)
- Custo pode ser maior

## Decisão

**Supabase** é a escolha porque:

1. **PostgreSQL completo:** Suporte a JSON/JSONB, arrays, full-text search, e todas as features do PostgreSQL 15+
2. **Connection Pooling:** pgBouncer integrado, essencial para ambientes serverless (Vercel)
3. **Row Level Security:** Multi-tenancy seguro por workspace nativo no banco
4. **Free Tier:** 500MB de storage e 2GB de transfer no plano gratuito
5. **Ecosystem:** Dashboard, API auto-gerada, Auth, Storage e Realtime para expansão futura
6. **Compatibilidade Prisma:** Supabase + Prisma é uma combinação bem documentada e testada
7. **Escalabilidade:** Upgrade transparente para planos maiores conforme necessidade

## Configuração Recomendada

### Connection String
```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Prisma Config
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

> **Nota:** `DATABASE_URL` usa a porta do pgBouncer (6543) para queries normais. `DIRECT_URL` usa a porta direta (5432) para migrations e introspection.

### Row Level Security (RLS)
Embora o isolamento por workspace seja feito na camada de aplicação (Prisma queries com `workspaceId`), o RLS pode ser ativado como camada adicional de segurança:

```sql
-- Exemplo de policy RLS
ALTER TABLE "Funnel" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_isolation" ON "Funnel"
  USING (workspace_id = current_setting('app.workspace_id')::uuid);
```

> **Decisão MVP:** No MVP, o isolamento será feito na camada de aplicação via Prisma. RLS será considerado para v1.1.

## Consequências

### Positivas
- Setup rápido e sem gerenciamento de infraestrutura
- Connection pooling resolve cold starts do serverless
- Plataforma em evolução com novas features
- Dashboard visual para debugging
- Backups automáticos

### Negativas
- Dependência do serviço Supabase
- Free tier tem limites de conexões e storage
- Latência pode variar por região (escolher região próxima: São Paulo)
- Algumas features Supabase-específicas podem criar lock-in

### Riscos e Mitigações
| Risco | Mitigação |
|---|---|
| Free tier insuficiente | Monitorar uso; upgrade para Pro ($25/mês) |
| Latência alta | Escolher região São Paulo (sa-east-1) |
| Downtime do Supabase | Backups exportáveis; código não depende de APIs Supabase-específicas |
| Lock-in | Usar apenas Prisma para acesso ao banco; não usar Supabase JS client no MVP |

## Índices Recomendados

```sql
-- Queries frequentes
CREATE INDEX idx_funnel_workspace ON "Funnel"("workspaceId");
CREATE INDEX idx_funnel_slug ON "Funnel"("slug");
CREATE INDEX idx_lead_funnel ON "Lead"("funnelId");
CREATE INDEX idx_lead_workspace ON "Lead"("funnelId", "classification");
CREATE INDEX idx_event_funnel ON "FunnelEvent"("funnelId");
CREATE INDEX idx_event_session ON "FunnelEvent"("sessionId");
CREATE INDEX idx_event_type ON "FunnelEvent"("funnelId", "eventType");
```

## Referências
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Supabase Pricing](https://supabase.com/pricing)
