'use client'

import React, { useState, useTransition } from 'react'
import { addMemberByEmail, removeMember } from '@/actions/members'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import type { MemberRole } from '@prisma/client'
import { Shield, Trash2, Mail, UserPlus2, Calendar } from 'lucide-react'

interface MemberInfo {
  id: string
  role: MemberRole
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
  }
}

interface OwnerInfo {
  id: string
  name: string
  email: string
}

interface MembersListProps {
  memberships: MemberInfo[]
  owner: OwnerInfo
  canManage: boolean
}

export function MembersList({ memberships, owner, canManage }: MembersListProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('EDITOR')
  const [isPending, startTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    startTransition(async () => {
      const result = await addMemberByEmail(email, role)
      if (result.success) {
        toast('Membro adicionado com sucesso!', 'success')
        setEmail('')
      } else {
        toast(result.error || 'Erro ao adicionar membro.', 'error')
      }
    })
  }

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm('Tem certeza de que deseja remover este membro da equipe?')) return

    setRemovingId(membershipId)
    const result = await removeMember(membershipId)
    setRemovingId(null)

    if (result.success) {
      toast('Membro removido com sucesso!', 'success')
    } else {
      toast(result.error || 'Erro ao remover membro.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite member section */}
      {canManage && (
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50">
          <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserPlus2 className="h-4.5 w-4.5 text-indigo-500" />
            Convidar Membro para a Equipe
          </h3>
          <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <Input
                label="E-mail do usuário"
                type="email"
                placeholder="exemplo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-4 w-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                label="Função/Acesso"
                value={role}
                onChange={(e) => setRole(e.target.value as MemberRole)}
                options={[
                  { value: 'ADMIN', label: 'Administrador' },
                  { value: 'EDITOR', label: 'Editor (Co-Edição)' },
                  { value: 'SALES', label: 'Vendas/Comercial' },
                  { value: 'VIEWER', label: 'Visualizador' },
                ]}
              />
            </div>
            <Button type="submit" loading={isPending} className="w-full sm:w-auto h-[42px] px-6">
              Enviar Convite
            </Button>
          </form>
        </div>
      )}

      {/* Members table */}
      <div className="rounded-2xl border border-slate-200/60 bg-white overflow-hidden shadow-sm shadow-slate-100/50">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">Membros da Equipe</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Gerencie quem tem acesso de edição ou visualização aos seus funis.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/30">
                <th className="px-6 py-3.5">Nome</th>
                <th className="px-6 py-3.5">E-mail</th>
                <th className="px-6 py-3.5">Acesso</th>
                <th className="px-6 py-3.5">Data de Entrada</th>
                {canManage && <th className="px-6 py-3.5 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {/* Render Owner */}
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4.5 font-medium text-slate-900">{owner.name}</td>
                <td className="px-6 py-4.5 text-slate-500">{owner.email}</td>
                <td className="px-6 py-4.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Shield className="h-3 w-3" />
                    Proprietário
                  </span>
                </td>
                <td className="px-6 py-4.5 text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-300" />
                  Criador do Workspace
                </td>
                {canManage && <td className="px-6 py-4.5"></td>}
              </tr>

              {/* Render Members */}
              {memberships.map((membership) => (
                <tr key={membership.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4.5 font-medium text-slate-900">{membership.user.name}</td>
                  <td className="px-6 py-4.5 text-slate-500">{membership.user.email}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      membership.role === 'ADMIN'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : membership.role === 'EDITOR'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : membership.role === 'SALES'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {membership.role === 'ADMIN' ? 'Administrador' :
                       membership.role === 'EDITOR' ? 'Editor' :
                       membership.role === 'SALES' ? 'Vendas' : 'Visualizador'}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-300" />
                      {new Date(membership.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4.5 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={removingId === membership.id}
                        onClick={() => handleRemoveMember(membership.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-none hover:shadow-none font-semibold text-2xs uppercase tracking-wide cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}

              {memberships.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="px-6 py-10 text-center text-slate-400 font-medium"
                  >
                    Nenhum membro convidado para esta equipe ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
