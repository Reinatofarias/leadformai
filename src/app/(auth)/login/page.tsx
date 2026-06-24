'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { loginAction, type AuthResult } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Zap, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    async (_prev, formData) => {
      return await loginAction(formData)
    },
    null
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-vertical.png" alt="VoxFunnels Logo" className="h-24 w-auto object-contain" />
          <p className="text-gray-500 text-sm mt-2">Entre na sua conta</p>
        </div>

        <Card className="p-8">
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

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
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={state?.fieldErrors?.password}
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={isPending}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Cadastre-se
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
