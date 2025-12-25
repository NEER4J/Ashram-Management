"use client"

import { Video } from "lucide-react"
import { getVideoEmbedUrl, VideoType } from "@/lib/utils/video-embed"

interface VideoPreviewProps {
  videoUrl: string
  videoType: VideoType
  className?: string
}

export function VideoPreview({ videoUrl, videoType, className = "" }: VideoPreviewProps) {
  const embedUrl = getVideoEmbedUrl(videoUrl, videoType)

  if (!videoUrl) {
    return (
      <div className={`aspect-video bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 ${className}`}>
        <div className="text-center text-slate-500">
          <Video className="h-12 w-12 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium">Video Preview</p>
          <p className="text-xs">Enter a video URL to see preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={embedUrl}
        title="Video Preview"
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

