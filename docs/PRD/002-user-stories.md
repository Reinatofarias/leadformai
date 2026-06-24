# User Stories — LeadFlow AI MVP

> **Versão:** 1.0.0  
> **Data:** 2026-06-24  
> **Status:** Draft  

---

## Formato

Cada user story segue o formato:

> **Como** [persona], **quero** [ação], **para que** [benefício].

Prioridades:
- 🔴 P0 — Crítica (MVP blocker)
- 🟠 P1 — Alta (MVP desejável)
- 🟡 P2 — Média (Nice-to-have)

---

## Épico 1: Autenticação e Gestão de Conta

### US-001: Cadastro de Usuário 🔴
**Como** gestor de tráfego, **quero** me cadastrar na plataforma com meu nome, e-mail e senha, **para que** eu tenha acesso ao meu workspace e possa criar funis.

**Critérios de Aceitação:**
- Formulário com nome, e-mail, senha e nome do workspace
- Validação em tempo real (e-mail válido, senha forte)
- Feedback de erro se e-mail já existir
- Criação automática de workspace vinculado
- Redirecionamento para dashboard após cadastro

### US-002: Login 🔴
**Como** usuário cadastrado, **quero** fazer login com meu e-mail e senha, **para que** eu acesse meu workspace e meus funis.

**Critérios de Aceitação:**
- Login com e-mail e senha
- Mensagem de erro genérica para credenciais inválidas
- Sessão persistente por 7 dias
- Redirecionamento para dashboard

### US-003: Logout 🔴
**Como** usuário logado, **quero** sair da minha conta, **para que** ninguém acesse meus dados neste dispositivo.

**Critérios de Aceitação:**
- Botão de logout visível na interface
- Invalidação da sessão
- Redirecionamento para login

### US-004: Proteção de Rotas 🔴
**Como** plataforma, **quero** proteger rotas autenticadas, **para que** apenas usuários logados acessem o dashboard.

**Critérios de Aceitação:**
- Acesso a `/dashboard/*` sem sessão redireciona para `/login`
- Middleware de autenticação em todas as rotas protegidas
- Token/sessão validado em cada request

---

## Épico 2: Dashboard

### US-010: Visualizar Dashboard 🔴
**Como** gestor de tráfego, **quero** ver um resumo das minhas métricas ao entrar na plataforma, **para que** eu tenha uma visão geral do desempenho dos meus funis.

**Critérios de Aceitação:**
- Cards com: total de funis, visitantes, leads e taxa de conversão
- Lista dos 5 funis mais recentes
- Botão de criar novo funil em destaque
- Dados filtrados pelo workspace do usuário

### US-011: Acessar Funis Recentes 🟠
**Como** usuário, **quero** ver meus funis recentes no dashboard, **para que** eu acesse rapidamente o que estou trabalhando.

**Critérios de Aceitação:**
- Lista com nome, status e data de criação
- Link para editar cada funil
- Limite de 5 funis mais recentes

---

## Épico 3: Gestão de Funis

### US-020: Listar Meus Funis 🔴
**Como** usuário, **quero** ver todos os meus funis em uma lista, **para que** eu gerencie meus funis ativos e rascunhos.

**Critérios de Aceitação:**
- Lista com nome, slug, status, leads e data
- Busca por nome
- Filtro por status (Todos / Rascunho / Publicado)
- Ordenação por data (mais recente primeiro)
- Paginação para mais de 20 funis

### US-021: Criar Novo Funil 🔴
**Como** gestor de tráfego, **quero** criar um novo funil a partir do zero, **para que** eu configure uma jornada interativa para minha campanha.

**Critérios de Aceitação:**
- Formulário com nome do funil
- Slug gerado automaticamente (editável)
- Validação de slug único
- Criação com status rascunho
- Redirecionamento para editor

### US-022: Editar Funil 🔴
**Como** usuário, **quero** editar nome, slug e configurações do meu funil, **para que** eu ajuste conforme necessário.

**Critérios de Aceitação:**
- Campos editáveis: nome, slug, WhatsApp, mensagem, tema
- Validação de slug único ao alterar
- Feedback de salvo com sucesso

### US-023: Duplicar Funil 🟠
**Como** gestor de tráfego, **quero** duplicar um funil existente, **para que** eu crie variações sem recomeçar do zero.

**Critérios de Aceitação:**
- Cópia completa com todas as etapas
- Nome com sufixo " (cópia)"
- Status da cópia como rascunho
- Leads não são copiados

### US-024: Publicar Funil 🔴
**Como** usuário, **quero** publicar meu funil para que ele fique acessível publicamente, **para que** visitantes possam responder.

**Critérios de Aceitação:**
- Botão de publicar/despublicar
- Funil precisa ter pelo menos 1 etapa para publicar
- Link público visível após publicação
- Funil despublicado retorna 404

### US-025: Excluir Funil 🟠
**Como** usuário, **quero** excluir funis que não uso mais, **para que** minha lista fique organizada.

**Critérios de Aceitação:**
- Confirmação antes de excluir
- Remove funil, etapas, eventos e leads
- Feedback de exclusão bem-sucedida

### US-026: Ver Link Público 🔴
**Como** gestor de tráfego, **quero** copiar o link público do meu funil, **para que** eu use nas minhas campanhas de tráfego.

**Critérios de Aceitação:**
- Link visível na lista e na edição do funil
- Botão de copiar link com feedback
- Formato: `{domain}/f/{slug}`

---

## Épico 4: Editor de Funil

### US-030: Adicionar Etapa ao Funil 🔴
**Como** usuário, **quero** adicionar etapas ao meu funil, **para que** eu construa a jornada interativa do visitante.

**Critérios de Aceitação:**
- Botão para adicionar nova etapa
- Seleção do tipo de etapa (7 tipos)
- Etapa adicionada ao final da sequência
- Formulário de configuração abre ao adicionar

### US-031: Configurar Tela de Boas-vindas 🔴
**Como** usuário, **quero** configurar uma tela de boas-vindas, **para que** o visitante tenha uma boa primeira impressão do funil.

**Critérios de Aceitação:**
- Campos: título, subtítulo, imagem (URL), texto do botão
- Preview da etapa no editor
- Salvar configuração

### US-032: Configurar Pergunta de Múltipla Escolha 🔴
**Como** usuário, **quero** criar perguntas de múltipla escolha com pontuação, **para que** eu qualifique as respostas dos leads.

**Critérios de Aceitação:**
- Título e descrição da pergunta
- Adicionar/remover opções de resposta (mín. 2)
- Definir pontuação por opção
- Definir variável a salvar por opção
- Configurar pulo condicional (ir para etapa X)

### US-033: Configurar Pergunta Aberta 🔴
**Como** usuário, **quero** criar perguntas abertas, **para que** eu colete informações em texto livre dos visitantes.

**Critérios de Aceitação:**
- Título da pergunta
- Tipo de campo (texto, número, telefone, e-mail)
- Placeholder personalizado
- Marcação como obrigatório/opcional

### US-034: Configurar Formulário de Captura 🔴
**Como** usuário, **quero** adicionar um formulário de captura de dados, **para que** eu colete informações de contato do lead.

**Critérios de Aceitação:**
- Campos ativáveis: nome, e-mail, telefone, empresa, cidade
- Campo personalizado (label + tipo)
- Marcação de campos obrigatórios
- Validação por tipo de campo

### US-035: Configurar Tela de Loading 🟠
**Como** usuário, **quero** adicionar uma tela de loading animada, **para que** o visitante sinta que suas respostas estão sendo processadas.

**Critérios de Aceitação:**
- Texto dinâmico configurável
- Duração em segundos configurável
- Animação de loading

### US-036: Configurar Tela de Resultado 🔴
**Como** usuário, **quero** configurar uma tela de resultado, **para que** o visitante veja sua classificação e receba um CTA.

**Critérios de Aceitação:**
- Título e texto personalizado
- Opção de mostrar pontuação e/ou classificação
- Resultados condicionais por faixa de pontuação
- CTA configurável (WhatsApp, URL, página final)

### US-037: Configurar Redirecionamento 🔴
**Como** usuário, **quero** configurar o redirecionamento final, **para que** o lead seja direcionado para WhatsApp, site externo ou página de obrigado.

**Critérios de Aceitação:**
- Tipo: WhatsApp, URL externa ou página interna
- Campos condicionais baseados no tipo
- Mensagem WhatsApp com variáveis

### US-038: Reordenar Etapas 🟠
**Como** usuário, **quero** reordenar as etapas do meu funil, **para que** eu ajuste a sequência da jornada.

**Critérios de Aceitação:**
- Botões para mover etapa para cima/baixo
- Atualização do campo `order` no banco
- Feedback visual da nova ordem

### US-039: Remover Etapa 🟠
**Como** usuário, **quero** remover etapas do meu funil, **para que** eu simplifique a jornada quando necessário.

**Critérios de Aceitação:**
- Confirmação antes de remover
- Reordenação automática das etapas restantes
- Feedback de remoção bem-sucedida

---

## Épico 5: Experiência Pública do Funil

### US-050: Responder Funil Publicado 🔴
**Como** visitante de uma campanha, **quero** responder um funil interativo, **para que** eu receba um diagnóstico/resultado personalizado.

**Critérios de Aceitação:**
- Acesso via `/f/{slug}`
- Carregamento rápido (< 1.5s)
- Navegação etapa por etapa
- Barra de progresso
- Design responsivo (mobile-first)
- Transição suave entre etapas

### US-051: Ver Resultado Personalizado 🔴
**Como** visitante, **quero** ver meu resultado ao final do funil, **para que** eu saiba minha classificação/diagnóstico.

**Critérios de Aceitação:**
- Resultado baseado na pontuação acumulada
- Resultados diferentes para faixas diferentes
- CTA visível e claro

### US-052: Ser Redirecionado para WhatsApp 🔴
**Como** visitante, **quero** ser redirecionado para o WhatsApp da empresa, **para que** eu inicie uma conversa com contexto.

**Critérios de Aceitação:**
- Link do WhatsApp com mensagem pré-preenchida
- Variáveis substituídas por dados reais
- Abre em nova aba

### US-053: Rastreamento UTM 🟠
**Como** gestor de tráfego, **quero** que os UTMs da URL sejam capturados automaticamente, **para que** eu saiba de qual campanha veio cada lead.

**Critérios de Aceitação:**
- Captura de utm_source, utm_medium, utm_campaign, utm_content, utm_term
- Dados salvos junto ao lead
- Funciona com qualquer combinação de UTMs

---

## Épico 6: Gestão de Leads

### US-060: Ver Todos os Leads 🔴
**Como** gestor de tráfego, **quero** ver todos os leads capturados em uma tabela, **para que** eu gerencie meus contatos.

**Critérios de Aceitação:**
- Tabela com nome, telefone, e-mail, funil, classificação, pontuação, data
- Busca por nome/e-mail/telefone
- Filtro por funil e classificação
- Ordenação por colunas
- Paginação

### US-061: Ver Detalhes do Lead 🟠
**Como** usuário, **quero** ver todos os detalhes de um lead específico, **para que** eu entenda seu perfil completo.

**Critérios de Aceitação:**
- Dados pessoais completos
- Todas as respostas do funil
- Pontuação e classificação
- UTMs de origem
- Botão de WhatsApp funcional

### US-062: Ver Leads por Funil 🟠
**Como** usuário, **quero** ver apenas os leads de um funil específico, **para que** eu analise os resultados de cada campanha.

**Critérios de Aceitação:**
- Acesso via `/dashboard/funnels/[id]/leads`
- Mesma interface da lista geral, filtrada pelo funil
- Link de volta para o funil

---

## Épico 7: Analytics

### US-070: Ver Métricas do Funil 🟠
**Como** gestor de tráfego, **quero** ver as métricas de desempenho de cada funil, **para que** eu otimize minhas campanhas.

**Critérios de Aceitação:**
- Cards: visitantes, leads, taxa de conversão
- Gráfico de funil por etapa (taxa de abandono)
- Gráfico de leads por classificação
- Gráfico de leads por dia
- Tabela de UTMs

### US-071: Filtrar Métricas por Período 🟡
**Como** usuário, **quero** filtrar métricas por período, **para que** eu compare desempenho em diferentes intervalos.

**Critérios de Aceitação:**
- Filtros: últimos 7 dias, 30 dias, personalizado
- Todos os gráficos e métricas respeitam o filtro

---

## Épico 8: Templates

### US-080: Navegar Templates 🟠
**Como** novo usuário, **quero** ver templates prontos por nicho, **para que** eu comece rapidamente sem criar do zero.

**Critérios de Aceitação:**
- Galeria com cards de templates
- Cada card mostra: nome, nicho, descrição, número de etapas
- Filtro por nicho (futuro)

### US-081: Usar Template 🟠
**Como** usuário, **quero** criar um funil a partir de um template, **para que** eu tenha um ponto de partida com perguntas e configurações prontas.

**Critérios de Aceitação:**
- Botão "Usar este template"
- Cria funil com nome editável
- Todas as etapas, perguntas e pontuações são copiadas
- Funil é totalmente editável após criação
- Redirecionamento para editor do novo funil

---

## Épico 9: Configurações Visuais

### US-090: Personalizar Visual do Funil 🟠
**Como** agência de marketing, **quero** personalizar as cores e fontes do funil, **para que** ele fique com a identidade visual do meu cliente.

**Critérios de Aceitação:**
- Configuração de cor principal, fundo, texto
- Upload/URL de logo
- Seleção de fonte
- Configuração de borda arredondada
- Modo claro/escuro
- Configurações aplicadas na página pública

---

## Resumo de Prioridades

| Prioridade | Quantidade | % do Total |
|---|---|---|
| 🔴 P0 — Crítica | 22 | 58% |
| 🟠 P1 — Alta | 13 | 34% |
| 🟡 P2 — Média | 3 | 8% |
| **Total** | **38** | **100%** |
