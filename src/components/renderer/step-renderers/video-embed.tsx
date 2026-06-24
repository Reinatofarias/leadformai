'use client'

import React from 'react'

interface VideoEmbedProps {
  url?: string
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  if (!url) return null

  // Clean and parse URL
  const trimmedUrl = url.trim()
  let embedUrl = ''
  let isYoutube = false
  let isVimeo = false
  let isDirect = false

  if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
    isYoutube = true
    let videoId = ''
    if (trimmedUrl.includes('youtube.com/watch')) {
      const urlObj = new URL(trimmedUrl)
      videoId = urlObj.searchParams.get('v') || ''
    } else if (trimmedUrl.includes('youtu.be/')) {
      videoId = trimmedUrl.split('youtu.be/')[1]?.split('?')[0] || ''
    } else if (trimmedUrl.includes('youtube.com/embed/')) {
      videoId = trimmedUrl.split('youtube.com/embed/')[1]?.split('?')[0] || ''
    }
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
  } else if (trimmedUrl.includes('vimeo.com')) {
    isVimeo = true
    const vimeoId = trimmedUrl.split('vimeo.com/')[1]?.split('?')[0] || ''
    embedUrl = `https://player.vimeo.com/video/${vimeoId}`
  } else if (trimmedUrl.endsWith('.mp4') || trimmedUrl.endsWith('.webm') || trimmedUrl.endsWith('.ogg')) {
    isDirect = true
  }

  return (
    <div className="w-full mb-6">
      {isYoutube || isVimeo ? (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm">
          <iframe
            src={embedUrl}
            title="Video instruction"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
      ) : isDirect ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm bg-black">
          <video
            src={trimmedUrl}
            controls
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <p className="text-xs text-red-500 font-semibold">Formato de vídeo não suportado. Use links do YouTube, Vimeo ou link direto MP4.</p>
      )}
    </div>
  )
}
