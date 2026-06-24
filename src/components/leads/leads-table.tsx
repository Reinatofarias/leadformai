'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ClassificationBadge } from '@/components/ui/badge'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LeadDetailsModal } from './lead-details-modal'
import { formatDate } from '@/lib/utils'
import { Search, Filter, MoreHorizontal, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface LeadsTableProps {
  data: any[]
  total: number
  totalPages: number
  currentPage: number
  funnels?: { id: string; name: string }[]
  hideFunnelColumn?: boolean
}

export function LeadsTable({ data, total, totalPages, currentPage, funnels, hideFunnelColumn }: LeadsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  
  // Filtros locais (antes de aplicar)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  
  const updateQueryParams = (params: Record<string, string | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })
    
    // Reset page to 1 when filtering, unless we're explicitly changing page
    if (!params.page && current.has('page')) {
      current.delete('page')
    }
    
    const searchStr = current.toString()
    const query = searchStr ? `?${searchStr}` : ''
    router.push(`${pathname}${query}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateQueryParams({ q: search || null })
  }

  return (
    <div className="flex flex-col w-full">
      {/* Tollbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 border-b border-gray-200 bg-white">
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-sm">
          <Input
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            icon={<Search className="h-4 w-4" />}
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!hideFunnelColumn && funnels && (
            <div className="w-full sm:w-48">
              <Select
                options={funnels.map(f => ({ value: f.id, label: f.name }))}
                placeholder="Todos os funis"
                value={searchParams.get('funnel') || ''}
                onChange={(e) => updateQueryParams({ funnel: e.target.value || null })}
              />
            </div>
          )}
          <div className="w-full sm:w-48">
            <Select
              options={[
                { value: 'VERY_HOT', label: 'Muito Quente' },
                { value: 'HOT', label: 'Quente' },
                { value: 'WARM', label: 'Morno' },
                { value: 'COLD', label: 'Frio' },
              ]}
              placeholder="Todas classificações"
              value={searchParams.get('classification') || ''}
              onChange={(e) => updateQueryParams({ classification: e.target.value || null })}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Nome / Contato</th>
              {!hideFunnelColumn && <th className="px-6 py-4">Funil</th>}
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-center">Classificação</th>
              <th className="px-6 py-4 text-right">Data</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={hideFunnelColumn ? 5 : 6} className="px-6 py-12 text-center text-gray-500">
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              data.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{lead.name || 'Sem nome'}</div>
                    <div className="text-gray-500 flex flex-col mt-0.5">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span>{lead.phone}</span>}
                    </div>
                  </td>
                  {!hideFunnelColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 max-w-[200px] truncate" title={lead.funnel.name}>
                        {lead.funnel.name}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {lead.score !== null ? (
                      <span className="font-semibold text-gray-900">{lead.score}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <ClassificationBadge classification={lead.classification} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                    >
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
          <p className="text-sm text-gray-500">
            Mostrando <span className="font-medium">{data.length}</span> de <span className="font-medium">{total}</span> leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => updateQueryParams({ page: (currentPage - 1).toString() })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => updateQueryParams({ page: (currentPage + 1).toString() })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
        />
      )}
    </div>
  )
}
