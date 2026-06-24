'use server'

import { prisma } from '@/lib/prisma'
import { getWorkspaceId } from '@/lib/workspace'
import { getWorkspacePlanDetails } from '@/lib/limits'
import { slugify } from '@/lib/utils'
import { DEFAULT_THEME } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

export interface AIGenerationResult {
  success: boolean
  funnelId?: string
  error?: string
}

// Simulated AI Niche templates
const NICHE_TEMPLATES: Record<string, {
  name: string
  theme: Record<string, string>
  whatsappMessage: string
  steps: Array<{
    type: string
    title: string
    description?: string
    config: Record<string, any>
  }>
}> = {
  solar: {
    name: 'Orcamento de Energia Solar por IA',
    theme: { primaryColor: '#eab308', backgroundColor: '#fefce8', mode: 'light', fontFamily: 'Inter' },
    whatsappMessage: 'Olá! Fiz minha simulação solar e quero o estudo oficial. Minha pontuação foi {{pontuacao}}.',
    steps: [
      { type: 'WELCOME', title: 'Calculadora de Economia Solar Inteligente', description: 'Simule em 1 minuto o tamanho do seu sistema e o quanto você pode economizar na conta de luz.', config: { buttonText: 'Simular Agora' } },
      { type: 'MULTIPLE_CHOICE', title: 'Qual é o valor médio da sua conta de luz?', config: { options: [{ id: '1', text: 'Até R$ 300', score: 5 }, { id: '2', text: 'R$ 300 a R$ 800', score: 20 }, { id: '3', text: 'Acima de R$ 800', score: 40 }] } },
      { type: 'IMAGE_CHOICE', title: 'Onde o sistema será instalado?', config: { options: [{ id: '1', text: 'Residência', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400', score: 10 }, { id: '2', text: 'Empresa / Comércio', imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', score: 30 }] } },
      { type: 'CAPTURE_FORM', title: 'Calcular Economia Estudo Oficial', description: 'Insira seus dados para receber o PDF do projeto preliminar.', config: { buttonText: 'Gerar Economia', fields: [{ name: 'nome', label: 'Seu Nome', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }] } },
      { type: 'LOADING', title: 'Processando Simulação', config: { text: 'Calculando a inclinação do telhado e irradiação local...', duration: 3 } },
      { type: 'RESULT', title: 'Estudo gerado com sucesso!', config: { showScore: false, showClassification: false, defaultCta: { type: 'whatsapp', text: 'Falar com um Consultor Solar' } } }
    ]
  },
  imoveis: {
    name: 'Qualificacao Imobiliaria por IA',
    theme: { primaryColor: '#0ea5e9', backgroundColor: '#f8fafc', mode: 'light', fontFamily: 'Inter' },
    whatsappMessage: 'Olá! Vim pelo quiz imobiliário. Meu score de interesse foi {{pontuacao}}.',
    steps: [
      { type: 'WELCOME', title: 'Encontre seu Imóvel Ideal', description: 'Responda a 4 perguntas e nosso algoritmo selecionará as melhores opções da região.', config: { buttonText: 'Encontrar Imóvel' } },
      { type: 'MULTIPLE_CHOICE', title: 'Qual a sua faixa de renda ou financiamento aprovado?', config: { options: [{ id: '1', text: 'Até R$ 5.000', score: 5 }, { id: '2', text: 'R$ 5.000 a R$ 12.000', score: 20 }, { id: '3', text: 'Acima de R$ 12.000', score: 35 }] } },
      { type: 'BEFORE_AFTER', title: 'Você prefere o design clássico ou moderno?', description: 'Deslize para ver as fachadas', config: { beforeUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600', afterUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600', score: 10 } },
      { type: 'CAPTURE_FORM', title: 'Liberar lista de imóveis', description: 'Informe seus contatos para que um corretor envie as fotos.', config: { buttonText: 'Receber Fotos', fields: [{ name: 'nome', label: 'Nome Completo', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }] } },
      { type: 'RESULT', title: 'Temos 3 opções na sua faixa!', config: { showScore: false, showClassification: false, defaultCta: { type: 'whatsapp', text: 'Receber pelo WhatsApp' } } }
    ]
  },
  marketing: {
    name: 'Diagnostico de Marketing por IA',
    theme: { primaryColor: '#6366f1', backgroundColor: '#f5f3ff', mode: 'light', fontFamily: 'Inter' },
    whatsappMessage: 'Olá! Fiz o diagnóstico da minha empresa e meu score de maturidade comercial foi {{pontuacao}}.',
    steps: [
      { type: 'WELCOME', title: 'Diagnóstico Comercial de Vendas', description: 'Descubra quais canais de aquisição estão fazendo você perder dinheiro.', config: { buttonText: 'Iniciar Auditoria' } },
      { type: 'MULTIPLE_CHOICE', title: 'Qual o faturamento mensal atual do negócio?', config: { options: [{ id: '1', text: 'Até R$ 30.000/mês', score: 10 }, { id: '2', text: 'R$ 30.000 a R$ 100.000/mês', score: 25 }, { id: '3', text: 'Acima de R$ 100.000/mês', score: 50 }] } },
      { type: 'VIDEO', title: 'Assista a nossa Estratégia de Tração', description: 'Veja como crescer 3x este ano', config: { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', buttonText: 'Entendi, Quero Meu Diagnóstico', score: 10 } },
      { type: 'CAPTURE_FORM', title: 'Ver Diagnóstico', description: 'Insira suas informações de contato.', config: { buttonText: 'Gerar Diagnóstico', fields: [{ name: 'nome', label: 'Nome', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }, { name: 'email', label: 'E-mail Comercial', type: 'email', required: true, enabled: true }] } },
      { type: 'RESULT', title: 'Diagnóstico Finalizado!', config: { showScore: true, showClassification: true, defaultCta: { type: 'whatsapp', text: 'Falar com Especialista' } } }
    ]
  },
  fitness: {
    name: 'Ficha de Treino Inteligente por IA',
    theme: { primaryColor: '#ef4444', backgroundColor: '#fef2f2', mode: 'light', fontFamily: 'Inter' },
    whatsappMessage: 'Olá! Fiz o quiz fitness e quero montar meu cronograma de treinos personalizado.',
    steps: [
      { type: 'WELCOME', title: 'Descubra o Treino Perfeito para Você', description: 'Com base no seu perfil físico, geramos uma sugestão de exercícios em 1 minuto.', config: { buttonText: 'Começar Ficha' } },
      { type: 'MULTIPLE_CHOICE', title: 'Qual é o seu principal objetivo?', config: { options: [{ id: '1', text: 'Perda de Peso / Definição', score: 15 }, { id: '2', text: 'Hipertrofia / Ganho de Massa', score: 25 }, { id: '3', text: 'Resistência / Saúde', score: 10 }] } },
      { type: 'OPEN_QUESTION', title: 'Quantas vezes na semana você pretende treinar?', config: { fieldType: 'number', required: true, placeholder: 'Ex: 4' } },
      { type: 'CAPTURE_FORM', title: 'Receber Cronograma Grátis', description: 'Onde devemos mandar o arquivo PDF com as séries?', config: { buttonText: 'Receber Série de Treino', fields: [{ name: 'nome', label: 'Nome', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }] } },
      { type: 'RESULT', title: 'Seu plano está pronto!', config: { showScore: false, showClassification: false, defaultCta: { type: 'whatsapp', text: 'Falar com o Treinador' } } }
    ]
  }
}

export async function generateFunnelWithAI(niche: string, goal: string): Promise<AIGenerationResult> {
  try {
    const workspaceId = await getWorkspaceId()

    // Plan Limit checks
    const limits = await getWorkspacePlanDetails(workspaceId)
    if (limits.hasReachedFunnelLimit) {
      return { 
        success: false, 
        error: `Limite de funis atingido (${limits.funnelLimit}) no plano ${limits.planName}. Faça um upgrade para gerar com IA.` 
      }
    }

    const template = NICHE_TEMPLATES[niche] || NICHE_TEMPLATES.marketing
    
    // Generate a unique slug
    const baseSlug = `${slugify(template.name)}-ia`
    let slug = baseSlug
    let attempt = 0
    while (await prisma.funnel.findUnique({ where: { slug } })) {
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    // Modify step descriptions or title depending on the goal
    const modifiedSteps = template.steps.map((step) => {
      let finalTitle = step.title
      if (step.type === 'WELCOME') {
        finalTitle = `${step.title} (${goal})`
      }
      return {
        ...step,
        title: finalTitle
      }
    })

    const funnel = await prisma.funnel.create({
      data: {
        workspaceId,
        name: `${template.name} (${goal})`,
        slug,
        status: 'DRAFT',
        theme: template.theme,
        whatsappMessage: template.whatsappMessage,
        steps: {
          create: modifiedSteps.map((step, index) => ({
            order: index,
            type: step.type as any,
            title: step.title,
            description: step.description || '',
            config: step.config
          }))
        }
      }
    })

    revalidatePath('/dashboard/funnels')
    return {
      success: true,
      funnelId: funnel.id
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: message || 'Erro ao gerar o funil utilizando inteligência artificial.'
    }
  }
}
