# ADR-001: Escolha do Framework — Next.js com App Router

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI precisa de um framework web que suporte:
- Renderização do lado do servidor (SSR) para performance e SEO
- Rotas de API para o backend
- Rotas dinâmicas para funis públicos (`/f/[slug]`)
- Deploy simples na Vercel
- Boa experiência de desenvolvimento com TypeScript

## Opções Consideradas

### Opção 1: Next.js com App Router (Escolhida ✅)
- Framework full-stack com SSR, SSG e ISR
- App Router com React Server Components
- Server Actions para operações de banco
- API Routes para endpoints REST
- Deploy nativo na Vercel
- Ecossistema maduro e comunidade ativa
- Suporte nativo a TypeScript

### Opção 2: Remix
- Framework full-stack com bom data loading
- Menos suportado na Vercel comparado ao Next.js
- Comunidade menor
- Curva de aprendizado para loader/action patterns

### Opção 3: Vite + Express separados
- Maior flexibilidade e controle
- Mais complexo para deploy
- Necessidade de configurar CORS, proxy
- Sem SSR out-of-the-box

### Opção 4: Nuxt.js (Vue)
- Bom framework full-stack
- Ecossistema menor para componentes UI
- Equipe precisa conhecer Vue

## Decisão

**Next.js com App Router** é a escolha ideal porque:

1. **Deploy na Vercel:** Integração zero-config, preview deployments, edge functions
2. **React Server Components:** Reduz bundle JavaScript no cliente para melhor performance
3. **Server Actions:** Elimina necessidade de API routes separadas para operações CRUD
4. **Rotas dinâmicas:** Suporte nativo a `[slug]` e `[id]` para funis e recursos
5. **Middleware:** Proteção de rotas autenticadas de forma centralizada
6. **Ecossistema:** Maior quantidade de bibliotecas, exemplos e soluções para problemas comuns
7. **TypeScript:** Suporte first-class com tipagem de rotas e params

## Consequências

### Positivas
- Deploy simplificado na Vercel
- Performance otimizada com Server Components
- Ecossistema rico de componentes e libs
- Tipagem forte end-to-end

### Negativas
- Lock-in parcial com Vercel (mitigável com Docker)
- App Router ainda evolui rapidamente (breaking changes potenciais)
- Complexidade adicional de entender Server vs Client Components
- Cold starts em funções serverless (mitigável com edge runtime)

### Riscos
- **Limites de execução serverless:** Funções na Vercel têm timeout de 10s (Hobby) ou 60s (Pro). Operações pesadas (relatórios, exports) podem precisar de background jobs.
- **Bundle size:** Monitorar para manter performance. Usar dynamic imports quando possível.

## Referências
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Vercel Deployment Limits](https://vercel.com/docs/concepts/limits/overview)
- [React Server Components RFC](https://github.com/reactjs/rfcs/pull/188)
