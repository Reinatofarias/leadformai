# Spec Driven — Fluxos de Negócio e Regras

> **Versão:** 1.0.0  
> **Data:** 2026-06-24  
> **Status:** Draft  

---

## 1. Fluxo de Autenticação

### 1.1 Registro

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend (/register)
    participant S as Server Action
    participant Z as Zod Validation
    participant DB as Prisma/PostgreSQL
    participant J as JWT (jose)

    U->>F: Preenche nome, email, senha, workspace
    F->>S: registerAction(formData)
    S->>Z: registerSchema.parse(data)
    
    alt Validação falhou
        Z-->>S: ZodError
        S-->>F: { error: field errors }
        F-->>U: Exibe erros nos campos
    end

    S->>DB: findUnique({ email })
    
    alt Email já existe
        DB-->>S: User found
        S-->>F: { error: "E-mail já cadastrado" }
        F-->>U: Exibe erro
    end

    S->>S: bcrypt.hash(password, 12)
    S->>DB: transaction: create User + Workspace
    DB-->>S: { user, workspace }
    S->>J: signJWT({ userId, workspaceId, email })
    J-->>S: token
    S->>S: cookies().set('session', token, options)
    S-->>F: redirect('/dashboard')
```

### 1.2 Login

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend (/login)
    participant S as Server Action
    participant DB as Prisma/PostgreSQL
    participant J as JWT (jose)

    U->>F: Preenche email e senha
    F->>S: loginAction(formData)
    S->>DB: findUnique({ email }, include: workspaces)
    
    alt Usuário não encontrado
        DB-->>S: null
        S-->>F: { error: "Credenciais inválidas" }
    end

    S->>S: bcrypt.compare(password, user.passwordHash)
    
    alt Senha incorreta
        S-->>F: { error: "Credenciais inválidas" }
    end

    S->>J: signJWT({ userId, workspaceId, email })
    S->>S: cookies().set('session', token)
    S-->>F: redirect('/dashboard')
```

### 1.3 Middleware de Proteção

```mermaid
flowchart TD
    A[Request para /dashboard/*] --> B{Cookie 'session' existe?}
    B -- Não --> C[Redirect /login]
    B -- Sim --> D{JWT válido?}
    D -- Não --> C
    D -- Sim --> E{JWT expirado?}
    E -- Sim --> C
    E -- Não --> F[Extrair userId + workspaceId]
    F --> G[Injetar headers x-user-id, x-workspace-id]
    G --> H[Next Response: continue]
```

---

## 2. Fluxo de Gestão de Funis

### 2.1 Criação de Funil

```mermaid
sequenceDiagram
    actor U as Usuário
    participant E as Editor Page
    participant S as Server Action
    participant DB as Prisma

    U->>E: Preenche nome do funil
    E->>E: Auto-gera slug (kebab-case)
    U->>E: Clica "Criar Funil"
    E->>S: createFunnel({ name, slug })
    S->>S: getWorkspaceId() from JWT
    S->>DB: findUnique({ slug })
    
    alt Slug já existe
        DB-->>S: Funnel found
        S-->>E: { error: "Slug já existe" }
        E-->>U: Exibe erro, sugere alternativa
    end

    S->>DB: create({ workspaceId, name, slug, status: DRAFT, theme: default })
    DB-->>S: funnel
    S-->>E: redirect('/dashboard/funnels/{id}/edit')
```

### 2.2 Publicação de Funil

```mermaid
flowchart TD
    A[Usuário clica "Publicar"] --> B{Funil tem ≥ 1 etapa?}
    B -- Não --> C[Erro: "Adicione pelo menos 1 etapa"]
    B -- Sim --> D[Atualiza status → PUBLISHED]
    D --> E[Exibe link público: /f/slug]
    E --> F[Botão "Copiar Link"]
    
    G[Usuário clica "Despublicar"] --> H[Atualiza status → DRAFT]
    H --> I[Funil retorna 404 na URL pública]
```

### 2.3 Duplicação de Funil

```mermaid
sequenceDiagram
    actor U as Usuário
    participant S as Server Action
    participant DB as Prisma

    U->>S: duplicateFunnel(funnelId)
    S->>S: getWorkspaceId()
    S->>DB: findFirst({ id: funnelId, workspaceId }, include: steps)
    
    alt Funil não encontrado
        S-->>U: 404
    end

    S->>S: newSlug = originalSlug + "-copia"
    S->>DB: Verifica slug único
    S->>DB: transaction {
    Note over S,DB: 1. Cria funil com "(cópia)" no nome
    Note over S,DB: 2. Cria todas as etapas do original
    Note over S,DB: 3. Status = DRAFT
    Note over S,DB: 4. NÃO copia leads/eventos
    S->>DB: }
    DB-->>S: newFunnel
    S-->>U: redirect('/dashboard/funnels/{newId}/edit')
```

---

## 3. Fluxo do Editor de Etapas

### 3.1 Adição de Etapa

```mermaid
flowchart TD
    A[Usuário clica "Adicionar Etapa"] --> B[Abre modal de seleção]
    B --> C{Tipo selecionado}
    C --> D[WELCOME]
    C --> E[MULTIPLE_CHOICE]
    C --> F[OPEN_QUESTION]
    C --> G[CAPTURE_FORM]
    C --> H[LOADING]
    C --> I[RESULT]
    C --> J[REDIRECT]
    
    D --> K[Cria etapa com order = último + 1]
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L[Abre formulário de configuração]
    L --> M[Usuário configura campos]
    M --> N[Salva config como JSON]
    N --> O[Atualiza lista de etapas]
```

### 3.2 Reordenação de Etapas

```mermaid
sequenceDiagram
    actor U as Usuário
    participant E as Editor
    participant S as Server Action
    participant DB as Prisma

    U->>E: Clica "Mover para cima" na etapa 3
    E->>S: reorderStep(stepId, direction: 'up')
    S->>DB: Busca etapa atual (order: 3) e anterior (order: 2)
    S->>DB: transaction {
    Note over S,DB: Etapa 3 → order: 2
    Note over S,DB: Etapa 2 → order: 3
    S->>DB: }
    DB-->>S: steps updated
    S-->>E: Retorna etapas reordenadas
    E-->>U: Atualiza lista visual
```

---

## 4. Fluxo do Funil Público

### 4.1 Experiência do Visitante

```mermaid
stateDiagram-v2
    [*] --> CarregarFunil : Acessa /f/slug
    
    CarregarFunil --> Erro404 : Funil não publicado
    CarregarFunil --> IniciarSessao : Funil encontrado
    
    IniciarSessao --> GerarSessionId
    GerarSessionId --> CapturarUTMs
    CapturarUTMs --> RegistrarEvento : FUNNEL_STARTED
    RegistrarEvento --> RenderizarEtapa
    
    state RenderizarEtapa {
        [*] --> Welcome
        Welcome --> MultipleChoice
        MultipleChoice --> OpenQuestion
        OpenQuestion --> CaptureForm
        CaptureForm --> Loading
        Loading --> Result
        Result --> Redirect
    }
    
    RenderizarEtapa --> CalcularScore
    CalcularScore --> ClassificarLead
    ClassificarLead --> SalvarLead
    SalvarLead --> Redirecionamento
    
    Redirecionamento --> WhatsApp : redirectType = whatsapp
    Redirecionamento --> URLExterna : redirectType = external_url
    Redirecionamento --> PaginaFinal : redirectType = internal_page
    
    WhatsApp --> [*]
    URLExterna --> [*]
    PaginaFinal --> [*]
```

### 4.2 Tracking de Eventos por Etapa

```mermaid
sequenceDiagram
    actor V as Visitante
    participant R as Renderer (Client)
    participant API as /api/public/events
    participant DB as Prisma

    Note over V,R: Etapa renderizada
    R->>API: POST { funnelId, sessionId, eventType: STEP_VIEWED, stepId }
    API->>DB: create FunnelEvent
    
    V->>R: Responde/interage com a etapa
    R->>R: Salva resposta no state local
    R->>R: Acumula score (se múltipla escolha)
    
    R->>API: POST { eventType: STEP_COMPLETED, stepId, metadata: { answer, score } }
    API->>DB: create FunnelEvent
    
    R->>R: Avalia condição de pulo
    
    alt Tem goToStep definido
        R->>R: Pula para etapa específica
    else Sem condição
        R->>R: Avança para próxima etapa
    end
```

### 4.3 Captura Progressiva de Lead

```mermaid
sequenceDiagram
    actor V as Visitante
    participant R as Renderer
    participant API as /api/public/leads
    participant DB as Prisma

    Note over V,R: Visitante chega na etapa CAPTURE_FORM
    V->>R: Preenche nome, email, telefone
    R->>API: POST { funnelId, sessionId, name, email, phone, utms... }
    API->>DB: findFirst({ funnelId, sessionId })
    
    alt Lead já existe (mesma sessão)
        API->>DB: update({ name, email, phone })
    else Lead novo
        API->>DB: create({ funnelId, sessionId, name, email, phone, utms })
    end
    
    DB-->>API: lead
    API-->>R: { leadId }
    R->>R: Armazena leadId no state
    
    Note over V,R: Ao finalizar o funil
    R->>R: calculateScore(answers)
    R->>R: classifyLead(normalizedScore)
    R->>API: PUT { leadId, answers, score, classification }
    API->>DB: update lead with score + classification
```

---

## 5. Regras de Negócio Detalhadas

### 5.1 Regras de Acesso

| Regra | Descrição | Implementação |
|---|---|---|
| RN-001 | Usuário só acessa dados do próprio workspace | `workspaceId` em todas as queries |
| RN-002 | Funil público só é acessível se status = PUBLISHED | Validação em `/f/[slug]` |
| RN-003 | Slug de funil é único globalmente | Constraint unique + validação na aplicação |
| RN-004 | Rotas `/dashboard/*` requerem autenticação | Middleware JWT |
| RN-005 | Dados sensíveis (IP, user agent) são opcionais | Captura controlável |

### 5.2 Regras de Funil

| Regra | Descrição | Implementação |
|---|---|---|
| RN-010 | Funil é criado com status DRAFT | Default no schema |
| RN-011 | Publicação requer ≥ 1 etapa | Validação na server action |
| RN-012 | Slug auto-gerado do nome (kebab-case) | Função `generateSlug()` |
| RN-013 | Slug deve conter apenas `[a-z0-9-]` | Regex validation no Zod |
| RN-014 | Duplicação não copia leads/eventos | Lógica na server action |
| RN-015 | Exclusão remove tudo (cascade) | onDelete: Cascade no Prisma |

### 5.3 Regras de Pontuação

| Regra | Descrição | Implementação |
|---|---|---|
| RN-020 | Score calculado pela soma dos pesos das respostas | `calculateScore()` |
| RN-021 | Score normalizado para 0-100 | `normalizeScore()` |
| RN-022 | Classificação: 0-30 Frio, 31-60 Morno, 61-85 Quente, 86-100 Muito Quente | `classifyLead()` |
| RN-023 | Apenas MULTIPLE_CHOICE contribui para score | Filtro por `stepType` |
| RN-024 | Score 0 se não há perguntas com pontuação | Retorno default |

### 5.4 Regras de Lead

| Regra | Descrição | Implementação |
|---|---|---|
| RN-030 | Lead é identificado por `funnelId + sessionId` | Upsert no capture |
| RN-031 | Lead pode ser criado parcialmente | Campos opcionais no schema |
| RN-032 | Lead é atualizado ao finalizar (score, classificação) | Update no completion |
| RN-033 | UTMs capturados da URL ao iniciar | `useUtm()` hook |
| RN-034 | SessionId gerado no cliente (UUID) | `crypto.randomUUID()` |
| RN-035 | Um visitante = um sessionId por funil | SessionStorage scoped |

### 5.5 Regras de Eventos

| Regra | Descrição | Implementação |
|---|---|---|
| RN-040 | Evento registrado ao visualizar cada etapa | STEP_VIEWED |
| RN-041 | Evento registrado ao completar cada etapa | STEP_COMPLETED |
| RN-042 | Evento de início registrado ao carregar funil | FUNNEL_STARTED |
| RN-043 | Evento de conclusão ao finalizar funil | FUNNEL_COMPLETED |
| RN-044 | Evento de captura ao salvar dados do lead | LEAD_CAPTURED |
| RN-045 | Evento de redirect ao clicar no CTA | REDIRECT_CLICKED |

### 5.6 Regras de WhatsApp

| Regra | Descrição | Implementação |
|---|---|---|
| RN-050 | Número WhatsApp configurável por funil | Campo no Funnel |
| RN-051 | Mensagem aceita variáveis com `{{variavel}}` | Template engine simples |
| RN-052 | Link formato: `wa.me/55NUMERO?text=MSG` | `buildWhatsAppUrl()` |
| RN-053 | Variáveis: nome, email, telefone, pontuacao, classificacao, funil | Substituição dinâmica |
| RN-054 | Link abre em nova aba | `target="_blank"` |

### 5.7 Regras de Templates

| Regra | Descrição | Implementação |
|---|---|---|
| RN-060 | Templates são funis marcados com `isTemplate = true` | Flag no Funnel |
| RN-061 | "Usar template" cria cópia editável no workspace | Clone de funil + steps |
| RN-062 | Templates populados via seed | `prisma/seed.ts` |
| RN-063 | Templates não aparecem na lista de funis do usuário | Filtro `isTemplate: false` |
| RN-064 | Funil criado de template é independente do template | Cópia completa |

---

## 6. Tratamento de Erros

### 6.1 Erros de Autenticação

| Código | Situação | Mensagem (PT-BR) | Ação |
|---|---|---|---|
| 400 | Dados inválidos | Erros específicos por campo | Exibir inline |
| 401 | Credenciais inválidas | "E-mail ou senha incorretos" | Exibir no form |
| 401 | Token expirado | — | Redirect para /login |
| 409 | Email já cadastrado | "Este e-mail já está cadastrado" | Exibir inline |
| 429 | Rate limit excedido | "Muitas tentativas. Tente novamente em X minutos" | Exibir no form |

### 6.2 Erros de Funil

| Código | Situação | Mensagem | Ação |
|---|---|---|---|
| 400 | Slug inválido | "Slug deve conter apenas letras minúsculas, números e hífens" | Inline |
| 400 | Publicar sem etapas | "Adicione pelo menos 1 etapa antes de publicar" | Toast |
| 404 | Funil não encontrado | "Funil não encontrado" | Página 404 |
| 409 | Slug duplicado | "Este slug já está em uso. Tente outro." | Inline |

### 6.3 Erros de Funil Público

| Código | Situação | Mensagem | Ação |
|---|---|---|---|
| 404 | Funil não publicado | "Este funil não está disponível no momento" | Página 404 amigável |
| 500 | Erro ao salvar lead | — | Retry silencioso (3x) |
| 500 | Erro ao registrar evento | — | Fail silently (não bloquear UX) |

---

## 7. Limites e Validações

| Recurso | Limite | Motivo |
|---|---|---|
| Nome do funil | 100 caracteres | UX |
| Slug do funil | 100 caracteres | URL |
| Etapas por funil | 50 | Performance |
| Opções por múltipla escolha | 20 | UX |
| Score por opção | 0-100 | Normalização |
| Duração do loading | 1-10 segundos | UX |
| Campos no formulário de captura | 10 | UX |
| Mensagem WhatsApp | 1000 caracteres | Limite WhatsApp |
| Leads por página (listagem) | 20 | Performance |
| Funis por página (listagem) | 20 | Performance |

---

## 8. WhatsApp — Motor de Templates

### 8.1 Processamento de Variáveis

```typescript
// lib/whatsapp.ts

interface WhatsAppData {
  nome?: string
  email?: string
  telefone?: string
  empresa?: string
  cidade?: string
  pontuacao?: number
  classificacao?: string
  funil?: string
}

/**
 * Substitui variáveis na mensagem do WhatsApp
 */
export function processWhatsAppMessage(
  template: string,
  data: WhatsAppData
): string {
  const variables: Record<string, string> = {
    '{{nome}}': data.nome || '',
    '{{email}}': data.email || '',
    '{{telefone}}': data.telefone || '',
    '{{empresa}}': data.empresa || '',
    '{{cidade}}': data.cidade || '',
    '{{pontuacao}}': data.pontuacao?.toString() || '0',
    '{{classificacao}}': data.classificacao || '',
    '{{funil}}': data.funil || '',
  }

  let message = template
  for (const [variable, value] of Object.entries(variables)) {
    message = message.replaceAll(variable, value)
  }

  return message
}

/**
 * Gera a URL completa do WhatsApp
 */
export function buildWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  // Remove tudo que não é número
  const cleanNumber = phoneNumber.replace(/\D/g, '')
  
  // Garante DDI 55 (Brasil)
  const fullNumber = cleanNumber.startsWith('55') 
    ? cleanNumber 
    : `55${cleanNumber}`
  
  const encodedMessage = encodeURIComponent(message)
  
  return `https://wa.me/${fullNumber}?text=${encodedMessage}`
}
```

### 8.2 Exemplo Completo

**Template configurado:**
```
Olá, meu nome é {{nome}}. Acabei de preencher o diagnóstico "{{funil}}" e minha classificação foi {{classificacao}}. Meu score é {{pontuacao}}/100.
```

**Dados do lead:**
```json
{
  "nome": "João Silva",
  "funil": "Diagnóstico de Marketing Digital",
  "classificacao": "Quente",
  "pontuacao": 78
}
```

**Resultado:**
```
Olá, meu nome é João Silva. Acabei de preencher o diagnóstico "Diagnóstico de Marketing Digital" e minha classificação foi Quente. Meu score é 78/100.
```

**URL gerada:**
```
https://wa.me/5511999999999?text=Ol%C3%A1%2C%20meu%20nome%20%C3%A9%20Jo%C3%A3o%20Silva...
```

---

## 9. UTM — Captura e Persistência

### 9.1 Parâmetros Suportados

| Parâmetro | Exemplo | Uso |
|---|---|---|
| `utm_source` | `google`, `facebook`, `instagram` | Origem do tráfego |
| `utm_medium` | `cpc`, `social`, `email` | Meio/canal |
| `utm_campaign` | `lancamento-curso`, `black-friday` | Nome da campanha |
| `utm_content` | `banner-azul`, `video-1` | Variação do anúncio |
| `utm_term` | `marketing+digital`, `agencia` | Palavra-chave |

### 9.2 Fluxo de Captura

```typescript
// hooks/use-utm.ts
export function useUtm() {
  const searchParams = useSearchParams()
  
  return {
    utmSource: searchParams.get('utm_source'),
    utmMedium: searchParams.get('utm_medium'),
    utmCampaign: searchParams.get('utm_campaign'),
    utmContent: searchParams.get('utm_content'),
    utmTerm: searchParams.get('utm_term'),
  }
}
```

### 9.3 URL de Exemplo

```
https://app.leadflow.ai/f/diagnostico-marketing?utm_source=facebook&utm_medium=cpc&utm_campaign=lancamento-q3&utm_content=video-depoimento
```
