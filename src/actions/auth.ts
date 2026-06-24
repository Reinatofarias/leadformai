'use server'

import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, signToken, setSessionCookie, clearSessionCookie } from '@/lib/auth'
import { loginSchema, registerSchema } from '@/schemas/auth'
import { redirect } from 'next/navigation'

export interface AuthResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    workspaceName: formData.get('workspaceName') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
    })
    return { success: false, fieldErrors }
  }

  const { name, email, password, workspaceName } = parsed.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { success: false, error: 'Este e-mail já está cadastrado.' }
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      workspaces: {
        create: {
          name: workspaceName,
        },
      },
    },
    include: {
      workspaces: true,
    },
  })

  const workspace = user.workspaces[0]
  const token = await signToken({
    userId: user.id,
    workspaceId: workspace.id,
    email: user.email,
  })

  await setSessionCookie(token)
  redirect('/dashboard')
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
    })
    return { success: false, fieldErrors }
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { email },
    include: { workspaces: true },
  })

  if (!user) {
    return { success: false, error: 'E-mail ou senha incorretos.' }
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return { success: false, error: 'E-mail ou senha incorretos.' }
  }

  const workspace = user.workspaces[0]
  if (!workspace) {
    return { success: false, error: 'Nenhum workspace encontrado.' }
  }

  const token = await signToken({
    userId: user.id,
    workspaceId: workspace.id,
    email: user.email,
  })

  await setSessionCookie(token)
  redirect('/dashboard')
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie()
  redirect('/login')
}
