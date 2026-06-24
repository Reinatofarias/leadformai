# PRD — LeadFlow AI

> **Versão:** 1.0.0  
> **Data:** 2026-06-24  
> **Status:** Draft  
> **Autor:** Equipe de Produto  

---

## 1. Visão Geral do Produto

### 1.1 Nome do Produto
**LeadFlow AI** — Plataforma SaaS para criação de funis interativos, quizzes, páginas de captura e qualificação automática de leads.

### 1.2 Declaração do Problema
Muitas campanhas de tráfego pago direcionam usuários para páginas estáticas ou formulários frios. Isso gera:
- Leads pouco qualificados
- Atendimento ineficiente
- Baixa taxa de conversão
- Desperdício de investimento em mídia paga

Não existe uma solução brasileira acessível que permita criar jornadas interativas com qualificação automática, integração nativa com WhatsApp e analytics de conversão — tudo sem necessidade de programação.

### 1.3 Proposta de Valor
> "Crie funis interativos que qualificam leads automaticamente e enviam os contatos certos para o WhatsApp, CRM ou automação."

### 1.4 Objetivos do MVP
| Objetivo | Métrica de Sucesso | Meta |
|---|---|---|
| Permitir criação de funis sem código | Tempo médio para criar funil | < 15 minutos |
| Capturar leads qualificados | Taxa de conclusão do funil | > 60% |
| Qualificar leads automaticamente | % de leads classificados | 100% |
| Integrar com WhatsApp | % de funis com WhatsApp configurado | > 70% |
| Fornecer analytics acionáveis | Usuários que acessam analytics | > 50% |

---

## 2. Público-Alvo

### 2.1 Personas Primárias

#### Persona 1: Gestor de Tráfego — "Carlos"
- **Idade:** 28-35 anos
- **Contexto:** Gerencia campanhas de tráfego pago para 10-20 clientes
- **Dor:** Precisa qualificar leads antes de enviar para o time comercial do cliente
- **Necessidade:** Ferramenta rápida para criar funis por nicho com integração WhatsApp
- **Comportamento:** Usa celular constantemente, precisa de interface mobile-friendly

#### Persona 2: Agência de Marketing — "Marina"
- **Idade:** 30-40 anos
- **Contexto:** Dona de agência com 5-15 funcionários
- **Dor:** Clientes reclamam de leads frios vindos de campanhas
- **Necessidade:** Plataforma white-label para oferecer como serviço adicional
- **Comportamento:** Valoriza templates prontos e personalização visual

#### Persona 3: Infoprodutor — "Rafael"
- **Idade:** 25-45 anos
- **Contexto:** Vende cursos online e mentorias
- **Dor:** Precisa segmentar audiência antes de oferecer produtos
- **Necessidade:** Quizzes que direcionam para ofertas diferentes baseado em perfil
- **Comportamento:** Focado em conversão, usa muito WhatsApp

#### Persona 4: Empresa Local — "Dona Fátima"
- **Idade:** 35-55 anos
- **Contexto:** Tem uma clínica de estética e investe em anúncios
- **Dor:** Recebe muitos leads que não fecham
- **Necessidade:** Filtrar leads qualificados antes do contato
- **Comportamento:** Pouco técnica, precisa de simplicidade

### 2.2 Nichos-Alvo Prioritários
1. Climatização (ar-condicionado)
2. Energia solar
3. Imobiliário
4. Estética e saúde
5. Educação e infoprodutos
6. Jurídico
7. Serviços premium e consultorias

---

## 3. Funcionalidades do MVP

### 3.1 Autenticação e Gestão de Usuários

#### F-001: Cadastro de Usuário
**Prioridade:** P0 (Crítica)

**Descrição:** O sistema deve permitir o cadastro de novos usuários com criação automática de workspace.

**Campos obrigatórios:**
| Campo | Tipo | Validação |
|---|---|---|
| Nome completo | `string` | Mín. 2 caracteres |
| E-mail | `string` | Formato válido, único |
| Senha | `string` | Mín. 8 caracteres, 1 maiúscula, 1 número |
| Nome do workspace | `string` | Mín. 2 caracteres |

**Critérios de Aceitação:**
- [ ] Usuário pode se cadastrar com nome, e-mail, senha e workspace
- [ ] E-mail duplicado retorna erro amigável
- [ ] Senha é armazenada com hash (bcrypt)
- [ ] Workspace é criado automaticamente vinculado ao usuário
- [ ] Após cadastro, redireciona para `/dashboard`
- [ ] Validação em tempo real nos campos do formulário

#### F-002: Login
**Prioridade:** P0 (Crítica)

**Descrição:** Sistema de login seguro com sessão persistente.

**Critérios de Aceitação:**
- [ ] Usuário pode fazer login com e-mail e senha
- [ ] Credenciais inválidas retornam erro genérico (segurança)
- [ ] Sessão persiste por 7 dias (cookie httpOnly)
- [ ] Redirecionamento para `/dashboard` após login bem-sucedido
- [ ] Proteção contra brute-force (rate limiting)

#### F-003: Logout
**Prioridade:** P0 (Crítica)

**Critérios de Aceitação:**
- [ ] Usuário pode fazer logout de qualquer página autenticada
- [ ] Sessão é invalidada no servidor
- [ ] Redirecionamento para `/login`

---

### 3.2 Dashboard Principal

#### F-010: Visão Geral do Dashboard
**Prioridade:** P0 (Crítica)

**Descrição:** Tela principal após login com resumo de métricas e acesso rápido às funcionalidades.

**Métricas exibidas:**
| Métrica | Cálculo |
|---|---|
| Total de funis criados | `COUNT(funnels)` do workspace |
| Total de visitantes | `COUNT(DISTINCT sessionId)` em FunnelEvent |
| Total de leads capturados | `COUNT(leads)` do workspace |
| Taxa de conversão geral | `(leads / visitantes) * 100` |

**Componentes da tela:**
- Cards de métricas com ícones e valores
- Lista dos 5 funis mais recentes com status
- Botão "Criar novo funil" em destaque
- Gráfico de leads dos últimos 7/30 dias

**Critérios de Aceitação:**
- [ ] Dashboard carrega em menos de 2 segundos
- [ ] Métricas são calculadas apenas para o workspace do usuário logado
- [ ] Cards de métricas são responsivos
- [ ] Lista de funis recentes mostra nome, status e data
- [ ] Botão de criar funil redireciona para `/dashboard/funnels/new`

---

### 3.3 CRUD de Funis

#### F-020: Listar Funis
**Prioridade:** P0 (Crítica)

**Descrição:** Página com lista de todos os funis do workspace.

**Informações por funil:**
- Nome
- Slug (link público)
- Status (Rascunho / Publicado)
- Quantidade de leads
- Data de criação
- Ações (Editar, Duplicar, Publicar/Despublicar, Excluir)

**Critérios de Aceitação:**
- [ ] Lista apenas funis do workspace do usuário
- [ ] Ordenação padrão: mais recente primeiro
- [ ] Busca por nome de funil
- [ ] Filtro por status (Todos, Rascunho, Publicado)
- [ ] Ações rápidas disponíveis para cada funil
- [ ] Paginação ou scroll infinito para >20 funis

#### F-021: Criar Funil
**Prioridade:** P0 (Crítica)

**Campos:**
| Campo | Tipo | Obrigatório | Padrão |
|---|---|---|---|
| Nome | `string` | Sim | — |
| Slug | `string` | Sim | Auto-gerado do nome |
| Status | `enum` | Não | `DRAFT` |
| Tema visual | `JSON` | Não | Tema padrão |
| Número WhatsApp | `string` | Não | — |
| Mensagem WhatsApp | `string` | Não | Template padrão |

**Critérios de Aceitação:**
- [ ] Slug é gerado automaticamente a partir do nome (kebab-case)
- [ ] Slug é validado como único globalmente
- [ ] Após criar, redireciona para o editor de funil
- [ ] Funil é criado com status `DRAFT`
- [ ] Tema padrão é aplicado automaticamente

#### F-022: Editar Funil
**Prioridade:** P0 (Crítica)

**Critérios de Aceitação:**
- [ ] Todos os campos do funil são editáveis
- [ ] Slug pode ser alterado (validação de unicidade)
- [ ] Alterações são salvas com feedback visual
- [ ] Não é possível editar funil de outro workspace

#### F-023: Duplicar Funil
**Prioridade:** P1 (Alta)

**Critérios de Aceitação:**
- [ ] Cria cópia do funil com todas as etapas
- [ ] Nome recebe sufixo " (cópia)"
- [ ] Slug recebe sufixo "-copia" (validado como único)
- [ ] Status da cópia é sempre `DRAFT`
- [ ] Leads NÃO são copiados

#### F-024: Publicar / Despublicar Funil
**Prioridade:** P0 (Crítica)

**Critérios de Aceitação:**
- [ ] Funil pode ser publicado se tiver pelo menos 1 etapa
- [ ] Ao publicar, status muda para `PUBLISHED`
- [ ] Ao despublicar, status muda para `DRAFT`
- [ ] Funil despublicado retorna 404 na rota pública
- [ ] Feedback visual de confirmação

#### F-025: Excluir Funil
**Prioridade:** P1 (Alta)

**Critérios de Aceitação:**
- [ ] Confirmação antes de excluir (modal)
- [ ] Exclusão remove funil, etapas, eventos e leads associados
- [ ] Exclusão lógica (soft delete) ou hard delete com confirmação dupla
- [ ] Feedback visual de sucesso

---

### 3.4 Editor de Funil

#### F-030: Editor de Etapas
**Prioridade:** P0 (Crítica)

**Descrição:** Interface para adicionar, ordenar e configurar etapas do funil sequencialmente. No MVP, sem drag-and-drop avançado.

**Tipos de Etapa:**

| Tipo | Identificador | Descrição |
|---|---|---|
| Tela de boas-vindas | `WELCOME` | Primeira tela com título, subtítulo, imagem e botão |
| Múltipla escolha | `MULTIPLE_CHOICE` | Pergunta com opções de resposta |
| Pergunta aberta | `OPEN_QUESTION` | Campo livre: texto, número, telefone ou e-mail |
| Formulário de captura | `CAPTURE_FORM` | Formulário com campos de contato |
| Tela de loading | `LOADING` | Animação de carregamento com texto dinâmico |
| Tela de resultado | `RESULT` | Resultado baseado na pontuação |
| Redirecionamento | `REDIRECT` | Redireciona para WhatsApp, URL ou página final |

**Critérios de Aceitação:**
- [ ] Usuário pode adicionar etapas de qualquer tipo
- [ ] Etapas são ordenadas sequencialmente (campo `order`)
- [ ] Cada etapa pode ser editada individualmente
- [ ] Cada etapa pode ser removida com confirmação
- [ ] Reordenação por botões (mover para cima/baixo)
- [ ] Preview de cada etapa no editor
- [ ] Configurações específicas por tipo de etapa

#### F-031: Configuração — Tela de Boas-vindas (`WELCOME`)
**Campos configuráveis:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Título | `string` | Sim |
| Subtítulo | `string` | Não |
| URL da imagem | `string` | Não |
| Texto do botão | `string` | Sim (padrão: "Começar") |

#### F-032: Configuração — Múltipla Escolha (`MULTIPLE_CHOICE`)
**Campos configuráveis:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Título da pergunta | `string` | Sim |
| Descrição | `string` | Não |
| Opções de resposta | `Array<Option>` | Sim (mín. 2) |

**Cada opção:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Texto da opção | `string` | Sim |
| Pontuação/peso | `number` | Não (padrão: 0) |
| Variável a salvar | `string` | Não |
| Ir para etapa (condicional) | `number` | Não |

#### F-033: Configuração — Pergunta Aberta (`OPEN_QUESTION`)
**Campos configuráveis:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Título da pergunta | `string` | Sim |
| Tipo de campo | `enum` | Sim |
| Placeholder | `string` | Não |
| Obrigatório | `boolean` | Sim (padrão: true) |

**Tipos de campo:** `text`, `number`, `phone`, `email`

#### F-034: Configuração — Formulário de Captura (`CAPTURE_FORM`)
**Campos configuráveis (cada campo é ativável):**
| Campo | Ativável | Obrigatório por padrão |
|---|---|---|
| Nome | Sim | Sim |
| E-mail | Sim | Sim |
| Telefone | Sim | Não |
| Empresa | Sim | Não |
| Cidade | Sim | Não |
| Campo personalizado (label + tipo) | Sim | Não |

#### F-035: Configuração — Tela de Loading (`LOADING`)
**Campos configuráveis:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Texto dinâmico | `string` | Sim (padrão: "Analisando suas respostas...") |
| Duração (segundos) | `number` | Sim (padrão: 3) |

#### F-036: Configuração — Tela de Resultado (`RESULT`)
**Campos configuráveis:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Título | `string` | Sim |
| Texto personalizado | `string` | Não |
| Mostrar pontuação | `boolean` | Não (padrão: false) |
| Mostrar classificação | `boolean` | Não (padrão: true) |
| Resultados condicionais | `Array<ConditionalResult>` | Não |

**Resultado condicional:**
| Campo | Tipo |
|---|---|
| Faixa de pontuação (min-max) | `number-number` |
| Título do resultado | `string` |
| Texto do resultado | `string` |
| CTA (texto + URL/WhatsApp) | `object` |

#### F-037: Configuração — Redirecionamento (`REDIRECT`)
**Campos configuráveis:**
| Campo | Tipo | Obrigatório |
|---|---|---|
| Tipo de redirecionamento | `enum` | Sim |
| URL de destino | `string` | Condicional |
| Número WhatsApp | `string` | Condicional |
| Mensagem WhatsApp | `string` | Condicional |

**Tipos:** `whatsapp`, `external_url`, `internal_page`

---

### 3.5 Lógica Condicional e Pontuação

#### F-040: Sistema de Pontuação
**Prioridade:** P0 (Crítica)

**Regras:**
- Cada opção de múltipla escolha pode ter um peso/pontuação (0-100)
- A pontuação total é a soma das pontuações das respostas
- A pontuação é normalizada para uma escala de 0 a 100

**Classificação automática:**
| Faixa | Classificação | Identificador |
|---|---|---|
| 0 — 30 pontos | Lead Frio | `COLD` |
| 31 — 60 pontos | Lead Morno | `WARM` |
| 61 — 85 pontos | Lead Quente | `HOT` |
| 86 — 100 pontos | Lead Muito Quente | `VERY_HOT` |

**Critérios de Aceitação:**
- [ ] Pontuação é calculada em tempo real durante o funil
- [ ] Classificação é atribuída automaticamente ao finalizar
- [ ] Faixas de classificação são as padrão (configuráveis no futuro)
- [ ] Pontuação e classificação são salvas no registro do lead

#### F-041: Regras Condicionais Simples
**Prioridade:** P1 (Alta)

**Regras suportadas no MVP:**
1. **Pular para etapa:** Se resposta for X, ir para etapa Y
2. **Resultado condicional:** Se pontuação > X, mostrar resultado A; senão, resultado B
3. **Redirecionamento condicional:** Baseado na classificação do lead

**Critérios de Aceitação:**
- [ ] Configuração de "ir para etapa" por opção de resposta
- [ ] Avaliação de regras de pontuação na tela de resultado
- [ ] Fluxo não quebra se regra condicional não for configurada (fallback: próxima etapa)

---

### 3.6 Captura de Leads

#### F-050: Registro de Lead
**Prioridade:** P0 (Crítica)

**Dados capturados:**
| Campo | Fonte | Obrigatório |
|---|---|---|
| Nome | Formulário de captura | Configurável |
| E-mail | Formulário de captura | Configurável |
| Telefone | Formulário de captura | Configurável |
| Empresa | Formulário de captura | Configurável |
| Cidade | Formulário de captura | Configurável |
| Respostas | Coleta progressiva | Automático |
| Pontuação | Cálculo automático | Automático |
| Classificação | Cálculo automático | Automático |
| Funil de origem | Contexto | Automático |
| UTM Source | URL | Automático |
| UTM Medium | URL | Automático |
| UTM Campaign | URL | Automático |
| UTM Content | URL | Automático |
| UTM Term | URL | Automático |
| Data/hora | Sistema | Automático |
| IP | Request (opcional) | Automático |
| User Agent | Request (opcional) | Automático |

**Critérios de Aceitação:**
- [ ] Lead é criado quando visitante preenche formulário de captura
- [ ] Respostas são salvas progressivamente (não perde dados se abandonar)
- [ ] UTMs são capturados da URL ao iniciar o funil
- [ ] SessionId é gerado no início da sessão
- [ ] Lead pode ser atualizado (respostas adicionais, score, classificação)
- [ ] Dados sensíveis (IP, user agent) são opcionais

---

### 3.7 Página Pública do Funil

#### F-060: Renderização Pública
**Prioridade:** P0 (Crítica)

**Rota:** `/f/{slug}`

**Comportamento:**
1. Carrega funil pelo slug
2. Valida se está publicado (404 se não estiver)
3. Gera `sessionId` único para o visitante
4. Captura UTMs da URL
5. Renderiza etapas sequencialmente
6. Registra eventos de navegação
7. Salva respostas progressivamente
8. Calcula pontuação ao finalizar
9. Atribui classificação
10. Salva lead completo
11. Redireciona conforme configuração

**Critérios de Aceitação:**
- [ ] Funil carrega em menos de 1.5 segundos
- [ ] Interface responsiva (mobile-first)
- [ ] Transição suave entre etapas
- [ ] Barra de progresso visual
- [ ] Tema visual do funil é aplicado
- [ ] Funciona sem JavaScript desabilitado (progressive enhancement)
- [ ] SEO básico (meta tags, og:image)

---

### 3.8 WhatsApp Dinâmico

#### F-070: Integração WhatsApp
**Prioridade:** P0 (Crítica)

**Formato do link:**
```
https://wa.me/55{numero}?text={mensagem_codificada}
```

**Variáveis suportadas na mensagem:**
| Variável | Descrição | Exemplo |
|---|---|---|
| `{{nome}}` | Nome do lead | "João Silva" |
| `{{email}}` | E-mail do lead | "joao@email.com" |
| `{{telefone}}` | Telefone do lead | "(11) 99999-9999" |
| `{{pontuacao}}` | Pontuação numérica | "78" |
| `{{classificacao}}` | Classificação textual | "Quente" |
| `{{funil}}` | Nome do funil | "Diagnóstico Solar" |
| `{{empresa}}` | Empresa do lead | "Solar Tech" |
| `{{cidade}}` | Cidade do lead | "São Paulo" |

**Mensagem padrão:**
```
Olá, meu nome é {{nome}}. Acabei de preencher o diagnóstico "{{funil}}" e minha classificação foi {{classificacao}}.
```

**Critérios de Aceitação:**
- [ ] Número de WhatsApp configurável por funil
- [ ] Mensagem personalizada com variáveis
- [ ] Variáveis são substituídas pelos dados reais do lead
- [ ] Link abre em nova aba
- [ ] Número aceita formato com ou sem DDI

---

### 3.9 Painel de Leads

#### F-080: Listagem de Leads
**Prioridade:** P0 (Crítica)

**Colunas da tabela:**
| Coluna | Ordenável | Filtrável |
|---|---|---|
| Nome | Sim | Sim (busca) |
| Telefone | Não | Sim (busca) |
| E-mail | Não | Sim (busca) |
| Funil | Sim | Sim (dropdown) |
| Classificação | Sim | Sim (dropdown) |
| Pontuação | Sim | Não |
| Data | Sim | Sim (range) |

**Critérios de Aceitação:**
- [ ] Lista apenas leads do workspace do usuário
- [ ] Busca por nome, e-mail ou telefone
- [ ] Filtro por funil e classificação
- [ ] Ordenação por qualquer coluna ordenável
- [ ] Paginação (20 leads por página)
- [ ] Exportação CSV (P2 — futuro)
- [ ] Botão "Ver detalhes" para cada lead

#### F-081: Detalhes do Lead
**Prioridade:** P1 (Alta)

**Informações exibidas:**
- Dados pessoais completos
- Todas as respostas com pergunta e resposta
- Pontuação e classificação
- UTMs de origem
- Data/hora de criação
- Link direto para WhatsApp com mensagem pré-preenchida

**Critérios de Aceitação:**
- [ ] Página de detalhe ou modal com todas as informações
- [ ] Respostas exibidas na ordem das etapas
- [ ] Botão de WhatsApp funcional
- [ ] Voltar para lista mantém filtros e página

---

### 3.10 Analytics Básico

#### F-090: Métricas por Funil
**Prioridade:** P1 (Alta)

**Métricas:**
| Métrica | Cálculo |
|---|---|
| Visitantes | `COUNT(DISTINCT sessionId)` por funil |
| Leads capturados | `COUNT(leads)` por funil |
| Taxa de conversão | `(leads / visitantes) * 100` |
| Etapas iniciadas | Eventos de tipo `STEP_STARTED` |
| Etapas concluídas | Eventos de tipo `STEP_COMPLETED` |
| Taxa de abandono por etapa | `1 - (concluíram etapa N / iniciaram etapa N)` |
| Leads por classificação | `GROUP BY classification` |
| Leads por UTM source | `GROUP BY utmSource` |

**Visualizações:**
- Gráfico de funil (conversão por etapa)
- Gráfico de pizza (classificação de leads)
- Gráfico de barras (leads por dia)
- Tabela de UTMs com conversão

**Critérios de Aceitação:**
- [ ] Dados calculados em tempo real ou com cache de 5 minutos
- [ ] Gráficos interativos com Recharts
- [ ] Filtro por período (7 dias, 30 dias, personalizado)
- [ ] Dados apenas do workspace do usuário

---

### 3.11 Templates de Funis

#### F-100: Templates Iniciais
**Prioridade:** P1 (Alta)

**Templates disponíveis:**
| Template | Nicho | Etapas estimadas |
|---|---|---|
| Diagnóstico de Marketing Digital | Agência | 8 etapas |
| Simulador de Economia Solar | Energia Solar | 7 etapas |
| Qualificação de Projeto | Climatização | 6 etapas |
| Encontre seu Imóvel Ideal | Corretor de Imóveis | 7 etapas |
| Diagnóstico Empresarial | Consultoria | 8 etapas |
| Quiz de Lançamento | Infoproduto | 6 etapas |

**Critérios de Aceitação:**
- [ ] Página com galeria de templates
- [ ] Preview do template (nome, descrição, nicho, número de etapas)
- [ ] Botão "Usar este template" cria funil pré-configurado
- [ ] Funil criado a partir de template é totalmente editável
- [ ] Templates incluem perguntas, pontuações e tela final configurada
- [ ] Templates são populados via seed do banco

---

### 3.12 Tema Visual do Funil

#### F-110: Configuração de Aparência
**Prioridade:** P1 (Alta)

**Configurações por funil:**
| Configuração | Tipo | Padrão |
|---|---|---|
| Cor principal | `hex color` | `#6366F1` (indigo) |
| Cor de fundo | `hex color` | `#FFFFFF` |
| Cor do texto | `hex color` | `#1F2937` |
| Logo (URL) | `string` | — |
| Fonte | `enum` | `Inter` |
| Borda arredondada | `number` (px) | `12` |
| Modo claro/escuro | `enum` | `light` |

**Fontes disponíveis:** Inter, Roboto, Outfit, Poppins, Montserrat

**Critérios de Aceitação:**
- [ ] Configurações salvas como JSON no campo `theme` do funil
- [ ] Aplicadas na página pública do funil
- [ ] Preview em tempo real no editor (P2)
- [ ] Tema não afeta interface administrativa

---

## 4. Estrutura de Rotas

### 4.1 Rotas Públicas
| Rota | Descrição | Auth |
|---|---|---|
| `/` | Landing page institucional | Não |
| `/login` | Página de login | Não |
| `/register` | Página de cadastro | Não |
| `/f/{slug}` | Página pública do funil | Não |

### 4.2 Rotas Autenticadas
| Rota | Descrição | Auth |
|---|---|---|
| `/dashboard` | Dashboard principal | Sim |
| `/dashboard/funnels` | Lista de funis | Sim |
| `/dashboard/funnels/new` | Criar novo funil | Sim |
| `/dashboard/funnels/[id]/edit` | Editor de funil | Sim |
| `/dashboard/funnels/[id]/leads` | Leads do funil | Sim |
| `/dashboard/funnels/[id]/analytics` | Analytics do funil | Sim |
| `/dashboard/leads` | Todos os leads | Sim |
| `/dashboard/templates` | Galeria de templates | Sim |

---

## 5. Requisitos Não-Funcionais

### 5.1 Performance
| Requisito | Meta |
|---|---|
| Tempo de carregamento inicial (dashboard) | < 2s |
| Tempo de carregamento (funil público) | < 1.5s |
| Tempo de resposta de API | < 500ms (p95) |
| Lighthouse Performance Score | > 80 |

### 5.2 Segurança
- Senhas com hash bcrypt (salt rounds ≥ 10)
- Sessões com cookies httpOnly, secure, sameSite
- Validação de entrada em todas as APIs (Zod)
- Isolamento de dados por workspace (row-level security)
- Rate limiting em endpoints de autenticação
- Sanitização de inputs contra XSS
- CSRF protection em formulários

### 5.3 Escalabilidade
- Arquitetura stateless (compatível com Vercel serverless)
- Database connection pooling (Supabase pgBouncer)
- Paginação em todas as listagens
- Índices de banco otimizados para queries frequentes

### 5.4 Disponibilidade
- Deploy na Vercel com auto-scaling
- Database no Supabase com backup automático
- Monitoramento de erros (futuro: Sentry)

### 5.5 UX/UI
- Design responsivo (mobile-first)
- Interface moderna, limpa e premium
- Acessibilidade WCAG 2.1 nível A
- Feedback visual para todas as ações
- Loading states em todas as operações assíncronas
- Tema claro no dashboard, customizável nos funis públicos

---

## 6. Fora do Escopo do MVP

Os seguintes itens **não** fazem parte do MVP e serão considerados em versões futuras:

| Feature | Versão Planejada |
|---|---|
| Recuperação de senha | v1.1 |
| Drag-and-drop no editor | v1.2 |
| Integrações com CRMs (RD Station, HubSpot) | v1.2 |
| Webhooks | v1.2 |
| Exportação de leads (CSV/Excel) | v1.1 |
| Multi-idioma | v2.0 |
| White-label | v2.0 |
| Planos e billing | v1.3 |
| Editor visual avançado (WYSIWYG) | v2.0 |
| A/B Testing | v2.0 |
| API pública | v1.3 |
| Notificações por e-mail | v1.1 |
| App mobile nativo | v3.0 |

---

## 7. Métricas de Sucesso do MVP

| KPI | Meta (3 meses) |
|---|---|
| Usuários cadastrados | 100 |
| Funis criados | 300 |
| Leads capturados | 5.000 |
| Taxa média de conversão dos funis | > 40% |
| NPS dos usuários | > 50 |
| Uptime | > 99.5% |

---

## 8. Cronograma de Desenvolvimento

| Fase | Escopo | Duração Estimada |
|---|---|---|
| Fase 1 | Base do projeto, auth, layout, dashboard | 3-4 dias |
| Fase 2 | Models, migrations, seed | 1-2 dias |
| Fase 3 | CRUD de funis | 2-3 dias |
| Fase 4 | Editor de etapas | 3-4 dias |
| Fase 5 | Renderer público (página do funil) | 3-4 dias |
| Fase 6 | Captura, score, classificação, WhatsApp | 2-3 dias |
| Fase 7 | Painel de leads e analytics | 2-3 dias |
| Fase 8 | Templates e polimento | 2-3 dias |
| **Total estimado** | | **18-26 dias** |

---

## 9. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| Performance do funil público em mobile | Alto | Média | Lighthouse testing contínuo, lazy loading |
| Complexidade do editor de etapas | Médio | Alta | Manter simples no MVP, sem drag-and-drop |
| Segurança de dados (LGPD) | Alto | Baixa | Row-level security, criptografia, isolamento |
| Escalabilidade do Supabase free tier | Médio | Média | Monitoramento, upgrade quando necessário |
| UX confusa para não-técnicos | Alto | Média | Testes com personas, templates prontos |

---

## Apêndice A: Glossário

| Termo | Definição |
|---|---|
| **Funil** | Sequência de etapas interativas que o visitante percorre |
| **Etapa (Step)** | Uma tela individual dentro do funil |
| **Lead** | Visitante que preencheu dados de contato no funil |
| **Score** | Pontuação numérica baseada nas respostas |
| **Classificação** | Categorização do lead (Frio/Morno/Quente/Muito Quente) |
| **Workspace** | Espaço isolado de uma empresa/usuário |
| **Slug** | Identificador amigável na URL do funil |
| **UTM** | Parâmetros de rastreamento de campanha |
| **Session** | Sessão única de um visitante no funil |
