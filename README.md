# LeadFlow AI 🚀

Plataforma SaaS para criação de funis interativos, páginas de captura e qualificação automática de leads. Feito para agências de marketing, gestores de tráfego e corretores de imóveis.

---

## 🎯 Arquitetura e Stack
Este projeto foi desenvolvido utilizando as melhores práticas para performance e escalabilidade:

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Vanilla components)
- **Banco de Dados:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Autenticação:** JWT Custom (via `jose`) Edge-compatible
- **Análise e Gráficos:** Recharts
- **Deploy:** Vercel

---

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para iniciar o projeto em seu ambiente local:

### 1. Configuração do Banco de Dados (Supabase)
O projeto usa o PostgreSQL hospedado no Supabase.

1. Crie um projeto no [Supabase](https://supabase.com).
2. Vá em **Project Settings > Database** e pegue as strings de conexão.
3. Crie um arquivo `.env.local` na raiz do projeto (use o `.env.example` como base).
4. Insira a `DATABASE_URL` (com pgbouncer/porta 6543 para conexões normais) e a `DIRECT_URL` (porta 5432 para migrações).

```env
# Exemplo do .env.local
DATABASE_URL="postgres://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgres://postgres.[ID]:[SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="sua_chave_secreta_aqui_bem_longa_e_segura"
```

### 2. Instalação e Migrations
Com o `.env.local` configurado, instale as dependências e rode as migrações para criar as tabelas no banco:

```bash
# 1. Instale as dependências
npm install

# 2. Rode as migrations no banco de dados (usa a DIRECT_URL)
npx prisma migrate dev --name init

# 3. Popular o banco com os Templates e o Usuário Admin
npx prisma db seed
```

*O comando seed criará um usuário para testes e 3 templates de funis totalmente prontos para uso.*
**Usuário:** `admin@leadflow.com` | **Senha:** `senha123`

### 3. Rodando o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
Você pode fazer login com o usuário criado pelo seed ou registrar uma nova conta.

---

## 🏗 Estrutura do Projeto

- `/src/app/(auth)`: Páginas de Login e Registro.
- `/src/app/(dashboard)`: Todo o painel interno (Funis, Leads, Analytics).
- `/src/app/(public)`: Landing page institucional e rotas públicas de api.
- `/src/app/f/[slug]`: Motor de renderização público do funil para o visitante final.
- `/src/components/editor`: Componentes do Editor Visual de Etapas.
- `/src/components/renderer`: Motor do front-end público dos funis (state-machine, tracking).
- `/src/lib`: Bibliotecas core (Prisma, Auth, Workspace, Motor de Scoring, UTMs, WhatsApp).
- `/prisma`: Schema do banco de dados e script de Seed.

## 🔐 Segurança e Multi-tenancy
- A aplicação utiliza `workspaceId` isolando os dados entre diferentes clientes em nível de aplicação (App-Level Multi-tenancy).
- A autenticação usa tokens JWT criptografados compatíveis com o Edge Runtime da Vercel (Edge Middleware suportado).
- Os parâmetros UTM (`utm_source`, etc.) são extraídos e persistidos via `sessionStorage` para garantir a atribuição correta das conversões.

## ✨ Recursos Principais
- **Editor de Funis:** 7 tipos de etapas (Boas-vindas, Múltipla Escolha, Perguntas Abertas, Formulário de Captura, Loading Artificial, Resultado e Redirecionamento Automático).
- **Motor de Score:** Sistema de pontuação condicional onde cada resposta adiciona "Pts", classificando o lead dinamicamente como Muito Quente (Very Hot), Quente, Morno ou Frio.
- **Integração Dinâmica com WhatsApp:** Botões de CTA que redirecionam para o WhatsApp do corretor/vendedor já com o nome do cliente, pontuação e classificação preenchidos dinamicamente (`buildWhatsAppUrlWithData`).
- **Dashboard de Analytics:** Gráficos interativos com métricas de retenção (Abandono por Etapa), taxa de conversão, perfil de leads e rastreamento UTM.

---
**LeadFlow AI** – Criado para máxima conversão.
