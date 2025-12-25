"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2 } from "lucide-react"
import { getVideoEmbedUrlWithAutoplay, VideoType, formatDuration } from "@/lib/utils/video-embed"
import { toast } from "sonner"

interface LessonPlayerProps {
  lesson: {
    id: string
    title: string
    description: string | null
    video_url: string | null
    video_type: VideoType | null
    video_duration_seconds: number | null
  }
  enrollmentId: string
  onProgressUpdate?: (progress: number) => void
  onComplete?: () => void
}

export function LessonPlayer({
  lesson,
  enrollmentId,
  onProgressUpdate,
  onComplete,
}: LessonPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Load lesson progress
    const loadProgress = async () => {
      const { data } = await supabase
        .from("user_lesson_progress")
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("lesson_id", lesson.id)
        .maybeSingle()

      if (data) {
        setProgress(data.progress_percentage || 0)
        setIsCompleted(data.is_completed || false)
      }
    }

    loadProgress()
  }, [lesson.id, enrollmentId, supabase])

  const updateProgress = async (percentage: number, watchTime: number = 0, completed: boolean = false) => {
    try {
      // Get current user for user_id field
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in to update progress")
        return
      }

      const progressData = {
        user_id: user.id,
        enrollment_id: enrollmentId,
        lesson_id: lesson.id,
        progress_percentage: percentage,
        watch_time_seconds: watchTime,
        is_completed: completed,
        last_watched_at: new Date().toISOString(),
        completed_at: completed ? new Date().toISOString() : null,
      }

      // Use upsert with proper error handling
      const { error, data } = await supabase
        .from("user_lesson_progress")
        .upsert(progressData, {
          onConflict: "enrollment_id,lesson_id",
        })
        .select()

      if (error) {
        // Log error details properly
        const errorDetails = {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        }
        console.error("Error updating progress:", JSON.stringify(errorDetails, null, 2))
        const errorMessage = error.message || "Failed to update progress. Please try again."
        toast.error(errorMessage)
        return
      }

      setProgress(percentage)
      if (completed) {
        setIsCompleted(true)
        onComplete?.()
        toast.success("Lesson completed!")
      }
      onProgressUpdate?.(percentage)
    } catch (error: any) {
      // Better error logging for catch block
      const errorInfo = {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        toString: error?.toString(),
      }
      console.error("Error updating progress (catch):", JSON.stringify(errorInfo, null, 2))
      const errorMessage = error?.message || error?.toString() || "Failed to update progress"
      toast.error(errorMessage)
    }
  }

  const handleMarkComplete = async () => {
    await updateProgress(100, 0, true)
  }

  const handleMarkIncomplete = async () => {
    await updateProgress(0, 0, false)
    setIsCompleted(false)
    toast.info("Lesson marked as incomplete")
  }

  const embedUrl = lesson.video_url && lesson.video_type
    ? getVideoEmbedUrlWithAutoplay(lesson.video_url, lesson.video_type)
    : ""

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white" />
          </div>
        )}
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white p-4">
            <div className="text-center">
              <p className="text-base sm:text-lg mb-2">No video available</p>
              <p className="text-xs sm:text-sm text-slate-400 break-all">{lesson.video_url || "Video URL not set"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 mb-2 break-words">{lesson.title}</h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 flex-wrap">
              {lesson.video_duration_seconds && (
                <div className="flex items-center gap-1">
                  <span>{formatDuration(lesson.video_duration_seconds)}</span>
                </div>
              )}
              {lesson.video_type && (
                <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                  {lesson.video_type.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {isCompleted ? (
              <Button
                variant="outline"
                onClick={handleMarkIncomplete}
                className="border-green-200 text-green-700 hover:bg-green-50 w-full sm:w-auto text-sm"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Completed
              </Button>
            ) : (
              <Button
                onClick={handleMarkComplete}
                style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                className="w-full sm:w-auto text-sm"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-600">Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Description */}
        {lesson.description && (
          <div className="prose prose-sm sm:prose-lg max-w-none">
            <div
              className="text-slate-700 leading-relaxed text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: lesson.description }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

