'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ClassificationBadge } from '@/components/ui/badge'
import { Input, Select } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LeadDetailsModal } from './lead-details-modal'
import { formatDate } from '@/lib/utils'
import { updateLeadStatus } from '@/actions/leads'
import { useToast } from '@/components/ui/toast'
import { 
  Search, 
  Filter, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react'

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
  const { toast } = useToast()
  
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Filtros locais
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [utmSource, setUtmSource] = useState(searchParams.get('utmSource') || '')
  const [utmMedium, setUtmMedium] = useState(searchParams.get('utmMedium') || '')
  const [utmCampaign, setUtmCampaign] = useState(searchParams.get('utmCampaign') || '')

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

  const handleStatusChange = async (leadId: string, status: string) => {
    setUpdatingId(leadId)
    const res = await updateLeadStatus(leadId, status as any)
    setUpdatingId(null)
    if (res.success) {
      toast('Status comercial atualizado com sucesso!', 'success')
    } else {
      toast(res.error || 'Erro ao atualizar status', 'error')
    }
  }

  const exportToCSV = () => {
    try {
      const headers = [
        'Nome', 
        'Email', 
        'Telefone', 
        'Empresa', 
        'Cidade', 
        'Score', 
        'Classificação', 
        'Status Comercial', 
        'Origem (UTM Source)', 
        'Mídia (UTM Medium)', 
        'Campanha (UTM Campaign)', 
        'Data de Criação'
      ]
      
      const rows = data.map(lead => [
        lead.name || 'Sem nome',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.city || '',
        lead.score !== null ? lead.score.toString() : '',
        lead.classification || 'Sem classificação',
        lead.status || 'NEW',
        lead.utmSource || '',
        lead.utmMedium || '',
        lead.utmCampaign || '',
        new Date(lead.createdAt).toLocaleDateString('pt-BR')
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `leads-leadflow-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast('CSV baixado com sucesso!', 'success')
    } catch (e) {
      toast('Erro ao gerar arquivo CSV.', 'error')
    }
  }

  const resetAllFilters = () => {
    setSearch('')
    setUtmSource('')
    setUtmMedium('')
    setUtmCampaign('')
    router.push(pathname)
  }

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Toolbar principal */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-5 border-b border-slate-100 bg-slate-50/20">
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-sm">
          <Input
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            icon={<Search className="h-4 w-4" />}
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!hideFunnelColumn && funnels && (
            <div className="w-full sm:w-44">
              <Select
                options={funnels.map(f => ({ value: f.id, label: f.name }))}
                placeholder="Todos os funis"
                value={searchParams.get('funnel') || ''}
                onChange={(e) => updateQueryParams({ funnel: e.target.value || null })}
              />
            </div>
          )}
          <div className="w-full sm:w-40">
            <Select
              options={[
                { value: 'VERY_HOT', label: 'Muito Quente' },
                { value: 'HOT', label: 'Quente' },
                { value: 'WARM', label: 'Morno' },
                { value: 'COLD', label: 'Frio' },
              ]}
              placeholder="Classificação"
              value={searchParams.get('classification') || ''}
              onChange={(e) => updateQueryParams({ classification: e.target.value || null })}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              options={[
                { value: 'NEW', label: 'Novo' },
                { value: 'IN_PROGRESS', label: 'Em atendimento' },
                { value: 'QUALIFIED', label: 'Qualificado' },
                { value: 'PROPOSAL_SENT', label: 'Proposta enviada' },
                { value: 'WON', label: 'Ganho' },
                { value: 'LOST', label: 'Perdido' },
              ]}
              placeholder="Status Comercial"
              value={searchParams.get('status') || ''}
              onChange={(e) => updateQueryParams({ status: e.target.value || null })}
            />
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="flex items-center gap-1.5 h-[42px] px-3.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </Button>

          <Button 
            type="button" 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 h-[42px] px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>

          {(searchParams.toString() !== '') && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={resetAllFilters}
              className="flex items-center gap-1 h-[42px] px-2 text-slate-450 hover:text-slate-700"
              title="Resetar todos os filtros"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtros avançados expandidos */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 border-b border-slate-100 bg-slate-50/40 animate-slide-down">
          <Input
            label="Origem (UTM Source)"
            value={utmSource}
            onChange={(e) => setUtmSource(e.target.value)}
            placeholder="Ex: facebook, google"
          />
          <Input
            label="Mídia (UTM Medium)"
            value={utmMedium}
            onChange={(e) => setUtmMedium(e.target.value)}
            placeholder="Ex: cpc, bio, stories"
          />
          <div className="flex flex-col justify-end">
            <Input
              label="Campanha (UTM Campaign)"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="Ex: blackfriday"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setUtmSource('')
                  setUtmMedium('')
                  setUtmCampaign('')
                  updateQueryParams({ utmSource: null, utmMedium: null, utmCampaign: null })
                }}
              >
                Limpar UTMs
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  updateQueryParams({
                    utmSource: utmSource || null,
                    utmMedium: utmMedium || null,
                    utmCampaign: utmCampaign || null,
                  })
                }}
              >
                Aplicar UTMs
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Leads */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-500 border-collapse">
          <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-400 tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Nome / Contato</th>
              {!hideFunnelColumn && <th className="px-6 py-4">Funil</th>}
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-center">Classificação</th>
              <th className="px-6 py-4 text-center">Status Comercial</th>
              <th className="px-6 py-4 text-right">Data</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={hideFunnelColumn ? 6 : 7} className="px-6 py-12 text-center text-slate-400 font-medium">
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              data.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-55/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">{lead.name || 'Sem nome'}</div>
                    <div className="text-xs text-slate-400 flex flex-col mt-1 space-y-0.5 font-medium">
                      {lead.email && <span>{lead.email}</span>}
                      {lead.phone && <span>{lead.phone}</span>}
                    </div>
                  </td>
                  {!hideFunnelColumn && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium max-w-[180px] truncate" title={lead.funnel?.name}>
                        {lead.funnel?.name || 'Sem funil'}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {lead.score !== null ? (
                      <span className="font-extrabold text-slate-850">{lead.score}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <ClassificationBadge classification={lead.classification} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <select
                        value={lead.status || 'NEW'}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`rounded-xl border bg-white px-2.5 py-1.5 text-2xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer ${
                          lead.status === 'WON' ? 'border-emerald-200 text-emerald-700 bg-emerald-50/20' :
                          lead.status === 'LOST' ? 'border-red-200 text-red-600 bg-red-50/20' :
                          lead.status === 'QUALIFIED' ? 'border-indigo-200 text-indigo-700 bg-indigo-50/20' :
                          lead.status === 'IN_PROGRESS' ? 'border-amber-200 text-amber-700 bg-amber-50/20' :
                          'border-slate-200 text-slate-650'
                        }`}
                      >
                        <option value="NEW">🆕 Novo</option>
                        <option value="IN_PROGRESS">⏳ Em atendimento</option>
                        <option value="QUALIFIED">✅ Qualificado</option>
                        <option value="PROPOSAL_SENT">📄 Proposta enviada</option>
                        <option value="WON">🎉 Ganho</option>
                        <option value="LOST">❌ Perdido</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-slate-400 text-xs">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                      className="text-indigo-600 hover:text-indigo-700 font-bold"
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
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/10 px-6 py-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mostrando <span className="text-slate-700 font-bold">{data.length}</span> de <span className="text-slate-700 font-bold">{total}</span> leads
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
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide px-1">
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
