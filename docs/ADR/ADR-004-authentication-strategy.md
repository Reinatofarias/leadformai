# ADR-004: Estratégia de Autenticação

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI precisa de um sistema de autenticação que:
- Suporte cadastro com e-mail e senha
- Mantenha sessões seguras
- Proteja rotas do dashboard
- Isole dados por workspace
- Seja simples de implementar no MVP
- Funcione bem com Next.js App Router e Vercel

## Opções Consideradas

### Opção 1: NextAuth.js (Auth.js) v5
- Solução madura para Next.js
- Suporte a múltiplos providers
- Session management built-in
- Complexidade para credentials provider

### Opção 2: Supabase Auth
- Integrado com banco Supabase
- JWT tokens
- Magic links, OAuth out-of-the-box
- Cria dependência forte do Supabase

### Opção 3: Autenticação Custom com JWT (Escolhida ✅)
- Controle total sobre o fluxo
- Simples e direto para e-mail/senha
- Sem dependência de terceiros
- Fácil de entender e debugar

### Opção 4: Clerk / Auth0
- Serviço gerenciado
- Custo adicional
- Excelente UX
- Overhead para MVP simples

## Decisão

**Autenticação custom com JWT** armazenado em cookie httpOnly para o MVP, porque:

1. **Simplicidade:** O MVP precisa apenas de e-mail/senha, sem OAuth
2. **Controle:** Total controle sobre fluxo de cadastro, login e sessão
3. **Sem dependência:** Não depende de serviço externo
4. **Next.js Middleware:** JWT validado no middleware para proteção de rotas
5. **Segurança adequada:** bcrypt + JWT + httpOnly cookie é suficiente para MVP
6. **Migração futura:** Fácil migrar para NextAuth/Supabase Auth no futuro se necessário

## Arquitetura

### Fluxo de Cadastro
```
1. Usuário preenche formulário (nome, email, senha, workspace)
2. Server Action valida dados com Zod
3. Verifica se email já existe
4. Hash da senha com bcrypt (salt rounds = 12)
5. Cria User + Workspace em transação
6. Gera JWT com { userId, workspaceId, email }
7. Define cookie httpOnly com JWT
8. Redireciona para /dashboard
```

### Fluxo de Login
```
1. Usuário preenche email e senha
2. Server Action valida dados
3. Busca usuário por email
4. Compara senha com bcrypt.compare()
5. Gera JWT com { userId, workspaceId, email }
6. Define cookie httpOnly com JWT
7. Redireciona para /dashboard
```

### Proteção de Rotas (Middleware)
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    const payload = verifyToken(token)
    // Inject workspaceId in headers for downstream use
    const headers = new Headers(request.headers)
    headers.set('x-workspace-id', payload.workspaceId)
    headers.set('x-user-id', payload.userId)
    return NextResponse.next({ headers })
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: '/dashboard/:path*'
}
```

### Estrutura do JWT
```typescript
interface JWTPayload {
  userId: string
  workspaceId: string
  email: string
  iat: number
  exp: number
}
```

### Configuração do Cookie
```typescript
const cookieOptions = {
  name: 'session',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: '/',
}
```

### Dependências
```json
{
  "bcryptjs": "^2.4.3",
  "jose": "^5.x"
}
```

> **Nota:** Usamos `jose` ao invés de `jsonwebtoken` porque `jose` é compatível com Edge Runtime (Vercel middleware).

## Segurança

| Medida | Implementação |
|---|---|
| Hash de senha | bcrypt com salt rounds = 12 |
| Cookie session | httpOnly, secure, sameSite=lax |
| JWT signing | HMAC-SHA256 com secret env var |
| JWT expiration | 7 dias |
| Rate limiting | Máximo 5 tentativas/minuto por IP |
| Error messages | Genéricas ("Credenciais inválidas") |
| Input validation | Zod schemas em todos os endpoints |

## Consequências

### Positivas
- Implementação simples e rápida
- Sem dependência de serviço externo
- Controle total sobre UX de autenticação
- Compatível com Edge Runtime

### Negativas
- Sem OAuth social (Google, GitHub) no MVP
- Sem recuperação de senha no MVP
- Sem MFA/2FA no MVP
- Responsabilidade total por segurança

### Evolução Futura
| Feature | Versão | Abordagem |
|---|---|---|
| Recuperação de senha | v1.1 | Token + e-mail (Resend/SendGrid) |
| OAuth social | v1.2 | Migrar para NextAuth.js |
| MFA/2FA | v2.0 | TOTP com QR code |
| Magic links | v1.3 | Token + e-mail |

## Referências
- [jose library (Edge-compatible JWT)](https://github.com/panva/jose)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
