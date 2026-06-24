# ADR-010: Lógica de Score e Classificação de Leads

> **Status:** Aceito  
> **Data:** 2026-06-24  
> **Decisores:** Equipe Técnica  

---

## Contexto

O core do LeadFlow AI é qualificar leads automaticamente baseado em suas respostas. A lógica de pontuação e classificação precisa ser:
- Clara e previsível para o usuário que configura o funil
- Calculada em tempo real durante a experiência do visitante
- Separada em função própria para testabilidade e reuso

## Decisão

### Sistema de Pontuação

**Modelo aditivo simples:** A pontuação total é a soma dos pesos de cada resposta de múltipla escolha.

```typescript
// lib/scoring.ts

interface Answer {
  stepId: string
  stepType: string
  value: any
  score?: number
}

interface ScoringResult {
  totalScore: number
  normalizedScore: number
  classification: Classification
  answers: Answer[]
}

type Classification = 'COLD' | 'WARM' | 'HOT' | 'VERY_HOT'

/**
 * Calcula a pontuação total baseada nas respostas
 * Apenas respostas de MULTIPLE_CHOICE com score definido são contabilizadas
 */
export function calculateScore(answers: Answer[]): number {
  return answers
    .filter(a => a.stepType === 'MULTIPLE_CHOICE' && typeof a.score === 'number')
    .reduce((total, answer) => total + (answer.score || 0), 0)
}

/**
 * Normaliza a pontuação para escala 0-100
 * maxPossibleScore é a soma dos maiores scores de cada pergunta
 */
export function normalizeScore(rawScore: number, maxPossibleScore: number): number {
  if (maxPossibleScore <= 0) return 0
  const normalized = (rawScore / maxPossibleScore) * 100
  return Math.min(Math.round(normalized), 100)
}

/**
 * Classifica o lead baseado na pontuação normalizada
 */
export function classifyLead(normalizedScore: number): Classification {
  if (normalizedScore >= 86) return 'VERY_HOT'
  if (normalizedScore >= 61) return 'HOT'
  if (normalizedScore >= 31) return 'WARM'
  return 'COLD'
}

/**
 * Função principal que orquestra o scoring completo
 */
export function scoreLead(
  answers: Answer[],
  maxPossibleScore: number
): ScoringResult {
  const totalScore = calculateScore(answers)
  const normalizedScore = normalizeScore(totalScore, maxPossibleScore)
  const classification = classifyLead(normalizedScore)

  return {
    totalScore,
    normalizedScore,
    classification,
    answers,
  }
}

/**
 * Calcula o score máximo possível para um funil
 * Soma o maior score de cada pergunta de múltipla escolha
 */
export function calculateMaxPossibleScore(steps: FunnelStep[]): number {
  return steps
    .filter(step => step.type === 'MULTIPLE_CHOICE')
    .reduce((total, step) => {
      const config = step.config as MultipleChoiceConfig
      const maxOptionScore = Math.max(...config.options.map(o => o.score || 0))
      return total + maxOptionScore
    }, 0)
}

/**
 * Retorna label e cor para a classificação
 */
export function getClassificationDisplay(classification: Classification) {
  const map: Record<Classification, { label: string; color: string; emoji: string }> = {
    COLD: { label: 'Frio', color: '#93C5FD', emoji: '🧊' },
    WARM: { label: 'Morno', color: '#FCD34D', emoji: '🌤️' },
    HOT: { label: 'Quente', color: '#FB923C', emoji: '🔥' },
    VERY_HOT: { label: 'Muito Quente', color: '#EF4444', emoji: '🌋' },
  }
  return map[classification]
}
```

### Faixas de Classificação

| Faixa (0-100) | Classificação | Label PT-BR | Cor |
|---|---|---|---|
| 0 — 30 | `COLD` | Frio | Azul (`#93C5FD`) |
| 31 — 60 | `WARM` | Morno | Amarelo (`#FCD34D`) |
| 61 — 85 | `HOT` | Quente | Laranja (`#FB923C`) |
| 86 — 100 | `VERY_HOT` | Muito Quente | Vermelho (`#EF4444`) |

### Fluxo de Cálculo

```
1. Visitante responde perguntas de múltipla escolha
   → Cada resposta acumula score

2. Ao chegar na etapa RESULT ou REDIRECT:
   → calculateMaxPossibleScore(steps) → maxScore
   → calculateScore(answers) → rawScore
   → normalizeScore(rawScore, maxScore) → normalizedScore (0-100)
   → classifyLead(normalizedScore) → classification

3. Salvar no Lead:
   → score = normalizedScore
   → classification = classification

4. Exibir resultado condicional:
   → Buscar conditionalResult onde minScore <= normalizedScore <= maxScore
   → Renderizar título e texto do resultado
```

### Regras Condicionais de Navegação

```typescript
// lib/conditional.ts

interface ConditionalRule {
  type: 'goto_step' | 'show_result'
  condition: {
    field: 'answer' | 'score'
    operator: 'equals' | 'greater_than' | 'less_than'
    value: any
  }
  target: number | string // stepOrder ou resultId
}

/**
 * Avalia se o visitante deve pular para outra etapa
 * baseado na resposta da etapa atual
 */
export function evaluateStepCondition(
  selectedOption: Option,
  currentStepOrder: number
): number {
  // Se a opção tem goToStep definido, pular para essa etapa
  if (selectedOption.goToStep !== undefined) {
    return selectedOption.goToStep
  }
  // Caso contrário, ir para próxima etapa
  return currentStepOrder + 1
}

/**
 * Encontra o resultado condicional baseado na pontuação
 */
export function findConditionalResult(
  conditionalResults: ConditionalResult[],
  normalizedScore: number
): ConditionalResult | undefined {
  return conditionalResults.find(
    result => normalizedScore >= result.minScore && normalizedScore <= result.maxScore
  )
}
```

## Exemplo Prático

### Funil "Diagnóstico de Marketing Digital" (8 etapas)

**Pergunta 1:** "Quanto sua empresa investe em marketing digital?"
- Menos de R$ 1.000/mês → 5 pontos
- R$ 1.000 a R$ 5.000/mês → 15 pontos
- R$ 5.000 a R$ 20.000/mês → 25 pontos
- Mais de R$ 20.000/mês → 30 pontos

**Pergunta 2:** "Você tem um site?"
- Não → 0 pontos
- Sim, mas está desatualizado → 10 pontos
- Sim, otimizado e com blog → 25 pontos

**Pergunta 3:** "Qual seu principal objetivo?"
- Mais leads → 20 pontos
- Mais vendas → 25 pontos
- Mais visibilidade → 10 pontos
- Não sei → 5 pontos

**Score máximo possível:** 30 + 25 + 25 = 80

**Visitante responde:** R$ 5.000-20.000 (25) + Site otimizado (25) + Mais vendas (25) = 75

**Normalizado:** (75 / 80) × 100 = **93.75 → 94**

**Classificação:** 94 ≥ 86 → **Muito Quente** 🌋

## Consequências

### Positivas
- Lógica simples e previsível para o usuário
- Funções puras e testáveis
- Separação de responsabilidades
- Fácil de evoluir (pesos por pergunta, faixas customizáveis)

### Negativas
- Modelo aditivo simples não captura nuances
- Faixas fixas (não customizáveis no MVP)
- Não considera peso relativo entre perguntas

### Evolução Futura
| Feature | Versão |
|---|---|
| Faixas customizáveis por funil | v1.1 |
| Peso por pergunta (multiplicador) | v1.2 |
| Scoring baseado em perguntas abertas (NLP) | v2.0 |
| Machine learning para classificação | v3.0 |

## Referências
- [Lead Scoring Best Practices](https://www.salesforce.com/resources/articles/lead-scoring/)
