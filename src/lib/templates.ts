export interface TemplateStep {
  type: 'WELCOME' | 'MULTIPLE_CHOICE' | 'OPEN_QUESTION' | 'CAPTURE_FORM' | 'LOADING' | 'RESULT' | 'REDIRECT'
  title: string
  description?: string
  config: Record<string, unknown>
}

export interface FunnelTemplate {
  id: string
  name: string
  description: string
  category: string
  whatsappMessage: string
  theme: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    mode: 'light' | 'dark'
    fontFamily: string
    borderRadius: number
  }
  steps: TemplateStep[]
}

export const TEMPLATES: FunnelTemplate[] = [
  {
    id: 'qualificacao-imoveis',
    name: 'Qualificação de Imóveis (Corretores)',
    description: 'Ideal para imobiliárias e corretores. Qualifica o lead com base em perfil de compra, investimento e preferências de moradia antes de enviar ao WhatsApp.',
    category: 'Imobiliário',
    whatsappMessage: 'Olá! Vim pelo diagnóstico de imóveis. Meu score foi {{pontuacao}} ({{classificacao}}).',
    theme: {
      primaryColor: '#0ea5e9',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a',
      mode: 'light',
      fontFamily: 'Inter',
      borderRadius: 16
    },
    steps: [
      {
        type: 'WELCOME',
        title: 'Descubra o Imóvel Ideal para Você',
        description: 'Responda 4 perguntas rápidas e receba uma seleção personalizada de imóveis.',
        config: { buttonText: 'Começar Diagnóstico' }
      },
      {
        type: 'MULTIPLE_CHOICE',
        title: 'Qual o seu objetivo principal?',
        config: {
          options: [
            { id: '1', text: 'Comprar para morar', score: 10 },
            { id: '2', text: 'Investimento comercial/residencial', score: 20 },
            { id: '3', text: 'Alugar imóvel', score: 5 }
          ]
        }
      },
      {
        type: 'MULTIPLE_CHOICE',
        title: 'Qual a sua faixa estimada de investimento?',
        config: {
          options: [
            { id: '1', text: 'Até R$ 300 mil', score: 5 },
            { id: '2', text: 'R$ 300 mil a R$ 800 mil', score: 15 },
            { id: '3', text: 'Acima de R$ 800 mil', score: 30 }
          ]
        }
      },
      {
        type: 'CAPTURE_FORM',
        title: 'Para onde enviamos a seleção personalizada?',
        config: {
          buttonText: 'Ver Resultados',
          fields: [
            { name: 'nome', label: 'Nome Completo', type: 'text', required: true, enabled: true },
            { name: 'phone', label: 'Seu WhatsApp', type: 'phone', required: true, enabled: true }
          ]
        }
      },
      {
        type: 'LOADING',
        title: 'Analisando perfil...',
        config: {
          text: 'Procurando imóveis ideais no seu perfil de investimento...',
          duration: 3
        }
      },
      {
        type: 'RESULT',
        title: 'Encontramos opções perfeitas para você!',
        config: {
          showScore: false,
          showClassification: false,
          defaultCta: { type: 'whatsapp', text: 'Falar com um Corretor no WhatsApp' }
        }
      }
    ]
  },
  {
    id: 'diagnostico-marketing',
    name: 'Diagnóstico de Marketing (Agências)',
    description: 'Diagnóstico de maturidade digital. Segmenta o lead por volume de investimento em tráfego pago e maturidade comercial de vendas.',
    category: 'Marketing & Vendas',
    whatsappMessage: 'Olá! Fiz o diagnóstico da minha empresa e caí na classificação {{classificacao}}.',
    theme: {
      primaryColor: '#f97316',
      backgroundColor: '#fff7ed',
      textColor: '#1e293b',
      mode: 'light',
      fontFamily: 'Inter',
      borderRadius: 16
    },
    steps: [
      {
        type: 'WELCOME',
        title: 'Sua empresa está perdendo dinheiro em anúncios?',
        description: 'Faça nosso diagnóstico de marketing gratuito em menos de 2 minutos.',
        config: { buttonText: 'Fazer Diagnóstico Comercial' }
      },
      {
        type: 'MULTIPLE_CHOICE',
        title: 'Você investe em tráfego pago atualmente?',
        config: {
          options: [
            { id: '1', text: 'Sim, invisto mais de R$ 5.000/mês', score: 30 },
            { id: '2', text: 'Sim, invisto até R$ 5.000/mês', score: 15 },
            { id: '3', text: 'Ainda não invisto em anúncios', score: 0 }
          ]
        }
      },
      {
        type: 'OPEN_QUESTION',
        title: 'Qual a sua principal dificuldade em vendas hoje?',
        config: { fieldType: 'text', required: true, placeholder: 'Ex: Gerar leads qualificados, fechar contratos...' }
      },
      {
        type: 'CAPTURE_FORM',
        title: 'Quem deve receber esta análise e consultoria?',
        config: {
          buttonText: 'Gerar Análise Completa',
          fields: [
            { name: 'nome', label: 'Seu Nome', type: 'text', required: true, enabled: true },
            { name: 'empresa', label: 'Nome da Empresa', type: 'text', required: true, enabled: true },
            { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }
          ]
        }
      },
      {
        type: 'RESULT',
        title: 'Análise de Maturidade Concluída!',
        config: {
          showScore: true,
          showClassification: true,
          defaultCta: { type: 'whatsapp', text: 'Agendar Consultoria Gratuita' }
        }
      }
    ]
  },
  {
    id: 'orcamento-solar',
    name: 'Orçamento de Energia Solar',
    description: 'Funil para empresas de instalação solar. Coleta tipo de telhado, valor médio da conta de luz e gera uma estimativa de economia.',
    category: 'Energia Renovável',
    whatsappMessage: 'Olá! Quero um orçamento de energia solar. Minha conta média é X.',
    theme: {
      primaryColor: '#eab308',
      backgroundColor: '#fefce8',
      textColor: '#1e293b',
      mode: 'light',
      fontFamily: 'Inter',
      borderRadius: 16
    },
    steps: [
      {
        type: 'WELCOME',
        title: 'Zere sua conta de luz imediatamente',
        description: 'Calcule o potencial de economia que a energia solar trará para sua residência ou empresa.',
        config: { buttonText: 'Calcular Economia Estipulada' }
      },
      {
        type: 'MULTIPLE_CHOICE',
        title: 'Onde será realizada a instalação dos painéis?',
        config: {
          options: [
            { id: '1', text: 'Residência', score: 10 },
            { id: '2', text: 'Empresa / Comércio', score: 20 },
            { id: '3', text: 'Propriedade Rural / Sítio', score: 30 }
          ]
        }
      },
      {
        type: 'OPEN_QUESTION',
        title: 'Qual o valor médio da sua conta de luz atual (R$)?',
        config: { fieldType: 'number', required: true, placeholder: 'Ex: 450' }
      },
      {
        type: 'CAPTURE_FORM',
        title: 'Para quem enviamos o cálculo detalhado de economia?',
        config: {
          buttonText: 'Ver Economia Estimada',
          fields: [
            { name: 'nome', label: 'Seu Nome', type: 'text', required: true, enabled: true },
            { name: 'phone', label: 'WhatsApp para Contato', type: 'phone', required: true, enabled: true }
          ]
        }
      },
      {
        type: 'RESULT',
        title: 'Você pode economizar até 95% na sua fatura!',
        config: {
          showScore: false,
          showClassification: false,
          defaultCta: { type: 'whatsapp', text: 'Solicitar Orçamento Oficial' }
        }
      }
    ]
  }
]
