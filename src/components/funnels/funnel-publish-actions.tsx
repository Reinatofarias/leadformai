'use client'

import React, { useState } from 'react'
import { publishFunnel, unpublishFunnel, duplicateFunnel, deleteFunnel } from '@/actions/funnels'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/badge'
import { ConfirmModal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { ExternalLink, Copy, MoreVertical, Trash2, Globe, EyeOff } from 'lucide-react'
import Link from 'next/link'
import type { Funnel } from '@prisma/client'

export function FunnelPublishActions({ funnel }: { funnel: Funnel }) {
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isPublished = funnel.status === 'PUBLISHED'

  const handlePublishToggle = async () => {
    setIsPublishing(true)
    try {
      const result = isPublished 
        ? await unpublishFunnel(funnel.id)
        : await publishFunnel(funnel.id)
      
      if (!result.success) {
        toast(result.error || 'Erro ao processar', 'error')
      } else {
        toast(isPublished ? 'Funil despublicado' : 'Funil publicado', 'success')
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/f/${funnel.slug}`
    navigator.clipboard.writeText(url)
    toast('Link copiado para a área de transferência', 'success')
  }

  const handleDuplicate = async () => {
    toast('Duplicando funil...', 'info')
    await duplicateFunnel(funnel.id)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteFunnel(funnel.id)
    } catch (e) {
      toast('Erro ao excluir funil', 'error')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <StatusBadge status={funnel.status} />
        
        {isPublished && (
          <>
            <Button variant="outline" onClick={handleCopyLink} title="Copiar link público">
              <Copy className="h-4 w-4" />
            </Button>
            <Link href={`/f/${funnel.slug}`} target="_blank">
              <Button variant="outline" title="Abrir página pública">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </>
        )}

        <Button 
          variant={isPublished ? 'secondary' : 'primary'} 
          onClick={handlePublishToggle}
          loading={isPublishing}
        >
          {isPublished ? (
            <><EyeOff className="h-4 w-4" /> Despublicar</>
          ) : (
            <><Globe className="h-4 w-4" /> Publicar</>
          )}
        </Button>

        {/* Simple Dropdown Menu */}
        <div className="relative">
          <Button 
            variant="ghost" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-2"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleDuplicate()
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <Copy className="mr-3 h-4 w-4 text-gray-400" />
                  Duplicar funil
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    setShowDeleteModal(true)
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                  Excluir funil
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir funil"
        description="Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita e excluirá todos os leads associados a ele."
        confirmText="Sim, excluir funil"
        variant="danger"
        loading={isDeleting}
      />
    </>
  )
}
