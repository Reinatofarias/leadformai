import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando o seed do LeadFlow AI...')

  // 1. Criar um Workspace e Usuário padrão para testes locais
  const passwordHash = await hash('senha123', 10)
  
  const workspace = await prisma.workspace.upsert({
    where: { id: 'workspace_seed_1' },
    update: {},
    create: {
      id: 'workspace_seed_1',
      name: 'Agência Seed',
      owner: {
        create: {
          email: 'admin@leadflow.com',
          name: 'Admin LeadFlow',
          passwordHash,
        }
      }
    }
  })

  console.log('✅ Usuário criado: admin@leadflow.com / senha123')

  // 2. Criar Templates (Funis)
  const templates = [
    {
      name: 'Qualificação de Imóveis (Corretores)',
      slug: 'qualificacao-imoveis-modelo',
      whatsappMessage: 'Olá! Vim pelo diagnóstico de imóveis. Meu score foi {{pontuacao}} ({{classificacao}}).',
      theme: { primaryColor: '#0ea5e9', backgroundColor: '#f8fafc', mode: 'light', fontFamily: 'Inter' },
      steps: [
        { type: 'WELCOME', title: 'Descubra o Imóvel Ideal para Você', description: 'Responda 4 perguntas rápidas e receba uma seleção personalizada.', config: { buttonText: 'Começar' } },
        { type: 'MULTIPLE_CHOICE', title: 'Qual seu objetivo?', config: { options: [{ id: '1', text: 'Comprar para morar', score: 10 }, { id: '2', text: 'Investimento', score: 20 }, { id: '3', text: 'Alugar', score: 5 }] } },
        { type: 'MULTIPLE_CHOICE', title: 'Qual a sua faixa de investimento?', config: { options: [{ id: '1', text: 'Até R$ 300 mil', score: 5 }, { id: '2', text: 'R$ 300 mil a R$ 800 mil', score: 15 }, { id: '3', text: 'Acima de R$ 800 mil', score: 30 }] } },
        { type: 'CAPTURE_FORM', title: 'Para onde enviamos a seleção?', config: { buttonText: 'Ver Resultados', fields: [{ name: 'nome', label: 'Nome', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }] } },
        { type: 'LOADING', title: 'Loading', config: { text: 'Buscando imóveis na nossa base...', duration: 3 } },
        { type: 'RESULT', title: 'Temos opções perfeitas para você!', config: { showScore: false, showClassification: false, defaultCta: { type: 'whatsapp', text: 'Falar com um Corretor' } } }
      ]
    },
    {
      name: 'Diagnóstico de Marketing (Agências)',
      slug: 'diagnostico-marketing-modelo',
      whatsappMessage: 'Olá! Fiz o diagnóstico da minha empresa e caí na classificação {{classificacao}}.',
      theme: { primaryColor: '#f97316', backgroundColor: '#fff7ed', mode: 'light', fontFamily: 'Inter' },
      steps: [
        { type: 'WELCOME', title: 'Sua empresa está perdendo dinheiro?', description: 'Faça nosso diagnóstico gratuito em 2 minutos.', config: { buttonText: 'Fazer Diagnóstico' } },
        { type: 'MULTIPLE_CHOICE', title: 'Você investe em tráfego pago hoje?', config: { options: [{ id: '1', text: 'Sim, mais de R$ 5.000/mês', score: 30 }, { id: '2', text: 'Sim, até R$ 5.000/mês', score: 15 }, { id: '3', text: 'Não invisto ainda', score: 0 }] } },
        { type: 'OPEN_QUESTION', title: 'Qual a sua maior dificuldade comercial?', config: { fieldType: 'text', required: true } },
        { type: 'CAPTURE_FORM', title: 'Quem deve receber esta análise?', config: { buttonText: 'Gerar Análise', fields: [{ name: 'nome', label: 'Seu Nome', type: 'text', required: true, enabled: true }, { name: 'empresa', label: 'Empresa', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }] } },
        { type: 'RESULT', title: 'Análise Concluída', config: { showScore: true, showClassification: true, defaultCta: { type: 'whatsapp', text: 'Agendar Consultoria Gratuita' } } }
      ]
    },
    {
      name: 'Orçamento de Energia Solar',
      slug: 'orcamento-solar-modelo',
      whatsappMessage: 'Olá! Quero um orçamento de energia solar. Minha conta média é X.',
      theme: { primaryColor: '#eab308', backgroundColor: '#fefce8', mode: 'light', fontFamily: 'Inter' },
      steps: [
        { type: 'WELCOME', title: 'Zere sua conta de luz', description: 'Calcule a economia que a energia solar pode trazer para sua casa ou empresa.', config: { buttonText: 'Calcular Economia' } },
        { type: 'MULTIPLE_CHOICE', title: 'Onde será a instalação?', config: { options: [{ id: '1', text: 'Residência', score: 10 }, { id: '2', text: 'Empresa / Comércio', score: 20 }, { id: '3', text: 'Propriedade Rural', score: 30 }] } },
        { type: 'OPEN_QUESTION', title: 'Qual o valor médio da sua conta de luz (R$)?', config: { fieldType: 'number', required: true } },
        { type: 'CAPTURE_FORM', title: 'Receba o cálculo detalhado', config: { buttonText: 'Ver Economia', fields: [{ name: 'nome', label: 'Nome', type: 'text', required: true, enabled: true }, { name: 'phone', label: 'WhatsApp', type: 'phone', required: true, enabled: true }] } },
        { type: 'RESULT', title: 'Você pode economizar até 95%!', config: { showScore: false, showClassification: false, defaultCta: { type: 'whatsapp', text: 'Solicitar Orçamento Oficial' } } }
      ]
    }
    // Adicionando 3 principais para não poluir muito o seed local
  ]

  for (const template of templates) {
    const exists = await prisma.funnel.findUnique({ where: { slug: template.slug } })
    if (!exists) {
      await prisma.funnel.create({
        data: {
          workspaceId: workspace.id,
          name: template.name,
          slug: template.slug,
          status: 'PUBLISHED',
          theme: template.theme,
          whatsappMessage: template.whatsappMessage,
          steps: {
            create: template.steps.map((step, index) => ({
              order: index,
              type: step.type as any,
              title: step.title,
              description: step.description || '',
              config: step.config
            }))
          }
        }
      })
      console.log(`✅ Template criado: ${template.name}`)
    }
  }

  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
