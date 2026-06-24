import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, CheckCircle, ArrowRight, Users, BarChart3, MessageCircle, Sparkles } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Sparkles,
      title: 'Funis Interativos',
      description: 'Crie jornadas personalizadas com perguntas, quizzes e formulários inteligentes que cativam o usuário.',
      color: 'text-violet-600',
      bg: 'bg-violet-50/75 border-violet-100',
    },
    {
      icon: Users,
      title: 'Qualificação Automática',
      description: 'Pontue e classifique leads em tempo real: Frio, Morno, Quente ou Muito Quente de forma automática.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50/75 border-indigo-100',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Dinâmico',
      description: 'Redirecione contatos quentes diretamente para o WhatsApp com mensagens totalmente personalizadas.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/75 border-emerald-100',
    },
    {
      icon: BarChart3,
      title: 'Analytics de Conversão',
      description: 'Monitore taxas de abandono por etapa, origem UTM e temperatura média dos leads capturados.',
      color: 'text-amber-600',
      bg: 'bg-amber-50/75 border-amber-100',
    },
  ]

  const benefits = [
    'Funis 100% no-code',
    'Modelos prontos validados por nicho',
    'Rastreamento inteligente de UTMs',
    'Cálculo de score dinâmico',
    'Integração direta com WhatsApp e CRM',
    'Painéis analíticos em tempo real',
  ]

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Blobs for Premium Aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-200/30 blur-3xl -z-10 animate-float" />
      <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-200/20 blur-3xl -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/10">
              <Zap className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent tracking-tight">
              LeadFlow AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-slate-600">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button variant="premium" size="sm">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-4.5 py-1.5 text-xs font-semibold text-indigo-700 mb-2 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
            Funis Interativos Inteligentes
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-heading">
            Converta e qualifique leads{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">
              automaticamente
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Monte quizzes interativos e formulários em minutos. Capture contatos, pontue a intenção do cliente e envie os leads mais quentes direto para o seu time comercial.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="premium" className="w-full sm:w-auto font-bold shadow-lg">
                Começar Grátis
                <ArrowRight className="h-4.5 w-4.5 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold hover:border-slate-300">
                Ver Demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white border-y border-slate-100 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Tudo que você precisa para maximizar conversões
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">
              Descubra ferramentas focadas em transformar meros visitantes em leads altamente qualificados e prontos para comprar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="rounded-2xl bg-white p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 group cursor-pointer"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} border mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              Por que escolher o LeadFlow AI?
            </h2>
            <p className="text-slate-500 mt-2.5 text-sm">A união perfeita entre rapidez de criação e resultados reais.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 max-w-xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3.5 py-1">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-500 shrink-0">
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" variant="premium" className="font-bold shadow-md">
                Criar Meu Funil Agora
                <ArrowRight className="h-4.5 w-4.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-extrabold text-slate-800">LeadFlow AI</span>
          </div>
          <p className="text-xs font-semibold text-slate-400">
            © {new Date().getFullYear()} LeadFlow AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

