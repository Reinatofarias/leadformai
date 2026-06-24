# ADR-005: Plataforma de Deploy — Vercel

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI precisa de uma plataforma de deploy que:
- Suporte Next.js nativamente
- Ofereça deploy contínuo via Git
- Tenha CDN global para performance
- Ofereça SSL automático
- Suporte preview deployments para PRs
- Escale automaticamente
- Tenha custo acessível no início

## Opções Consideradas

### Opção 1: Vercel (Escolhida ✅)
- Criadora do Next.js, suporte nativo
- Deploy automático via Git push
- Preview deployments por branch/PR
- CDN global com edge locations
- SSL automático
- Serverless functions
- Analytics integrado
- Free tier generoso

### Opção 2: Netlify
- Bom suporte a Next.js (mas não nativo)
- Algumas features do Next.js não funcionam perfeitamente
- Serverless functions com limitações

### Opção 3: Railway
- Deploy genérico (Docker)
- Mais controle
- Sem preview deployments nativos
- Menos otimizado para Next.js

### Opção 4: AWS Amplify
- Suporte a Next.js
- Mais complexo de configurar
- Mais poderoso para escala
- Custo pode subir rapidamente

## Decisão

**Vercel** é a escolha natural porque:

1. **Next.js nativo:** Otimizações automáticas, ISR, edge middleware
2. **Developer Experience:** `git push` → deploy automático em segundos
3. **Preview Deployments:** Cada PR tem URL única para teste
4. **Edge Network:** CDN global, 35+ regiões, incluindo São Paulo
5. **Free Tier:** 100GB bandwidth, serverless functions, SSL
6. **Zero Config:** Detecta Next.js automaticamente
7. **Environment Variables:** Gestão segura via dashboard

## Configuração

### Estrutura de Ambientes
| Ambiente | Branch | URL | Propósito |
|---|---|---|---|
| Production | `main` | `leadflow-ai.vercel.app` | Produção |
| Preview | `feature/*` | `leadflow-ai-{hash}.vercel.app` | Teste de PRs |
| Development | Local | `localhost:3000` | Desenvolvimento |

### Environment Variables
```bash
# .env.example (publicado no repo)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret-here-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Importante:** Na Vercel, configurar variáveis via Dashboard > Settings > Environment Variables, não no repo.

### vercel.json (opcional)
```json
{
  "framework": "nextjs",
  "regions": ["gru1"],
  "headers": [
    {
      "source": "/f/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, s-maxage=60, stale-while-revalidate=300" }
      ]
    }
  ]
}
```

### Limites Relevantes (Hobby Plan)
| Recurso | Limite |
|---|---|
| Bandwidth | 100 GB/mês |
| Serverless Function Duration | 10 segundos |
| Serverless Function Memory | 1024 MB |
| Edge Function Duration | 30 segundos |
| Builds | 6000/mês |
| Concurrent Builds | 1 |
| Team Members | 1 (Hobby) |

### Otimizações de Deploy
1. **ISR para funis públicos:** Revalidação a cada 60s para `/f/[slug]`
2. **Edge Middleware:** Autenticação no edge para menor latência
3. **Image Optimization:** Usar `next/image` com Vercel Image Optimization
4. **Região GRU1:** Forçar deploy em São Paulo para menor latência com Supabase (sa-east-1)

## Consequências

### Positivas
- Deploy em segundos, sem configuração de CI/CD
- Preview automático para cada PR
- CDN global com edge caching
- SSL e HTTPS automáticos
- Monitoring e analytics básicos inclusos

### Negativas
- Lock-in parcial com Vercel
- Limite de 10s para serverless functions (Hobby)
- Custo pode subir com escala (Pro: $20/mês por membro)
- Sem acesso SSH ou ambiente persistente

### Mitigações
| Risco | Mitigação |
|---|---|
| Lock-in | Manter código Next.js padrão; deploy alternativo com Docker |
| Timeout de functions | Otimizar queries; usar edge runtime onde possível |
| Custos | Monitorar uso; caching agressivo; otimizar bundle |

## Referências
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Limits](https://vercel.com/docs/concepts/limits/overview)
- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)
