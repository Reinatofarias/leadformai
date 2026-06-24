# ADR-006: Estratégia de Estilização — Tailwind CSS

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O LeadFlow AI precisa de uma estratégia de CSS que:
- Permita desenvolvimento rápido de UI
- Ofereça design consistente e responsivo
- Suporte temas claros e escuros
- Permita customização de cores por funil (tema visual dinâmico)
- Seja produtivo para o time
- Tenha bom bundle size

## Opções Consideradas

### Opção 1: Tailwind CSS v4 (Escolhida ✅)
- Utility-first CSS framework
- Tree-shaking automático (bundle mínimo)
- Design system integrado
- Dark mode nativo
- Responsivo por padrão
- Excelente com Next.js

### Opção 2: Vanilla CSS com CSS Variables
- Máximo controle
- Sem dependência
- Mais verboso e lento para desenvolver
- Inconsistências potenciais

### Opção 3: CSS Modules
- Scoped CSS nativo do Next.js
- Sem utilidades pré-definidas
- Mais boilerplate
- Inconsistências potenciais

### Opção 4: Styled Components / Emotion
- CSS-in-JS
- Runtime overhead
- Problemas com Server Components
- Mais complexo no App Router

## Decisão

**Tailwind CSS v4** porque:

1. **Velocidade de desenvolvimento:** Utilities prontas para layout, espaçamento, cores, tipografia
2. **Consistência:** Design tokens padronizados (spacing scale, color palette)
3. **Bundle size:** Tree-shaking remove classes não usadas
4. **Responsividade:** Breakpoints como `md:`, `lg:` nativos
5. **Dark mode:** `dark:` variant nativo
6. **Next.js:** Integração oficial e otimizada
7. **Temas dinâmicos:** CSS Variables para cores customizadas por funil

## Configuração de Design System

### Paleta de Cores (Dashboard)
```css
/* globals.css - CSS Variables para o tema */
:root {
  /* Brand */
  --color-primary: #6366F1;      /* Indigo */
  --color-primary-hover: #4F46E5;
  --color-primary-light: #EEF2FF;
  
  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Neutrals */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-bg-tertiary: #F3F4F6;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  --color-border: #E5E7EB;
  
  /* Lead Classification Colors */
  --color-cold: #93C5FD;        /* Blue */
  --color-warm: #FCD34D;        /* Yellow */
  --color-hot: #FB923C;         /* Orange */
  --color-very-hot: #EF4444;    /* Red */
}
```

### Tema Dinâmico para Funis Públicos
```css
/* Aplicado via style attribute no container do funil */
.funnel-container {
  --funnel-primary: var(--theme-primary, #6366F1);
  --funnel-bg: var(--theme-bg, #FFFFFF);
  --funnel-text: var(--theme-text, #1F2937);
  --funnel-radius: var(--theme-radius, 12px);
}
```

### Tipografia
- **Dashboard:** Inter (Google Fonts)
- **Funis Públicos:** Configurável (Inter, Roboto, Outfit, Poppins, Montserrat)

### Componentes UI
Componentes reutilizáveis com variantes via Tailwind:

```
components/ui/
├── button.tsx        # Variantes: primary, secondary, ghost, danger
├── card.tsx          # Container com sombra e borda
├── input.tsx         # Input com label, error state
├── badge.tsx         # Classification badges
├── modal.tsx         # Dialogs de confirmação
├── table.tsx         # Tabela de dados
├── select.tsx        # Dropdown select
├── tabs.tsx          # Navegação por abas
└── progress-bar.tsx  # Barra de progresso do funil
```

## Consequências

### Positivas
- Desenvolvimento 3-5x mais rápido que CSS vanilla
- Design consistente sem design system manual
- Bundle CSS final muito pequeno (~10-30KB)
- Responsivo e acessível por padrão

### Negativas
- Curva de aprendizado para quem não conhece Tailwind
- Classes longas no JSX (mitigado com `cn()` utility)
- Customização profunda pode ser complexa
- Versão 4 ainda estabilizando

## Referências
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Tailwind + Next.js](https://tailwindcss.com/docs/guides/nextjs)
