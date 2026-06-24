'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Zap,
  Users,
  LayoutTemplate,
  Menu,
  X,
  LogOut,
  UserPlus,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Funis', href: '/dashboard/funnels', icon: Zap },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Templates', href: '/dashboard/templates', icon: LayoutTemplate },
  { name: 'Membros', href: '/dashboard/settings/members', icon: UserPlus },
]

interface SidebarProps {
  userName?: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden cursor-pointer"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-950/95 backdrop-blur-md border-r border-slate-900 transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-slate-900">
          <img src="/logo-dark.png" alt="VoxFunnels Logo" className="h-8 w-auto object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 border',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-500/30 shadow-md shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 border-transparent'
                )}
              >
                <item.icon className={cn('h-5 w-5 transition-colors', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-900 px-4 py-5 bg-slate-950/40">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/40 border border-slate-900 px-3.5 py-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm shadow-indigo-500/15">
                {userName ? userName[0].toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {userName || 'Usuário'}
                </p>
                <p className="text-2xs text-slate-500 font-medium">Workspace Ativo</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800/80 transition-all cursor-pointer"
                title="Sair"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
