'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { registerAction, type AuthResult } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Zap, User, Mail, Lock, Building2 } from 'lucide-react'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    async (_prev, formData) => {
      return await registerAction(formData)
    },
    null
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            LeadFlow AI
          </h1>
          <p className="text-gray-500 text-sm mt-1">Crie sua conta gratuitamente</p>
        </div>

        <Card className="p-8">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <Input
              label="Nome completo"
              name="name"
              type="text"
              placeholder="Seu nome"
              icon={<User className="h-4 w-4" />}
              error={state?.fieldErrors?.name}
              required
            />

            <Input
              label="E-mail"
              name="email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail className="h-4 w-4" />}
              error={state?.fieldErrors?.email}
              required
            />

            <Input
              label="Senha"
              name="password"
              type="password"
              placeholder="Mín. 8 caracteres, 1 maiúscula, 1 número"
              icon={<Lock className="h-4 w-4" />}
              error={state?.fieldErrors?.password}
              required
            />

            <Input
              label="Nome da empresa/workspace"
              name="workspaceName"
              type="text"
              placeholder="Minha Empresa"
              icon={<Building2 className="h-4 w-4" />}
              error={state?.fieldErrors?.workspaceName}
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={isPending}>
              Criar Conta
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Fazer login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
