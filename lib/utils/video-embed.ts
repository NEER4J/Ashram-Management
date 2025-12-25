/**
 * Utility functions for video URL parsing and embedding
 */

export type VideoType = 'vimeo' | 'loom' | 'youtube' | 'custom'

export interface VideoEmbedInfo {
  embedUrl: string
  type: VideoType
  originalUrl: string
}

/**
 * Extract video ID and generate embed URL for different platforms
 */
export function getVideoEmbedUrl(url: string, type: VideoType): string {
  if (!url) return ''

  switch (type) {
    case 'vimeo': {
      const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1] || 
                     url.match(/vimeo\.com\/video\/(\d+)/)?.[1]
      return vimeoId ? `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0` : url
    }
    
    case 'loom': {
      const loomId = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)?.[1]
      return loomId ? `https://www.loom.com/embed/${loomId}` : url
    }
    
    case 'youtube': {
      const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1] ||
                       url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)?.[1]
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url
    }
    
    case 'custom':
    default:
      return url
  }
}

/**
 * Auto-detect video type from URL
 */
export function detectVideoType(url: string): VideoType {
  if (!url) return 'custom'
  
  if (url.includes('vimeo.com')) return 'vimeo'
  if (url.includes('loom.com')) return 'loom'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  
  return 'custom'
}

/**
 * Get autoplay embed URL (for player)
 */
export function getVideoEmbedUrlWithAutoplay(url: string, type: VideoType): string {
  const embedUrl = getVideoEmbedUrl(url, type)
  
  if (!embedUrl) return ''
  
  // Add autoplay parameter based on type
  switch (type) {
    case 'vimeo':
      return embedUrl.includes('?') 
        ? `${embedUrl}&autoplay=1` 
        : `${embedUrl}?autoplay=1`
    
    case 'youtube':
      return embedUrl.includes('?') 
        ? `${embedUrl}&autoplay=1` 
        : `${embedUrl}?autoplay=1`
    
    case 'loom':
    case 'custom':
    default:
      return embedUrl
  }
}

/**
 * Format duration from seconds to readable string
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return "0m"
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

